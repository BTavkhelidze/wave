type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className='mx-auto max-w-5xl space-y-6'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          {title}
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          {description}
        </p>
      </section>

      <section className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
        <p className='text-sm font-medium text-[#111827]'>{title}</p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          This admin page is ready for the next implementation step.
        </p>
      </section>
    </div>
  );
}
