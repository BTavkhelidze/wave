import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { queryClient } from './query-client';

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200/70">
              Wave Admin
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">
              Operations Console
            </h1>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              to="/"
              className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:border-sky-300/50 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/sign-in"
              className="rounded-full bg-sky-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-300"
            >
              Sign in
            </Link>
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        status: 'Healthy',
        activeSessions: 18,
        tasksQueued: 4,
        uptime: '99.98%',
      };
    },
  });
  const health = data ?? {
    status: 'Healthy',
    activeSessions: 0,
    tasksQueued: 0,
    uptime: '0%',
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">
          Overview
        </p>
        <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          A focused control room for the admin experience.
        </h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          This scaffold gives us a typed React foundation with routing, server
          state, and form validation ready to extend into real admin workflows.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['Revenue', '$128.4k'],
            ['Active users', '1,284'],
            ['Queues', '3 live'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">
          System status
        </p>
        <div className="mt-5 space-y-4">
          {isLoading ? (
            <p className="text-slate-300">Loading status...</p>
          ) : isError ? (
            <p className="text-rose-300">Could not load admin health.</p>
          ) : (
            <>
              <StatusRow label="Health" value={health.status} />
              <StatusRow label="Sessions" value={String(health.activeSessions)} />
              <StatusRow label="Queued jobs" value={String(health.tasksQueued)} />
              <StatusRow label="Uptime" value={health.uptime} />
            </>
          )}
        </div>
      </aside>
    </section>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    window.alert(`Signed in as ${values.email}`);
    reset();
  };

  return (
    <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-8 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-200/70">
          Access
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Sign in with validated credentials.
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          The form stack is wired with React Hook Form, Zod, and the resolvers
          package so future admin screens can share the same validation flow.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <div className="space-y-5">
          <Field
            label="Email"
            error={errors.email?.message}
            inputProps={register('email')}
            type="email"
            placeholder="admin@wave.app"
          />
          <Field
            label="Password"
            error={errors.password?.message}
            inputProps={register('password')}
            type="password"
            placeholder="********"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  inputProps,
  type,
  placeholder,
}: {
  label: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
  type: 'email' | 'password';
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        {...inputProps}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300/70 focus:ring-2 focus:ring-sky-400/20"
      />
      {error ? (
        <span className="mt-2 block text-sm text-rose-300">{error}</span>
      ) : null}
    </label>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
