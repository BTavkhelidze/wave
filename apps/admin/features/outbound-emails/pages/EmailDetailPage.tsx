import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ADMIN_ROUTE_PATHS } from "../../../src/app/router/routes.constants";
import { isApiRequestError } from "../../../src/shared/api/httpClient";
import {
  useDeleteOutboundEmailMutation,
  useOutboundEmailQuery,
} from "../api/outboundEmails.queries";
import { DeleteOutboundEmailDialog } from "../components/DeleteOutboundEmailDialog";
import { OutboundEmailStatusBadge } from "../components/OutboundEmailStatusBadge";
import { OutboundEmailsStateCard } from "../components/OutboundEmailsStateCard";
import {
  formatOutboundEmailDateTime,
  formatSenderName,
} from "../model/outboundEmailFormat";
import { getOutboundEmailLanguageLabel } from "../model/outboundEmail.constants";
import type { OutboundEmailDetail } from "../model/outboundEmail.types";

type LocationState = {
  successMessage?: string;
};

export function EmailDetailPage() {
  const { emailId } = useParams<{ emailId: string }>();

  if (!emailId) {
    return <Navigate to={ADMIN_ROUTE_PATHS.emails} replace />;
  }

  return <EmailDetailContent emailId={emailId} />;
}

type EmailDetailContentProps = {
  emailId: string;
};

function EmailDetailContent({ emailId }: EmailDetailContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const emailQuery = useOutboundEmailQuery(emailId);
  const deleteEmailMutation = useDeleteOutboundEmailMutation();

  if (emailQuery.isLoading) {
    return (
      <EmailDetailShell>
        <OutboundEmailsStateCard
          tone="neutral"
          title="Loading email"
          message="Fetching the selected delivery record."
        />
      </EmailDetailShell>
    );
  }

  if (emailQuery.isError) {
    const isNotFound =
      isApiRequestError(emailQuery.error) && emailQuery.error.status === 404;
    const isAccessDenied =
      isApiRequestError(emailQuery.error) && emailQuery.error.status === 403;

    return (
      <EmailDetailShell>
        <OutboundEmailsStateCard
          tone={isAccessDenied ? "warning" : isNotFound ? "neutral" : "error"}
          title={
            isAccessDenied
              ? "Access denied"
              : isNotFound
                ? "Email not found"
                : "Could not load email"
          }
          message={
            isAccessDenied
              ? "You do not have permission to view outbound emails."
              : isNotFound
                ? "No outbound email was found for this route."
                : "The email detail request failed."
          }
          actionLabel={isAccessDenied || isNotFound ? undefined : "Try again"}
          onAction={
            isAccessDenied || isNotFound
              ? undefined
              : () => void emailQuery.refetch()
          }
        />
      </EmailDetailShell>
    );
  }

  const email = emailQuery.data;

  const handleDelete = async () => {
    if (!email || deleteEmailMutation.isPending) {
      return;
    }

    try {
      await deleteEmailMutation.mutateAsync(email.id);
      navigate(ADMIN_ROUTE_PATHS.emails, {
        replace: true,
        state: {
          successMessage: "Email history record deleted.",
        },
      });
    } catch {
      // The dialog stays open and shows a safe error message.
    }
  };

  if (!email) {
    return (
      <EmailDetailShell>
        <OutboundEmailsStateCard
          tone="neutral"
          title="Email not found"
          message="No outbound email was found for this route."
        />
      </EmailDetailShell>
    );
  }

  return (
    <EmailDetailShell>
      {locationState?.successMessage && (
        <OutboundEmailsStateCard
          tone="success"
          title="Email sent"
          message={locationState.successMessage}
        />
      )}

      <article className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7EB] bg-[#F8FAFC] p-6">
          <div className="min-w-0">
            <h1 className="max-w-3xl wrap-break-word text-2xl font-semibold tracking-tight text-[#111827]">
              {email.subject}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Created {formatOutboundEmailDateTime(email.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OutboundEmailStatusBadge status={email.status} />
            <button
              type="button"
              onClick={() => {
                deleteEmailMutation.reset();
                setIsDeleteDialogOpen(true);
              }}
              disabled={deleteEmailMutation.isPending}
              className="rounded-md bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteEmailMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </header>

        <section className="space-y-6 p-6">
          <dl className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm sm:grid-cols-2">
            <DetailItem
              label="Recipient name"
              value={email.recipientName ?? "Not provided"}
            />
            <DetailItem label="Recipient email" value={email.recipientEmail} />
            <DetailItem
              label="Email language"
              value={getOutboundEmailLanguageLabel(email.language)}
            />
            <DetailItem
              label="Sent by"
              value={formatSenderName(email.createdBy)}
            />
            <DetailItem label="Sender role" value={email.createdBy.role} />
            <DetailItem
              label="Created date"
              value={formatOutboundEmailDateTime(email.createdAt)}
            />
            <DetailItem
              label="Sent date"
              value={formatOutboundEmailDateTime(email.sentAt)}
            />
            {email.providerMessageId && (
              <DetailItem
                label="Provider message ID"
                value={email.providerMessageId}
                mono
              />
            )}
            {email.failureCode && (
              <DetailItem label="Failure code" value={email.failureCode} mono />
            )}
          </dl>

          <EmailContent email={email} />
        </section>
      </article>

      {isDeleteDialogOpen && (
        <DeleteOutboundEmailDialog
          email={email}
          isDeleting={deleteEmailMutation.isPending}
          errorMessage={
            deleteEmailMutation.isError
              ? "Could not delete email record. Please try again."
              : null
          }
          onCancel={() => {
            if (!deleteEmailMutation.isPending) {
              setIsDeleteDialogOpen(false);
            }
          }}
          onConfirm={() => void handleDelete()}
        />
      )}
    </EmailDetailShell>
  );
}

function EmailDetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to={ADMIN_ROUTE_PATHS.emails}
        className="inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
      >
        Back to emails
      </Link>
      {children}
    </div>
  );
}

function EmailContent({ email }: { email: OutboundEmailDetail }) {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-sm font-semibold text-[#111827]">Heading</h2>
        <p className="mt-2 rounded-lg border border-[#E5E7EB] bg-white p-4 text-sm leading-6 text-[#374151]">
          {email.heading || "Not provided"}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[#111827]">Message</h2>
        <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-white p-4 text-sm leading-6 text-[#374151]">
          {email.message}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <DetailPanel label="CTA button text" value={email.buttonText} />
        <DetailPanel label="CTA button URL" value={email.buttonUrl} mono />
      </section>
    </div>
  );
}

function DetailPanel({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        {label}
      </p>
      <p
        className={`mt-2 wrap-break-word text-sm text-[#111827] ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        {label}
      </dt>
      <dd
        className={`mt-1 wrap-break-word font-medium text-[#111827] ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
