import { z } from "zod";

import {
  BLOG_STATUS_OPTIONS,
  COVER_IMAGE_MAX_SIZE_BYTES,
  CREATE_BLOG_FORM_VALIDATION_MESSAGES,
  META_DESCRIPTION_MAX_LENGTH,
} from "./createBlogForm.constants";
import type { BlogStatus, CreateBlogFormValues } from "./createBlogForm.types";

const blogStatusValues = BLOG_STATUS_OPTIONS.map(
  (statusOption) => statusOption.value,
) as [BlogStatus, ...BlogStatus[]];

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const BlogTranslationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.titleRequired })
    .max(160, { message: "Blog title must be 160 characters or fewer." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.slugRequired })
    .max(120, { message: "Slug must be 120 characters or fewer." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.slugInvalid,
    }),
  excerpt: z
    .string()
    .trim()
    .min(1, { message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.excerptRequired })
    .max(500, {
      message: "Short description must be 500 characters or fewer.",
    }),
  content: z
    .string()
    .max(50000, { message: "Main blog content is too long." })
    .refine((html) => getVisibleTextFromHtml(html).length > 0, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.contentRequired,
    }),
  seoTitle: z
    .string()
    .max(160, { message: "SEO title must be 160 characters or fewer." }),
  metaDescription: z.string().max(META_DESCRIPTION_MAX_LENGTH, {
    message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.metaDescriptionMax,
  }),
});

export const CreateBlogFormSchema: z.ZodType<CreateBlogFormValues> = z.object({
  coverImage: z
    .custom<File | null>((value) => value === null || value instanceof File)
    .refine((file) => file === null || allowedImageTypes.includes(file.type), {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageType,
    })
    .refine((file) => file === null || file.size <= COVER_IMAGE_MAX_SIZE_BYTES, {
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageSize,
    }),
  existingCoverImageKey: z.string().optional(),
  existingCoverImageUrl: z.string().optional(),
  status: z.enum(blogStatusValues),
  publishDate: z.string(),
  isFeatured: z.boolean(),
  translations: z.object({
    EN: BlogTranslationSchema,
    KA: BlogTranslationSchema,
  }),
}).superRefine((values, context) => {
  if (!values.coverImage && !values.existingCoverImageKey) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["coverImage"],
      message: CREATE_BLOG_FORM_VALIDATION_MESSAGES.coverImageRequired,
    });
  }
});

export function getVisibleTextFromHtml(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html.trim();
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  return document.body.textContent?.trim() ?? "";
}

export function createSlugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}
