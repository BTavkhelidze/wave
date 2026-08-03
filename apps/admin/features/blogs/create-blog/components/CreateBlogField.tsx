import type { ReactNode } from 'react';

type CreateBlogFieldProps = {
  label: string;
  fieldId: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function CreateBlogField({
  label,
  fieldId,
  error,
  hint,
  children,
}: CreateBlogFieldProps) {
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div>
      <label htmlFor={fieldId} className='block text-sm font-medium text-[#111827]'>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className='mt-2 text-xs leading-5 text-[#6B7280]'>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className='mt-2 text-sm text-[#DC2626]'>
          {error}
        </p>
      )}
    </div>
  );
}
