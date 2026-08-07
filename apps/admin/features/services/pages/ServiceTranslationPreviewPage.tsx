import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import {
  useCreateServiceTranslationMutation,
  useServiceTranslationQuery,
  useUpdateServiceTranslationMutation,
} from '../api/services.queries';
import { ServiceLanguageBadge } from '../components/ServiceStatusBadge';
import { ServicesStateCard } from '../components/ServicesStateCard';
import { ServiceTranslationForm } from '../components/ServiceTranslationForm';
import { formatServiceIconName } from '../model/serviceCatalog';
import {
  SERVICE_LANGUAGES,
  getServiceLanguageLabel,
} from '../model/service.constants';
import type {
  ServiceLanguage,
  ServiceTranslationFormValues,
} from '../model/service.types';

export function ServiceTranslationPreviewPage() {
  const { serviceId, language } = useParams<{
    serviceId: string;
    language: string;
  }>();
  const serviceLanguage = parseServiceLanguageParam(language);

  if (!serviceId) {
    return <Navigate to={ADMIN_ROUTE_PATHS.services} replace />;
  }

  if (!serviceLanguage) {
    return <Navigate to={`${ADMIN_ROUTE_PATHS.services}/${serviceId}`} replace />;
  }

  return (
    <ServiceTranslationManageContent
      serviceId={serviceId}
      language={serviceLanguage}
    />
  );
}

type ServiceTranslationManageContentProps = {
  serviceId: string;
  language: ServiceLanguage;
};

