import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { BLOG_STATUS_OPTIONS } from '../model/createBlogForm.constants';
import type { CreateBlogFormValues } from '../model/createBlogForm.types';
import { CreateBlogField } from './CreateBlogField';
import { CreateBlogPanel } from './CreateBlogPanel';

type PublicationSettingsSectionProps = {
  register: UseFormRegister<CreateBlogFormValues>;
  errors: FieldErrors<CreateBlogFormValues>;
  isFeatured: boolean;
};

export function PublicationSettingsSection({
  register,
  errors,
  isFeatured,
}: PublicationSettingsSectionProps) {
  return (
    <CreateBlogPanel
      title='Publication settings'
      description='Control how the blog will be prepared for publishing.'
    >
      <CreateBlogField
        label='Status'
        fieldId='create-blog-status'
        error={errors.status?.message}
      >
        <select
          id='create-blog-status'
          aria-invalid={Boolean(errors.status)}
          className='mt-2 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
          {...register('status')}
        >
          {BLOG_STATUS_OPTIONS.map((statusOption) => (
            <option key={statusOption.value} value={statusOption.value}>
              {statusOption.label}
            </option>
          ))}
        </select>
      </CreateBlogField>

      <CreateBlogField
        label='Publish date'
        fieldId='create-blog-publish-date'
        error={errors.publishDate?.message}
        hint='Optional. Leave empty to publish without scheduling.'
      >
        <input
          id='create-blog-publish-date'
          type='datetime-local'
          aria-invalid={Boolean(errors.publishDate)}
          aria-describedby={
            errors.publishDate
              ? 'create-blog-publish-date-error'
              : 'create-blog-publish-date-hint'
          }
          className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
          {...register('publishDate')}
        />
      </CreateBlogField>

      <label
        htmlFor='create-blog-featured'
        className='flex cursor-pointer items-center justify-between gap-4 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 transition hover:bg-[#F5F3FF]'
      >
        <span>
          <span className='block text-sm font-medium text-[#111827]'>
            Featured blog
          </span>
          <span className='mt-1 block text-xs leading-5 text-[#6B7280]'>
            Highlight this article in featured content areas.
          </span>
        </span>
        <input
          id='create-blog-featured'
          type='checkbox'
          className='peer sr-only'
          {...register('isFeatured')}
        />
        <span
          aria-hidden='true'
          className='relative h-6 w-11 shrink-0 rounded-full bg-[#D1D5DB] transition peer-checked:bg-[#7C3AED] peer-focus:ring-2 peer-focus:ring-[#7C3AED]/30'
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              isFeatured ? 'left-6' : 'left-1'
            }`}
          />
        </span>
      </label>
    </CreateBlogPanel>
  );
}
