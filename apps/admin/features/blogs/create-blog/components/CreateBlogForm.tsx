import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { ADMIN_ROUTE_PATHS } from "../../../../src/app/router/routes.constants";
import {
  uploadBlogImage,
  type UploadImageResponse,
} from "../api/createBlog.api";
import { useCreateBlogMutation } from "../api/createBlog.queries";
import { CoverImageSection } from "./CoverImageSection";
import { CreateBlogFormActions } from "./CreateBlogFormActions";
import { MainInformationSection } from "./MainInformationSection";
import { PublicationSettingsSection } from "./PublicationSettingsSection";
import { SeoSection } from "./SeoSection";
import { CREATE_BLOG_FORM_DEFAULT_VALUES } from "../model/createBlogForm.constants";
import {
  CreateBlogFormSchema,
  createSlugFromTitle,
} from "../model/createBlogForm.schema";
import type {
  BlogLanguage,
  BlogStatus,
  CreateBlogFormValues,
} from "../model/createBlogForm.types";

type SubmitIntent = "draft" | "publish";

function getValidationMessage(
  errors: FieldErrors<CreateBlogFormValues>,
): string | null {
  if (errors.coverImage?.message) {
    return errors.coverImage.message;
  }

  if (errors.publishDate?.message) {
    return errors.publishDate.message;
  }

  if (errors.canonicalSlug?.message) {
    return `Slug: ${errors.canonicalSlug.message}`;
  }

  for (const language of ["KA", "EN"] as const) {
    const translationErrors = errors.translations?.[language];

    if (!translationErrors) {
      continue;
    }

    if (translationErrors.title?.message) {
      return `${language === "KA" ? "Georgian" : "English"} title: ${translationErrors.title.message}`;
    }

    if (translationErrors.slug?.message) {
      return `${language === "KA" ? "Georgian" : "English"} slug: ${translationErrors.slug.message}`;
    }

    if (translationErrors.excerpt?.message) {
      return `${language === "KA" ? "Georgian" : "English"} short description: ${translationErrors.excerpt.message}`;
    }

    if (translationErrors.content?.message) {
      return `${language === "KA" ? "Georgian" : "English"} content: ${translationErrors.content.message}`;
    }

    if (translationErrors.seoTitle?.message) {
      return `${language === "KA" ? "Georgian" : "English"} SEO title: ${translationErrors.seoTitle.message}`;
    }

    if (translationErrors.metaDescription?.message) {
      return `${language === "KA" ? "Georgian" : "English"} meta description: ${translationErrors.metaDescription.message}`;
    }
  }

  return null;
}

function getFirstInvalidLanguage(
  errors: FieldErrors<CreateBlogFormValues>,
): BlogLanguage | null {
  for (const language of ["KA", "EN"] as const) {
    if (errors.translations?.[language]) {
      return language;
    }
  }

  return null;
}

