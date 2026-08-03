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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicBlogDetail = BlogListItem & {
  content: string;
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
