import { z } from 'zod';

const requiredTextField = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const slugField = (label: string) =>
  requiredTextField(label).regex(
    /^[A-Za-z0-9]+(?:[\s-]+[A-Za-z0-9]+)*$/,
    `${label} must use letters, numbers, spaces, and hyphens.`,
  );

export const CreateServiceFormSchema = z.object({
  icon: requiredTextField('Icon'),
  iconColor: requiredTextField('Icon color').regex(
    /^#[0-9A-Fa-f]{6}$/,
    'Icon color must be a valid hex color.',
  ),
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
