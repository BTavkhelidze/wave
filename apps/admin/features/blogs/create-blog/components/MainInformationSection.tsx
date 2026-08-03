import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';

import { BLOG_LANGUAGE_OPTIONS } from '../model/createBlogForm.constants';
import type { CreateBlogFormValues } from '../model/createBlogForm.types';
import { BlogContentEditor } from './BlogContentEditor';
import { CreateBlogField } from './CreateBlogField';
import { CreateBlogPanel } from './CreateBlogPanel';

type MainInformationSectionProps = {
  control: Control<CreateBlogFormValues>;
  register: UseFormRegister<CreateBlogFormValues>;
  errors: FieldErrors<CreateBlogFormValues>;
  onSlugEdited: () => void;
};

const inputClassName =
  'mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20';
const textareaClassName =
  'mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20';

export function MainInformationSection({
  control,
  register,
  errors,
  onSlugEdited,
}: MainInformationSectionProps) {
  const slugField = register('slug', {
    onChange: onSlugEdited,
  });

  return (
    <CreateBlogPanel
      title='Main information'
      description='Write the core content and choose the language for this blog.'
    >
      <CreateBlogField
        label='Blog title'
        fieldId='create-blog-title'
        error={errors.title?.message}
      >
        <input
          id='create-blog-title'
          type='text'
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'create-blog-title-error' : undefined}
          className={inputClassName}
          placeholder='Fire safety checklist for commercial buildings'
          {...register('title')}
        />
      </CreateBlogField>

      <div className='grid gap-4 sm:grid-cols-[1fr_180px]'>
        <CreateBlogField
          label='Slug'
          fieldId='create-blog-slug'
          error={errors.slug?.message}
          hint='Used in the public blog URL.'
        >
          <input
            id='create-blog-slug'
            type='text'
            aria-invalid={Boolean(errors.slug)}
            aria-describedby={
              errors.slug
                ? 'create-blog-slug-error'
                : 'create-blog-slug-hint'
            }
            className={inputClassName}
            placeholder='fire-safety-checklist'
            {...slugField}
          />
        </CreateBlogField>

        <CreateBlogField
          label='Language'
          fieldId='create-blog-language'
          error={errors.language?.message}
        >
          <select
            id='create-blog-language'
            aria-invalid={Boolean(errors.language)}
            className='mt-2 w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...register('language')}
          >
            {BLOG_LANGUAGE_OPTIONS.map((languageOption) => (
              <option key={languageOption.value} value={languageOption.value}>
                {languageOption.label}
              </option>
            ))}
          </select>
        </CreateBlogField>
      </div>

      <CreateBlogField
        label='Short description'
        fieldId='create-blog-excerpt'
        error={errors.excerpt?.message}
      >
        <textarea
          id='create-blog-excerpt'
          rows={4}
          aria-invalid={Boolean(errors.excerpt)}
          aria-describedby={
            errors.excerpt ? 'create-blog-excerpt-error' : undefined
          }
          className={textareaClassName}
          placeholder='Summarize the article for listings and previews.'
          {...register('excerpt')}
        />
      </CreateBlogField>

      <Controller
        name='content'
        control={control}
        render={({ field }) => (
          <BlogContentEditor
            fieldId='create-blog-content'
            value={field.value}
            error={errors.content?.message}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </CreateBlogPanel>
  );
}
