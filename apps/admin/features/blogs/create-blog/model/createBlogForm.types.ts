export type BlogLanguage = "EN" | "KA";

export type BlogStatus = "DRAFT" | "PUBLISHED";

export type CreateBlogTranslationFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  metaDescription: string;
};

export type CreateBlogFormValues = {
  coverImage: File | null;
  existingCoverImageKey?: string;
  existingCoverImageUrl?: string;
  canonicalSlug: string;
  status: BlogStatus;
  publishDate: string;
  isFeatured: boolean;
  translations: Record<BlogLanguage, CreateBlogTranslationFormValues>;
};
