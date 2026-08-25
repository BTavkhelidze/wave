import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createBlog,
  deleteBlogImage,
  uploadBlogImage,
  type CreateBlogPayload,
  type CreateBlogResponse,
} from "./createBlog.api";
import { adminLogsRootQueryKey } from "../../../admin-logs/api/adminLogs.queries";
import { adminBlogsRootQueryKey } from "../../api/blogs.queries";
import { servicesAnalyticsQueryKey } from "../../../services/api/services.queries";
import type { CreateBlogFormValues } from "../model/createBlogForm.types";

type CreateBlogMutationInput = {
  values: CreateBlogFormValues;
  status: CreateBlogPayload["status"];
  uploadedInlineImageKeys: string[];
};

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlogFromForm,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["public-blogs"] });
      await queryClient.invalidateQueries({ queryKey: adminBlogsRootQueryKey });
      await queryClient.invalidateQueries({
        queryKey: servicesAnalyticsQueryKey,
      });
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

async function createBlogFromForm({
  values,
  status,
  uploadedInlineImageKeys,
}: CreateBlogMutationInput): Promise<CreateBlogResponse> {
  if (!values.coverImage) {
    throw new Error("Cover image is required.");
  }

  const uploadedCoverImage = await uploadBlogImage(values.coverImage);

  try {
    return await createBlog(
      buildCreateBlogPayload(values, status, uploadedCoverImage),
    );
  } catch (error) {
    await deleteUploadedImages([
      uploadedCoverImage.key,
      ...uploadedInlineImageKeys,
    ]);
    throw error;
  }
}

function buildCreateBlogPayload(
  values: CreateBlogFormValues,
  status: CreateBlogPayload["status"],
  uploadedCoverImage: { key: string; url: string },
): CreateBlogPayload {
  const payload: CreateBlogPayload = {
    coverImageKey: uploadedCoverImage.key,
    coverImageUrl: uploadedCoverImage.url,
    status,
    isFeatured: values.isFeatured,
    translations: (["KA", "EN"] as const).map((language) => {
      const translation = values.translations[language];

      return {
        language,
        title: translation.title.trim(),
        slug: values.canonicalSlug.trim(),
        excerpt: translation.excerpt.trim(),
        content: translation.content.trim(),
        metaTitle: normalizeOptionalText(translation.seoTitle),
        metaDescription: normalizeOptionalText(translation.metaDescription),
      };
    }),
  };

  if (status === "PUBLISHED" && values.publishDate) {
    payload.publishedAt = new Date(values.publishDate).toISOString();
  }

  return payload;
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

async function deleteUploadedImages(keys: string[]): Promise<void> {
  await Promise.all(
    Array.from(new Set(keys)).map(async (key) => {
      try {
        await deleteBlogImage(key);
      } catch {
        // Best-effort cleanup only. The original blog creation error is more
        // useful to surface to the admin than a secondary storage cleanup failure.
      }
    }),
  );
}
