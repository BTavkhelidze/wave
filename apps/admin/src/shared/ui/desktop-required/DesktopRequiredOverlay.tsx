import { useEffect } from 'react';

function MonitorIcon() {
  return (
    <svg
      aria-hidden='true'
      className='h-8 w-8'
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.8'
      viewBox='0 0 24 24'
    >
      <path d='M5.75 5h12.5A1.75 1.75 0 0 1 20 6.75v8.5A1.75 1.75 0 0 1 18.25 17H5.75A1.75 1.75 0 0 1 4 15.25v-8.5A1.75 1.75 0 0 1 5.75 5Z' />
      <path d='M9 20h6' />
      <path d='M12 17v3' />
    </svg>
  );
}

export function DesktopRequiredOverlay() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, []);

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='desktop-required-title'
      aria-describedby='desktop-required-description'
      className='fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-6 text-[#111827]'
    >
      <div className='w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white p-6 text-center shadow-sm'>
        <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#F3EEFF] text-[#7C3AED]'>
          <MonitorIcon />
        </div>
        <h1
          id='desktop-required-title'
          className='mt-5 text-xl font-semibold text-[#111827]'
        >
          Larger screen required
        </h1>
        <p
          id='desktop-required-description'
          className='mt-3 text-sm leading-6 text-[#6B7280]'
        >
          This admin panel is optimized for desktop use. Please open it on a
          device with a screen width of at least 1040px.
        </p>
      </div>
    </div>
  );
}
