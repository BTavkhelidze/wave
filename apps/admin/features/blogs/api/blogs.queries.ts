import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteBlog,
  getAdminBlogById,
  getAdminBlogs,
  getPublicBlogBySlug,
  getPublicBlogs,
  updateBlog,
} from './blogs.api';
import { adminLogsRootQueryKey } from '../../admin-logs/api/adminLogs.queries';
import { servicesAnalyticsQueryKey } from '../../services/api/services.queries';
import type {
  AdminBlogDetail,
  AdminBlogsQueryParams,
  BlogMutationPayload,
  PublicBlogsQueryParams,
} from '../model/blog.types';

export const publicBlogsQueryKey = (params: PublicBlogsQueryParams) =>
  ['public-blogs', params] as const;

export const publicBlogDetailQueryKey = (slug: string) =>
  ['public-blog', slug] as const;

export const adminBlogsRootQueryKey = ['admin-blogs'] as const;

export const adminBlogsQueryKey = (params: AdminBlogsQueryParams) =>
  [...adminBlogsRootQueryKey, params] as const;

export const adminBlogDetailQueryKey = (blogId: string) =>
  [...adminBlogsRootQueryKey, 'detail', blogId] as const;

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

export function useAdminBlogQuery(blogId: string) {
  return useQuery({
    queryKey: adminBlogDetailQueryKey(blogId),
    queryFn: ({ signal }) => getAdminBlogById(blogId, signal),
    enabled: blogId.length > 0,
  });
}

export function useUpdateBlogMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BlogMutationPayload) => updateBlog(blogId, payload),
    onSuccess: async (blog) => {
      queryClient.setQueryData<AdminBlogDetail>(
        adminBlogDetailQueryKey(blogId),
        blog,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminBlogsRootQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['public-blogs'] }),
        queryClient.invalidateQueries({ queryKey: servicesAnalyticsQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey }),
      ]);
    },
  });
}

export function useDeleteBlogMutation(blogId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteBlog(blogId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminBlogsRootQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['public-blogs'] }),
        queryClient.invalidateQueries({ queryKey: servicesAnalyticsQueryKey }),
        queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey }),
        queryClient.removeQueries({
          queryKey: adminBlogDetailQueryKey(blogId),
        }),
      ]);
    },
  });
}
