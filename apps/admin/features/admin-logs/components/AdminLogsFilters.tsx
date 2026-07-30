import { FormEvent, useEffect, useState } from 'react';
import {
  ADMIN_LOG_ACTIONS,
  ADMIN_LOG_ENTITIES,
  getAdminLogActionLabel,
  getAdminLogEntityLabel,
} from '../model/adminLogs.constants';
import type { AdminLogsQueryParams } from '../model/adminLogs.types';

type AdminLogsFiltersProps = {
  params: AdminLogsQueryParams;
  onFilterChange: (
    key: keyof AdminLogsQueryParams,
    value: string | number | undefined,
  ) => void;
  onResetFilters: () => void;
};

export function AdminLogsFilters({
  params,
  onFilterChange,
  onResetFilters,
}: AdminLogsFiltersProps) {
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
      <form
        onSubmit={handleSearchSubmit}
        className='grid gap-4 xl:grid-cols-[minmax(220px,1.4fr)_repeat(5,minmax(140px,1fr))_auto]'
      >
        <label className='flex min-w-0 flex-col gap-2 text-sm font-medium text-[#111827]'>
          Search
          <div className='flex gap-2'>
            <input
              type='search'
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder='Email, log ID, user ID'
              className='min-w-0 flex-1 rounded-md border border-[#D1D5DB] px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
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
          label='Action'
          value={params.action ?? ''}
          onChange={(value) => onFilterChange('action', value)}
        >
          <option value=''>All actions</option>
          {ADMIN_LOG_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {getAdminLogActionLabel(action)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label='Entity'
          value={params.entity ?? ''}
          onChange={(value) => onFilterChange('entity', value)}
        >
          <option value=''>All entities</option>
          {ADMIN_LOG_ENTITIES.map((entity) => (
            <option key={entity} value={entity}>
              {getAdminLogEntityLabel(entity)}
            </option>
          ))}
        </SelectField>

        <InputField
          label='From'
          type='date'
          value={params.dateFrom ?? ''}
          onChange={(value) => onFilterChange('dateFrom', value)}
        />

        <InputField
          label='To'
          type='date'
          value={params.dateTo ?? ''}
          onChange={(value) => onFilterChange('dateTo', value)}
        />

        <SelectField
          label='Sort'
          value={params.sortOrder ?? 'desc'}
          onChange={(value) => onFilterChange('sortOrder', value)}
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

type InputFieldProps = {
  label: string;
  type: 'date';
  value: string;
  onChange: (value: string) => void;
};

function InputField({ label, type, value, onChange }: InputFieldProps) {
  return (
    <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='rounded-md border border-[#D1D5DB] px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
      />
    </label>
  );
}
