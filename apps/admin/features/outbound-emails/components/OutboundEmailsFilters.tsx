import { type FormEvent, useEffect, useState } from 'react';
import {
  OUTBOUND_EMAIL_STATUSES,
  getOutboundEmailStatusLabel,
} from '../model/outboundEmail.constants';
import type {
  OutboundEmailsQueryParams,
  OutboundEmailSortOrder,
  OutboundEmailStatus,
} from '../model/outboundEmail.types';

type OutboundEmailsFiltersProps = {
  params: OutboundEmailsQueryParams;
  totalEmails: number | undefined;
  onFilterChange: (
    key: keyof OutboundEmailsQueryParams,
    value: string | number | undefined,
  ) => void;
  onResetFilters: () => void;
};

export function OutboundEmailsFilters({
  params,
  totalEmails,
  onFilterChange,
  onResetFilters,
}: OutboundEmailsFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(params.search ?? '');

  useEffect(() => {
    setSearchDraft(params.search ?? '');
  }, [params.search]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFilterChange('search', searchDraft);
  };

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[#111827]">
          {totalEmails === undefined
            ? 'Outbound emails'
            : `${totalEmails} outbound email${totalEmails === 1 ? '' : 's'}`}
        </p>
        <p className="mt-1 text-sm leading-6 text-[#6B7280]">
          Search business emails by recipient email or subject.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="grid gap-4 lg:grid-cols-[minmax(260px,1.4fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto]"
      >
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-[#111827]">
          Search
          <div className="flex gap-2">
            <input
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Recipient email or subject"
              className="min-w-0 flex-1 rounded-md border border-[#D1D5DB] px-3 py-2 text-sm font-normal text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
            />
            <button
              type="submit"
              className="rounded-md bg-[#111827] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#374151] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
            >
              Apply
            </button>
          </div>
        </label>

        <SelectField
          label="Status"
          value={params.status ?? ''}
          onChange={(value) =>
            onFilterChange('status', value as OutboundEmailStatus | '')
          }
        >
          <option value="">All</option>
          {OUTBOUND_EMAIL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getOutboundEmailStatusLabel(status)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Order"
          value={params.sortOrder ?? 'desc'}
          onChange={(value) =>
            onFilterChange('sortOrder', value as OutboundEmailSortOrder)
          }
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </SelectField>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
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
    <label className="flex flex-col gap-2 text-sm font-medium text-[#111827]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
      >
        {children}
      </select>
    </label>
  );
}
