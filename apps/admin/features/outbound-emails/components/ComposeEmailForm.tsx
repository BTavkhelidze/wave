import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { useSendOutboundEmailMutation } from '../api/outboundEmails.queries';
import {
  OUTBOUND_EMAIL_LANGUAGES,
  getOutboundEmailLanguageLabel,
  SEND_OUTBOUND_EMAIL_DEFAULT_VALUES,
} from '../model/outboundEmail.constants';
import type { SendOutboundEmailPayload } from '../model/outboundEmail.types';
import { SendOutboundEmailSchema } from '../model/sendOutboundEmail.schema';
import { EmailPreviewDialog } from './EmailPreviewDialog';
import { SendEmailConfirmationDialog } from './SendEmailConfirmationDialog';

const fieldIds = {
  recipientEmail: 'send-email-recipient-email',
  recipientName: 'send-email-recipient-name',
  language: 'send-email-language',
  subject: 'send-email-subject',
  heading: 'send-email-heading',
  message: 'send-email-message',
  buttonText: 'send-email-button-text',
  buttonUrl: 'send-email-button-url',
} as const;

export function ComposeEmailForm() {
  const navigate = useNavigate();
  const sendEmailMutation = useSendOutboundEmailMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewValues, setPreviewValues] =
    useState<SendOutboundEmailPayload | null>(null);
  const [confirmationValues, setConfirmationValues] =
    useState<SendOutboundEmailPayload | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<SendOutboundEmailPayload>({
    resolver: zodResolver(SendOutboundEmailSchema),
    defaultValues: SEND_OUTBOUND_EMAIL_DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const isSending = sendEmailMutation.isPending;

  const onSubmit: SubmitHandler<SendOutboundEmailPayload> = (values) => {
    setServerError(null);
    setSuccessMessage(null);
    setConfirmationValues(normalizeSendOutboundEmailValues(values));
  };

  const handlePreview = () => {
    setPreviewValues(normalizeSendOutboundEmailValues(getValues()));
  };

  const handleConfirmSend = async () => {
    if (!confirmationValues || isSending) {
      return;
    }

    setServerError(null);

    try {
      const response = await sendEmailMutation.mutateAsync(confirmationValues);
      const message = response.message || 'Email sent successfully.';

      setSuccessMessage(message);
      setConfirmationValues(null);

      if (response.data.id) {
        navigate(
          ADMIN_ROUTE_PATHS.emailDetail.replace(':emailId', response.data.id),
          {
            state: {
              successMessage: message,
            },
          },
        );
      } else {
        navigate(ADMIN_ROUTE_PATHS.emails, {
          state: {
            successMessage: message,
          },
        });
      }
    } catch {
      setConfirmationValues(null);
      setServerError(
        'Delivery failed. A FAILED record may be available in email history for review.',
      );
    }
  };

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg border border-[#E5E7EB] bg-white shadow-sm"
      >
        <div className="border-b border-[#E5E7EB] px-5 py-4">
          <h3 className="text-base font-semibold text-[#111827]">
            Email details
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            Send one branded Wave Engineering email to one recipient.
          </p>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={fieldIds.recipientEmail}
              label="Recipient email"
              error={errors.recipientEmail?.message}
            >
              <input
                id={fieldIds.recipientEmail}
                type="email"
                autoComplete="email"
                disabled={isSending}
                className={fieldClassName}
                {...register('recipientEmail')}
              />
            </FormField>

            <FormField
              id={fieldIds.recipientName}
              label="Recipient name"
              error={errors.recipientName?.message}
              optional
            >
              <input
                id={fieldIds.recipientName}
                type="text"
                autoComplete="name"
                disabled={isSending}
                className={fieldClassName}
                {...register('recipientName')}
              />
            </FormField>
          </div>

          <FormField
            id={fieldIds.language}
            label="Email language"
            error={errors.language?.message}
          >
            <select
              id={fieldIds.language}
              disabled={isSending}
              className={fieldClassName}
              {...register('language')}
            >
              {OUTBOUND_EMAIL_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {getOutboundEmailLanguageLabel(language)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id={fieldIds.subject}
            label="Subject"
            error={errors.subject?.message}
          >
            <input
              id={fieldIds.subject}
              type="text"
              disabled={isSending}
              className={fieldClassName}
              {...register('subject')}
            />
          </FormField>

          <FormField
            id={fieldIds.heading}
            label="Heading"
            error={errors.heading?.message}
            optional
          >
            <input
              id={fieldIds.heading}
              type="text"
              disabled={isSending}
              className={fieldClassName}
              {...register('heading')}
            />
          </FormField>

          <FormField
            id={fieldIds.message}
            label="Message"
            error={errors.message?.message}
          >
            <textarea
              id={fieldIds.message}
              rows={10}
              disabled={isSending}
              className={`${fieldClassName} resize-y leading-6`}
              {...register('message')}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id={fieldIds.buttonText}
              label="Button text"
              error={errors.buttonText?.message}
              optional
            >
              <input
                id={fieldIds.buttonText}
                type="text"
                disabled={isSending}
                className={fieldClassName}
                {...register('buttonText')}
              />
            </FormField>

            <FormField
              id={fieldIds.buttonUrl}
              label="Button URL"
              error={errors.buttonUrl?.message}
              optional
            >
              <input
                id={fieldIds.buttonUrl}
                type="url"
                disabled={isSending}
                placeholder="https://waveengineering.ge/services"
                className={fieldClassName}
                {...register('buttonUrl')}
              />
            </FormField>
          </div>

          {serverError && (
            <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div
              aria-live="polite"
              className="rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]"
            >
              {successMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isSending}
            className="rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Preview Email
          </button>
          <button
            type="submit"
            disabled={!isValid || isSending}
            className="rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>

      {previewValues && (
        <EmailPreviewDialog
          values={previewValues}
          onClose={() => setPreviewValues(null)}
        />
      )}

      {confirmationValues && (
        <SendEmailConfirmationDialog
          values={confirmationValues}
          isSending={isSending}
          onCancel={() => setConfirmationValues(null)}
          onConfirm={() => void handleConfirmSend()}
        />
      )}
    </>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
};

function FormField({ id, label, error, optional, children }: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#111827]">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-[#6B7280]">(optional)</span>
        )}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-[#DC2626]">
          {error}
        </p>
      )}
    </div>
  );
}

function normalizeSendOutboundEmailValues(
  values: SendOutboundEmailPayload,
): SendOutboundEmailPayload {
  return {
    recipientEmail: values.recipientEmail.trim().toLowerCase(),
    recipientName: normalizeOptionalValue(values.recipientName),
    language: values.language,
    subject: values.subject.trim(),
    heading: normalizeOptionalValue(values.heading),
    message: values.message.trim(),
    buttonText: normalizeOptionalValue(values.buttonText),
    buttonUrl: normalizeOptionalValue(values.buttonUrl),
  };
}

function normalizeOptionalValue(value: string | undefined): string | undefined {
  const trimmedValue = value?.trim() ?? '';

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

const fieldClassName =
  'w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:text-[#6B7280]';
