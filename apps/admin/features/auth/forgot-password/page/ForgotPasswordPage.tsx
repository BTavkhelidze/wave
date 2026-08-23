import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { isApiRequestError } from '../../../../src/shared/api/httpClient';
import { ADMIN_ROUTE_PATHS } from '../../../../src/app/router/routes.constants';
import { useForgotPasswordMutation } from '../api/forgotPassword.queries';
import {
  ForgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../model/forgotPassword.schema';

const emailFieldId = 'forgot-password-email';
const genericSuccessMessage =
  'If an account exists for this email, password reset instructions have been sent.';

function getForgotPasswordErrorMessage(error: unknown): string {
  if (isApiRequestError(error) && error.status === 429) {
    return 'Too many reset requests. Please wait before trying again.';
  }

  return 'Could not send reset instructions. Please try again.';
}

export function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (values) => {
    setSubmitError(null);

    try {
      await forgotPasswordMutation.mutateAsync(values);
      setHasSubmitted(true);
    } catch (error) {
      setSubmitError(getForgotPasswordErrorMessage(error));
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8 text-[#111827]'>
      <section className='w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h1 className='text-xl font-semibold text-[#111827]'>
            Reset your password
          </h1>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            Enter your admin email to receive reset instructions.
          </p>
        </div>

        {hasSubmitted ? (
          <div className='space-y-5 p-5'>
            <p
              role='status'
              className='rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm leading-6 text-[#166534]'
            >
              {genericSuccessMessage}
            </p>
            <Link
              to={ADMIN_ROUTE_PATHS.login}
              className='inline-flex w-full justify-center rounded-md border border-[#D1D5DB] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-5 p-5'>
              <div>
                <label
                  htmlFor={emailFieldId}
                  className='block text-sm font-medium text-[#111827]'
                >
                  Email
                </label>
                <input
                  id={emailFieldId}
                  type='email'
                  autoComplete='email'
                  aria-invalid={Boolean(errors.email)}
                  className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
                  placeholder='admin@example.com'
                  {...register('email')}
                />
                {errors.email && (
                  <p className='mt-2 text-sm text-[#DC2626]'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {submitError && (
                <p
                  role='alert'
                  className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]'
                >
                  {submitError}
                </p>
              )}
            </div>

            <div className='flex flex-col gap-3 border-t border-[#E5E7EB] px-5 py-4'>
              <button
                type='submit'
                disabled={!isValid || forgotPasswordMutation.isPending}
                className='w-full rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {forgotPasswordMutation.isPending
                  ? 'Sending instructions...'
                  : 'Send reset instructions'}
              </button>
              <Link
                to={ADMIN_ROUTE_PATHS.login}
                className='text-center text-sm font-medium text-[#6D28D9] transition hover:text-[#5B21B6]'
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
