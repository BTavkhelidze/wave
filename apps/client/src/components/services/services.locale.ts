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
