import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminLogsRootQueryKey } from '../../admin-logs/api/adminLogs.queries';
import {
  createService,
  createServiceTranslation,
  deleteService,
  fetchServicesAnalytics,
  fetchServices,
  reorderServices,
  updateServiceTranslation,
} from './services.api';
import { groupServiceTranslations } from '../model/serviceCatalog';
import type {
  CreateServiceFormValues,
  CreateServicePayload,
  CreateServiceResponse,
  CreateServiceTranslationPayload,
  ReorderServicesPayload,
  ServiceCatalogItemData,
  ServiceLanguage,
  ServiceListQueryParams,
  ServiceTranslationContent,
  ServicesAnalyticsResponse,
  UpdateServiceTranslationPayload,
} from '../model/service.types';

export const servicesQueryKey = (params: ServiceListQueryParams) =>
  ['services', params] as const;

export const serviceCatalogQueryKey = ['services', 'catalog'] as const;

export const servicesAnalyticsQueryKey = ['services', 'analytics'] as const;

export const serviceTranslationQueryKey = (
  serviceId: string,
  language: ServiceLanguage,
) => [...serviceCatalogQueryKey, serviceId, language] as const;

export function useServicesQuery(params: ServiceListQueryParams) {
  return useQuery({
    queryKey: servicesQueryKey(params),
    queryFn: ({ signal }) => fetchServices(params, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useServiceCatalogQuery() {
  return useQuery({
    queryKey: serviceCatalogQueryKey,
    queryFn: async ({ signal }) => {
      const translations = await fetchServices({}, signal);

      return groupServiceTranslations(translations);
    },
  });
}

export function useServicesAnalyticsQuery() {
  return useQuery<ServicesAnalyticsResponse>({
    queryKey: servicesAnalyticsQueryKey,
    queryFn: ({ signal }) => fetchServicesAnalytics(signal),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createServiceFromForm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: serviceCatalogQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      await queryClient.invalidateQueries({
        queryKey: servicesAnalyticsQueryKey,
      });
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export function useServiceTranslationQuery(
  serviceId: string,
  language: ServiceLanguage,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: serviceTranslationQueryKey(serviceId, language),
    queryFn: async ({ signal }) => {
      const catalog = await queryClient.fetchQuery({
        queryKey: serviceCatalogQueryKey,
        queryFn: async () => {
          const translations = await fetchServices({}, signal);

          return groupServiceTranslations(translations);
        },
      });

      return getServiceTranslationFromCatalog(catalog, serviceId, language);
    },
    enabled: serviceId.length > 0,
  });
}

export function useCreateServiceTranslationMutation(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceTranslationPayload) =>
      createServiceTranslation(serviceId, payload),
    onSuccess: async (_createdTranslation, payload) => {
      await invalidateServiceTranslationQueries(
        queryClient,
        serviceId,
        payload.language,
      );
      await queryClient.invalidateQueries({
        queryKey: servicesAnalyticsQueryKey,
      });
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export function useUpdateServiceTranslationMutation(
  serviceId: string,
  language: ServiceLanguage,
  translationId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateServiceTranslationPayload) =>
      updateServiceTranslation(translationId, payload),
    onSuccess: async () => {
      await invalidateServiceTranslationQueries(queryClient, serviceId, language);
      await queryClient.invalidateQueries({
        queryKey: servicesAnalyticsQueryKey,
      });
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export function useDeleteServiceMutation(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteService(serviceId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: serviceCatalogQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['services'] }),
        queryClient.invalidateQueries({ queryKey: servicesAnalyticsQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey }),
        queryClient.removeQueries({
          queryKey: [...serviceCatalogQueryKey, serviceId],
        }),
      ]);
    },
  });
}

export function useReorderServicesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderServicesPayload) => reorderServices(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: serviceCatalogQueryKey });

      const previousCatalog =
        queryClient.getQueryData<ServiceCatalogItemData[]>(
          serviceCatalogQueryKey,
        );

      if (previousCatalog) {
        queryClient.setQueryData<ServiceCatalogItemData[]>(
          serviceCatalogQueryKey,
          reorderCatalogByServiceIds(previousCatalog, payload.serviceIds),
        );
      }

      return { previousCatalog };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousCatalog) {
        queryClient.setQueryData(
          serviceCatalogQueryKey,
          context.previousCatalog,
        );
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: servicesAnalyticsQueryKey,
      });
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: serviceCatalogQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

type ServiceTranslationQueryData = {
  service: ServiceCatalogItemData | undefined;
  translation: ServiceTranslationContent | undefined;
};

function getServiceTranslationFromCatalog(
  catalog: ServiceCatalogItemData[],
  serviceId: string,
  language: ServiceLanguage,
): ServiceTranslationQueryData {
  const service = catalog.find((item) => item.id === serviceId);

  return {
    service,
    translation: service?.translations[language],
  };
}

async function invalidateServiceTranslationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  serviceId: string,
  language: ServiceLanguage,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: serviceCatalogQueryKey }),
    queryClient.invalidateQueries({
      queryKey: serviceTranslationQueryKey(serviceId, language),
    }),
  ]);
}

function createServiceFromForm(
  values: CreateServiceFormValues,
): Promise<CreateServiceResponse> {
  return createService(buildCreateServicePayload(values));
}

function buildCreateServicePayload(
  values: CreateServiceFormValues,
): CreateServicePayload {
  return {
    icon: values.icon.trim(),
    iconColor: values.iconColor.trim(),
    animationColors: values.animationColors.map((color) =>
      color.trim().toUpperCase(),
    ),
    translations: [
      {
        language: 'KA',
        title: values.kaTitle.trim(),
        description: values.kaDescription.trim(),
        slug: values.kaSlug.trim(),
        metaTitle: optionalTrimmedValue(values.kaMetaTitle),
        metaDescription: optionalTrimmedValue(values.kaMetaDescription),
      },
      {
        language: 'EN',
        title: values.enTitle.trim(),
        description: values.enDescription.trim(),
        slug: values.enSlug.trim(),
        metaTitle: optionalTrimmedValue(values.enMetaTitle),
        metaDescription: optionalTrimmedValue(values.enMetaDescription),
      },
    ],
  };
}

function optionalTrimmedValue(value: string): string | undefined {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function reorderCatalogByServiceIds(
  catalog: ServiceCatalogItemData[],
  serviceIds: string[],
): ServiceCatalogItemData[] {
  const servicesById = new Map(catalog.map((service) => [service.id, service]));

  return serviceIds
    .map((serviceId, index) => {
      const service = servicesById.get(serviceId);

      if (!service) {
        return undefined;
      }

      return {
        ...service,
        sortOrder: index + 1,
        service: {
          ...service.service,
          sortOrder: index + 1,
        },
      };
    })
    .filter((service): service is ServiceCatalogItemData => Boolean(service));
}
