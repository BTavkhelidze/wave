import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import {
  useDeleteServiceMutation,
  useServiceCatalogQuery,
} from '../api/services.queries';
import { DeleteServiceDialog } from '../components/DeleteServiceDialog';
import { ServiceLanguageBadge } from '../components/ServiceStatusBadge';
import { ServicesStateCard } from '../components/ServicesStateCard';
import {
  formatServiceIconName,
  getMissingServiceLanguages,
} from '../model/serviceCatalog';
import {
  SERVICE_LANGUAGES,
  getServiceLanguageLabel,
} from '../model/service.constants';
import type {
  ServiceCatalogItemData,
  ServiceLanguage,
} from '../model/service.types';

export function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId: string }>();

  if (!serviceId) {
    return <Navigate to={ADMIN_ROUTE_PATHS.services} replace />;
  }

  return <ServiceDetailContent serviceId={serviceId} />;
}

type ServiceDetailContentProps = {
  serviceId: string;
};

function ServiceDetailContent({ serviceId }: ServiceDetailContentProps) {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const servicesQuery = useServiceCatalogQuery();
  const deleteServiceMutation = useDeleteServiceMutation(serviceId);

  if (servicesQuery.isLoading) {
    return (
      <ServiceDetailShell>
        <ServicesStateCard
          tone='neutral'
          title='Loading service'
          message='Fetching the selected service and its translations.'
        />
      </ServiceDetailShell>
    );
  }

  if (servicesQuery.isError) {
    const isAccessDenied =
      isApiRequestError(servicesQuery.error) && servicesQuery.error.status === 403;

    return (
      <ServiceDetailShell>
        <ServicesStateCard
          tone={isAccessDenied ? 'warning' : 'error'}
          title={isAccessDenied ? 'Access denied' : 'Could not load service'}
          message={
            isAccessDenied
              ? 'You do not have permission to view services.'
              : 'The service detail request failed.'
          }
          actionLabel={isAccessDenied ? undefined : 'Try again'}
          onAction={
            isAccessDenied ? undefined : () => void servicesQuery.refetch()
          }
        />
      </ServiceDetailShell>
    );
  }

  const service = servicesQuery.data?.find((item) => item.id === serviceId);

  if (!service) {
    return (
      <ServiceDetailShell>
        <ServicesStateCard
          tone='neutral'
          title='Service not found'
          message='No service was found for this admin route.'
        />
      </ServiceDetailShell>
    );
  }

  const deleteErrorMessage =
    deleteServiceMutation.error instanceof Error
      ? deleteServiceMutation.error.message
      : null;

  const handleConfirmDelete = async () => {
    try {
      await deleteServiceMutation.mutateAsync();
      navigate(ADMIN_ROUTE_PATHS.services);
    } catch {
      setIsDeleteDialogOpen(true);
    }
  };

  return (
    <ServiceDetailShell>
      <article className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
        <header className='grid gap-6 border-b border-[#E5E7EB] bg-[#F8FAFC] p-6 lg:grid-cols-[180px_minmax(0,1fr)]'>
          <div
            className='flex h-[160px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-center text-sm font-semibold leading-5 shadow-sm'
            style={{ color: service.service.iconColor }}
            title={service.service.icon}
          >
            {formatServiceIconName(service.service.icon)}
          </div>

          <div className='min-w-0 self-center'>
            <div className='flex flex-wrap items-center gap-2'>
              {service.languages.map((language) => (
                <ServiceLanguageBadge key={language} language={language} />
              ))}
              {getMissingServiceLanguages(service).map((language) => (
                <span
                  key={language}
                  className='rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#6B7280]'
                >
                  Missing {language}
                </span>
              ))}
            </div>
            <h1 className='mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#111827]'>
              {service.title}
            </h1>
            <p className='mt-3 max-w-3xl text-sm leading-6 text-[#6B7280]'>
              {service.description || 'No primary description has been added.'}
            </p>
          </div>
        </header>

        <section className='grid gap-4 p-6 lg:grid-cols-2'>
          {SERVICE_LANGUAGES.map((language) => (
            <TranslationPanel
              key={language}
              language={language}
              service={service}
            />
          ))}
        </section>

        <section className='border-t border-[#E5E7EB] p-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h2 className='text-sm font-semibold text-[#111827]'>Metadata</h2>
              <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
                Delete Service removes the service and both translations.
              </p>
            </div>
            <button
              type='button'
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteServiceMutation.isPending}
              className='rounded-md border border-[#FCA5A5] bg-white px-4 py-2 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 disabled:cursor-not-allowed disabled:opacity-60'
            >
              Delete Service
            </button>
          </div>
          <dl className='mt-4 grid gap-4 text-sm sm:grid-cols-2'>
            <MetadataItem label='Service ID' value={service.id} mono />
            <MetadataItem label='Icon' value={service.service.icon} />
            <MetadataItem label='Icon color' value={service.service.iconColor} />
            <MetadataItem
              label='Translations'
              value={
                service.languages.length
                  ? service.languages.join(', ')
                  : 'No translations'
              }
            />
          </dl>
        </section>
      </article>
      {isDeleteDialogOpen && (
        <DeleteServiceDialog
          serviceTitle={service.title}
          isDeleting={deleteServiceMutation.isPending}
          errorMessage={deleteErrorMessage}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </ServiceDetailShell>
  );
}

type ServiceDetailShellProps = {
  children: ReactNode;
};

function ServiceDetailShell({ children }: ServiceDetailShellProps) {
  return (
    <div className='mx-auto max-w-6xl space-y-6'>
      <Link
        to={ADMIN_ROUTE_PATHS.services}
        className='inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
      >
        Back to services
      </Link>
      {children}
    </div>
  );
}

type TranslationPanelProps = {
  language: ServiceLanguage;
  service: ServiceCatalogItemData;
};

function TranslationPanel({ language, service }: TranslationPanelProps) {
  const translation = service.translations[language];

  if (!translation) {
    return (
      <div className='rounded-lg border border-dashed border-[#D1D5DB] bg-[#F8FAFC] p-5'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-sm font-semibold text-[#111827]'>
            {getServiceLanguageLabel(language)}
          </h2>
          <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#6B7280]'>
            Missing
          </span>
        </div>
        <p className='mt-4 text-sm leading-6 text-[#6B7280]'>
          No {getServiceLanguageLabel(language).toLowerCase()} translation has
          been returned for this service.
        </p>
        <Link
          to={`${ADMIN_ROUTE_PATHS.services}/${service.id}/${language.toLowerCase()}`}
          className='mt-5 inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          Create translation
        </Link>
      </div>
    );
  }

  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-sm font-semibold text-[#111827]'>
          {getServiceLanguageLabel(language)}
        </h2>
        <ServiceLanguageBadge language={language} />
      </div>
      <p className='mt-4 text-lg font-semibold leading-7 text-[#111827]'>
        {translation.title}
      </p>
      <p className='mt-3 whitespace-pre-line text-sm leading-6 text-[#4B5563]'>
        {translation.description}
      </p>
      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <p className='font-mono text-xs text-[#9CA3AF]'>
          Translation ID: {translation.id}
        </p>
        <Link
          to={`${ADMIN_ROUTE_PATHS.services}/${service.id}/${language.toLowerCase()}`}
          className='rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          Manage translation
        </Link>
      </div>
    </div>
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
