import { Link } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { formatServiceIconName } from '../model/serviceCatalog';
import type { ServiceCatalogItemData } from '../model/service.types';
import { ServiceLanguageBadge } from './ServiceStatusBadge';

type ServicesOrderTableProps = {
  services: ServiceCatalogItemData[];
  isReordering: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
};

export function ServicesOrderTable({
  services,
  isReordering,
  onMove,
}: ServicesOrderTableProps) {
  const lastIndex = services.length - 1;

  return (
    <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-[#F8FAFC]'>
            <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              <th scope='col' className='w-20 px-5 py-3'>
                Order
              </th>
              <th scope='col' className='px-5 py-3'>
                Service
              </th>
              <th scope='col' className='px-5 py-3'>
                Languages
              </th>
              <th scope='col' className='px-5 py-3'>
                Description
              </th>
              <th scope='col' className='px-5 py-3'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr
                key={service.id}
                className='border-b border-[#E5E7EB] last:border-b-0'
              >
                <td className='whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#111827]'>
                  {index + 1}
                </td>
                <td className='min-w-[260px] px-5 py-4'>
                  <div className='flex items-center gap-3'>
                    <span
                      className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-[#F8FAFC] text-[10px] font-semibold leading-3'
                      style={{ color: service.service.iconColor }}
                      title={service.service.icon}
                    >
                      {formatServiceIconName(service.service.icon)}
                    </span>
                    <div className='min-w-0'>
                      <Link
                        to={`${ADMIN_ROUTE_PATHS.services}/${service.id}`}
                        className='line-clamp-1 text-sm font-semibold text-[#111827] underline-offset-4 hover:text-[#6D28D9] hover:underline focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
                      >
                        {service.title}
                      </Link>
                      <p className='mt-1 font-mono text-xs text-[#9CA3AF]'>
                        {service.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <div className='flex flex-wrap gap-2'>
                    {service.languages.map((language) => (
                      <ServiceLanguageBadge key={language} language={language} />
                    ))}
                  </div>
                </td>
                <td className='max-w-[360px] px-5 py-4 text-sm leading-6 text-[#6B7280]'>
                  <span className='line-clamp-2'>
                    {service.description || 'No description has been added yet.'}
                  </span>
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <div className='flex gap-2'>
                    <ReorderButton
                      label='Move Up'
                      symbol='↑'
                      disabled={index === 0 || isReordering}
                      onClick={() => onMove(index, index - 1)}
                    />
                    <ReorderButton
                      label='Move Down'
                      symbol='↓'
                      disabled={index === lastIndex || isReordering}
                      onClick={() => onMove(index, index + 1)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type ReorderButtonProps = {
  label: string;
  symbol: string;
  disabled: boolean;
  onClick: () => void;
};

function ReorderButton({
  label,
  symbol,
  disabled,
  onClick,
}: ReorderButtonProps) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className='flex h-9 w-9 items-center justify-center rounded-md border border-[#D1D5DB] bg-white text-base font-semibold text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-40'
    >
      {symbol}
    </button>
  );
}
