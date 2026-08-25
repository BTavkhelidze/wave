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
  canonicalSlug?: string;
  canonicalSlugError?: string;
  onCanonicalSlugChange?: (value: string) => void;
  onRegenerateCanonicalSlug?: () => void;
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
  canonicalSlug,
  canonicalSlugError,
  onCanonicalSlugChange,
  onRegenerateCanonicalSlug,
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
  const usesCanonicalSlug = onCanonicalSlugChange !== undefined;

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
        error={usesCanonicalSlug ? canonicalSlugError : languageErrors?.slug?.message}
        hint={
          usesCanonicalSlug
            ? "English canonical slug used by both public language URLs."
            : "Used in the public blog URL for this language."
        }
      >
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            key={slugFieldId}
            id={slugFieldId}
            type="text"
            autoComplete="off"
            aria-invalid={Boolean(
              usesCanonicalSlug ? canonicalSlugError : languageErrors?.slug,
            )}
            aria-describedby={
              usesCanonicalSlug
                ? canonicalSlugError
                  ? `${slugFieldId}-error`
                  : `${slugFieldId}-hint`
                : languageErrors?.slug
                  ? `${slugFieldId}-error`
                  : `${slugFieldId}-hint`
            }
            className={inputClassName.replace("mt-2 ", "")}
            placeholder="fire-safety-checklist"
            {...(usesCanonicalSlug
              ? {
                  value: canonicalSlug ?? "",
                  onChange: (event) =>
                    onCanonicalSlugChange(event.currentTarget.value),
                }
              : slugField)}
          />
          {usesCanonicalSlug && onRegenerateCanonicalSlug && (
            <button
              type="button"
              onClick={onRegenerateCanonicalSlug}
              className="rounded-md border border-[#C4B5FD] bg-white px-3 py-2 text-sm font-semibold text-[#6D28D9] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              Regenerate
            </button>
          )}
        </div>
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
