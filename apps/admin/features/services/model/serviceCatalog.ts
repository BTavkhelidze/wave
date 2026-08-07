import { SERVICE_LANGUAGES } from './service.constants';
import type {
  ServiceCatalogItemData,
  ServiceLanguage,
  ServiceListItemData,
  ServiceTranslationContent,
} from './service.types';

const PREFERRED_LANGUAGE_ORDER: readonly ServiceLanguage[] = ['EN', 'KA'];

export function groupServiceTranslations(
  translations: ServiceListItemData[],
): ServiceCatalogItemData[] {
  const servicesById = new Map<
    string,
    {
      id: string;
      service: ServiceCatalogItemData['service'];
      translations: Partial<Record<ServiceLanguage, ServiceTranslationContent>>;
    }
  >();

  translations.forEach((translation) => {
    const serviceId = translation.serviceId;
    const serviceGroup =
      servicesById.get(serviceId) ??
      {
        id: serviceId,
        service: translation.service,
        translations: {},
      };

    serviceGroup.translations[translation.language] = {
      id: translation.id,
      language: translation.language,
      title: translation.title,
      description: translation.description,
    };

    servicesById.set(serviceId, serviceGroup);
  });

  return Array.from(servicesById.values()).map((serviceGroup) => {
    const primaryTranslation = getPreferredServiceTranslation(
      serviceGroup.translations,
    );

    return {
      id: serviceGroup.id,
      service: serviceGroup.service,
      sortOrder: serviceGroup.service.sortOrder,
      translations: serviceGroup.translations,
      languages: SERVICE_LANGUAGES.filter(
        (language) => serviceGroup.translations[language],
      ),
      title: primaryTranslation?.title ?? 'Untitled service',
      description: primaryTranslation?.description ?? '',
    };
  });
}

export function getPreferredServiceTranslation(
  translations: Partial<Record<ServiceLanguage, ServiceTranslationContent>>,
): ServiceTranslationContent | undefined {
  return PREFERRED_LANGUAGE_ORDER.map((language) => translations[language]).find(
    Boolean,
  );
}

export function getMissingServiceLanguages(
  service: ServiceCatalogItemData,
): ServiceLanguage[] {
  return SERVICE_LANGUAGES.filter((language) => !service.translations[language]);
}

export function formatServiceIconName(icon: string): string {
  return icon
    .replace(/^Fa/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim();
}
