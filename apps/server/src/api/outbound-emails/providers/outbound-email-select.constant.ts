import { Prisma } from '@prisma/client';

const outboundEmailSenderSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} satisfies Prisma.UserSelect;

export const outboundEmailListSelect = {
  id: true,
  recipientEmail: true,
  recipientName: true,
  subject: true,
  status: true,
  sentAt: true,
  createdAt: true,
  createdBy: {
    select: outboundEmailSenderSelect,
  },
} satisfies Prisma.OutboundEmailSelect;

export const outboundEmailDetailSelect = {
  ...outboundEmailListSelect,
  heading: true,
  message: true,
  buttonText: true,
  buttonUrl: true,
  providerMessageId: true,
  failureCode: true,
  updatedAt: true,
} satisfies Prisma.OutboundEmailSelect;

export type OutboundEmailListItem = Prisma.OutboundEmailGetPayload<{
  select: typeof outboundEmailListSelect;
}>;

export type OutboundEmailDetail = Prisma.OutboundEmailGetPayload<{
  select: typeof outboundEmailDetailSelect;
}>;
