import type {
  AdminBlogsQueryParams,
  BlogLanguage,
  BlogSortBy,
  BlogSortOrder,
  BlogStatus,
} from './blog.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const isBlogLanguage = (value: string | null): value is BlogLanguage =>
  value === 'EN' || value === 'KA';

const isBlogStatus = (value: string | null): value is BlogStatus =>
  value === 'DRAFT' || value === 'PUBLISHED';

const isBlogSortBy = (value: string | null): value is BlogSortBy =>
  value === 'createdAt' || value === 'publishedAt';

const isBlogSortOrder = (value: string | null): value is BlogSortOrder =>
  value === 'asc' || value === 'desc';

export function getAdminBlogsParamsFromSearch(
  searchParams: URLSearchParams,
): AdminBlogsQueryParams {
  const page = Number(searchParams.get('page'));
  const search = searchParams.get('search')?.trim() ?? '';
  const language = searchParams.get('language');
  const status = searchParams.get('status');
  const isFeatured = searchParams.get('isFeatured');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    search: search || undefined,
    language: isBlogLanguage(language) ? language : undefined,
    status: isBlogStatus(status) ? status : undefined,
    isFeatured: isFeatured === 'true' ? true : undefined,
    sortBy: isBlogSortBy(sortBy) ? sortBy : 'createdAt',
    sortOrder: isBlogSortOrder(sortOrder) ? sortOrder : 'desc',
  };
}

export function setAdminBlogsSearchParam(
  searchParams: URLSearchParams,
  key:
    | 'page'
    | 'limit'
    | 'search'
    | 'language'
    | 'status'
    | 'isFeatured'
    | 'sortBy'
    | 'sortOrder',
  value: string,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams);

  if (!value) {
    nextSearchParams.delete(key);
  } else {
    nextSearchParams.set(key, value);
  }

  if (key !== 'page') {
    nextSearchParams.delete('page');
  }

  return nextSearchParams;
}
