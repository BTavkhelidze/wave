import { z } from 'zod';

import {
  BLOG_LANGUAGE_OPTIONS,
  BLOG_STATUS_OPTIONS,
  COVER_IMAGE_MAX_SIZE_BYTES,
  CREATE_BLOG_FORM_VALIDATION_MESSAGES,
  META_DESCRIPTION_MAX_LENGTH,
} from './createBlogForm.constants';
import type {
  BlogLanguage,
  BlogStatus,
  CreateBlogFormValues,
} from './createBlogForm.types';

const blogLanguageValues = BLOG_LANGUAGE_OPTIONS.map(
  (languageOption) => languageOption.value,
) as [BlogLanguage, ...BlogLanguage[]];

const blogStatusValues = BLOG_STATUS_OPTIONS.map(
  (statusOption) => statusOption.value,
) as [BlogStatus, ...BlogStatus[]];

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const CreateBlogFormSchema: z.ZodType<CreateBlogFormValues> = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.titleRequired }),
  slug: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.slugRequired })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.slugInvalid,
    }),
  excerpt: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.excerptRequired }),
  content: z
    .string()
    .refine((html) => getVisibleTextFromHtml(html).length > 0, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.contentRequired,
    }),
  language: z.enum(blogLanguageValues),
  coverImage: z
    .custom<File>((value) => value instanceof File, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageRequired,
    })
    .refine((file) => allowedImageTypes.includes(file.type), {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageType,
    })
    .refine((file) => file.size <= COVER_IMAGE_MAX_SIZE_BYTES, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageSize,
    }),
  status: z.enum(blogStatusValues),
  publishDate: z.string(),
  isFeatured: z.boolean(),
  seoTitle: z.string(),
  metaDescription: z
    .string()
    .max(META_DESCRIPTION_MAX_LENGTH, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.metaDescriptionMax,
    }),
});

export function getVisibleTextFromHtml(html: string): string {
  if (typeof DOMParser === 'undefined') {
    return html.trim();
  }

  const document = new DOMParser().parseFromString(html, 'text/html');

  return document.body.textContent?.trim() ?? '';
}

export function createSlugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}
