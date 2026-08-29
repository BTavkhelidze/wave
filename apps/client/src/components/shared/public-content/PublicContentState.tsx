import { Skeleton } from '@/components/ui/skeleton';

interface PublicContentStateProps {
  title?: string;
  message: string;
  role?: 'alert' | 'status';
}

export function PublicContentState({
  title,
  message,
  role = 'status',
}: PublicContentStateProps) {
  return (
    <div className='max-w-[1440px] mx-auto w-full px-6 2xl:px-0'>
      {title && (
        <h2 className='text-3xl md:text-4xl font-light tracking-wide dark:text-white leading-tight'>
          {title}
        </h2>
      )}
      <p className='text-white mt-6' role={role}>
        {message}
      </p>
    </div>
  );
}

export function PublicCardSkeleton({ label }: { label: string }) {
  return (
    <div
      className='relative w-full sm:w-[230px]'
      role='status'
      aria-label={label}
    >
      <Skeleton
        className='relative w-full h-[180px] border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'
        aria-hidden='true'
      >
        <Skeleton className='absolute w-full h-[65px] bottom-0 text-start px-2 bg-[#18181B]' />
      </Skeleton>
    </div>
  );
}
