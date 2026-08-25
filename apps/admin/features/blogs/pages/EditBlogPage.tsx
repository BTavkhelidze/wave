import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  useForm,
  type FieldErrors,
  type SubmitErrorHandler,
  type SubmitHandler,
} from 'react-hook-form';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import {
  useAdminBlogQuery,
  useDeleteBlogMutation,
  useUpdateBlogMutation,
} from '../api/blogs.queries';
import { DeleteBlogDialog } from '../components/DeleteBlogDialog';
import type { AdminBlogDetail, BlogMutationPayload } from '../model/blog.types';
import {
  deleteBlogImage,
  uploadBlogImage,
  type UploadImageResponse,
} from '../create-blog/api/createBlog.api';
import { CoverImageSection } from '../create-blog/components/CoverImageSection';
import { MainInformationSection } from '../create-blog/components/MainInformationSection';
import { PublicationSettingsSection } from '../create-blog/components/PublicationSettingsSection';
import { SeoSection } from '../create-blog/components/SeoSection';
import { CREATE_BLOG_FORM_DEFAULT_VALUES } from '../create-blog/model/createBlogForm.constants';
import { CreateBlogFormSchema } from '../create-blog/model/createBlogForm.schema';
import type {
  BlogLanguage,
  BlogStatus,
  CreateBlogFormValues,
} from '../create-blog/model/createBlogForm.types';

type SubmitIntent = 'draft' | 'publish';

export function EditBlogPage() {
  const { blogId } = useParams<{ blogId: string }>();

  if (!blogId) {
    return <Navigate to={ADMIN_ROUTE_PATHS.blogs} replace />;
  }

  return <EditBlogContent blogId={blogId} />;
}

type EditBlogContentProps = {
  blogId: string;
};

