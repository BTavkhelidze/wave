'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchPublicBlogBySlug, fetchPublicBlogs } from './blogs.api';

export const publicBlogsQueryKey = (locale: string) =>
  ['blogs', 'public', locale] as const;

export const publicBlogDetailQueryKey = (locale: string, slug: string) =>
  ['blogs', 'public', locale, slug] as const;

export function usePublicBlogsQuery(locale: string) {
  return useQuery({
    queryKey: publicBlogsQueryKey(locale),
    queryFn: ({ signal }) => fetchPublicBlogs(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicBlogDetailQuery(locale: string, slug: string) {
  return useQuery({
    queryKey: publicBlogDetailQueryKey(locale, slug),
    queryFn: ({ signal }) => fetchPublicBlogBySlug(slug, signal),
    staleTime: 5 * 60 * 1000,
  });
}
