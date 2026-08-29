import type { ServiceLanguage } from '../model/service.types';
import { getServiceLanguageLabel } from '../model/service.constants';

type ServiceLanguageBadgeProps = {
  language: ServiceLanguage;
};

export function ServiceLanguageBadge({ language }: ServiceLanguageBadgeProps) {
  return (
    <span className='inline-flex rounded-md bg-[#F3EEFF] px-2 py-1 text-xs font-medium text-[#7C3AED]'>
      {getServiceLanguageLabel(language)}
    </span>
  );
}
