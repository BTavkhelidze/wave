import { type FormEvent, useEffect, useState } from 'react';
import {
  MESSAGE_STATUSES,
  getMessageStatusLabel,
} from '../model/message.constants';
import type {
  ContactMessagesQueryParams,
  MessageSortOrder,
  MessageStatus,
} from '../model/message.types';

type MessagesFiltersProps = {
  params: ContactMessagesQueryParams;
  totalMessages: number | undefined;
  onFilterChange: (
    key: keyof ContactMessagesQueryParams,
    value: string | number | undefined,
  ) => void;
  onResetFilters: () => void;
};

export function MessagesFilters({
  params,
  totalMessages,
  onFilterChange,
  onResetFilters,
}: MessagesFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(params.search ?? '');

  useEffect(() => {
    setSearchDraft(params.search ?? '');
  }, [params.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFilterChange('search', searchDraft);
  };

  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div className='mb-4'>
        <p className='text-sm font-semibold text-[#111827]'>
          {totalMessages === undefined
            ? 'Contact messages'
            : `${totalMessages} contact message${totalMessages === 1 ? '' : 's'}`}
        </p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Review public contact form submissions and update their status.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className='grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto]'
      >
        <label className='flex min-w-0 flex-col gap-2 text-sm font-medium text-[#111827]'>
          Search
          <div className='flex gap-2'>
            <input
              type='search'
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder='Name, email, subject, or message'
              className='min-w-0 flex-1 rounded-md border border-[#D1D5DB] px-3 py-2 text-sm font-normal text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            />
            <button
              type='submit'
              className='rounded-md bg-[#111827] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#374151] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
            >
              Apply
            </button>
          </div>
        </label>

        <SelectField
          label='Status'
          value={params.status ?? ''}
          onChange={(value) =>
            onFilterChange('status', value as MessageStatus | '')
          }
        >
          <option value=''>All active</option>
          {MESSAGE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getMessageStatusLabel(status)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label='Order'
          value={params.sortOrder ?? 'desc'}
          onChange={(value) =>
            onFilterChange('sortOrder', value as MessageSortOrder)
          }
        >
          <option value='desc'>Newest first</option>
          <option value='asc'>Oldest first</option>
        </SelectField>

        <div className='flex items-end'>
          <button
            type='button'
            onClick={onResetFilters}
            className='w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
};

function SelectField({ label, value, onChange, children }: SelectFieldProps) {
  return (
    <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
      >
        {children}
      </select>
    </label>
  );
}
