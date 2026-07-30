import { ServicesList } from '../components/ServicesList';

export function ServicesPage() {
  return (
    <div className='mx-auto max-w-6xl space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Services
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Review service translations and the visual metadata used across the
          catalog.
        </p>
      </section>

      <ServicesList />
    </div>
  );
}
