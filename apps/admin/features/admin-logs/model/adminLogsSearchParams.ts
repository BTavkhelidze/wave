import {
  ADMIN_LOG_ACTIONS,
  ADMIN_LOG_ENTITIES,
  DEFAULT_ADMIN_LOGS_LIMIT,
  DEFAULT_ADMIN_LOGS_PAGE,
  DEFAULT_ADMIN_LOGS_SORT_ORDER,
} from './adminLogs.constants';
import type {
  AdminAction,
  AdminEntity,
  AdminLogsQueryParams,
  AdminLogSortOrder,
} from './adminLogs.types';

const SORT_ORDERS: readonly AdminLogSortOrder[] = ['asc', 'desc'];

function parsePositiveInteger(
  value: string | null,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseAction(value: string | null): AdminAction | undefined {
  return ADMIN_LOG_ACTIONS.includes(value as AdminAction)
    ? (value as AdminAction)
    : undefined;
}

function parseEntity(value: string | null): AdminEntity | undefined {
  return ADMIN_LOG_ENTITIES.includes(value as AdminEntity)
    ? (value as AdminEntity)
    : undefined;
}

function parseSortOrder(value: string | null): AdminLogSortOrder {
  return SORT_ORDERS.includes(value as AdminLogSortOrder)
    ? (value as AdminLogSortOrder)
    : DEFAULT_ADMIN_LOGS_SORT_ORDER;
}

function getTrimmedParam(
  searchParams: URLSearchParams,
  key: keyof AdminLogsQueryParams,
): string | undefined {
  const value = searchParams.get(key);
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function getAdminLogsParamsFromSearch(
  searchParams: URLSearchParams,
): Required<Pick<AdminLogsQueryParams, 'page' | 'limit' | 'sortOrder'>> &
  Omit<AdminLogsQueryParams, 'page' | 'limit' | 'sortOrder'> {
  return {
    page: parsePositiveInteger(
      searchParams.get('page'),
      DEFAULT_ADMIN_LOGS_PAGE,
    ),
    limit: parsePositiveInteger(
      searchParams.get('limit'),
      DEFAULT_ADMIN_LOGS_LIMIT,
    ),
    userId: getTrimmedParam(searchParams, 'userId'),
    action: parseAction(searchParams.get('action')),
    entity: parseEntity(searchParams.get('entity')),
    dateFrom: getTrimmedParam(searchParams, 'dateFrom'),
    dateTo: getTrimmedParam(searchParams, 'dateTo'),
    search: getTrimmedParam(searchParams, 'search'),
    sortOrder: parseSortOrder(searchParams.get('sortOrder')),
  };
}

export function setAdminLogsSearchParam(
  currentParams: URLSearchParams,
  key: keyof AdminLogsQueryParams,
  value: string | number | undefined,
  resetPage = true,
): URLSearchParams {
  const nextParams = new URLSearchParams(currentParams);
  const normalizedValue = String(value ?? '').trim();

  if (normalizedValue) {
    nextParams.set(key, normalizedValue);
  } else {
    nextParams.delete(key);
  }

  if (resetPage) {
    nextParams.set('page', String(DEFAULT_ADMIN_LOGS_PAGE));
  }

  return nextParams;
}
