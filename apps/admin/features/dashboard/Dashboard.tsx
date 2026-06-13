import { useQuery } from '@tanstack/react-query';
import React from 'react'

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

export default DashboardPage