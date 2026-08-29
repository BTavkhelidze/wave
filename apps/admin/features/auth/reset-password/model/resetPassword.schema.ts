import { z } from 'zod';

import { AdminPasswordSchema } from '../../model/adminPassword.schema';

export const ResetPasswordSchema = z
  .object({
    newPassword: AdminPasswordSchema,
    confirmPassword: z.string().min(1, {
      message: 'Confirm your new password.',
    }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;
