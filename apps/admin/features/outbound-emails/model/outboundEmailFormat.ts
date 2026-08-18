export function formatOutboundEmailDateTime(value: string | null): string {
  if (!value) {
    return 'Not sent';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatSenderName(sender: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  const fullName = [sender.firstName, sender.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ');

  return fullName || sender.email;
}
