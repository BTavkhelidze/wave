import { z } from 'zod';

const requiredTextField = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

export const CreateServiceFormSchema = z.object({
  icon: requiredTextField('Icon'),
  iconColor: requiredTextField('Icon color').regex(
    /^#[0-9A-Fa-f]{6}$/,
    'Icon color must be a valid hex color.',
  ),
  kaTitle: requiredTextField('Georgian title'),
  kaDescription: requiredTextField('Georgian description'),
  enTitle: requiredTextField('English title'),
  enDescription: requiredTextField('English description'),
});
