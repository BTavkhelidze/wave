import { getMessageStatusLabel } from '../model/message.constants';
import type { MessageStatus } from '../model/message.types';

type MessageStatusBadgeProps = {
  status: MessageStatus;
};

export function MessageStatusBadge({ status }: MessageStatusBadgeProps) {
  const classNameByStatus: Record<MessageStatus, string> = {
    UNREAD: 'border-[#DDD6FE] bg-[#F3EEFF] text-[#6D28D9]',
    READ: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]',
    ARCHIVED: 'border-[#D1D5DB] bg-[#F8FAFC] text-[#4B5563]',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${classNameByStatus[status]}`}
    >
      {getMessageStatusLabel(status)}
    </span>
  );
}
