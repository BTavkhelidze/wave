import { Link } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { OutboundEmailsList } from '../components/OutboundEmailsList';

export function EmailsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Emails
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
            Compose branded business emails and review delivery history.
          </p>
        </div>
        <Link
          to={ADMIN_ROUTE_PATHS.composeEmail}
          className="rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
        >
          Compose Email
        </Link>
      </section>

      <OutboundEmailsList />
    </div>
  );
}
