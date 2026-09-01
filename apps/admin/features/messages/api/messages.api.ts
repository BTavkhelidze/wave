import {
  apiRequest,
  apiRequestNoContent,
} from "../../../src/shared/api/httpClient";
import type {
  ContactMessage,
  ContactMessagesQueryParams,
  ContactMessagesResponse,
  ContactMessagesUnreadCountResponse,
  UpdateContactMessageStatusPayload,
} from "../model/message.types";

export function getContactMessages(
  params: ContactMessagesQueryParams,
  signal?: AbortSignal,
): Promise<ContactMessagesResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, "page", params.page);
  appendParam(searchParams, "limit", params.limit);
  appendParam(searchParams, "status", params.status);
  appendParam(searchParams, "search", params.search);
  appendParam(searchParams, "sortOrder", params.sortOrder);

  const queryString = searchParams.toString();

  return apiRequest<ContactMessagesResponse>(
    `/contact-messages/admin${queryString ? `?${queryString}` : ""}`,
    { signal },
  );
}

export function getContactMessageById(
  messageId: string,
  signal?: AbortSignal,
): Promise<ContactMessage> {
  return apiRequest<ContactMessage>(
    `/contact-messages/admin/${encodeURIComponent(messageId)}`,
    { signal },
  );
}

export function getUnreadContactMessagesCount(
  signal?: AbortSignal,
): Promise<ContactMessagesUnreadCountResponse> {
  return apiRequest<ContactMessagesUnreadCountResponse>(
    "/contact-messages/admin/unread-count",
    { signal },
  );
}

export function updateContactMessageStatus(
  messageId: string,
  payload: UpdateContactMessageStatusPayload,
): Promise<ContactMessage> {
  return apiRequest<ContactMessage>(
    `/contact-messages/admin/${encodeURIComponent(messageId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteContactMessage(messageId: string): Promise<void> {
  return apiRequestNoContent(
    `/contact-messages/${encodeURIComponent(messageId)}`,
    {
      method: "DELETE",
    },
  );
}

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== "") {
    searchParams.set(key, String(value));
  }
}
