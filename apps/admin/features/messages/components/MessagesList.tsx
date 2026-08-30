import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isApiRequestError } from "../../../src/shared/api/httpClient";
import {
  CONTENT_MANAGER_ROLES,
  canAccessRole,
} from "../../auth/lib/authorization";
import { useAuth } from "../../context/AuthContext";
import {
  useDeleteContactMessageMutation,
  useContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
} from "../api/messages.queries";
import {
  getMessagesParamsFromSearch,
  setMessagesSearchParam,
} from "../model/messagesSearchParams";
import type {
  ContactMessage,
  ContactMessagesQueryParams,
  MessageStatus,
} from "../model/message.types";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { MessageDetailsDialog } from "./MessageDetailsDialog";
import { MessagesFilters } from "./MessagesFilters";
import { MessagesLoadingSkeleton } from "./MessagesLoadingSkeleton";
import { MessagesPagination } from "./MessagesPagination";
import { MessagesStateCard } from "./MessagesStateCard";
import { MessagesTable } from "./MessagesTable";

export function MessagesList() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const processedAutoReadMessageIdRef = useRef<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const canUpdateStatus = canAccessRole(user?.role, CONTENT_MANAGER_ROLES);
  const params = useMemo(
    () => getMessagesParamsFromSearch(searchParams),
    [searchParams],
  );
  const messagesQuery = useContactMessagesQuery(params);
  const updateStatusMutation = useUpdateContactMessageStatusMutation();
  const deleteMessageMutation = useDeleteContactMessageMutation();

  const handleFilterChange = (
    key: keyof ContactMessagesQueryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams(
      setMessagesSearchParam(
        searchParams,
        key,
        value === undefined ? "" : String(value),
      ),
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleOpenMessage = (messageId: string, status: MessageStatus) => {
    if (
      selectedMessageId !== messageId &&
      processedAutoReadMessageIdRef.current !== messageId
    ) {
      processedAutoReadMessageIdRef.current = null;
    }

    setSelectedMessageId(messageId);

    if (
      !canUpdateStatus ||
      status !== "UNREAD" ||
      processedAutoReadMessageIdRef.current === messageId
    ) {
      return;
    }

    processedAutoReadMessageIdRef.current = messageId;
    updateStatusMutation.mutate({ messageId, status: "READ" });
  };

  const handleCloseMessage = () => {
    processedAutoReadMessageIdRef.current = null;
    setSelectedMessageId(null);
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setSuccessMessage(null);
    deleteMessageMutation.reset();
    setMessageToDelete(message);
  };

  const handleCancelDelete = () => {
    if (deleteMessageMutation.isPending) {
      return;
    }

    setMessageToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete || deleteMessageMutation.isPending) {
      return;
    }

    const deletedMessageId = messageToDelete.id;

    try {
      await deleteMessageMutation.mutateAsync({
        messageId: deletedMessageId,
      });
      setMessageToDelete(null);
      setSuccessMessage("Message deleted.");

      if (selectedMessageId === deletedMessageId) {
        handleCloseMessage();
      }
    } catch {
      // The dialog stays open and shows a safe error message.
    }
  };

  const filters = (
    <MessagesFilters
      params={params}
      totalMessages={messagesQuery.data?.meta.total}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
    />
  );

  if (
    messagesQuery.isError &&
    isApiRequestError(messagesQuery.error) &&
    messagesQuery.error.status === 403
  ) {
    return (
      <MessagesStateCard
        tone="warning"
        title="Access denied"
        message="You do not have permission to view contact messages."
      />
    );
  }

  if (messagesQuery.isLoading) {
    return (
      <div className="space-y-4">
        {filters}
        <MessagesLoadingSkeleton />
      </div>
    );
  }

  if (messagesQuery.isError) {
    return (
      <div className="space-y-4">
        {filters}
        <MessagesStateCard
          tone="error"
          title="Could not load messages"
          message="The contact messages request failed."
          actionLabel="Try again"
          onAction={() => void messagesQuery.refetch()}
        />
      </div>
    );
  }

  const messages = messagesQuery.data?.data ?? [];
  const meta = messagesQuery.data?.meta;

  return (
    <div className="space-y-4">
      {filters}

      {successMessage && (
        <MessagesStateCard
          tone="success"
          title="Message deleted"
          message={successMessage}
        />
      )}

      {messages.length > 0 ? (
        <MessagesTable
          messages={messages}
          canDeleteMessages={canUpdateStatus}
          deletingMessageId={
            deleteMessageMutation.isPending
              ? (deleteMessageMutation.variables?.messageId ?? null)
              : null
          }
          onOpenMessage={handleOpenMessage}
          onDeleteMessage={handleDeleteMessage}
        />
      ) : (
        <MessagesStateCard
          tone="neutral"
          title="No messages found"
          message="New public contact form submissions will appear here."
        />
      )}

      {meta && (
        <MessagesPagination
          meta={meta}
          onPageChange={(page) => handleFilterChange("page", page)}
        />
      )}

      <MessageDetailsDialog
        messageId={selectedMessageId}
        onClose={handleCloseMessage}
        onDeleteMessage={handleDeleteMessage}
        deletingMessageId={
          deleteMessageMutation.isPending
            ? (deleteMessageMutation.variables?.messageId ?? null)
            : null
        }
      />

      {messageToDelete && (
        <DeleteMessageDialog
          message={messageToDelete}
          isDeleting={deleteMessageMutation.isPending}
          errorMessage={
            deleteMessageMutation.isError
              ? "Could not delete message. Please try again."
              : null
          }
          onCancel={handleCancelDelete}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>
  );
}
