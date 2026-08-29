import { z } from 'zod';

import { LoginSchema } from '../../schema/LoginShcema';

export const ForgotPasswordSchema = LoginSchema.pick({
  email: true,
});

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
