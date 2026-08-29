import type { UserRole } from '../../../auth/model/user.types';

export type CreateUserRole = UserRole;

export type CreateUserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: CreateUserRole;
};
