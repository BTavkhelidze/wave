import { z } from 'zod';
import { SERVICE_ANIMATION_COLOR_PATTERN } from './serviceAnimationColors';

const requiredTextField = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const slugField = (label: string) =>
  requiredTextField(label).regex(
    /^[A-Za-z0-9]+(?:[\s-]+[A-Za-z0-9]+)*$/,
    `${label} must use letters, numbers, spaces, and hyphens.`,
  );

export const animationColorsField = z
  .array(z.string().trim())
  .length(5, 'Animation colors must include exactly five colors.')
  .refine(
    (colors) =>
      colors.every((color) => SERVICE_ANIMATION_COLOR_PATTERN.test(color)),
    'Each animation color must be a valid hex color.',
  );

export const CreateServiceFormSchema = z.object({
  icon: requiredTextField('Icon'),
  iconColor: requiredTextField('Icon color').regex(
    /^#[0-9A-Fa-f]{6}$/,
    'Icon color must be a valid hex color.',
  ),
  animationColors: animationColorsField,
  kaTitle: requiredTextField('Georgian title'),
  kaDescription: requiredTextField('Georgian description'),
  kaSlug: slugField('Georgian slug'),
  kaMetaTitle: z.string().trim(),
  kaMetaDescription: z.string().trim(),
  enTitle: requiredTextField('English title'),
  enDescription: requiredTextField('English description'),
  enSlug: slugField('English slug'),
  enMetaTitle: z.string().trim(),
  enMetaDescription: z.string().trim(),
});

export const ServiceTranslationFormSchema = z.object({
  title: requiredTextField('Title'),
  description: requiredTextField('Description'),
  slug: slugField('Slug'),
  metaTitle: z.string().trim(),
  metaDescription: z.string().trim(),
  animationColors: animationColorsField,
});
