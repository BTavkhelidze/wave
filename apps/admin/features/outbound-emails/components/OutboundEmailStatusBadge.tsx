import { getOutboundEmailStatusLabel } from '../model/outboundEmail.constants';
import type { OutboundEmailStatus } from '../model/outboundEmail.types';

type OutboundEmailStatusBadgeProps = {
  status: OutboundEmailStatus;
};

export function OutboundEmailStatusBadge({
  status,
}: OutboundEmailStatusBadgeProps) {
  const classNameByStatus: Record<OutboundEmailStatus, string> = {
    PENDING: 'border-[#DDD6FE] bg-[#F3EEFF] text-[#6D28D9]',
    SENT: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]',
    FAILED: 'border-[#FCA5A5] bg-[#FEF2F2] text-[#B91C1C]',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${classNameByStatus[status]}`}
    >
      {getOutboundEmailStatusLabel(status)}
    </span>
  );
}
