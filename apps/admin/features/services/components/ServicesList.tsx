import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { useServicesQuery } from '../api/services.queries';
import {
  DEFAULT_SERVICE_LANGUAGE,
  SERVICE_LANGUAGES,
  getServiceLanguageLabel,
} from '../model/service.constants';
import {
  getServicesParamsFromSearch,
  setServicesSearchParam,
} from '../model/servicesSearchParams';
import { ServicesTable } from './ServicesTable';

export function ServicesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => getServicesParamsFromSearch(searchParams),
    [searchParams],
  );
  const servicesQuery = useServicesQuery(params);

  const handleLanguageChange = (language: string) => {
    setSearchParams(
      setServicesSearchParam(
        searchParams,
        'language',
        language || DEFAULT_SERVICE_LANGUAGE,
      ),
    );
  };

  if (
    servicesQuery.isError &&
    isApiRequestError(servicesQuery.error) &&
    servicesQuery.error.status === 403
  ) {
    return (
      <StateCard
        tone='warning'
        title='Access denied'
        message='You do not have permission to view services.'
      />
    );
  }

  if (servicesQuery.isLoading) {
    return (
      <div className='space-y-4'>
        <ServicesToolbar
          language={params.language}
          totalServices={undefined}
          onLanguageChange={handleLanguageChange}
        />
        <StateCard
          tone='neutral'
          title='Loading services'
          message='Fetching service translations.'
        />
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div className='space-y-4'>
        <ServicesToolbar
          language={params.language}
          totalServices={servicesQuery.data?.length}
          onLanguageChange={handleLanguageChange}
        />
        <StateCard
          tone='error'
          title='Could not load services'
          message='The services request failed.'
          actionLabel='Try again'
          onAction={() => void servicesQuery.refetch()}
        />
      </div>
    );
  }

  const services = servicesQuery.data ?? [];

  return (
    <div className='space-y-4'>
      <ServicesToolbar
        language={params.language}
        totalServices={services.length}
        onLanguageChange={handleLanguageChange}
      />

      {services.length > 0 ? (
        <ServicesTable services={services} />
      ) : (
        <StateCard
          tone='neutral'
          title='No services have been created yet'
          message='No service translations were found for the selected language.'
        />
      )}
    </div>
  );
}

type ServicesToolbarProps = {
  language: string;
  totalServices: number | undefined;
  onLanguageChange: (language: string) => void;
};

function ServicesToolbar({
  language,
  totalServices,
  onLanguageChange,
}: ServicesToolbarProps) {
  return (
    <div className='flex flex-col gap-4 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between'>
      <div>
        <p className='text-sm font-semibold text-[#111827]'>
          {totalServices === undefined
            ? 'Service translations'
            : `${totalServices} service${totalServices === 1 ? '' : 's'}`}
        </p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Showing translations for the selected admin language.
        </p>
      </div>

      <label className='flex min-w-[180px] flex-col gap-2 text-sm font-medium text-[#111827]'>
        Language
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
        >
          {SERVICE_LANGUAGES.map((serviceLanguage) => (
            <option key={serviceLanguage} value={serviceLanguage}>
              {getServiceLanguageLabel(serviceLanguage)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

type StateCardProps = {
  title: string;
  message: string;
  tone: 'error' | 'neutral' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
};

function StateCard({
  title,
  message,
  tone,
  actionLabel,
  onAction,
}: StateCardProps) {
  const classNameByTone: Record<StateCardProps['tone'], string> = {
    error: 'border-[#FCA5A5]',
    neutral: 'border-[#E5E7EB]',
    warning: 'border-[#FBBF24]',
  };
  const titleClassNameByTone: Record<StateCardProps['tone'], string> = {
    error: 'text-[#B91C1C]',
    neutral: 'text-[#111827]',
    warning: 'text-[#92400E]',
  };

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${classNameByTone[tone]}`}
    >
      <p className={`text-sm font-semibold ${titleClassNameByTone[tone]}`}>
        {title}
      </p>
      <p className='mt-1 text-sm leading-6 text-[#6B7280]'>{message}</p>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='mt-3 rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
