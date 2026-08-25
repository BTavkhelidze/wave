import { z } from 'zod';

export const adminPasswordPolicyText =
  'Use 8 to 128 characters with uppercase, lowercase, a number, and a special character.';

export const AdminPasswordSchema = z
  .string()
  .min(8, { message: 'New password must be at least 8 characters.' })
  .max(128, { message: 'New password must be 128 characters or fewer.' })
  .regex(/[a-z]/, {
    message: 'New password must include a lowercase letter.',
  })
  .regex(/[A-Z]/, {
    message: 'New password must include an uppercase letter.',
  })
  .regex(/\d/, { message: 'New password must include a number.' })
  .regex(/[^A-Za-z0-9]/, {
    message: 'New password must include a special character.',
  });
