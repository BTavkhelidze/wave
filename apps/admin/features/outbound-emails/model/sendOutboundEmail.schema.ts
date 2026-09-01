import { z } from 'zod';
import { SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES } from './outboundEmail.constants';
import type { SendOutboundEmailPayload } from './outboundEmail.types';

const optionalTrimmedString = (maxLength: number, message: string) =>
  z.string().trim().max(maxLength, { message }).optional().or(z.literal(''));

const absoluteHttpUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      try {
        const parsedUrl = new URL(value);

        return (
          parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
        );
      } catch {
        return false;
      }
    },
    {
      message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.buttonUrlInvalid,
    },
  );

export const SendOutboundEmailSchema: z.ZodType<SendOutboundEmailPayload> = z
  .object({
    recipientEmail: z
      .string()
      .trim()
      .min(1, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.recipientEmailRequired,
      })
      .email({
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.recipientEmailInvalid,
      })
      .max(254, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.recipientEmailMax,
      }),
    recipientName: optionalTrimmedString(
      100,
      SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.recipientNameMax,
    ),
    language: z.enum(['KA', 'EN'], {
      required_error: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.languageRequired,
      invalid_type_error:
        SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.languageRequired,
    }),
    subject: z
      .string()
      .trim()
      .min(1, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.subjectRequired,
      })
      .min(2, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.subjectShort,
      })
      .max(150, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.subjectMax,
      }),
    heading: optionalTrimmedString(
      150,
      SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.headingMax,
    ),
    message: z
      .string()
      .trim()
      .min(1, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.messageRequired,
      })
      .min(2, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.messageShort,
      })
      .max(10000, {
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.messageMax,
      }),
    buttonText: optionalTrimmedString(
      60,
      SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.buttonTextMax,
    ),
    buttonUrl: absoluteHttpUrl,
  })
  .superRefine((values, context) => {
    const hasButtonText = Boolean(values.buttonText?.trim());
    const hasButtonUrl = Boolean(values.buttonUrl?.trim());

    if (hasButtonText !== hasButtonUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasButtonText ? ['buttonUrl'] : ['buttonText'],
        message: SEND_OUTBOUND_EMAIL_VALIDATION_MESSAGES.buttonPairRequired,
      });
    }
  });
