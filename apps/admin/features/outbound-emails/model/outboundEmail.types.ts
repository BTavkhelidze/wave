import type { UserRole } from '../../auth/model/user.types';

export type OutboundEmailStatus = 'PENDING' | 'SENT' | 'FAILED';
export type OutboundEmailLanguage = 'KA' | 'EN';

export type OutboundEmailSortOrder = 'asc' | 'desc';

export type OutboundEmailSender = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type OutboundEmailListItem = {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  language: OutboundEmailLanguage;
  subject: string;
  status: OutboundEmailStatus;
  sentAt: string | null;
  createdAt: string;
  createdBy: OutboundEmailSender;
};

export type OutboundEmailDetail = OutboundEmailListItem & {
  heading: string | null;
  message: string;
  buttonText: string | null;
  buttonUrl: string | null;
  providerMessageId: string | null;
  failureCode: string | null;
  updatedAt: string;
};

export type OutboundEmailsQueryParams = {
  page?: number;
  limit?: number;
  status?: OutboundEmailStatus;
  search?: string;
  sortOrder?: OutboundEmailSortOrder;
};

export type OutboundEmailsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type OutboundEmailsResponse = {
  data: OutboundEmailListItem[];
  meta: OutboundEmailsMeta;
};

export type SendOutboundEmailPayload = {
  recipientEmail: string;
  recipientName?: string;
  language: OutboundEmailLanguage;
  subject: string;
  heading?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
};

export type SendOutboundEmailResponse = {
  message: string;
  data: {
    id: string;
    recipientEmail: string;
    language: OutboundEmailLanguage;
    subject: string;
    status: OutboundEmailStatus;
    sentAt: string;
  };
};
