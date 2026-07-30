import type { ServiceLanguage } from './service.types';

export const SERVICE_LANGUAGES: readonly ServiceLanguage[] = ['EN', 'KA'];

export const DEFAULT_SERVICE_LANGUAGE: ServiceLanguage = 'EN';

export function getServiceLanguageLabel(language: ServiceLanguage): string {
  const labels: Record<ServiceLanguage, string> = {
    EN: 'English',
    KA: 'Georgian',
  };

  return labels[language];
}
