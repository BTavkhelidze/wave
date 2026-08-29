import { CreateServiceForm } from '../components/CreateServiceForm';

export function CreateServicePage() {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Create Service
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Create one service with both required ქართული and English
          translations.
        </p>
      </section>

      <CreateServiceForm />
    </div>
  );
}
