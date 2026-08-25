import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../context/AuthContext';
import { ADMIN_DEFAULT_ROUTE } from '../../../../src/app/router/routes.constants';
import { useChangeInitialPasswordMutation } from '../api/changeInitialPassword.queries';
import { adminPasswordPolicyText } from '../../model/adminPassword.schema';
import {
  ChangeInitialPasswordSchema,
  type ChangeInitialPasswordFormValues,
} from '../model/changeInitialPassword.schema';

const newPasswordFieldId = 'change-initial-password-new';
const confirmNewPasswordFieldId = 'change-initial-password-confirm';

export function ChangeInitialPasswordPage() {
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const changeInitialPasswordMutation = useChangeInitialPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangeInitialPasswordFormValues>({
    resolver: zodResolver(ChangeInitialPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<ChangeInitialPasswordFormValues> = async (
    values,
  ) => {
    setSubmitError(null);

    try {
      await changeInitialPasswordMutation.mutateAsync({
        newPassword: values.newPassword,
      });
      await refreshCurrentUser();
      navigate(ADMIN_DEFAULT_ROUTE, { replace: true });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Could not change your password.',
      );
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8 text-[#111827]'>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className='w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white shadow-sm'
      >
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h1 className='text-xl font-semibold text-[#111827]'>
            Change initial password
          </h1>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            Set a permanent password before continuing to the admin panel.
          </p>
        </div>

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
              htmlFor={confirmNewPasswordFieldId}
              className='block text-sm font-medium text-[#111827]'
            >
              Confirm new password
            </label>
            <input
              id={confirmNewPasswordFieldId}
              type='password'
              autoComplete='new-password'
              aria-invalid={Boolean(errors.confirmNewPassword)}
              className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
              {...register('confirmNewPassword')}
            />
            {errors.confirmNewPassword && (
              <p className='mt-2 text-sm text-[#DC2626]'>
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <div className='rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 text-sm leading-6 text-[#5B21B6]'>
            {adminPasswordPolicyText}
          </div>

          {submitError && (
            <p className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]'>
              {submitError}
            </p>
          )}
        </div>

        <div className='border-t border-[#E5E7EB] px-5 py-4'>
          <button
            type='submit'
            disabled={!isValid || changeInitialPasswordMutation.isPending}
            className='w-full rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {changeInitialPasswordMutation.isPending
              ? 'Changing password...'
              : 'Change password'}
          </button>
        </div>
      </form>
    </main>
  );
}
