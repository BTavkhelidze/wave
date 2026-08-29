import { type FormEvent, useEffect, useState } from 'react';
import {
  BLOG_LANGUAGES,
  BLOG_STATUSES,
  getBlogLanguageLabel,
  getBlogStatusLabel,
} from '../model/blog.constants';
import type {
  AdminBlogsQueryParams,
  BlogSortBy,
  BlogSortOrder,
} from '../model/blog.types';

type BlogsFiltersProps = {
  params: AdminBlogsQueryParams;
  totalBlogs: number | undefined;
  onFilterChange: (
    key: keyof AdminBlogsQueryParams,
    value: string | number | undefined,
  ) => void;
  onResetFilters: () => void;
};

export function BlogsFilters({
  params,
  totalBlogs,
  onFilterChange,
  onResetFilters,
}: BlogsFiltersProps) {
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
          {totalBlogs === undefined
            ? 'Blog posts'
            : `${totalBlogs} blog post${totalBlogs === 1 ? '' : 's'}`}
        </p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          Showing draft and published posts available to your admin role.
        </p>
      </div>

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
              placeholder='Title'
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
          label='Language'
          value={params.language ?? ''}
          onChange={(value) => onFilterChange('language', value)}
        >
          <option value=''>All languages</option>
          {BLOG_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {getBlogLanguageLabel(language)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label='Status'
          value={params.status ?? ''}
          onChange={(value) => onFilterChange('status', value)}
        >
          <option value=''>All statuses</option>
          {BLOG_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getBlogStatusLabel(status)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label='Featured'
          value={params.isFeatured ? 'true' : ''}
          onChange={(value) => onFilterChange('isFeatured', value)}
        >
          <option value=''>All posts</option>
          <option value='true'>Featured only</option>
        </SelectField>

        <SelectField
          label='Sort'
          value={params.sortBy ?? 'createdAt'}
          onChange={(value) => onFilterChange('sortBy', value as BlogSortBy)}
        >
          <option value='createdAt'>Created</option>
          <option value='publishedAt'>Published</option>
        </SelectField>

        <SelectField
          label='Order'
          value={params.sortOrder ?? 'desc'}
          onChange={(value) =>
            onFilterChange('sortOrder', value as BlogSortOrder)
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
