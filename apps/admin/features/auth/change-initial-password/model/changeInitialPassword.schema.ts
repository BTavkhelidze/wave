import { z } from 'zod';

export const ChangeInitialPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters.' })
      .regex(/[a-z]/, {
        message: 'New password must include a lowercase letter.',
      })
      .regex(/[A-Z]/, {
        message: 'New password must include an uppercase letter.',
      })
      .regex(/\d/, { message: 'New password must include a number.' })
      .regex(/[^A-Za-z0-9]/, {
        message: 'New password must include a special character.',
      }),
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
