import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import {
  CREATE_USER_FORM_DEFAULT_VALUES,
  CREATE_USER_ROLE_OPTIONS,
} from '../model/createUserForm.constants';
import { CreateUserFormSchema } from '../model/createUserForm.schema';
import type { CreateUserFormValues } from '../model/createUserForm.types';
import { useCreateUserMutation } from '../api/createUser.queries';

const firstNameFieldId = 'create-user-first-name';
const firstNameErrorId = 'create-user-first-name-error';
const lastNameFieldId = 'create-user-last-name';
const lastNameErrorId = 'create-user-last-name-error';
const emailFieldId = 'create-user-email';
const emailErrorId = 'create-user-email-error';
const roleFieldId = 'create-user-role';
const roleErrorId = 'create-user-role-error';

export function CreateUserForm() {
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const createUserMutation = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: CREATE_USER_FORM_DEFAULT_VALUES,
    mode: 'onBlur',
  });

  const firstNameError = errors.firstName?.message;
  const lastNameError = errors.lastName?.message;
  const emailError = errors.email?.message;
  const roleError = errors.role?.message;
  const submitError =
    createUserMutation.error instanceof Error
      ? createUserMutation.error.message
      : null;

  const onSubmit: SubmitHandler<CreateUserFormValues> = async (data) => {
    setCreatedUserCredentials(null);

    const normalizedData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
    };

    try {
      const response = await createUserMutation.mutateAsync(normalizedData);

      setCreatedUserCredentials({
        email: response.user.email,
        temporaryPassword: response.temporaryPassword,
      });
      reset(CREATE_USER_FORM_DEFAULT_VALUES);
    } catch {
      setCreatedUserCredentials(null);
    }
  };

  const handleCancel = () => {
    setCreatedUserCredentials(null);
    reset(CREATE_USER_FORM_DEFAULT_VALUES);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'
    >
      <div className='border-b border-[#E5E7EB] px-5 py-4'>
        <h3 className='text-base font-semibold text-[#111827]'>
          User details
        </h3>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Add the account details and choose the access level for this user.
        </p>
      </div>

      <div className='space-y-6 p-5'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label
              htmlFor={firstNameFieldId}
              className='block text-sm font-medium text-[#111827]'
            >
              First name
            </label>
            <input
              id={firstNameFieldId}
              type='text'
              autoComplete='given-name'
              aria-invalid={Boolean(firstNameError)}
              aria-describedby={firstNameError ? firstNameErrorId : undefined}
              className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
              {...register('firstName')}
            />
            {firstNameError && (
              <p id={firstNameErrorId} className='mt-2 text-sm text-[#DC2626]'>
                {firstNameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={lastNameFieldId}
              className='block text-sm font-medium text-[#111827]'
            >
              Last name
            </label>
            <input
              id={lastNameFieldId}
              type='text'
              autoComplete='family-name'
              aria-invalid={Boolean(lastNameError)}
              aria-describedby={lastNameError ? lastNameErrorId : undefined}
              className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
              {...register('lastName')}
            />
            {lastNameError && (
              <p id={lastNameErrorId} className='mt-2 text-sm text-[#DC2626]'>
                {lastNameError}
              </p>
            )}
          </div>
        </div>

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
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? emailErrorId : undefined}
            className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...register('email')}
          />
          {emailError && (
            <p id={emailErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={roleFieldId}
            className='block text-sm font-medium text-[#111827]'
          >
            Role
          </label>
          <select
            id={roleFieldId}
            aria-invalid={Boolean(roleError)}
            aria-describedby={roleError ? roleErrorId : undefined}
            className='mt-2 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...register('role')}
          >
            {CREATE_USER_ROLE_OPTIONS.map((roleOption) => (
              <option key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </option>
            ))}
          </select>
          {roleError && (
            <p id={roleErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {roleError}
            </p>
          )}
        </div>

        <div className='rounded-md border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3 text-sm leading-6 text-[#5B21B6]'>
          An initial password will be generated automatically after the user is
          created.
        </div>

        {submitError && (
          <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'>
            {submitError}
          </div>
        )}

        {createdUserCredentials && (
          <div
            aria-live='polite'
            className='rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]'
          >
            <p className='font-semibold text-[#065F46]'>User created.</p>
            <p className='mt-1'>
              Email:{' '}
              <span className='font-mono font-semibold'>
                {createdUserCredentials.email}
              </span>
            </p>
            <p className='mt-1'>
              Initial password:{' '}
              <span className='font-mono font-semibold'>
                {createdUserCredentials.temporaryPassword}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={handleCancel}
          disabled={!isDirty || createUserMutation.isPending}
          className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={!isValid || createUserMutation.isPending}
          className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {createUserMutation.isPending ? 'Creating...' : 'Create user'}
        </button>
      </div>
    </form>
  );
}
