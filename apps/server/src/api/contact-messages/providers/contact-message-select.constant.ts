import { Prisma } from '@prisma/client';

export const adminContactMessageSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
  status: true,
  readAt: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ContactMessageSelect;

export type AdminContactMessage = Prisma.ContactMessageGetPayload<{
  select: typeof adminContactMessageSelect;
}>;
