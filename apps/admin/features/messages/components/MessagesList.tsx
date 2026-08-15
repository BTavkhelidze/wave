import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { useContactMessagesQuery } from '../api/messages.queries';
import {
  getMessagesParamsFromSearch,
  setMessagesSearchParam,
} from '../model/messagesSearchParams';
import type { ContactMessagesQueryParams } from '../model/message.types';
import { MessageDetailsDialog } from './MessageDetailsDialog';
import { MessagesFilters } from './MessagesFilters';
import { MessagesLoadingSkeleton } from './MessagesLoadingSkeleton';
import { MessagesPagination } from './MessagesPagination';
import { MessagesStateCard } from './MessagesStateCard';
import { MessagesTable } from './MessagesTable';

export function MessagesList() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => getMessagesParamsFromSearch(searchParams),
    [searchParams],
  );
  const messagesQuery = useContactMessagesQuery(params);

  const handleFilterChange = (
    key: keyof ContactMessagesQueryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams(
      setMessagesSearchParam(
        searchParams,
        key,
        value === undefined ? '' : String(value),
      ),
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
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
        tone='warning'
        title='Access denied'
        message='You do not have permission to view contact messages.'
      />
    );
  }

  if (messagesQuery.isLoading) {
    return (
      <div className='space-y-4'>
        {filters}
        <MessagesLoadingSkeleton />
      </div>
    );
  }

  if (messagesQuery.isError) {
    return (
      <div className='space-y-4'>
        {filters}
        <MessagesStateCard
          tone='error'
          title='Could not load messages'
          message='The contact messages request failed.'
          actionLabel='Try again'
          onAction={() => void messagesQuery.refetch()}
        />
      </div>
    );
  }

  const messages = messagesQuery.data?.data ?? [];
  const meta = messagesQuery.data?.meta;

  return (
    <div className='space-y-4'>
      {filters}

      {messages.length > 0 ? (
        <MessagesTable
          messages={messages}
          onOpenMessage={setSelectedMessageId}
        />
      ) : (
        <MessagesStateCard
          tone='neutral'
          title='No messages found'
          message='New public contact form submissions will appear here.'
        />
      )}

      {meta && (
        <MessagesPagination
          meta={meta}
          onPageChange={(page) => handleFilterChange('page', page)}
        />
      )}

      <MessageDetailsDialog
        messageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />
    </div>
  );
}
