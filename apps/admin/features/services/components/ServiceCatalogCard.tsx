import { Link } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { formatServiceIconName } from '../model/serviceCatalog';
import type { ServiceCatalogItemData } from '../model/service.types';
import { ServiceLanguageBadge } from './ServiceStatusBadge';

type ServiceCatalogCardProps = {
  service: ServiceCatalogItemData;
};

export function ServiceCatalogCard({ service }: ServiceCatalogCardProps) {
  return (
    <article className='h-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#C4B5FD] hover:shadow-md'>
      <Link
        to={`${ADMIN_ROUTE_PATHS.services}/${service.id}`}
        className='flex h-full flex-col focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
      >
        <div className='flex min-h-[150px] items-center justify-center border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-6'>
          <div
            className='flex h-20 w-20 items-center justify-center rounded-lg border border-white bg-white text-center text-xs font-semibold leading-4 shadow-sm'
            style={{ color: service.service.iconColor }}
            title={service.service.icon}
          >
            {formatServiceIconName(service.service.icon)}
          </div>
        </div>

        <div className='flex flex-1 flex-col p-5'>
          <div className='flex flex-wrap gap-2'>
            {service.languages.map((language) => (
              <ServiceLanguageBadge key={language} language={language} />
            ))}
          </div>

          <h3 className='mt-4 line-clamp-2 text-lg font-semibold leading-7 text-[#111827]'>
            {service.title}
          </h3>
          <p className='mt-2 line-clamp-3 text-sm leading-6 text-[#6B7280]'>
            {service.description || 'No description has been added yet.'}
          </p>

          <div className='mt-auto flex items-center justify-between gap-3 pt-5'>
            <span className='font-mono text-xs text-[#9CA3AF]'>
              {service.id}
            </span>
            <span className='text-sm font-medium text-[#6D28D9]'>View</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
