import type { IServices } from '@/Interface/Interface';

export function getLocalizedServiceTitle(
  service: IServices,
  locale: string,
): string | undefined {
  return locale === 'ka'
    ? service.title_ka ?? service.title_en
    : service.title_en ?? service.title_ka;
}

export function getLocalizedServiceDescription(
  service: IServices,
  locale: string,
): string | undefined {
  return locale === 'ka'
    ? service.description_ka ?? service.description_en
    : service.description_en ?? service.description_ka;
}

export function getLocalizedServiceSlug(
  service: IServices,
  locale: string,
): string | undefined {
  return locale === 'ka'
    ? service.slug_ka ?? service.slug_en
    : service.slug_en ?? service.slug_ka;
}

export function getLocalizedServiceMetaTitle(
  service: IServices,
  locale: string,
): string | undefined {
  return locale === 'ka'
    ? service.metaTitle_ka ?? service.metaTitle_en
    : service.metaTitle_en ?? service.metaTitle_ka;
}

export function getLocalizedServiceMetaDescription(
  service: IServices,
  locale: string,
): string | undefined {
  return locale === 'ka'
    ? service.metaDescription_ka ?? service.metaDescription_en
    : service.metaDescription_en ?? service.metaDescription_ka;
}

export function matchesLocalizedServiceSlug(
  service: IServices,
  locale: string,
  serviceParam: string,
): boolean {
  return (
    service.id === serviceParam ||
    getLocalizedServiceSlug(service, locale) === serviceParam
  );
}
