import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  AdminBlogsQueryParams,
  AdminBlogDetail,
  AdminBlogsResponse,
  BlogMutationPayload,
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

export function getAdminBlogById(
  blogId: string,
  signal?: AbortSignal,
): Promise<AdminBlogDetail> {
  return apiRequest<AdminBlogDetail>(`/blogs/${encodeURIComponent(blogId)}`, {
    signal,
  });
}

export function updateBlog(
  blogId: string,
  payload: BlogMutationPayload,
): Promise<AdminBlogDetail> {
  return apiRequest<AdminBlogDetail>(`/blogs/${encodeURIComponent(blogId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteBlog(
  blogId: string,
): Promise<{ blog: AdminBlogDetail; message: string }> {
  return apiRequest<{ blog: AdminBlogDetail; message: string }>(
    `/blogs/${encodeURIComponent(blogId)}`,
    {
      method: 'DELETE',
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
