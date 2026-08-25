import type {
  OutboundEmailStatus,
  SendOutboundEmailPayload,
} from './outboundEmail.types';

export const OUTBOUND_EMAIL_STATUSES = [
  'PENDING',
  'SENT',
  'FAILED',
] as const satisfies readonly OutboundEmailStatus[];

export const OUTBOUND_EMAIL_STATUS_LABELS: Record<OutboundEmailStatus, string> =
  {
    PENDING: 'Pending',
    SENT: 'Sent',
    FAILED: 'Failed',
  };

export const SEND_OUTBOUND_EMAIL_DEFAULT_VALUES: SendOutboundEmailPayload = {
  recipientEmail: '',
  recipientName: '',
  subject: '',
  heading: '',
  message: '',
  buttonText: '',
  buttonUrl: '',
};

export const SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES = {
  recipientEmailRequired: 'Recipient email is required.',
  recipientEmailInvalid: 'Enter a valid recipient email address.',
  recipientEmailMax: 'Recipient email must be at most 254 characters.',
  recipientNameMax: 'Recipient name must be at most 100 characters.',
  subjectRequired: 'Subject is required.',
  subjectShort: 'Subject must be at least 2 characters.',
  subjectMax: 'Subject must be at most 150 characters.',
  headingMax: 'Heading must be at most 150 characters.',
  messageRequired: 'Message is required.',
  messageShort: 'Message must be at least 2 characters.',
  messageMax: 'Message must be at most 10000 characters.',
  buttonTextMax: 'Button text must be at most 60 characters.',
  buttonUrlInvalid: 'Enter an absolute HTTP or HTTPS URL.',
  buttonPairRequired: 'Button text and button URL must be provided together.',
} as const;

export function getOutboundEmailStatusLabel(
  status: OutboundEmailStatus,
): string {
  return OUTBOUND_EMAIL_STATUS_LABELS[status];
}
