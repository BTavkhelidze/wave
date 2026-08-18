import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  OutboundEmailDetail,
  OutboundEmailsQueryParams,
  OutboundEmailsResponse,
  SendOutboundEmailPayload,
  SendOutboundEmailResponse,
} from '../model/outboundEmail.types';

export function getOutboundEmails(
  params: OutboundEmailsQueryParams,
  signal?: AbortSignal,
): Promise<OutboundEmailsResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, 'page', params.page);
  appendParam(searchParams, 'limit', params.limit);
  appendParam(searchParams, 'status', params.status);
  appendParam(searchParams, 'search', params.search);
  appendParam(searchParams, 'sortOrder', params.sortOrder);

  const queryString = searchParams.toString();

  return apiRequest<OutboundEmailsResponse>(
    `/admin/emails${queryString ? `?${queryString}` : ''}`,
    { signal },
  );
}

export function getOutboundEmailById(
  emailId: string,
  signal?: AbortSignal,
): Promise<OutboundEmailDetail> {
  return apiRequest<OutboundEmailDetail>(
    `/admin/emails/${encodeURIComponent(emailId)}`,
    { signal },
  );
}

export function sendOutboundEmail(
  payload: SendOutboundEmailPayload,
): Promise<SendOutboundEmailResponse> {
  return apiRequest<SendOutboundEmailResponse>('/admin/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== '') {
    searchParams.set(key, String(value));
  }
}
