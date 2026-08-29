import { Link } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { ComposeEmailForm } from '../components/ComposeEmailForm';

export function ComposeEmailPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to={ADMIN_ROUTE_PATHS.emails}
        className="inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
      >
        Back to emails
      </Link>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">
          Compose Email
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
          Prepare one branded Wave Engineering business email for immediate
          delivery.
        </p>
      </section>

      <ComposeEmailForm />
    </div>
  );
}
