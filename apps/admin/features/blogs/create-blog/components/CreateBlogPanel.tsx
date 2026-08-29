import type { ReactNode } from 'react';

type CreateBlogPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function CreateBlogPanel({
  title,
  description,
  children,
}: CreateBlogPanelProps) {
  return (
    <section className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='border-b border-[#E5E7EB] px-5 py-4'>
        <h3 className='text-base font-semibold text-[#111827]'>{title}</h3>
        {description && (
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>{description}</p>
        )}
      </div>
      <div className='space-y-5 p-5'>{children}</div>
    </section>
  );
}
