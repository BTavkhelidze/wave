export type ServiceLanguage = 'EN' | 'KA';

export type ServiceListQueryParams = {
  language?: ServiceLanguage;
};

export type ServiceAsset = {
  icon: string;
  iconColor: string;
  sortOrder: number;
};

export type ServiceListItemData = {
  id: string;
  serviceId: string;
  language: ServiceLanguage;
  title: string;
  description: string;
  service: ServiceAsset;
};

export type ServiceTranslationMutationResponse = {
  id: string;
  serviceId: string;
  language: ServiceLanguage;
  title: string;
  description: string;
};

export type ServiceTranslationContent = {
  id: string;
  language: ServiceLanguage;
  title: string;
  description: string;
};

export type ServiceTranslationFormValues = {
  title: string;
  description: string;
};

export type CreateServiceTranslationPayload = ServiceTranslationFormValues & {
  language: ServiceLanguage;
};

export type UpdateServiceTranslationPayload = ServiceTranslationFormValues;

export type CreateServiceFormValues = {
  icon: string;
  iconColor: string;
  kaTitle: string;
  kaDescription: string;
  enTitle: string;
  enDescription: string;
};

export type CreateServicePayload = {
  icon: string;
  iconColor: string;
  translations: Array<{
    language: ServiceLanguage;
    title: string;
    description: string;
  }>;
};

export type CreateServiceResponse = {
  id: string;
  icon: string;
  iconColor: string;
  isActive: boolean;
  sortOrder: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  translations: ServiceTranslationMutationResponse[];
};

export type ServiceCatalogItemData = {
  id: string;
  service: ServiceAsset;
  sortOrder: number;
  translations: Partial<Record<ServiceLanguage, ServiceTranslationContent>>;
  languages: ServiceLanguage[];
  title: string;
  description: string;
};

export type ReorderServicesPayload = {
  serviceIds: string[];
};

export type ReorderServicesResponse = {
  serviceIds: string[];
  message: string;
};
