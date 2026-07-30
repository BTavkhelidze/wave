import { CREATE_USER_ROLE_OPTIONS } from '../../create-user';
import type { UserListItemData } from './usersList.types';

export function getUserRoleLabel(role: UserListItemData['role']): string {
  return (
    CREATE_USER_ROLE_OPTIONS.find((roleOption) => roleOption.value === role)
      ?.label ?? role
  );
}
