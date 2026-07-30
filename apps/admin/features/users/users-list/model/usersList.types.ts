import type { UserRole } from '../../../auth/model/user.types';

export type UserListItemData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
