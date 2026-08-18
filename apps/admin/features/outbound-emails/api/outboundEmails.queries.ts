import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOutboundEmailById,
  getOutboundEmails,
  sendOutboundEmail,
} from './outboundEmails.api';
import type {
  OutboundEmailDetail,
  OutboundEmailsQueryParams,
} from '../model/outboundEmail.types';

export const outboundEmailsRootQueryKey = ['outbound-emails'] as const;

export const outboundEmailsQueryKey = (params: OutboundEmailsQueryParams) =>
  [...outboundEmailsRootQueryKey, 'list', params] as const;

export const outboundEmailDetailsRootQueryKey = [
  ...outboundEmailsRootQueryKey,
  'detail',
] as const;

export const outboundEmailDetailQueryKey = (emailId: string) =>
  [...outboundEmailDetailsRootQueryKey, emailId] as const;

export function useOutboundEmailsQuery(params: OutboundEmailsQueryParams) {
  return useQuery({
    queryKey: outboundEmailsQueryKey(params),
    queryFn: ({ signal }) => getOutboundEmails(params, signal),
    placeholderData: (previousData) => previousData,
  });
}

export function useOutboundEmailQuery(emailId: string | undefined) {
  return useQuery({
    queryKey: outboundEmailDetailQueryKey(emailId ?? ''),
    queryFn: ({ signal }) => getOutboundEmailById(emailId ?? '', signal),
    enabled: Boolean(emailId),
  });
}

export function useSendOutboundEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendOutboundEmail,
    onSuccess: async (response) => {
      queryClient.setQueryData<OutboundEmailDetail | undefined>(
        outboundEmailDetailQueryKey(response.data.id),
        undefined,
      );

      await queryClient.invalidateQueries({
        queryKey: outboundEmailsRootQueryKey,
      });
    },
  });
}