function ServiceTranslationManageContent({
  serviceId,
  language,
}: ServiceTranslationManageContentProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const translationQuery = useServiceTranslationQuery(serviceId, language);
  const createTranslationMutation = useCreateServiceTranslationMutation(serviceId);
  const service = translationQuery.data?.service;
  const translation = translationQuery.data?.translation;
  const updateTranslationMutation = useUpdateServiceTranslationMutation(
    serviceId,
    language,
    translation?.id ?? '',
  );

  if (translationQuery.isLoading) {
    return (
      <ServiceTranslationManageShell serviceId={serviceId}>
        <ServicesStateCard
          tone='neutral'
          title='Loading service'
          message='Fetching the selected service translation.'
        />
      </ServiceTranslationManageShell>
    );
  }

  if (translationQuery.isError) {
    const isAccessDenied =
      isApiRequestError(translationQuery.error) &&
      translationQuery.error.status === 403;

    return (
      <ServiceTranslationManageShell serviceId={serviceId}>
        <ServicesStateCard
          tone={isAccessDenied ? 'warning' : 'error'}
          title={isAccessDenied ? 'Access denied' : 'Could not load service'}
          message={
            isAccessDenied
              ? 'You do not have permission to view services.'
              : 'The service translation request failed.'
          }
          actionLabel={isAccessDenied ? undefined : 'Try again'}
          onAction={
            isAccessDenied ? undefined : () => void translationQuery.refetch()
          }
        />
      </ServiceTranslationManageShell>
    );
  }

  if (!service) {
    return (
      <ServiceTranslationManageShell serviceId={serviceId}>
        <ServicesStateCard
          tone='neutral'
          title='Service not found'
          message='No service was found for this localized admin route.'
        />
      </ServiceTranslationManageShell>
    );
  }

  const submitError =
    createTranslationMutation.error instanceof Error
      ? createTranslationMutation.error.message
      : updateTranslationMutation.error instanceof Error
        ? updateTranslationMutation.error.message
        : null;

  const handleSubmit = async (values: ServiceTranslationFormValues) => {
    setSuccessMessage(null);

    if (translation) {
      await updateTranslationMutation.mutateAsync(values);
      setSuccessMessage('Translation updated.');
      return;
    }

    await createTranslationMutation.mutateAsync({
      ...values,
      language,
    });
    setSuccessMessage('Translation created.');
  };

  return (
    <ServiceTranslationManageShell serviceId={serviceId}>
      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='space-y-6'>
          <section className='relative overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-sm'>
            <div
              className='absolute inset-x-0 top-0 h-24 opacity-10'
              style={{
                background: `linear-gradient(135deg, ${service.service.iconColor}, transparent 70%)`,
              }}
              aria-hidden='true'
            />
            <div className='relative flex flex-col gap-5 sm:flex-row sm:items-center'>
              <div
                className='flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-center text-xs font-semibold leading-4 shadow-sm'
                style={{ color: service.service.iconColor }}
                title={service.service.icon}
              >
                {formatServiceIconName(service.service.icon)}
              </div>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <ServiceLanguageBadge language={language} />
                  <span className='rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#6B7280]'>
                    {translation ? 'Existing translation' : 'Missing translation'}
                  </span>
                </div>
                <h1 className='mt-3 text-2xl font-semibold tracking-tight text-[#111827]'>
                  {translation
                    ? translation.title
                    : `${getServiceLanguageLabel(language)} translation`}
                </h1>
                <p className='mt-2 text-sm leading-6 text-[#6B7280]'>
                  {translation
                    ? 'Edit this language without changing the other translation.'
                    : 'Create this missing language on the existing service.'}
                </p>
              </div>
            </div>
          </section>

          <ServiceTranslationForm
            language={language}
            translation={translation}
            isSubmitting={
              createTranslationMutation.isPending ||
              updateTranslationMutation.isPending
            }
            submitError={submitError}
            successMessage={successMessage}
            onSubmit={handleSubmit}
          />
        </div>

        <aside className='space-y-4'>
          <LanguageSwitcher serviceId={serviceId} currentLanguage={language} />
          <section className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold text-[#111827]'>Preview</h2>
            {translation ? (
              <div className='mt-4'>
                <p className='text-lg font-semibold leading-7 text-[#111827]'>
                  {translation.title}
                </p>
                <p className='mt-3 whitespace-pre-line text-sm leading-6 text-[#4B5563]'>
                  {translation.description}
                </p>
              </div>
            ) : (
              <p className='mt-4 text-sm leading-6 text-[#6B7280]'>
                This language has no saved content yet.
              </p>
            )}
          </section>
          <section className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-semibold text-[#111827]'>Metadata</h2>
            <dl className='mt-4 space-y-3 text-sm'>
              <MetadataItem label='Service ID' value={service.id} mono />
              <MetadataItem label='Language' value={language} />
              <MetadataItem
                label='Translation ID'
                value={translation?.id ?? 'Not created'}
                mono={Boolean(translation)}
              />
            </dl>
          </section>
        </aside>
      </div>
    </ServiceTranslationManageShell>
  );
}

type ServiceTranslationManageShellProps = {
  serviceId: string;
  children: ReactNode;
};

function ServiceTranslationManageShell({
  serviceId,
  children,
}: ServiceTranslationManageShellProps) {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <div className='flex flex-wrap gap-3'>
        <Link
          to={`${ADMIN_ROUTE_PATHS.services}/${serviceId}`}
          className='inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          Back to service
        </Link>
        <Link
          to={ADMIN_ROUTE_PATHS.services}
          className='inline-flex rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-[#6B7280] transition hover:bg-white hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          All services
        </Link>
      </div>
      {children}
    </div>
  );
}

type LanguageSwitcherProps = {
  serviceId: string;
  currentLanguage: ServiceLanguage;
};

function LanguageSwitcher({
  serviceId,
  currentLanguage,
}: LanguageSwitcherProps) {
  return (
    <section className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <h2 className='text-sm font-semibold text-[#111827]'>Language</h2>
      <div className='mt-4 grid grid-cols-2 gap-2'>
        {SERVICE_LANGUAGES.map((language) => {
          const isCurrent = language === currentLanguage;

          return (
            <Link
              key={language}
              to={`${ADMIN_ROUTE_PATHS.services}/${serviceId}/${language.toLowerCase()}`}
              className={[
                'rounded-md border px-3 py-2 text-center text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30',
                isCurrent
                  ? 'border-[#C4B5FD] bg-[#F5F3FF] text-[#6D28D9]'
                  : 'border-[#D1D5DB] bg-white text-[#111827] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              {language}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

type MetadataItemProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function MetadataItem({ label, value, mono = false }: MetadataItemProps) {
  return (
    <div>
      <dt className='text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-[#111827] ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function parseServiceLanguageParam(
  value: string | undefined,
): ServiceLanguage | undefined {
  const normalizedValue = value?.toUpperCase();

  return SERVICE_LANGUAGES.includes(normalizedValue as ServiceLanguage)
    ? (normalizedValue as ServiceLanguage)
    : undefined;
}