function EditBlogContent({ blogId }: EditBlogContentProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const blogQuery = useAdminBlogQuery(blogId);
  const deleteBlogMutation = useDeleteBlogMutation(blogId);

  if (blogQuery.isLoading) {
    return (
      <BlogEditShell>
        <BlogStateCard
          tone='neutral'
          title='Loading blog'
          message='Fetching the selected blog and both translations.'
        />
      </BlogEditShell>
    );
  }

  if (blogQuery.isError) {
    const isAccessDenied =
      isApiRequestError(blogQuery.error) && blogQuery.error.status === 403;

    return (
      <BlogEditShell>
        <BlogStateCard
          tone={isAccessDenied ? 'warning' : 'error'}
          title={isAccessDenied ? 'Access denied' : 'Could not load blog'}
          message={
            isAccessDenied
              ? 'You do not have permission to edit blogs.'
              : 'The blog detail request failed.'
          }
          actionLabel={isAccessDenied ? undefined : 'Try again'}
          onAction={isAccessDenied ? undefined : () => void blogQuery.refetch()}
        />
      </BlogEditShell>
    );
  }

  const blog = blogQuery.data;

  if (!blog) {
    return (
      <BlogEditShell>
        <BlogStateCard
          tone='neutral'
          title='Blog not found'
          message='No blog was found for this admin route.'
        />
      </BlogEditShell>
    );
  }

  const deleteErrorMessage =
    deleteBlogMutation.error instanceof Error
      ? deleteBlogMutation.error.message
      : null;

  const handleConfirmDelete = async () => {
    try {
      await deleteBlogMutation.mutateAsync();
      navigate(ADMIN_ROUTE_PATHS.blogs);
    } catch {
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <BlogEditShell>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-[#111827]'>
            Edit Blog
          </h1>
          <p className='mt-2 text-sm leading-6 text-[#6B7280]'>
            Update shared blog settings and both required translations.
          </p>
        </div>
        <button
          type='button'
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={deleteBlogMutation.isPending}
          className='rounded-md border border-[#FCA5A5] bg-white px-4 py-2 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Delete Blog
        </button>
      </div>

      <EditBlogForm blog={blog} />

      {isDeleteDialogOpen && (
        <DeleteBlogDialog
          blogTitle={blog.title}
          isDeleting={deleteBlogMutation.isPending}
          errorMessage={deleteErrorMessage}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </BlogEditShell>
  );
}

type EditBlogFormProps = {
  blog: AdminBlogDetail;
};

function EditBlogForm({ blog }: EditBlogFormProps) {
  const navigate = useNavigate();
  const submitIntentRef = useRef<SubmitIntent>('draft');
  const inlineImageUploadsRef = useRef<
    Map<string, Promise<UploadImageResponse>>
  >(new Map());
  const uploadedInlineImageKeysRef = useRef<Set<string>>(new Set());
  const [submitIntent, setSubmitIntentState] = useState<SubmitIntent>(
    blog.status === 'PUBLISHED' ? 'publish' : 'draft',
  );
  const [activeLanguage, setActiveLanguage] = useState<BlogLanguage>('KA');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    blog.coverImageUrl,
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [updatedBlogSlug, setUpdatedBlogSlug] = useState<string | null>(null);
  const updateBlogMutation = useUpdateBlogMutation(blog.id);
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
    defaultValues: getBlogFormValues(blog),
    mode: 'onBlur',
  });

  const translations = watch('translations');
  const coverImage = watch('coverImage');
  const existingCoverImageUrl = watch('existingCoverImageUrl');
  const isFeatured = watch('isFeatured');
  const activeMetaDescription =
    translations[activeLanguage]?.metaDescription ?? '';
  const submitError =
    updateBlogMutation.error instanceof Error
      ? updateBlogMutation.error.message
      : null;
  const isSubmitting = updateBlogMutation.isPending;
  const canSubmit = isDirty && isValid && !isSubmitting;

  useEffect(() => {
    const nextValues = getBlogFormValues(blog);
    reset(nextValues);
    setPreviewUrl(blog.coverImageUrl);
    setSubmitIntentState(blog.status === 'PUBLISHED' ? 'publish' : 'draft');
    submitIntentRef.current = blog.status === 'PUBLISHED' ? 'publish' : 'draft';
  }, [blog, reset]);

  useEffect(() => {
    if (!coverImage) {
      setPreviewUrl(existingCoverImageUrl ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverImage);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverImage, existingCoverImageUrl]);

  useEffect(() => {
    if (isValid) {
      setValidationMessage(null);
    }
  }, [isValid]);

  const setSubmitIntent = (intent: SubmitIntent) => {
    const status: BlogStatus = intent === 'publish' ? 'PUBLISHED' : 'DRAFT';

    submitIntentRef.current = intent;
    setSubmitIntentState(intent);
    setValue('status', status, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSelectCoverImage = (file: File) => {
    setValue('coverImage', file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleRemoveCoverImage = () => {
    setValue('coverImage', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setValue('existingCoverImageKey', undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('existingCoverImageUrl', undefined, {
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
    setUpdatedBlogSlug(null);
    setValidationMessage(null);

    const status =
      submitIntentRef.current === 'publish'
        ? ('PUBLISHED' as const)
        : ('DRAFT' as const);
    const uploadedCoverImage = values.coverImage
      ? await uploadBlogImage(values.coverImage)
      : null;

    try {
      const updatedBlog = await updateBlogMutation.mutateAsync(
        buildBlogMutationPayload(values, status, uploadedCoverImage),
      );

      setUpdatedBlogSlug(updatedBlog.slug);
      inlineImageUploadsRef.current.clear();
      uploadedInlineImageKeysRef.current.clear();
      reset(getBlogFormValues(updatedBlog));
    } catch {
      await deleteUploadedImages([
        uploadedCoverImage?.key,
        ...uploadedInlineImageKeysRef.current,
      ]);
      inlineImageUploadsRef.current.clear();
      uploadedInlineImageKeysRef.current.clear();
      setUpdatedBlogSlug(null);
    }
  };

  const onInvalid: SubmitErrorHandler<CreateBlogFormValues> = (formErrors) => {
    setUpdatedBlogSlug(null);
    setValidationMessage(getValidationMessage(formErrors));

    const firstInvalidLanguage = getFirstInvalidLanguage(formErrors);

    if (firstInvalidLanguage) {
      setActiveLanguage(firstInvalidLanguage);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className='space-y-6'
    >
      <div className='inline-flex rounded-lg border border-[#D1D5DB] bg-white p-1 shadow-sm'>
        {(['KA', 'EN'] as const).map((language) => {
          const isActive = activeLanguage === language;

          return (
            <button
              key={language}
              type='button'
              onClick={() => setActiveLanguage(language)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#7C3AED] text-white'
                  : 'text-[#374151] hover:bg-[#F8FAFC]'
              }`}
            >
              {language === 'KA' ? 'Georgian' : 'English'}
            </button>
          );
        })}
      </div>

      <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='min-w-0'>
          <MainInformationSection
            key={activeLanguage}
            activeLanguage={activeLanguage}
            control={control}
            register={register}
            errors={errors}
            onSlugEdited={() => undefined}
            onUploadImage={handleUploadInlineImage}
          />
        </div>

        <div className='space-y-6'>
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
        <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'>
          {submitError}
        </div>
      )}

      {validationMessage && !submitError && (
        <div className='rounded-md border border-[#FCD34D] bg-[#FFFBEB] px-4 py-3 text-sm leading-6 text-[#92400E]'>
          {validationMessage}
        </div>
      )}

      {updatedBlogSlug && (
        <div
          aria-live='polite'
          className='rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]'
        >
          <p className='font-semibold text-[#065F46]'>Blog updated.</p>
          <p className='mt-1'>
            Slug:{' '}
            <span className='font-mono font-semibold'>{updatedBlogSlug}</span>
          </p>
        </div>
      )}

      <div className='flex flex-col-reverse gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={() => navigate(ADMIN_ROUTE_PATHS.blogs)}
          disabled={isSubmitting}
          className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Cancel
        </button>
        <button
          type='submit'
          onClick={() => setSubmitIntent('draft')}
          disabled={!canSubmit}
          className='rounded-md border border-[#C4B5FD] bg-white px-4 py-2 text-sm font-semibold text-[#6D28D9] transition hover:bg-[#F5F3FF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSubmitting && submitIntent === 'draft'
            ? 'Saving...'
            : 'Save Draft'}
        </button>
        <button
          type='submit'
          onClick={() => setSubmitIntent('publish')}
          disabled={!canSubmit}
          className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSubmitting && submitIntent === 'publish'
            ? 'Publishing...'
            : 'Publish Update'}
        </button>
      </div>
    </form>
  );
}

function getBlogFormValues(blog: AdminBlogDetail): CreateBlogFormValues {
  const translations = {
    ...CREATE_BLOG_FORM_DEFAULT_VALUES.translations,
  };

  for (const translation of blog.translations) {
    translations[translation.language] = {
      title: translation.title,
      slug: translation.slug,
      excerpt: translation.excerpt,
      content: translation.content,
      seoTitle: translation.metaTitle ?? '',
      metaDescription: translation.metaDescription ?? '',
    };
  }

  return {
    coverImage: null,
    existingCoverImageKey: blog.coverImageKey,
    existingCoverImageUrl: blog.coverImageUrl,
    canonicalSlug: blog.slug,
    status: blog.status,
    publishDate: blog.publishedAt ? toDateTimeLocalValue(blog.publishedAt) : '',
    isFeatured: blog.isFeatured,
    translations,
  };
}

function buildBlogMutationPayload(
  values: CreateBlogFormValues,
  status: BlogStatus,
  uploadedCoverImage: { key: string; url: string } | null,
): BlogMutationPayload {
  const coverImageKey = uploadedCoverImage?.key ?? values.existingCoverImageKey;
  const coverImageUrl = uploadedCoverImage?.url ?? values.existingCoverImageUrl;

  if (!coverImageKey || !coverImageUrl) {
    throw new Error('Cover image is required.');
  }

  const payload: BlogMutationPayload = {
    coverImageKey,
    coverImageUrl,
    status,
    isFeatured: values.isFeatured,
    translations: (['KA', 'EN'] as const).map((language) => {
      const translation = values.translations[language];

      return {
        language,
        title: translation.title.trim(),
        slug: translation.slug.trim(),
        excerpt: translation.excerpt.trim(),
        content: translation.content.trim(),
        metaTitle: normalizeOptionalText(translation.seoTitle),
        metaDescription: normalizeOptionalText(translation.metaDescription),
      };
    }),
  };

  if (status === 'PUBLISHED' && values.publishDate) {
    payload.publishedAt = new Date(values.publishDate).toISOString();
  }

  return payload;
}

function getValidationMessage(
  errors: FieldErrors<CreateBlogFormValues>,
): string | null {
  if (errors.coverImage?.message) {
    return errors.coverImage.message;
  }

  for (const language of ['KA', 'EN'] as const) {
    const translationErrors = errors.translations?.[language];

    if (!translationErrors) {
      continue;
    }

    if (translationErrors.title?.message) {
      return `${getLanguageLabel(language)} title: ${translationErrors.title.message}`;
    }

    if (translationErrors.slug?.message) {
      return `${getLanguageLabel(language)} slug: ${translationErrors.slug.message}`;
    }

    if (translationErrors.excerpt?.message) {
      return `${getLanguageLabel(language)} short description: ${translationErrors.excerpt.message}`;
    }

    if (translationErrors.content?.message) {
      return `${getLanguageLabel(language)} content: ${translationErrors.content.message}`;
    }

    if (translationErrors.metaDescription?.message) {
      return `${getLanguageLabel(language)} meta description: ${translationErrors.metaDescription.message}`;
    }
  }

  return null;
}

function getFirstInvalidLanguage(
  errors: FieldErrors<CreateBlogFormValues>,
): BlogLanguage | null {
  for (const language of ['KA', 'EN'] as const) {
    if (errors.translations?.[language]) {
      return language;
    }
  }

  return null;
}

function getLanguageLabel(language: BlogLanguage): string {
  return language === 'KA' ? 'Georgian' : 'English';
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

async function deleteUploadedImages(
  keys: Array<string | undefined>,
): Promise<void> {
  await Promise.all(
    Array.from(new Set(keys.filter(isDefinedString))).map(async (key) => {
      try {
        await deleteBlogImage(key);
      } catch {
        // Best-effort cleanup only; the update error is the useful one.
      }
    }),
  );
}

function isDefinedString(value: string | undefined): value is string {
  return typeof value === 'string';
}

type BlogEditShellProps = {
  children: ReactNode;
};

function BlogEditShell({ children }: BlogEditShellProps) {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <Link
        to={ADMIN_ROUTE_PATHS.blogs}
        className='inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
      >
        Back to blogs
      </Link>
      {children}
    </div>
  );
}

type BlogStateCardProps = {
  tone: 'neutral' | 'warning' | 'error';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function BlogStateCard({
  tone,
  title,
  message,
  actionLabel,
  onAction,
}: BlogStateCardProps) {
  const toneClassName =
    tone === 'error'
      ? 'border-[#FCA5A5] bg-[#FEF2F2]'
      : tone === 'warning'
        ? 'border-[#FCD34D] bg-[#FFFBEB]'
        : 'border-[#E5E7EB] bg-white';

  return (
    <div className={`rounded-lg border p-6 shadow-sm ${toneClassName}`}>
      <h1 className='text-lg font-semibold text-[#111827]'>{title}</h1>
      <p className='mt-2 text-sm leading-6 text-[#4B5563]'>{message}</p>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='mt-4 rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
