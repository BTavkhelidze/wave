export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';

export interface AuthenticatedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt: string | null;
}
