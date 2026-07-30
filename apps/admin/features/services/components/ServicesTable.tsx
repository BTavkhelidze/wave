import { ServiceLanguageBadge } from './ServiceStatusBadge';
import type { ServiceListItemData } from '../model/service.types';

type ServicesTableProps = {
  services: ServiceListItemData[];
};

export function ServicesTable({ services }: ServicesTableProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-[#F8FAFC]'>
            <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              <th scope='col' className='px-5 py-3'>
                Service
              </th>
              <th scope='col' className='px-5 py-3'>
                Language
              </th>
              <th scope='col' className='px-5 py-3'>
                Description
              </th>
              <th scope='col' className='px-5 py-3'>
                Icon
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className='border-b border-[#E5E7EB] last:border-b-0'
              >
                <td className='min-w-[220px] px-5 py-4'>
                  <p className='text-sm font-semibold text-[#111827]'>
                    {service.title}
                  </p>
                  <p className='mt-1 font-mono text-xs text-[#6B7280]'>
                    {service.id}
                  </p>
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <ServiceLanguageBadge language={service.language} />
                </td>
                <td className='max-w-[420px] px-5 py-4 text-sm leading-6 text-[#6B7280]'>
                  <span title={service.description} className='line-clamp-2'>
                    {service.description}
                  </span>
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <div className='flex items-center gap-2'>
                    <span
                      aria-hidden='true'
                      className='h-3 w-3 rounded-full border border-[#E5E7EB]'
                      style={{ backgroundColor: service.service.iconColor }}
                    />
                    <span className='text-sm text-[#111827]'>
                      {service.service.icon}
                    </span>
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
