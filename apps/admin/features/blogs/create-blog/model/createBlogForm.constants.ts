import type {
  BlogLanguage,
  BlogStatus,
  CreateBlogFormValues,
} from "./createBlogForm.types";

export const BLOG_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: BlogLanguage;
  label: string;
}> = [
  {
    value: "EN",
    label: "English",
  },
  {
    value: "KA",
    label: "Georgian",
  },
];

export const BLOG_STATUS_OPTIONS: ReadonlyArray<{
  value: BlogStatus;
  label: string;
}> = [
  {
    value: "DRAFT",
    label: "Draft",
  },
  {
    value: "PUBLISHED",
    label: "Published",
  },
];

export const CREATE_BLOG_FORM_DEFAULT_VALUES: CreateBlogFormValues = {
  coverImage: null,
  existingCoverImageKey: undefined,
  existingCoverImageUrl: undefined,
  status: "DRAFT",
  publishDate: "",
  isFeatured: false,
  translations: {
    EN: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      seoTitle: "",
      metaDescription: "",
    },
    KA: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      seoTitle: "",
      metaDescription: "",
    },
  },
};

export const CREATE_BLOG_FORM_VALIDATION_MESSAGES = {
  titleRequired: "Blog title is required.",
  slugRequired: "Slug is required.",
  slugInvalid:
    "Use lowercase letters, numbers, and single hyphens only. Do not start or end with a hyphen.",
  excerptRequired: "Short description is required.",
  contentRequired: "Main blog content is required.",
  coverImageRequired: "Cover image is required.",
  coverImageType: "Select a JPEG, PNG, or WebP image.",
  coverImageSize: "Cover image must not exceed 5 MB.",
  metaDescriptionMax: "Meta description must be 160 characters or fewer.",
} as const;

export const COVER_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const COVER_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const BLOG_CONTENT_IMAGE_ACCEPT = COVER_IMAGE_ACCEPT;
export const BLOG_CONTENT_IMAGE_MAX_SIZE_BYTES = COVER_IMAGE_MAX_SIZE_BYTES;
export const META_DESCRIPTION_MAX_LENGTH = 160;
