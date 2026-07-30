import type { UserRole } from '../../auth/model/user.types';

export type AdminAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PASSWORD_CHANGE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE';

export type AdminEntity = 'USER' | 'SERVICE' | 'BLOG' | 'CONTACT_MESSAGE';

export type AdminLogSortOrder = 'asc' | 'desc';

export type AdminLogsQueryParams = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AdminAction;
  entity?: AdminEntity;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortOrder?: AdminLogSortOrder;
};

export type AdminLogUser = {
  id: string;
  email: string;
  role: UserRole;
};

export type AdminLog = {
  id: string;
  userId: string | null;
  action: AdminAction;
  entity: AdminEntity;
  entityId: string | null;
  createdAt: string;
  user: AdminLogUser | null;
};

export type AdminLogsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type AdminLogsResponse = {
  data: AdminLog[];
  pagination: AdminLogsPagination;
};
