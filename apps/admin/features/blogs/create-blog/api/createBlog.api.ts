import { apiRequest } from "../../../../src/shared/api/httpClient";
import type { PublicBlogDetail } from "../../model/blog.types";
import type { BlogLanguage, BlogStatus } from "../model/createBlogForm.types";

export type UploadImageResponse = {
  key: string;
  url: string;
};

export type DeleteImageResponse = {
  success: boolean;
  message: string;
};

export type CreateBlogPayload = {
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

export type CreateBlogResponse = PublicBlogDetail;

export async function uploadBlogImage(
  file: File,
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("image", file);

  return apiRequest<UploadImageResponse>("/uploads/image", {
    method: "POST",
    body: formData,
  });
}

export function deleteBlogImage(key: string): Promise<DeleteImageResponse> {
  return apiRequest<DeleteImageResponse>("/uploads/image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  });
}

export function createBlog(
  payload: CreateBlogPayload,
): Promise<CreateBlogResponse> {
  return apiRequest<CreateBlogResponse>("/blogs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
