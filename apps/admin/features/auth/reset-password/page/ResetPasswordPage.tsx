import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
  isApiRequestError,
  isAuthRequestError,
} from '../../../../src/shared/api/httpClient';
import { ADMIN_ROUTE_PATHS } from '../../../../src/app/router/routes.constants';
import { adminPasswordPolicyText } from '../../model/adminPassword.schema';
import { useResetPasswordMutation } from '../api/resetPassword.queries';
import {
  ResetPasswordSchema,
  type ResetPasswordFormValues,
} from '../model/resetPassword.schema';

const newPasswordFieldId = 'reset-password-new';
const confirmPasswordFieldId = 'reset-password-confirm';
const invalidLinkMessage =
  'This password reset link is invalid or has expired. Request a new reset link to continue.';

function getResetPasswordErrorMessage(error: unknown): string {
  if (isApiRequestError(error) && error.status === 429) {
    return 'Too many reset attempts. Please wait before trying again.';
  }

  if (isAuthRequestError(error)) {
    return invalidLinkMessage;
  }

  return 'Could not reset your password. Please try again.';
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasTokenParam = useMemo(() => searchParams.has('token'), [searchParams]);
  const initialToken = useMemo(() => {
    const token = searchParams.get('token')?.trim();

    return token ? token : null;
  }, [searchParams]);
  const [resetToken, setResetToken] = useState<string | null>(initialToken);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isInvalidLink, setIsInvalidLink] = useState(!initialToken);
  const [hasResetPassword, setHasResetPassword] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (hasTokenParam) {
      navigate(ADMIN_ROUTE_PATHS.resetPassword, { replace: true });
    }
  }, [hasTokenParam, navigate]);

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (values) => {
    if (!resetToken) {
      setIsInvalidLink(true);
      return;
    }

    setSubmitError(null);

    try {
      await resetPasswordMutation.mutateAsync({
        token: resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      reset();
      setResetToken(null);
      setHasResetPassword(true);
    } catch (error) {
      if (isApiRequestError(error) && error.status === 400) {
        setResetToken(null);
        setIsInvalidLink(true);
        setSubmitError(null);
        return;
      }

      const message = getResetPasswordErrorMessage(error);
      setSubmitError(message);

      if (message === invalidLinkMessage) {
        setResetToken(null);
        setIsInvalidLink(true);
      }
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8 text-[#111827]'>
      <section className='w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h1 className='text-xl font-semibold text-[#111827]'>
            Set a new password
          </h1>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            Choose a new password for your admin account.
          </p>
        </div>

        {hasResetPassword ? (
          <div className='space-y-5 p-5'>
            <p
              role='status'
              className='rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm leading-6 text-[#166534]'
            >
              Password has been reset successfully. Please sign in with your new
              password.
            </p>
            <Link
              to={ADMIN_ROUTE_PATHS.login}
              className='inline-flex w-full justify-center rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
            >
              Go to login
            </Link>
          </div>
        ) : isInvalidLink ? (
          <div className='space-y-5 p-5'>
            <p
              role='alert'
              className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'
            >
              {invalidLinkMessage}
            </p>
            <Link
              to={ADMIN_ROUTE_PATHS.forgotPassword}
              className='inline-flex w-full justify-center rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className='space-y-5 p-5'>
              <div>
                <label
                  htmlFor={newPasswordFieldId}
                  className='block text-sm font-medium text-[#111827]'
                >
                  New password
                </label>
                <input
                  id={newPasswordFieldId}
                  type='password'
                  autoComplete='new-password'
                  aria-invalid={Boolean(errors.newPassword)}
                  className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className='mt-2 text-sm text-[#DC2626]'>
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={confirmPasswordFieldId}
                  className='block text-sm font-medium text-[#111827]'
                >
                  Confirm new password
                </label>
                <input
                  id={confirmPasswordFieldId}
                  type='password'
                  autoComplete='new-password'
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className='mt-2 text-sm text-[#DC2626]'>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className='rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 text-sm leading-6 text-[#5B21B6]'>
                {adminPasswordPolicyText}
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

            <div className='border-t border-[#E5E7EB] px-5 py-4'>
              <button
                type='submit'
                disabled={!isValid || resetPasswordMutation.isPending}
                className='w-full rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {resetPasswordMutation.isPending
                  ? 'Resetting password...'
                  : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
