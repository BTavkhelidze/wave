import { z } from 'zod';

import {
  CREATE_USER_FORM_VALIDATION_MESSAGES,
  CREATE_USER_ROLE_VALUES,
} from './createUserForm.constants';
import type { CreateUserFormValues } from './createUserForm.types';

export const CreateUserFormSchema: z.ZodType<CreateUserFormValues> = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, {
      message: CREATE_USER_FORM_VALIDATION_MESSAGES.firstNameRequired,
    }),
  lastName: z
    .string()
    .trim()
    .min(1, {
      message: CREATE_USER_FORM_VALIDATION_MESSAGES.lastNameRequired,
    }),
  email: z
    .string()
    .trim()
    .min(1, { message: CREATE_USER_FORM_VALIDATION_MESSAGES.emailRequired })
    .email({ message: CREATE_USER_FORM_VALIDATION_MESSAGES.emailInvalid }),
  role: z.enum(CREATE_USER_ROLE_VALUES, {
    required_error: CREATE_USER_FORM_VALIDATION_MESSAGES.roleRequired,
  }),
});
