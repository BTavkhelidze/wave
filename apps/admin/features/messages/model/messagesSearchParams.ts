import type {
  ContactMessagesQueryParams,
  MessageSortOrder,
  MessageStatus,
} from './message.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const isMessageStatus = (value: string | null): value is MessageStatus =>
  value === 'UNREAD' || value === 'READ' || value === 'ARCHIVED';

const isMessageSortOrder = (
  value: string | null,
): value is MessageSortOrder => value === 'asc' || value === 'desc';

export function getMessagesParamsFromSearch(
  searchParams: URLSearchParams,
): ContactMessagesQueryParams {
  const page = Number(searchParams.get('page'));
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status');
  const sortOrder = searchParams.get('sortOrder');

  return {
    page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    search: search || undefined,
    status: isMessageStatus(status) ? status : undefined,
    sortOrder: isMessageSortOrder(sortOrder) ? sortOrder : 'desc',
  };
}

export function setMessagesSearchParam(
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
