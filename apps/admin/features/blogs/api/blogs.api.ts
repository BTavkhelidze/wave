import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  AdminBlogsQueryParams,
  AdminBlogsResponse,
  PublicBlogDetail,
  PublicBlogsQueryParams,
  PublicBlogsResponse,
} from '../model/blog.types';

export function getPublicBlogs(
  params: PublicBlogsQueryParams,
  signal?: AbortSignal,
): Promise<PublicBlogsResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, 'page', params.page);
  appendParam(searchParams, 'limit', params.limit);
  appendParam(searchParams, 'search', params.search);
  appendParam(searchParams, 'language', params.language);
  appendParam(searchParams, 'isFeatured', params.isFeatured);
  appendParam(searchParams, 'sortBy', params.sortBy);
  appendParam(searchParams, 'sortOrder', params.sortOrder);

  const queryString = searchParams.toString();

  return apiRequest<PublicBlogsResponse>(
    `/blogs${queryString ? `?${queryString}` : ''}`,
    {
      signal,
      skipAuthRefresh: true,
    },
  );
}

export function getPublicBlogBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<PublicBlogDetail> {
  return apiRequest<PublicBlogDetail>(
    `/blogs/slug/${encodeURIComponent(slug)}`,
    {
      signal,
      skipAuthRefresh: true,
    },
  );
}

export function getAdminBlogs(
  params: AdminBlogsQueryParams,
  signal?: AbortSignal,
): Promise<AdminBlogsResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, 'page', params.page);
  appendParam(searchParams, 'limit', params.limit);
  appendParam(searchParams, 'search', params.search);
  appendParam(searchParams, 'language', params.language);
  appendParam(searchParams, 'status', params.status);
  appendParam(searchParams, 'isFeatured', params.isFeatured);
  appendParam(searchParams, 'sortBy', params.sortBy);
  appendParam(searchParams, 'sortOrder', params.sortOrder);

  const queryString = searchParams.toString();

  return apiRequest<AdminBlogsResponse>(
    `/blogs/admin${queryString ? `?${queryString}` : ''}`,
    {
      signal,
    },
  );
}

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined,
) {
  if (value !== undefined && value !== '') {
    searchParams.set(key, String(value));
  }
}
