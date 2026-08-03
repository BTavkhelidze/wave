import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { ADMIN_ROUTE_PATHS } from '../../../../src/app/router/routes.constants';
import { useCreateBlogMutation } from '../api/createBlog.queries';
import { CoverImageSection } from './CoverImageSection';
import { CreateBlogFormActions } from './CreateBlogFormActions';
import { MainInformationSection } from './MainInformationSection';
import { PublicationSettingsSection } from './PublicationSettingsSection';
import { SeoSection } from './SeoSection';
import { CREATE_BLOG_FORM_DEFAULT_VALUES } from '../model/createBlogForm.constants';
import {
  CreateBlogFormSchema,
  createSlugFromTitle,
} from '../model/createBlogForm.schema';
import type {
  BlogStatus,
  CreateBlogFormValues,
} from '../model/createBlogForm.types';

type SubmitIntent = 'draft' | 'publish';

export function CreateBlogForm() {
  const navigate = useNavigate();
  const submitIntentRef = useRef<SubmitIntent>('draft');
  const [submitIntent, setSubmitIntentState] = useState<SubmitIntent>('draft');
  const [hasEditedSlug, setHasEditedSlug] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [createdBlogSlug, setCreatedBlogSlug] = useState<string | null>(null);
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
    mode: 'onBlur',
  });

  const title = watch('title');
  const coverImage = watch('coverImage');
  const isFeatured = watch('isFeatured');
  const metaDescription = watch('metaDescription');
  const submitError =
    createBlogMutation.error instanceof Error
      ? createBlogMutation.error.message
      : null;

  useEffect(() => {
    if (!hasEditedSlug) {
      setValue('slug', createSlugFromTitle(title), {
        shouldDirty: Boolean(title),
        shouldValidate: Boolean(title),
      });
    }
  }, [hasEditedSlug, setValue, title]);

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
  };

  const setSubmitIntent = (intent: SubmitIntent) => {
    const status: BlogStatus = intent === 'publish' ? 'PUBLISHED' : 'DRAFT';

    submitIntentRef.current = intent;
    setSubmitIntentState(intent);
    setValue('status', status, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<CreateBlogFormValues> = async (values) => {
    setCreatedBlogSlug(null);

    const status =
      submitIntentRef.current === 'publish'
        ? ('PUBLISHED' as const)
        : ('DRAFT' as const);

    try {
      const createdBlog = await createBlogMutation.mutateAsync({
        values,
        status,
      });

      setCreatedBlogSlug(createdBlog.slug);
      setHasEditedSlug(false);
      reset(CREATE_BLOG_FORM_DEFAULT_VALUES);
    } catch {
      setCreatedBlogSlug(null);
    }
  };

  const handleCancel = () => {
    navigate(ADMIN_ROUTE_PATHS.blogs);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]'>
        <div className='min-w-0'>
          <MainInformationSection
            control={control}
            register={register}
            errors={errors}
            onSlugEdited={() => setHasEditedSlug(true)}
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
            register={register}
            errors={errors}
            metaDescriptionLength={metaDescription.length}
          />
        </div>
      </div>

      {submitError && (
        <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'>
          {submitError}
        </div>
      )}

      {createdBlogSlug && (
        <div
          aria-live='polite'
          className='rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]'
        >
          <p className='font-semibold text-[#065F46]'>Blog created.</p>
          <p className='mt-1'>
            Slug:{' '}
            <span className='font-mono font-semibold'>{createdBlogSlug}</span>
          </p>
        </div>
      )}

      <CreateBlogFormActions
        canSubmit={isDirty && isValid}
        isSubmitting={createBlogMutation.isPending}
        submitIntent={submitIntent}
        onCancel={handleCancel}
        onSaveDraft={() => setSubmitIntent('draft')}
        onPublish={() => setSubmitIntent('publish')}
      />
    </form>
  );
}
