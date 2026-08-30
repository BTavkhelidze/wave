import { MessageStatusBadge } from "./MessageStatusBadge";
import type { ContactMessage, MessageStatus } from "../model/message.types";

type MessagesTableProps = {
  messages: ContactMessage[];
  canDeleteMessages: boolean;
  deletingMessageId: string | null;
  onOpenMessage: (messageId: string, status: MessageStatus) => void;
  onDeleteMessage: (message: ContactMessage) => void;
};

export function MessagesTable({
  messages,
  canDeleteMessages,
  deletingMessageId,
  onOpenMessage,
  onDeleteMessage,
}: MessagesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#F8FAFC]">
            <tr className="border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              <th scope="col" className="px-5 py-3">
                Sender
              </th>
              <th scope="col" className="px-5 py-3">
                Subject
              </th>
              <th scope="col" className="px-5 py-3">
                Preview
              </th>
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-5 py-3">
                Received
              </th>
              <th scope="col" className="px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => {
              const isUnread = message.status === "UNREAD";

              return (
                <tr
                  key={message.id}
                  className={[
                    "border-b border-[#E5E7EB] last:border-b-0",
                    isUnread ? "bg-[#FBFAFF]" : "",
                  ].join(" ")}
                >
                  <td className="min-w-[240px] px-5 py-4">
                    <p
                      className={[
                        "line-clamp-1 text-sm text-[#111827]",
                        isUnread ? "font-semibold" : "font-medium",
                      ].join(" ")}
                    >
                      {message.fullName}
                    </p>
                    <a
                      href={buildMailtoHref(message.email)}
                      className="mt-1 block line-clamp-1 text-xs text-[#6B7280] transition hover:text-[#7C3AED]"
                    >
                      {message.email}
                    </a>
                    {message.phone && (
                      <a
                        href={buildTelHref(message.phone)}
                        className="mt-1 block line-clamp-1 text-xs text-[#6B7280] transition hover:text-[#7C3AED]"
                      >
                        {message.phone}
                      </a>
                    )}
                  </td>
                  <td className="min-w-[220px] px-5 py-4">
                    <p
                      className={[
                        "line-clamp-2 text-sm text-[#111827]",
                        isUnread ? "font-semibold" : "font-medium",
                      ].join(" ")}
                    >
                      {message.subject || "No subject"}
                    </p>
                  </td>
                  <td className="min-w-[280px] px-5 py-4">
                    <p className="line-clamp-2 text-sm leading-6 text-[#6B7280]">
                      {message.message}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <MessageStatusBadge status={message.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                    {formatDateTime(message.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenMessage(message.id, message.status)
                        }
                        disabled={deletingMessageId === message.id}
                        className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        View
                      </button>
                      {canDeleteMessages && (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(message)}
                          disabled={deletingMessageId === message.id}
                          className="rounded-md border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingMessageId === message.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildMailtoHref(email: string): string {
  return `mailto:${email.replace(/[\r\n]/g, "")}`;
}

export function buildTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+*#]/g, "")}`;
}
