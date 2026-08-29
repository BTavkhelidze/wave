import { z } from 'zod';

import { AdminPasswordSchema } from '../../model/adminPassword.schema';

export const ChangeInitialPasswordSchema = z
  .object({
    newPassword: AdminPasswordSchema,
    confirmNewPassword: z.string().min(1, {
      message: 'Confirm your new password.',
    }),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });

export type ChangeInitialPasswordFormValues = z.infer<
  typeof ChangeInitialPasswordSchema
>;
