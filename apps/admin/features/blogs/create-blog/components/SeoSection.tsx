import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { META_DESCRIPTION_MAX_LENGTH } from "../model/createBlogForm.constants";
import type {
  BlogLanguage,
  CreateBlogFormValues,
} from "../model/createBlogForm.types";
import { CreateBlogField } from "./CreateBlogField";
import { CreateBlogPanel } from "./CreateBlogPanel";

type SeoSectionProps = {
  activeLanguage: BlogLanguage;
  register: UseFormRegister<CreateBlogFormValues>;
  errors: FieldErrors<CreateBlogFormValues>;
  metaDescriptionLength: number;
};

export function SeoSection({
  activeLanguage,
  register,
  errors,
  metaDescriptionLength,
}: SeoSectionProps) {
  const languageErrors = errors.translations?.[activeLanguage];
  const fieldPrefix = `translations.${activeLanguage}` as const;
  const seoTitleFieldId = `create-blog-seo-title-${activeLanguage}`;
  const metaDescriptionFieldId = `create-blog-meta-description-${activeLanguage}`;
  const counterClassName =
    metaDescriptionLength > META_DESCRIPTION_MAX_LENGTH
      ? "text-[#DC2626]"
      : "text-[#6B7280]";

  return (
    <CreateBlogPanel
      title="SEO"
      description={`Tune ${activeLanguage} search snippets without changing the blog content.`}
    >
      <CreateBlogField
        label="SEO title"
        fieldId={seoTitleFieldId}
        error={languageErrors?.seoTitle?.message}
        hint="Optional. Defaults can be derived from the blog title later."
      >
        <input
          key={seoTitleFieldId}
          id={seoTitleFieldId}
          type="text"
          autoComplete="off"
          aria-invalid={Boolean(languageErrors?.seoTitle)}
          aria-describedby={
            languageErrors?.seoTitle
              ? `${seoTitleFieldId}-error`
              : `${seoTitleFieldId}-hint`
          }
          className="mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
          placeholder="Fire safety checklist for commercial buildings"
          {...register(`${fieldPrefix}.seoTitle`)}
        />
      </CreateBlogField>

      <div>
        <CreateBlogField
          label="Meta description"
          fieldId={metaDescriptionFieldId}
          error={languageErrors?.metaDescription?.message}
        >
          <textarea
            key={metaDescriptionFieldId}
            id={metaDescriptionFieldId}
            rows={4}
            maxLength={META_DESCRIPTION_MAX_LENGTH + 20}
            autoComplete="off"
            aria-invalid={Boolean(languageErrors?.metaDescription)}
            aria-describedby={
              languageErrors?.metaDescription
                ? `${metaDescriptionFieldId}-error`
                : `${metaDescriptionFieldId}-counter`
            }
            className="mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
            placeholder="A concise search result summary for this blog."
            {...register(`${fieldPrefix}.metaDescription`)}
          />
        </CreateBlogField>
        <p
          id={`${metaDescriptionFieldId}-counter`}
          className={`mt-2 text-right text-xs ${counterClassName}`}
        >
          {metaDescriptionLength}/{META_DESCRIPTION_MAX_LENGTH}
        </p>
      </div>
    </CreateBlogPanel>
  );
}
