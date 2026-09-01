import { useIsMutating } from "@tanstack/react-query";
import {
  CONTENT_MANAGER_ROLES,
  canAccessRole,
} from "../../auth/lib/authorization";
import { useAuth } from "../../context/AuthContext";
import {
  useContactMessageQuery,
  type UpdateContactMessageStatusVariables,
  useUpdateContactMessageStatusMutation,
} from "../api/messages.queries";
import { getMessageStatusLabel } from "../model/message.constants";
import type { ContactMessage, MessageStatus } from "../model/message.types";
import { buildMailtoHref, buildTelHref, formatDateTime } from "./MessagesTable";
import { MessageStatusBadge } from "./MessageStatusBadge";

type MessageDetailsDialogProps = {
  messageId: string | null;
  onClose: () => void;
  onDeleteMessage: (message: ContactMessage) => void;
  deletingMessageId: string | null;
};

export function MessageDetailsDialog({
  messageId,
  onClose,
  onDeleteMessage,
  deletingMessageId,
}: MessageDetailsDialogProps) {
  const { user } = useAuth();
  const canUpdateStatus = canAccessRole(user?.role, CONTENT_MANAGER_ROLES);
  const messageQuery = useContactMessageQuery(messageId);
  const updateStatusMutation = useUpdateContactMessageStatusMutation({
    onSuccessBeforeInvalidate: (_message, variables) => {
      if (variables.status === "UNREAD") {
        onClose();
      }
    },
  });
  const pendingStatusUpdates = useIsMutating({
    predicate: (mutation) =>
      isUpdateContactMessageStatusVariables(mutation.state.variables) &&
      mutation.state.variables.messageId === messageId,
  });
  const message = messageQuery.data;
  const isStatusUpdatePending =
    updateStatusMutation.isPending || pendingStatusUpdates > 0;
  const isDeletePending = deletingMessageId === messageId;

  if (!messageId) {
    return null;
  }

  const handleStatusChange = (status: MessageStatus) => {
    if (!messageId || message?.status === status || isStatusUpdatePending) {
      return;
    }

    updateStatusMutation.mutate({ messageId, status });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/40 p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-details-title"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h3
              id="message-details-title"
              className="text-lg font-semibold text-[#111827]"
            >
              Message details
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              View the complete contact form submission.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeletePending}
            aria-label="Close message details"
            className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {messageQuery.isLoading && (
            <div className="space-y-3">
              <div className="h-5 w-56 animate-pulse rounded bg-[#E5E7EB]" />
              <div className="h-4 w-80 animate-pulse rounded bg-[#F3F4F6]" />
              <div className="h-32 w-full animate-pulse rounded bg-[#F3F4F6]" />
            </div>
          )}

          {messageQuery.isError && (
            <div className="rounded-lg border border-[#FCA5A5] bg-white p-5">
              <p className="text-sm font-semibold text-[#B91C1C]">
                Could not load message
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                The message detail request failed.
              </p>
              <button
                type="button"
                onClick={() => void messageQuery.refetch()}
                className="mt-3 rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
              >
                Try again
              </button>
            </div>
          )}

          {message && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#111827]">
                    {message.subject || "No subject"}
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Received {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <MessageStatusBadge status={message.status} />
              </div>

              <dl className="grid gap-4 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:grid-cols-2">
                <DetailItem label="Full name" value={message.fullName} />
                <DetailLink
                  label="Email"
                  value={message.email}
                  href={buildMailtoHref(message.email)}
                />
                <DetailLink
                  label="Phone"
                  value={message.phone}
                  href={message.phone ? buildTelHref(message.phone) : null}
                />
                <DetailItem
                  label="Last updated"
                  value={formatDateTime(message.updatedAt)}
                />
                <DetailItem
                  label="Read at"
                  value={
                    message.readAt ? formatDateTime(message.readAt) : "Not read"
                  }
                />
                <DetailItem
                  label="Archived at"
                  value={
                    message.archivedAt
                      ? formatDateTime(message.archivedAt)
                      : "Not archived"
                  }
                />
              </dl>

              <div>
                <p className="text-sm font-semibold text-[#111827]">Message</p>
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[#E5E7EB] bg-white p-4 text-sm leading-6 text-[#374151]">
                  {message.message}
                </p>
              </div>

              {canUpdateStatus && (
                <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] pt-4">
                  <StatusActionButton
                    status="READ"
                    currentStatus={message.status}
                    isPending={isStatusUpdatePending || isDeletePending}
                    onClick={handleStatusChange}
                  />
                  <StatusActionButton
                    status="UNREAD"
                    currentStatus={message.status}
                    isPending={isStatusUpdatePending || isDeletePending}
                    onClick={handleStatusChange}
                  />
                  <StatusActionButton
                    status="ARCHIVED"
                    currentStatus={message.status}
                    isPending={isStatusUpdatePending || isDeletePending}
                    onClick={handleStatusChange}
                  />
                  {updateStatusMutation.isError && (
                    <p className="basis-full text-sm text-[#B91C1C]">
                      Could not update message status.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteMessage(message)}
                    disabled={isDeletePending || isStatusUpdatePending}
                    className="rounded-md bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeletePending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function isUpdateContactMessageStatusVariables(
  value: unknown,
): value is UpdateContactMessageStatusVariables {
  return (
    typeof value === "object" &&
    value !== null &&
    "messageId" in value &&
    "status" in value
  );
}

type DetailItemProps = {
  label: string;
  value: string | null;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-sm font-medium text-[#111827]">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

type DetailLinkProps = DetailItemProps & {
  href: string | null;
};

function DetailLink({ label, value, href }: DetailLinkProps) {
  if (!value || !href) {
    return <DetailItem label={label} value={value} />;
  }

  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
        {label}
      </dt>
      <dd className="mt-1 wrap-break-word text-sm font-medium">
        <a className="text-[#7C3AED] hover:text-[#6D28D9]" href={href}>
          {value}
        </a>
      </dd>
    </div>
  );
}

type StatusActionButtonProps = {
  status: MessageStatus;
  currentStatus: MessageStatus;
  isPending: boolean;
  onClick: (status: MessageStatus) => void;
};

function StatusActionButton({
  status,
  currentStatus,
  isPending,
  onClick,
}: StatusActionButtonProps) {
  return (
    <button
      type="button"
      disabled={isPending || status === currentStatus}
      onClick={() => onClick(status)}
      className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Mark as {getMessageStatusLabel(status).toLowerCase()}
    </button>
  );
}
