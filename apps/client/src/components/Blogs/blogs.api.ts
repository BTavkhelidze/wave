import {
  ApiRequestError,
  getApiBaseUrl,
  getResponseErrorMessage,
  isRecord,
  readOptionalString,
  readRequiredString,
} from '@/lib/api';

const BLOGS_PUBLIC_PATH = '/blogs';
const BLOGS_PUBLIC_DETAIL_PATH = '/blogs/slug';

export type BlogLanguage = 'EN' | 'KA';

export interface BlogTranslation {
  id: string;
  language: BlogLanguage;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageKey: string;
  coverImageUrl: string;
  language: BlogLanguage;
  status: 'DRAFT' | 'PUBLISHED';
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations?: BlogTranslation[];
}

export interface BlogDetail extends BlogListItem {
  content: string;
  translations: BlogTranslation[];
}

interface BlogsPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PublicBlogsResponse {
  data: BlogListItem[];
  pagination: BlogsPagination;
}

function readNullableString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];

  return typeof value === 'string' ? value : null;
}

function readBoolean(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

function readLanguage(
  record: Record<string, unknown>,
  key: string,
  context: string,
): BlogLanguage {
  const value = readRequiredString(record, key, context);

  if (value !== 'EN' && value !== 'KA') {
    throw new Error(`Invalid ${context}: unsupported language`);
  }

  return value;
}

function parseBlogListItem(value: unknown, index: number): BlogListItem {
  const context = `blog response item ${index}`;

  if (!isRecord(value)) {
    throw new Error(`Invalid ${context}: expected an object`);
  }

  return {
    id: readRequiredString(value, 'id', context),
    title: readRequiredString(value, 'title', context),
    slug: readRequiredString(value, 'slug', context),
    excerpt: readRequiredString(value, 'excerpt', context),
    coverImageKey: readOptionalString(value, 'coverImageKey') ?? '',
    coverImageUrl: readOptionalString(value, 'coverImageUrl') ?? '',
    language: readLanguage(value, 'language', context),
    status: readRequiredString(value, 'status', context) === 'PUBLISHED'
      ? 'PUBLISHED'
      : 'DRAFT',
    isFeatured: readBoolean(value, 'isFeatured'),
    publishedAt: readNullableString(value, 'publishedAt'),
    createdAt: readRequiredString(value, 'createdAt', context),
    updatedAt: readRequiredString(value, 'updatedAt', context),
  };
}

function parseBlogTranslation(value: unknown, index: number): BlogTranslation {
  const context = `blog translation ${index}`;

  if (!isRecord(value)) {
    throw new Error(`Invalid ${context}: expected an object`);
  }

  return {
    id: readRequiredString(value, 'id', context),
    language: readLanguage(value, 'language', context),
    title: readRequiredString(value, 'title', context),
    slug: readRequiredString(value, 'slug', context),
    excerpt: readRequiredString(value, 'excerpt', context),
    content: readRequiredString(value, 'content', context),
    metaTitle: readNullableString(value, 'metaTitle'),
    metaDescription: readNullableString(value, 'metaDescription'),
  };
}

function parseBlogDetail(value: unknown): BlogDetail {
  if (!isRecord(value)) {
    throw new Error('Invalid blog response: expected an object');
  }

  const translations = value.translations;

  if (!Array.isArray(translations)) {
    throw new Error('Invalid blog response: expected translations');
  }

  return {
    ...parseBlogListItem(value, 0),
    content: readRequiredString(value, 'content', 'blog response'),
    translations: translations.map(parseBlogTranslation),
  };
}

function parsePublicBlogsResponse(value: unknown): PublicBlogsResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !isRecord(value.pagination)) {
    throw new Error('Invalid blogs response: expected paginated data');
  }

  const pagination = value.pagination;

  return {
    data: value.data.map(parseBlogListItem),
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 10,
      totalItems: Number(pagination.totalItems) || 0,
      totalPages: Number(pagination.totalPages) || 0,
    },
  };
}

async function fetchBlogDetailBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<BlogDetail> {
  const response = await fetch(
    `${getApiBaseUrl()}${BLOGS_PUBLIC_DETAIL_PATH}/${encodeURIComponent(slug)}`,
    { signal },
  );

  if (!response.ok) {
    throw new ApiRequestError(
      await getResponseErrorMessage(response, 'Blog request'),
      response.status,
    );
  }

  return parseBlogDetail(await response.json());
}

export async function fetchPublicBlogs(
  signal?: AbortSignal,
): Promise<PublicBlogsResponse> {
  const searchParams = new URLSearchParams({
    limit: '100',
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });
  const response = await fetch(
    `${getApiBaseUrl()}${BLOGS_PUBLIC_PATH}?${searchParams.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new ApiRequestError(
      await getResponseErrorMessage(response, 'Blogs request'),
      response.status,
    );
  }

  const parsedResponse = parsePublicBlogsResponse(await response.json());
  const enrichedData = await Promise.all(
    parsedResponse.data.map(async (blog) => {
      try {
        return await fetchBlogDetailBySlug(blog.slug, signal);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw error;
        }

        return blog;
      }
    }),
  );

  return {
    ...parsedResponse,
    data: enrichedData,
  };
}

export async function fetchPublicBlogBySlug(
  slug: string,
  signal?: AbortSignal,
): Promise<BlogDetail> {
  try {
    return await fetchBlogDetailBySlug(slug, signal);
  } catch (error) {
    if (!(error instanceof ApiRequestError) || error.status !== 404) {
      throw error;
    }
  }

  const blogs = await fetchPublicBlogs(signal);
  const matchingBlog = blogs.data.find((blog) =>
    blog.translations?.some((translation) => translation.slug === slug),
  );

  if (!matchingBlog) {
    throw new ApiRequestError('Blog not found', 404);
  }

  return fetchBlogDetailBySlug(matchingBlog.slug, signal);
}
