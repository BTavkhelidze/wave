import Link from 'next/link';

type PublicDetailStateAction = {
  href: string;
  label: string;
};

type PublicDetailStateProps = {
  title: string;
  message: string;
  actions?: PublicDetailStateAction[];
  tone?: 'neutral' | 'error';
  isLoading?: boolean;
};

export function PublicDetailState({
  title,
  message,
  actions = [],
  tone = 'neutral',
  isLoading = false,
}: PublicDetailStateProps) {
  return (
    <section
      className='mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-center justify-center px-6 pt-32 pb-20 text-center text-white'
      aria-busy={isLoading}
      aria-labelledby='public-detail-state-title'
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <h1
        id='public-detail-state-title'
        className='text-2xl font-semibold leading-tight sm:text-3xl'
      >
        {title}
      </h1>
      <p className='mt-4 max-w-[560px] text-sm leading-6 text-[#B6BEC3] sm:text-base'>
        {message}
      </p>
      {actions.length > 0 && (
        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className='rounded-md border border-[#2E3A40] bg-[#11181C] px-4 py-2 text-sm font-medium text-white transition hover:border-[#3B82F6] hover:bg-[#162129] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
