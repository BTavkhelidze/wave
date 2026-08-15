import type { MessageStatus } from './message.types';

export const MESSAGE_STATUSES: readonly MessageStatus[] = [
  'UNREAD',
  'READ',
  'ARCHIVED',
];

export function getMessageStatusLabel(status: MessageStatus): string {
  const labels: Record<MessageStatus, string> = {
    UNREAD: 'Unread',
    READ: 'Read',
    ARCHIVED: 'Archived',
  };

  return labels[status];
}
