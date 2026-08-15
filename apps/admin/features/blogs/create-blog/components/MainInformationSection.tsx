import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldPath,
  type UseFormRegister,
} from "react-hook-form";

import type {
  BlogLanguage,
  CreateBlogFormValues,
} from "../model/createBlogForm.types";
import { BlogContentEditor } from "./BlogContentEditor";
import { CreateBlogField } from "./CreateBlogField";
import { CreateBlogPanel } from "./CreateBlogPanel";

type MainInformationSectionProps = {
  activeLanguage: BlogLanguage;
  control: Control<CreateBlogFormValues>;
  register: UseFormRegister<CreateBlogFormValues>;
  errors: FieldErrors<CreateBlogFormValues>;
  onSlugEdited: () => void;
  onUploadImage: (file: File) => Promise<{ url: string }>;
};

const inputClassName =
  "mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20";
const textareaClassName =
  "mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20";

export function MainInformationSection({
  activeLanguage,
  control,
  register,
  errors,
  onSlugEdited,
  onUploadImage,
}: MainInformationSectionProps) {
  const languageErrors = errors.translations?.[activeLanguage];
  const fieldPrefix = `translations.${activeLanguage}` as const;
  const titleFieldId = `create-blog-title-${activeLanguage}`;
  const slugFieldId = `create-blog-slug-${activeLanguage}`;
  const excerptFieldId = `create-blog-excerpt-${activeLanguage}`;
  const contentFieldId = `create-blog-content-${activeLanguage}`;
  const slugField = register(`${fieldPrefix}.slug`, {
    onChange: onSlugEdited,
  });

  return (
    <CreateBlogPanel
      title="Main information"
      description={`Write the ${activeLanguage} title, summary, and content.`}
    >
      <CreateBlogField
        label="Blog title"
        fieldId={titleFieldId}
        error={languageErrors?.title?.message}
      >
        <input
          key={titleFieldId}
          id={titleFieldId}
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(languageErrors?.title)}
          aria-describedby={
            languageErrors?.title ? `${titleFieldId}-error` : undefined
          }
          className={inputClassName}
          placeholder="Fire safety checklist for commercial buildings"
          {...register(`${fieldPrefix}.title`)}
        />
      </CreateBlogField>

      <CreateBlogField
        label="Slug"
        fieldId={slugFieldId}
        error={languageErrors?.slug?.message}
        hint="Used in the public blog URL for this language."
      >
        <input
          key={slugFieldId}
          id={slugFieldId}
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(languageErrors?.slug)}
          aria-describedby={
            languageErrors?.slug ? `${slugFieldId}-error` : `${slugFieldId}-hint`
          }
          className={inputClassName}
          placeholder="fire-safety-checklist"
          {...slugField}
        />
      </CreateBlogField>

      <CreateBlogField
        label="Short description"
        fieldId={excerptFieldId}
        error={languageErrors?.excerpt?.message}
      >
        <textarea
          key={excerptFieldId}
          id={excerptFieldId}
          rows={4}
          autoComplete="off"
          aria-invalid={Boolean(languageErrors?.excerpt)}
          aria-describedby={
            languageErrors?.excerpt ? `${excerptFieldId}-error` : undefined
          }
          className={textareaClassName}
          placeholder="Summarize the article for listings and previews."
          {...register(`${fieldPrefix}.excerpt`)}
        />
      </CreateBlogField>

      <Controller
        name={`${fieldPrefix}.content` as FieldPath<CreateBlogFormValues>}
        control={control}
        render={({ field }) => (
          <BlogContentEditor
            key={contentFieldId}
            fieldId={contentFieldId}
            value={typeof field.value === "string" ? field.value : ""}
            error={languageErrors?.content?.message}
            onChange={field.onChange}
            onBlur={field.onBlur}
            onUploadImage={onUploadImage}
          />
        )}
      />
    </CreateBlogPanel>
  );
}
