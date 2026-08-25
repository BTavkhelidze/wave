import type { CreateServiceFormValues } from './service.types';
import { DEFAULT_SERVICE_ANIMATION_COLORS } from './serviceAnimationColors';

export const CREATE_SERVICE_FORM_DEFAULT_VALUES: CreateServiceFormValues = {
  icon: 'FaTools',
  iconColor: '#7C3AED',
  animationColors: [...DEFAULT_SERVICE_ANIMATION_COLORS],
  kaTitle: '',
  kaDescription: '',
  kaSlug: '',
  kaMetaTitle: '',
  kaMetaDescription: '',
  enTitle: '',
  enDescription: '',
  enSlug: '',
  enMetaTitle: '',
  enMetaDescription: '',
};
