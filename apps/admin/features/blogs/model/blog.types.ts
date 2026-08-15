export type BlogLanguage = 'EN' | 'KA';

export type BlogStatus = 'DRAFT' | 'PUBLISHED';

export type BlogSortBy = 'createdAt' | 'publishedAt';

export type BlogSortOrder = 'asc' | 'desc';

export type PublicBlogsQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  language?: BlogLanguage;
  isFeatured?: boolean;
  sortBy?: BlogSortBy;
  sortOrder?: BlogSortOrder;
};

export type AdminBlogsQueryParams = PublicBlogsQueryParams & {
  status?: BlogStatus;
};

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageKey: string;
  coverImageUrl: string;
  language: BlogLanguage;
  status: BlogStatus;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogTranslation = {
  id: string;
  language: BlogLanguage;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type PublicBlogDetail = BlogListItem & {
  content: string;
  translations?: BlogTranslation[];
};

export type BlogsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type PublicBlogsResponse = {
  data: BlogListItem[];
  pagination: BlogsPagination;
};

export type AdminBlogsResponse = PublicBlogsResponse;

export type AdminBlogDetail = BlogListItem & {
  content: string;
  translations: BlogTranslation[];
};

export type BlogMutationPayload = {
  coverImageKey: string;
  coverImageUrl: string;
  status: BlogStatus;
  isFeatured: boolean;
  publishedAt?: string;
  translations: Array<{
    language: BlogLanguage;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    metaTitle?: string;
    metaDescription?: string;
  }>;
};
