import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { useCreateServiceMutation } from '../api/services.queries';
import { CREATE_SERVICE_FORM_DEFAULT_VALUES } from '../model/createServiceForm.constants';
import { CreateServiceFormSchema } from '../model/createServiceForm.schema';
import type { CreateServiceFormValues } from '../model/service.types';

export function CreateServiceForm() {
  const navigate = useNavigate();
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  const createServiceMutation = useCreateServiceMutation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(CreateServiceFormSchema),
    defaultValues: CREATE_SERVICE_FORM_DEFAULT_VALUES,
    mode: 'onBlur',
  });
  const iconColor = watch('iconColor');
  const submitError =
    createServiceMutation.error instanceof Error
      ? createServiceMutation.error.message
      : null;

  const onSubmit: SubmitHandler<CreateServiceFormValues> = async (values) => {
    setCreatedServiceId(null);

    try {
      const createdService = await createServiceMutation.mutateAsync(values);

      setCreatedServiceId(createdService.id);
      reset(CREATE_SERVICE_FORM_DEFAULT_VALUES);
    } catch {
      setCreatedServiceId(null);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <section className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
        <div className='border-b border-[#E5E7EB] px-5 py-4'>
          <h3 className='text-base font-semibold text-[#111827]'>
            Service visual metadata
          </h3>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            These values keep the admin catalog aligned with the client service
            cards.
          </p>
        </div>
        <div className='grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px_80px]'>
          <TextField
            id='create-service-icon'
            label='Icon'
            error={errors.icon?.message}
            registration={register('icon')}
          />
          <TextField
            id='create-service-icon-color'
            label='Icon color'
            error={errors.iconColor?.message}
            registration={register('iconColor')}
          />
          <div>
            <p className='block text-sm font-medium text-[#111827]'>Preview</p>
            <div className='mt-2 flex h-10 items-center justify-center rounded-md border border-[#D1D5DB] bg-[#F8FAFC]'>
              <span
                className='h-5 w-5 rounded-full border border-[#E5E7EB]'
                style={{ backgroundColor: iconColor }}
                aria-hidden='true'
              />
            </div>
          </div>
        </div>
      </section>

      <section className='grid gap-6 xl:grid-cols-2'>
        <TranslationSection
          title='ქართული'
          description='Required Georgian translation.'
          titleField={{
            id: 'create-service-ka-title',
            error: errors.kaTitle?.message,
            registration: register('kaTitle'),
          }}
          descriptionField={{
            id: 'create-service-ka-description',
            error: errors.kaDescription?.message,
            registration: register('kaDescription'),
          }}
        />
        <TranslationSection
          title='English'
          description='Required English translation.'
          titleField={{
            id: 'create-service-en-title',
            error: errors.enTitle?.message,
            registration: register('enTitle'),
          }}
          descriptionField={{
            id: 'create-service-en-description',
            error: errors.enDescription?.message,
            registration: register('enDescription'),
          }}
        />
      </section>

      {submitError && (
        <div className='rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm leading-6 text-[#B91C1C]'>
          {submitError}
        </div>
      )}

      {createdServiceId && (
        <div
          aria-live='polite'
          className='rounded-md border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#047857]'
        >
          <p className='font-semibold text-[#065F46]'>Service created.</p>
          <p className='mt-1'>
            Service ID:{' '}
            <span className='font-mono font-semibold'>{createdServiceId}</span>
          </p>
          <Link
            to={`${ADMIN_ROUTE_PATHS.services}/${createdServiceId}`}
            className='mt-2 inline-flex text-sm font-semibold text-[#065F46] underline-offset-4 hover:underline'
          >
            Open service
          </Link>
        </div>
      )}

      <div className='flex flex-col-reverse gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm sm:flex-row sm:justify-end'>
        <button
          type='button'
          onClick={() => navigate(ADMIN_ROUTE_PATHS.services)}
          disabled={createServiceMutation.isPending}
          className='rounded-md border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Cancel
        </button>
        <button
          type='submit'
          disabled={!isDirty || !isValid || createServiceMutation.isPending}
          className='rounded-md bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {createServiceMutation.isPending ? 'Creating...' : 'Create service'}
        </button>
      </div>
    </form>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  error: string | undefined;
  registration: UseFormRegisterReturn;
};

function TextField({ id, label, error, registration }: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-[#111827]'>
        {label}
      </label>
      <input
        id={id}
        type='text'
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
        {...registration}
      />
      {error && (
        <p id={errorId} className='mt-2 text-sm text-[#DC2626]'>
          {error}
        </p>
      )}
    </div>
  );
}

type TranslationSectionProps = {
  title: string;
  description: string;
  titleField: {
    id: string;
    error: string | undefined;
    registration: UseFormRegisterReturn;
  };
  descriptionField: {
    id: string;
    error: string | undefined;
    registration: UseFormRegisterReturn;
  };
};

function TranslationSection({
  title,
  description,
  titleField,
  descriptionField,
}: TranslationSectionProps) {
  const titleErrorId = `${titleField.id}-error`;
  const descriptionErrorId = `${descriptionField.id}-error`;

  return (
    <section className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='border-b border-[#E5E7EB] px-5 py-4'>
        <h3 className='text-base font-semibold text-[#111827]'>{title}</h3>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>{description}</p>
      </div>
      <div className='space-y-5 p-5'>
        <div>
          <label
            htmlFor={titleField.id}
            className='block text-sm font-medium text-[#111827]'
          >
            Title
          </label>
          <input
            id={titleField.id}
            type='text'
            aria-invalid={Boolean(titleField.error)}
            aria-describedby={titleField.error ? titleErrorId : undefined}
            className='mt-2 w-full rounded-md border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...titleField.registration}
          />
          {titleField.error && (
            <p id={titleErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {titleField.error}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={descriptionField.id}
            className='block text-sm font-medium text-[#111827]'
          >
            Description
          </label>
          <textarea
            id={descriptionField.id}
            rows={10}
            aria-invalid={Boolean(descriptionField.error)}
            aria-describedby={
              descriptionField.error ? descriptionErrorId : undefined
            }
            className='mt-2 w-full resize-y rounded-md border border-[#D1D5DB] px-3 py-2 text-sm leading-6 text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            {...descriptionField.registration}
          />
          {descriptionField.error && (
            <p id={descriptionErrorId} className='mt-2 text-sm text-[#DC2626]'>
              {descriptionField.error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
