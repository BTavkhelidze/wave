import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../context/AuthContext';
import {
  ADMIN_DEFAULT_ROUTE,
  ADMIN_ROUTE_PATHS,
} from '../../src/app/router/routes.constants';
import { LoginSchema } from './schema/LoginShcema';

type LoginFormValues = z.infer<typeof LoginSchema>;

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setSubmitError(null);

    try {
      const user = await login(data);
      navigate(
        user.mustChangePassword
          ? ADMIN_ROUTE_PATHS.changeInitialPassword
          : ADMIN_DEFAULT_ROUTE,
        { replace: true },
      );
    } catch {
      setSubmitError('Invalid email or password');
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex w-full max-w-sm flex-col gap-4 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm'
      >
        <div>
          <h1 className='text-xl font-semibold text-[#111827]'>Admin Login</h1>
          <p className='mt-1 text-sm text-[#6B7280]'>Sign in to continue</p>
        </div>

        <label className='flex flex-col gap-1 text-sm font-medium text-[#111827]'>
          Email
          <input
            {...register('email')}
            className='rounded-md border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]'
            placeholder='admin@example.com'
            type='email'
          />
        </label>
        {errors.email && (
          <p className='text-sm text-[#DC2626]'>{errors.email.message}</p>
        )}

        <label className='flex flex-col gap-1 text-sm font-medium text-[#111827]'>
          Password
          <input
            {...register('password')}
            className='rounded-md border border-[#D1D5DB] px-3 py-2 text-sm outline-none focus:border-[#7C3AED]'
            placeholder='Password'
            type='password'
          />
        </label>
        {errors.password && (
          <p className='text-sm text-[#DC2626]'>{errors.password.message}</p>
        )}

        {submitError && <p className='text-sm text-[#DC2626]'>{submitError}</p>}

        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-70'
        >
          {isSubmitting ? 'Signing in...' : 'Log in'}
        </button>
      </form>
    </main>
  );
}

export default Login;
