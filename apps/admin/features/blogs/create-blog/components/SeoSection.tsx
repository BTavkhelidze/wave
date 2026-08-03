import type { FieldErrors, UseFormRegister } from 'react-hook-form';

import { META_DESCRIPTION_MAX_LENGTH } from '../model/createBlogForm.constants';
import type { CreateBlogFormValues } from '../model/createBlogForm.types';
import { CreateBlogField } from './CreateBlogField';
import { CreateBlogPanel } from './CreateBlogPanel';

type SeoSectionProps = {
  register: UseFormRegister<CreateBlogFormValues>;
  errors: FieldErrors<CreateBlogFormValues>;
  metaDescriptionLength: number;
};

export function SeoSection({
  register,
  errors,
  metaDescriptionLength,
}: SeoSectionProps) {
  const counterClassName =
    metaDescriptionLength > META_DESCRIPTION_MAX_LENGTH
      ? 'text-[#DC2626]'
      : 'text-[#6B7280]';

  return (
    <CreateBlogPanel
      title='SEO'
      description='Tune search snippets without changing the blog content.'
    >
      <CreateBlogField
        label='SEO title'
        fieldId='create-blog-seo-title'
        error={errors.seoTitle?.message}
        hint='Optional. Defaults can be derived from the blog title later.'
      >
        <input
          id='create-blog-seo-title'
          type='text'
          aria-invalid={Boolean(errors.seoTitle)}
          aria-describedby={
            errors.seoTitle
              ? 'create-blog-seo-title-error'
              : 'create-blog-seo-title-hint'
          }
          className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
          placeholder='Fire safety checklist for commercial buildings'
          {...register('seoTitle')}
        />
      </CreateBlogField>

      <div>
        <CreateBlogField
          label='Meta description'
          fieldId='create-blog-meta-description'
          error={errors.metaDescription?.message}
        >
          <textarea
            id='create-blog-meta-description'
            rows={4}
            maxLength={META_DESCRIPTION_MAX_LENGTH + 20}
            aria-invalid={Boolean(errors.metaDescription)}
            aria-describedby='create-blog-meta-description-counter'
            className='mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            placeholder='A concise search result summary for this blog.'
            {...register('metaDescription')}
          />
        </CreateBlogField>
        <p
          id='create-blog-meta-description-counter'
          className={`mt-2 text-right text-xs ${counterClassName}`}
        >
          {metaDescriptionLength}/{META_DESCRIPTION_MAX_LENGTH}
        </p>
      </div>
    </CreateBlogPanel>
  );
}
