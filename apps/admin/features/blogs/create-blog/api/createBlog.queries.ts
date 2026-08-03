import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createBlog,
  deleteBlogImage,
  uploadBlogImage,
  type CreateBlogPayload,
  type CreateBlogResponse,
} from './createBlog.api';
import { adminBlogsRootQueryKey } from '../../api/blogs.queries';
import type { CreateBlogFormValues } from '../model/createBlogForm.types';

type CreateBlogMutationInput = {
  values: CreateBlogFormValues;
  status: CreateBlogPayload['status'];
};

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlogFromForm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['public-blogs'] });
      await queryClient.invalidateQueries({ queryKey: adminBlogsRootQueryKey });
    },
  });
}

async function createBlogFromForm({
  values,
  status,
}: CreateBlogMutationInput): Promise<CreateBlogResponse> {
  if (!values.coverImage) {
    throw new Error('Cover image is required.');
  }

  const uploadedCoverImage = await uploadBlogImage(values.coverImage);

  try {
    return await createBlog(
      buildCreateBlogPayload(values, status, uploadedCoverImage),
    );
  } catch (error) {
    await deleteUploadedCoverImage(uploadedCoverImage.key);
    throw error;
  }
}

function buildCreateBlogPayload(
  values: CreateBlogFormValues,
  status: CreateBlogPayload['status'],
  uploadedCoverImage: { key: string; url: string },
): CreateBlogPayload {
  const payload: CreateBlogPayload = {
    title: values.title.trim(),
    slug: values.slug.trim(),
    excerpt: values.excerpt.trim(),
    content: values.content.trim(),
    coverImageKey: uploadedCoverImage.key,
    coverImageUrl: uploadedCoverImage.url,
    language: values.language,
    status,
    isFeatured: values.isFeatured,
  };

  if (status === 'PUBLISHED' && values.publishDate) {
    payload.publishedAt = new Date(values.publishDate).toISOString();
  }

  return payload;
}

async function deleteUploadedCoverImage(key: string): Promise<void> {
  try {
    await deleteBlogImage(key);
  } catch {
    // Best-effort cleanup only. The original blog creation error is more useful
    // to surface to the admin than a secondary storage cleanup failure.
  }
}
