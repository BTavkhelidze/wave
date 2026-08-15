import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getContactMessageById,
  getContactMessages,
  getUnreadContactMessagesCount,
  updateContactMessageStatus,
} from './messages.api';
import type {
  ContactMessage,
  ContactMessagesQueryParams,
  MessageStatus,
} from '../model/message.types';

export const contactMessagesRootQueryKey = ['contact-messages'] as const;

export const contactMessagesQueryKey = (
  params: ContactMessagesQueryParams,
) => [...contactMessagesRootQueryKey, 'list', params] as const;

export const contactMessageDetailQueryKey = (messageId: string) =>
  [...contactMessagesRootQueryKey, 'detail', messageId] as const;

export const unreadContactMessagesCountQueryKey = [
  ...contactMessagesRootQueryKey,
  'unread-count',
] as const;

export function useContactMessagesQuery(params: ContactMessagesQueryParams) {
  return useQuery({
    queryKey: contactMessagesQueryKey(params),
    queryFn: ({ signal }) => getContactMessages(params, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useContactMessageQuery(messageId: string | null) {
  return useQuery({
    queryKey: contactMessageDetailQueryKey(messageId ?? ''),
    queryFn: ({ signal }) => getContactMessageById(messageId ?? '', signal),
    enabled: Boolean(messageId),
  });
}

export function useUnreadContactMessagesCountQuery() {
  return useQuery({
    queryKey: unreadContactMessagesCountQueryKey,
    queryFn: ({ signal }) => getUnreadContactMessagesCount(signal),
  });
}

export function useUpdateContactMessageStatusMutation(messageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: MessageStatus) =>
      updateContactMessageStatus(messageId, { status }),
    onSuccess: async (message) => {
      queryClient.setQueryData<ContactMessage>(
        contactMessageDetailQueryKey(messageId),
        message,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: contactMessagesRootQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: unreadContactMessagesCountQueryKey,
        }),
      ]);
    },
  });
}
