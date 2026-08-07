import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type {
  ServiceLanguage,
  ServiceTranslationContent,
  ServiceTranslationFormValues,
} from '../model/service.types';
import { getServiceLanguageLabel } from '../model/service.constants';

type ServiceTranslationFormProps = {
  language: ServiceLanguage;
  translation: ServiceTranslationContent | undefined;
  isSubmitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  onSubmit: (values: ServiceTranslationFormValues) => Promise<void>;
};

const titleFieldId = 'service-translation-title';
const titleErrorId = 'service-translation-title-error';
const descriptionFieldId = 'service-translation-description';
const descriptionErrorId = 'service-translation-description-error';

export function ServiceTranslationForm({
  language,
  translation,
  isSubmitting,
  submitError,
  successMessage,
  onSubmit,
}: ServiceTranslationFormProps) {
  const isEditing = Boolean(translation);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<ServiceTranslationFormValues>({
    defaultValues: {
      title: translation?.title ?? '',
      description: translation?.description ?? '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    reset({
      title: translation?.title ?? '',
      description: translation?.description ?? '',
    });
  }, [reset, translation]);

  const titleError = errors.title?.message;
  const descriptionError = errors.description?.message;

  const handleFormSubmit: SubmitHandler<ServiceTranslationFormValues> = async (
    values,
  ) => {
    await onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
    });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleFormSubmit)}
      className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'
    >
      <div className='border-b border-[#E5E7EB] px-5 py-4'>
        <h2 className='text-base font-semibold text-[#111827]'>
          {isEditing ? 'Edit translation' : 'Create translation'}
        </h2>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Managing only the {getServiceLanguageLabel(language)} translation.
        </p>
      </div>

      <div className='space-y-5 p-5'>
        <div>
          <label
            htmlFor={titleFieldId}
            className='block text-sm font-medium text-[#111827]'
          >
            Title
          </label>
          <input
            id={titleFieldId}
            type='text'
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? titleErrorId : undefined}
            className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...register('title', {
              validate: (value) =>
                value.trim().length > 0 || 'Title is required.',
            })}
          />
          {titleError && (
            <p id={titleErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {titleError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={descriptionFieldId}
            className='block text-sm font-medium text-[#111827]'
          >
            Description
          </label>
          <textarea
            id={descriptionFieldId}
            rows={10}
            aria-invalid={Boolean(descriptionError)}
            aria-describedby={
              descriptionError ? descriptionErrorId : undefined
            }
            className='mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...register('description', {
              validate: (value) =>
                value.trim().length > 0 || 'Description is required.',
            })}
          />
          {descriptionError && (
            <p id={descriptionErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {descriptionError}
            </p>
          )}
        </div>

        {submitError && (
          <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'>
            {submitError}
          </div>
        )}

        {successMessage && (
          <div
            aria-live='polite'
            className='rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]'
          >
            {successMessage}
          </div>
        )}
      </div>

      <div className='flex flex-col-reverse gap-3 border-t border-[#E5E7EB] px-5 py-4 sm:flex-row sm:justify-end'>
        <button
          type='submit'
          disabled={!isValid || (!isDirty && isEditing) || isSubmitting}
          className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSubmitting
            ? isEditing
              ? 'Saving...'
              : 'Creating...'
            : isEditing
              ? 'Save translation'
              : 'Create translation'}
        </button>
      </div>
    </form>
  );
}
