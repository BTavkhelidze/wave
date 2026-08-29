import { AdminLogsPanel } from '../components/AdminLogsPanel';

export function AdminLogsPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Admin Logs
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Review administrator activity and audit trail events.
        </p>
      </section>

      <AdminLogsPanel />
    </div>
  );
}
