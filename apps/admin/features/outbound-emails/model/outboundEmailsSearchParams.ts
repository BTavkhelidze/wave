import type {
  OutboundEmailsQueryParams,
  OutboundEmailSortOrder,
  OutboundEmailStatus,
} from './outboundEmail.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const isOutboundEmailStatus = (
  value: string | null,
): value is OutboundEmailStatus =>
  value === 'PENDING' || value === 'SENT' || value === 'FAILED';

const isOutboundEmailSortOrder = (
  value: string | null,
): value is OutboundEmailSortOrder => value === 'asc' || value === 'desc';

export function getOutboundEmailsParamsFromSearch(
  searchParams: URLSearchParams,
): OutboundEmailsQueryParams {
  const page = Number(searchParams.get('page'));
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status');
  const sortOrder = searchParams.get('sortOrder');

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    search: search || undefined,
    status: isOutboundEmailStatus(status) ? status : undefined,
    sortOrder: isOutboundEmailSortOrder(sortOrder) ? sortOrder : 'desc',
  };
}

export function setOutboundEmailsSearchParam(
  searchParams: URLSearchParams,
  key: 'page' | 'limit' | 'search' | 'status' | 'sortOrder',
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