export function CreateBlogForm() {
  const navigate = useNavigate();
  const submitIntentRef = useRef<SubmitIntent>("draft");
  const inlineImageUploadsRef = useRef<
    Map<string, Promise<UploadImageResponse>>
  >(new Map());
  const uploadedInlineImageKeysRef = useRef<Set<string>>(new Set());
  const [submitIntent, setSubmitIntentState] = useState<SubmitIntent>("draft");
  const [activeLanguage, setActiveLanguage] = useState<BlogLanguage>("KA");
  const [hasEditedCanonicalSlug, setHasEditedCanonicalSlug] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createdBlogSlug, setCreatedBlogSlug] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const createBlogMutation = useCreateBlogMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<CreateBlogFormValues>({
    resolver: zodResolver(CreateBlogFormSchema),
    defaultValues: CREATE_BLOG_FORM_DEFAULT_VALUES,
    mode: "onBlur",
  });

  const translations = watch("translations");
  const canonicalSlug = watch("canonicalSlug");
  const coverImage = watch("coverImage");
  const isFeatured = watch("isFeatured");
  const activeMetaDescription =
    translations[activeLanguage]?.metaDescription ?? "";
  const submitError =
    createBlogMutation.error instanceof Error
      ? createBlogMutation.error.message
      : null;
  const isSubmitting = createBlogMutation.isPending;
  const canSubmit = isDirty && isValid && !isSubmitting;

  useEffect(() => {
    if (hasEditedCanonicalSlug) {
      return;
    }

    const englishTitle = translations.EN?.title ?? "";
    const nextSlug = createSlugFromTitle(englishTitle);

    if (canonicalSlug === nextSlug) {
      return;
    }

    setValue("canonicalSlug", nextSlug, {
      shouldDirty: Boolean(englishTitle),
      shouldValidate: Boolean(englishTitle),
    });
  }, [canonicalSlug, hasEditedCanonicalSlug, setValue, translations.EN?.title]);

  useEffect(() => {
    (["KA", "EN"] as const).forEach((language) => {
      if (translations[language]?.slug === canonicalSlug) {
        return;
      }

      setValue(`translations.${language}.slug`, canonicalSlug, {
        shouldDirty: false,
        shouldValidate: true,
      });
    });
  }, [
    canonicalSlug,
    setValue,
    translations.EN?.slug,
    translations.KA?.slug,
  ]);

  useEffect(() => {
    if (!coverImage) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage]);

  useEffect(() => {
    if (isValid) {
      setValidationMessage(null);
    }
  }, [isValid]);

  const handleSelectCoverImage = (file: File) => {
    setValue("coverImage", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleRemoveCoverImage = () => {
    setValue("coverImage", null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const setSubmitIntent = (intent: SubmitIntent) => {
    const status: BlogStatus = intent === "publish" ? "PUBLISHED" : "DRAFT";

    submitIntentRef.current = intent;
    setSubmitIntentState(intent);
    setValue("status", status, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleUploadInlineImage = async (file: File) => {
    const uploadKey = `${file.name}:${file.size}:${file.lastModified}`;
    let uploadRequest = inlineImageUploadsRef.current.get(uploadKey);

    if (!uploadRequest) {
      uploadRequest = uploadBlogImage(file);
      inlineImageUploadsRef.current.set(uploadKey, uploadRequest);
    }

    const uploadedImage = await uploadRequest;
    uploadedInlineImageKeysRef.current.add(uploadedImage.key);

    return uploadedImage;
  };

  const onSubmit: SubmitHandler<CreateBlogFormValues> = async (values) => {
    setCreatedBlogSlug(null);
    setValidationMessage(null);

    const status =
      submitIntentRef.current === "publish"
        ? ("PUBLISHED" as const)
        : ("DRAFT" as const);

    try {
      const createdBlog = await createBlogMutation.mutateAsync({
        values,
        status,
        uploadedInlineImageKeys: Array.from(uploadedInlineImageKeysRef.current),
      });

      setCreatedBlogSlug(createdBlog.slug);
      setHasEditedCanonicalSlug(false);
      inlineImageUploadsRef.current.clear();
      uploadedInlineImageKeysRef.current.clear();
      reset(CREATE_BLOG_FORM_DEFAULT_VALUES);
    } catch {
      inlineImageUploadsRef.current.clear();
      uploadedInlineImageKeysRef.current.clear();
      setCreatedBlogSlug(null);
    }
  };

  const onInvalid: SubmitErrorHandler<CreateBlogFormValues> = (formErrors) => {
    setCreatedBlogSlug(null);
    setValidationMessage(getValidationMessage(formErrors));

    const firstInvalidLanguage = getFirstInvalidLanguage(formErrors);

    if (firstInvalidLanguage) {
      setActiveLanguage(firstInvalidLanguage);
    }
  };

  const handleCancel = () => {
    navigate(ADMIN_ROUTE_PATHS.blogs);
  };

  const handleCanonicalSlugChange = (value: string) => {
    setHasEditedCanonicalSlug(true);
    setValue("canonicalSlug", createSlugFromTitle(value), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6"
    >
      <div className="inline-flex rounded-lg border border-[#D1D5DB] bg-white p-1 shadow-sm">
        {(["KA", "EN"] as const).map((language) => {
          const isActive = activeLanguage === language;

          return (
            <button
              key={language}
              type="button"
              onClick={() => setActiveLanguage(language)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#7C3AED] text-white"
                  : "text-[#374151] hover:bg-[#F8FAFC]"
              }`}
            >
              {language === "KA" ? "Georgian" : "English"}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <MainInformationSection
            key={activeLanguage}
            activeLanguage={activeLanguage}
            control={control}
            register={register}
            errors={errors}
            onSlugEdited={() => undefined}
            canonicalSlug={canonicalSlug}
            canonicalSlugError={errors.canonicalSlug?.message}
            onCanonicalSlugChange={handleCanonicalSlugChange}
            onUploadImage={handleUploadInlineImage}
          />
        </div>

        <div className="space-y-6">
          <CoverImageSection
            selectedFile={coverImage}
            previewUrl={previewUrl}
            error={errors.coverImage?.message}
            onSelectFile={handleSelectCoverImage}
            onRemoveFile={handleRemoveCoverImage}
          />
          <PublicationSettingsSection
            register={register}
            errors={errors}
            isFeatured={isFeatured}
          />
          <SeoSection
            key={`seo-${activeLanguage}`}
            activeLanguage={activeLanguage}
            register={register}
            errors={errors}
            metaDescriptionLength={activeMetaDescription.length}
          />
        </div>
      </div>

      {submitError && (
        <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]">
          {submitError}
        </div>
      )}

      {validationMessage && !submitError && (
        <div className="rounded-md border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3 text-sm leading-6 text-[#92400E]">
          {validationMessage}
        </div>
      )}

      {createdBlogSlug && (
        <div
          aria-live="polite"
          className="rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]"
        >
          <p className="font-semibold text-[#065F46]">Blog created.</p>
          <p className="mt-1">
            Slug:{" "}
            <span className="font-mono font-semibold">{createdBlogSlug}</span>
          </p>
        </div>
      )}

      <CreateBlogFormActions
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        submitIntent={submitIntent}
        onCancel={handleCancel}
        onSaveDraft={() => setSubmitIntent("draft")}
        onPublish={() => setSubmitIntent("publish")}
      />
    </form>
  );
}
