import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getContactMessageById,
  getContactMessages,
  getUnreadContactMessagesCount,
  updateContactMessageStatus,
} from './messages.api';
import type {
  ContactMessage,
  ContactMessagesQueryParams,
  ContactMessagesResponse,
  ContactMessagesUnreadCountResponse,
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

export type UpdateContactMessageStatusVariables = {
  messageId: string;
  status: MessageStatus;
};

type UpdateContactMessageStatusMutationOptions = {
  onSuccessBeforeInvalidate?: (
    message: ContactMessage,
    variables: UpdateContactMessageStatusVariables,
  ) => void;
};

export function useUpdateContactMessageStatusMutation(
  options: UpdateContactMessageStatusMutationOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, status }: UpdateContactMessageStatusVariables) =>
      updateContactMessageStatus(messageId, { status }),
    onMutate: async ({ messageId, status }) => {
      await queryClient.cancelQueries({
        queryKey: contactMessagesRootQueryKey,
      });

      const previousDetail = queryClient.getQueryData<ContactMessage>(
        contactMessageDetailQueryKey(messageId),
      );
      const previousLists =
        queryClient.getQueriesData<ContactMessagesResponse>({
          queryKey: contactMessagesQueryRootKey,
        });
      const previousUnreadCount =
        queryClient.getQueryData<ContactMessagesUnreadCountResponse>(
          unreadContactMessagesCountQueryKey,
        );
      const previousStatus = getCachedMessageStatus(queryClient, messageId);

      updateContactMessageStatusCache(queryClient, {
        messageId,
        status,
        previousStatus,
      });

      return {
        previousDetail,
        previousLists,
        previousUnreadCount,
      };
    },
    onError: (_error, variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData<ContactMessage>(
        contactMessageDetailQueryKey(variables.messageId),
        context.previousDetail,
      );

      context.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData<ContactMessagesResponse>(queryKey, data);
      });

      queryClient.setQueryData<ContactMessagesUnreadCountResponse>(
        unreadContactMessagesCountQueryKey,
        context.previousUnreadCount,
      );
    },
    onSuccess: async (message, variables) => {
      updateContactMessageStatusCache(queryClient, {
        messageId: variables.messageId,
        status: message.status,
        message,
      });

      options.onSuccessBeforeInvalidate?.(message, variables);

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

const contactMessagesQueryRootKey = [
  ...contactMessagesRootQueryKey,
  'list',
] as const;

type UpdateContactMessageStatusCacheInput = {
  messageId: string;
  status: MessageStatus;
  message?: ContactMessage;
  previousStatus?: MessageStatus;
};

function updateContactMessageStatusCache(
  queryClient: QueryClient,
  {
    messageId,
    status,
    message,
    previousStatus,
  }: UpdateContactMessageStatusCacheInput,
) {
  queryClient.setQueryData<ContactMessage>(
    contactMessageDetailQueryKey(messageId),
    (currentMessage) =>
      updateCachedMessage(currentMessage, messageId, status, message),
  );

  queryClient.setQueriesData<ContactMessagesResponse>(
    { queryKey: contactMessagesQueryRootKey },
    (response) => {
      if (!response) {
        return response;
      }

      return {
        ...response,
        data: response.data.map((currentMessage) =>
          currentMessage.id === messageId
            ? message ?? { ...currentMessage, status }
            : currentMessage,
        ),
      };
    },
  );

  if (previousStatus) {
    updateUnreadCountCache(queryClient, previousStatus, status);
  }
}

function updateCachedMessage(
  currentMessage: ContactMessage | undefined,
  messageId: string,
  status: MessageStatus,
  message?: ContactMessage,
) {
  if (!currentMessage || currentMessage.id !== messageId) {
    return currentMessage;
  }

  return message ?? { ...currentMessage, status };
}

function getCachedMessageStatus(
  queryClient: QueryClient,
  messageId: string,
): MessageStatus | undefined {
  const detailStatus = queryClient.getQueryData<ContactMessage>(
    contactMessageDetailQueryKey(messageId),
  )?.status;

  if (detailStatus) {
    return detailStatus;
  }

  const messageListResults =
    queryClient.getQueriesData<ContactMessagesResponse>({
      queryKey: contactMessagesQueryRootKey,
    });

  for (const [, response] of messageListResults) {
    const message = response?.data.find(
      (currentMessage) => currentMessage.id === messageId,
    );

    if (message) {
      return message.status;
    }
  }

  return undefined;
}

function updateUnreadCountCache(
  queryClient: QueryClient,
  previousStatus: MessageStatus,
  nextStatus: MessageStatus,
) {
  if (previousStatus === nextStatus) {
    return;
  }

  const unreadDelta =
    nextStatus === 'UNREAD' ? 1 : previousStatus === 'UNREAD' ? -1 : 0;

  if (unreadDelta === 0) {
    return;
  }

  queryClient.setQueryData<ContactMessagesUnreadCountResponse>(
    unreadContactMessagesCountQueryKey,
    (response) => ({
      count: Math.max((response?.count ?? 0) + unreadDelta, 0),
    }),
  );
}
