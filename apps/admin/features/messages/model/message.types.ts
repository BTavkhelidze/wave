export type MessageStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export type MessageSortOrder = 'asc' | 'desc';

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessagesQueryParams = {
  page?: number;
  limit?: number;
  status?: MessageStatus;
  search?: string;
  sortOrder?: MessageSortOrder;
};

export type ContactMessagesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ContactMessagesResponse = {
  data: ContactMessage[];
  meta: ContactMessagesMeta;
};

export type ContactMessagesUnreadCountResponse = {
  count: number;
};

export type UpdateContactMessageStatusPayload = {
  status: MessageStatus;
};
