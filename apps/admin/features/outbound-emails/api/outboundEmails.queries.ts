import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminLogsRootQueryKey } from "../../admin-logs/api/adminLogs.queries";
import {
  deleteOutboundEmail,
  getOutboundEmailById,
  getOutboundEmails,
  sendOutboundEmail,
} from "./outboundEmails.api";
import type {
  OutboundEmailDetail,
  OutboundEmailsQueryParams,
  OutboundEmailsResponse,
} from "../model/outboundEmail.types";

export const outboundEmailsRootQueryKey = ["outbound-emails"] as const;

export const outboundEmailsQueryKey = (params: OutboundEmailsQueryParams) =>
  [...outboundEmailsRootQueryKey, "list", params] as const;

export const outboundEmailDetailsRootQueryKey = [
  ...outboundEmailsRootQueryKey,
  "detail",
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
    queryKey: outboundEmailDetailQueryKey(emailId ?? ""),
    queryFn: ({ signal }) => getOutboundEmailById(emailId ?? "", signal),
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

export function useDeleteOutboundEmailMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: string) => deleteOutboundEmail(emailId),
    onMutate: async (emailId) => {
      await queryClient.cancelQueries({
        queryKey: outboundEmailsRootQueryKey,
      });

      const previousDetail = queryClient.getQueryData<OutboundEmailDetail>(
        outboundEmailDetailQueryKey(emailId),
      );
      const previousLists = queryClient.getQueriesData<OutboundEmailsResponse>({
        queryKey: outboundEmailsQueryRootKey,
      });

      removeOutboundEmailFromCache(queryClient, emailId);

      return {
        previousDetail,
        previousLists,
      };
    },
    onError: (_error, emailId, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData<OutboundEmailDetail>(
        outboundEmailDetailQueryKey(emailId),
        context.previousDetail,
      );

      context.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData<OutboundEmailsResponse>(queryKey, data);
      });
    },
    onSuccess: async (_response, emailId) => {
      queryClient.removeQueries({
        queryKey: outboundEmailDetailQueryKey(emailId),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: outboundEmailsRootQueryKey,
        }),
        queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey }),
      ]);
    },
  });
}

const outboundEmailsQueryRootKey = [
  ...outboundEmailsRootQueryKey,
  "list",
] as const;

function removeOutboundEmailFromCache(
  queryClient: QueryClient,
  emailId: string,
) {
  queryClient.removeQueries({
    queryKey: outboundEmailDetailQueryKey(emailId),
  });

  queryClient.setQueriesData<OutboundEmailsResponse>(
    { queryKey: outboundEmailsQueryRootKey },
    (response) => {
      if (!response) {
        return response;
      }

      return {
        ...response,
        data: response.data.filter((email) => email.id !== emailId),
        meta: {
          ...response.meta,
          total: Math.max(response.meta.total - 1, 0),
        },
      };
    },
  );
}
