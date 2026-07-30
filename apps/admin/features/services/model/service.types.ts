export type ServiceLanguage = 'EN' | 'KA';

export type ServiceListQueryParams = {
  language?: ServiceLanguage;
};

export type ServiceAsset = {
  icon: string;
  iconColor: string;
};

export type ServiceListItemData = {
  id: string;
  serviceId: string;
  language: ServiceLanguage;
  title: string;
  description: string;
  service: ServiceAsset;
};
