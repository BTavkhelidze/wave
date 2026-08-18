import { isApiRequestError } from '../../../src/shared/api/httpClient';
import {
  CONTENT_MANAGER_ROLES,
  canAccessRole,
} from '../../auth/lib/authorization';
import { useAuth } from '../../context/AuthContext';
import {
  useReorderServicesMutation,
  useServiceCatalogQuery,
} from '../api/services.queries';
import type { ServiceCatalogItemData } from '../model/service.types';
import { ServicesOrderTable } from './ServicesOrderTable';
import { ServicesStateCard } from './ServicesStateCard';

export function ServicesList() {
  const { user } = useAuth();
  const canManageServices = canAccessRole(user?.role, CONTENT_MANAGER_ROLES);
  const servicesQuery = useServiceCatalogQuery();
  const reorderServicesMutation = useReorderServicesMutation();

  if (
    servicesQuery.isError &&
    isApiRequestError(servicesQuery.error) &&
    servicesQuery.error.status === 403
  ) {
    return (
      <ServicesStateCard
        tone='warning'
        title='Access denied'
        message='You do not have permission to view services.'
      />
    );
  }

  if (servicesQuery.isLoading) {
    return (
      <div className='space-y-4'>
        <ServicesToolbar totalServices={undefined} />
        <ServicesStateCard
          tone='neutral'
          title='Loading services'
          message='Fetching the service catalog and translations.'
        />
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div className='space-y-4'>
        <ServicesToolbar totalServices={servicesQuery.data?.length} />
        <ServicesStateCard
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
  const reorderError =
    reorderServicesMutation.error instanceof Error
      ? reorderServicesMutation.error.message
      : null;

  const handleMoveService = (fromIndex: number, toIndex: number) => {
    if (
      !canManageServices ||
      reorderServicesMutation.isPending ||
      toIndex < 0 ||
      toIndex >= services.length
    ) {
      return;
    }

    const reorderedServices = moveService(services, fromIndex, toIndex);

    reorderServicesMutation.mutate({
      serviceIds: reorderedServices.map((service) => service.id),
    });
  };

  return (
    <div className='space-y-4'>
      <ServicesToolbar
        totalServices={services.length}
        isReordering={reorderServicesMutation.isPending}
        canReorder={canManageServices}
      />

      {canManageServices && reorderError && (
        <ServicesStateCard
          tone='error'
          title='Could not reorder services'
          message={reorderError}
        />
      )}

      {services.length > 0 ? (
        <ServicesOrderTable
          services={services}
          isReordering={reorderServicesMutation.isPending}
          canReorder={canManageServices}
          onMove={handleMoveService}
        />
      ) : (
        <ServicesStateCard
          tone='neutral'
          title='No services have been created yet'
          message='No service translations were returned by the services API.'
        />
      )}
    </div>
  );
}

type ServicesToolbarProps = {
  totalServices: number | undefined;
  canReorder?: boolean;
  isReordering?: boolean;
};

function ServicesToolbar({
  totalServices,
  canReorder = false,
  isReordering = false,
}: ServicesToolbarProps) {
  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div>
        <p className='text-sm font-semibold text-[#111827]'>
          {totalServices === undefined
            ? 'Service catalog'
            : `${totalServices} service${totalServices === 1 ? '' : 's'}`}
        </p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          {canReorder
            ? 'Showing services in persisted order. Use Move Up and Move Down to update the order shown on the public website.'
            : 'Showing services in persisted order.'}
        </p>
      </div>
      {canReorder && isReordering && (
        <p className='mt-3 text-sm font-medium text-[#6D28D9]'>
          Saving order...
        </p>
      )}
    </div>
  );
}

function moveService(
  services: ServiceCatalogItemData[],
  fromIndex: number,
  toIndex: number,
): ServiceCatalogItemData[] {
  const nextServices = [...services];
  const [service] = nextServices.splice(fromIndex, 1);

  if (!service) {
    return services;
  }

  nextServices.splice(toIndex, 0, service);

  return nextServices;
}
