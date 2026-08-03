export type BlogLanguage = 'EN' | 'KA';

export type BlogStatus = 'DRAFT' | 'PUBLISHED';

export type CreateBlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  language: BlogLanguage;
  coverImage: File | null;
  status: BlogStatus;
  publishDate: string;
  isFeatured: boolean;
  seoTitle: string;
  metaDescription: string;
};
