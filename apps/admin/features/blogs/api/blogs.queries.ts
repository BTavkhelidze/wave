import { useQuery } from '@tanstack/react-query';
import { getAdminBlogs, getPublicBlogBySlug, getPublicBlogs } from './blogs.api';
import type {
  AdminBlogsQueryParams,
  PublicBlogsQueryParams,
} from '../model/blog.types';

export const publicBlogsQueryKey = (params: PublicBlogsQueryParams) =>
  ['public-blogs', params] as const;

export const publicBlogDetailQueryKey = (slug: string) =>
  ['public-blog', slug] as const;

export const adminBlogsRootQueryKey = ['admin-blogs'] as const;

export const adminBlogsQueryKey = (params: AdminBlogsQueryParams) =>
  [...adminBlogsRootQueryKey, params] as const;

export function usePublicBlogsQuery(params: PublicBlogsQueryParams) {
  return useQuery({
    queryKey: publicBlogsQueryKey(params),
    queryFn: ({ signal }) => getPublicBlogs(params, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function usePublicBlogBySlugQuery(slug: string) {
  return useQuery({
    queryKey: publicBlogDetailQueryKey(slug),
    queryFn: ({ signal }) => getPublicBlogBySlug(slug, signal),
    enabled: slug.length > 0,
  });
}

export function useAdminBlogsQuery(params: AdminBlogsQueryParams) {
  return useQuery({
    queryKey: adminBlogsQueryKey(params),
    queryFn: ({ signal }) => getAdminBlogs(params, signal),
    placeholderData: (previousData) => previousData,
  });
}
