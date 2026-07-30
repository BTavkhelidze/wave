import type {
  CreateUserFormValues,
  CreateUserRole,
} from './createUserForm.types';

export const CREATE_USER_ROLE_VALUES = [
  'SUPER_ADMIN',
  'ADMIN',
  'EMPLOYEE',
] as const satisfies readonly [CreateUserRole, ...CreateUserRole[]];

export const CREATE_USER_ROLE_OPTIONS: ReadonlyArray<{
  value: CreateUserRole;
  label: string;
}> = [
  {
    value: 'SUPER_ADMIN',
    label: 'Super Admin',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
  },
  {
    value: 'EMPLOYEE',
    label: 'Employee',
  },
];

export const CREATE_USER_FORM_DEFAULT_VALUES: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'ADMIN',
};

export const CREATE_USER_FORM_VALIDATION_MESSAGES = {
  firstNameRequired: 'First name is required.',
  lastNameRequired: 'Last name is required.',
  emailRequired: 'Email is required.',
  emailInvalid: 'Enter a valid email address.',
  roleRequired: 'Role is required.',
} as const;
