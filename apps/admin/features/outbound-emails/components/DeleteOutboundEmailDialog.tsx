import type {
  OutboundEmailDetail,
  OutboundEmailListItem,
} from "../model/outboundEmail.types";

type DeleteOutboundEmailDialogProps = {
  email: OutboundEmailDetail | OutboundEmailListItem;
  isDeleting: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteOutboundEmailDialog({
  email,
  isDeleting,
  errorMessage,
  onCancel,
  onConfirm,
}: DeleteOutboundEmailDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 px-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-outbound-email-dialog-title"
        className="w-full max-w-md rounded-lg border border-[#FCA5A5] bg-white shadow-xl"
      >
        <div className="border-b border-[#FEE2E2] px-5 py-4">
          <h2
            id="delete-outbound-email-dialog-title"
            className="text-base font-semibold text-[#991B1B]"
          >
            Delete email record?
          </h2>
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-sm leading-6 text-[#374151]">
            This email history record will be removed from the Admin Panel. This
            action does not recall an email that has already been delivered.
          </p>
          <div className="rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-sm text-[#111827]">
            <p className="wrap-break-word font-semibold">{email.subject}</p>
            <p className="mt-1 wrap-break-word text-xs text-[#6B7280]">
              {email.recipientName || "No recipient name"} -{" "}
              {email.recipientEmail}
            </p>
          </div>
          {errorMessage && (
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm leading-6 text-[#B91C1C]">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#FEE2E2] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
