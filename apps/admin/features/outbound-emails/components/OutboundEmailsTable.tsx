import { Link } from "react-router-dom";
import { ADMIN_ROUTE_PATHS } from "../../../src/app/router/routes.constants";
import {
  formatOutboundEmailDateTime,
  formatSenderName,
} from "../model/outboundEmailFormat";
import type { OutboundEmailListItem } from "../model/outboundEmail.types";
import { OutboundEmailStatusBadge } from "./OutboundEmailStatusBadge";

type OutboundEmailsTableProps = {
  emails: OutboundEmailListItem[];
  deletingEmailId: string | null;
  onDeleteEmail: (email: OutboundEmailListItem) => void;
};

export function OutboundEmailsTable({
  emails,
  deletingEmailId,
  onDeleteEmail,
}: OutboundEmailsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#F8FAFC]">
            <tr className="border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              <th scope="col" className="px-5 py-3">
                Recipient
              </th>
              <th scope="col" className="px-5 py-3">
                Subject
              </th>
              <th scope="col" className="px-5 py-3">
                Sent by
              </th>
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-5 py-3">
                Created
              </th>
              <th scope="col" className="px-5 py-3">
                Sent
              </th>
              <th scope="col" className="px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {emails.map((email) => (
              <tr
                key={email.id}
                className="border-b border-[#E5E7EB] last:border-b-0"
              >
                <td className="min-w-[240px] px-5 py-4">
                  <p className="line-clamp-1 text-sm font-medium text-[#111827]">
                    {email.recipientName || "No recipient name"}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#6B7280]">
                    {email.recipientEmail}
                  </p>
                </td>
                <td className="min-w-[260px] px-5 py-4">
                  <p className="line-clamp-2 text-sm font-medium text-[#111827]">
                    {email.subject}
                  </p>
                </td>
                <td className="min-w-[180px] px-5 py-4">
                  <p className="line-clamp-1 text-sm text-[#111827]">
                    {formatSenderName(email.createdBy)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#6B7280]">
                    {email.createdBy.role}
                  </p>
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <OutboundEmailStatusBadge status={email.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                  {formatOutboundEmailDateTime(email.createdAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]">
                  {formatOutboundEmailDateTime(email.sentAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={ADMIN_ROUTE_PATHS.emailDetail.replace(
                        ":emailId",
                        email.id,
                      )}
                      className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDeleteEmail(email)}
                      disabled={deletingEmailId === email.id}
                      className="rounded-md border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingEmailId === email.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
