import {
  BLOG_LANGUAGES,
  getBlogLanguageLabel,
} from '../model/blog.constants';
import type {
  BlogLanguage,
  BlogSortBy,
  BlogSortOrder,
} from '../model/blog.types';

type PublicBlogsToolbarProps = {
  search: string;
  language: BlogLanguage | undefined;
  isFeatured: boolean;
  sortBy: BlogSortBy;
  sortOrder: BlogSortOrder;
  totalBlogs: number | undefined;
  onSearchChange: (search: string) => void;
  onLanguageChange: (language: string) => void;
  onFeaturedChange: (isFeatured: boolean) => void;
  onSortByChange: (sortBy: BlogSortBy) => void;
  onSortOrderChange: (sortOrder: BlogSortOrder) => void;
};

export function PublicBlogsToolbar({
  search,
  language,
  isFeatured,
  sortBy,
  sortOrder,
  totalBlogs,
  onSearchChange,
  onLanguageChange,
  onFeaturedChange,
  onSortByChange,
  onSortOrderChange,
}: PublicBlogsToolbarProps) {
  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-sm font-semibold text-[#111827]'>
            {totalBlogs === undefined
              ? 'Published blogs'
              : `${totalBlogs} published blog${totalBlogs === 1 ? '' : 's'}`}
          </p>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            Browse live articles from the public blog API.
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_160px_150px_130px]'>
          <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
            Search
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder='Search posts'
              className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            />
          </label>

          <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
            Language
            <select
              value={language ?? ''}
              onChange={(event) => onLanguageChange(event.target.value)}
              className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            >
              <option value=''>All languages</option>
              {BLOG_LANGUAGES.map((blogLanguage) => (
                <option key={blogLanguage} value={blogLanguage}>
                  {getBlogLanguageLabel(blogLanguage)}
                </option>
              ))}
            </select>
          </label>

          <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
            Sort
            <select
              value={sortBy}
              onChange={(event) =>
                onSortByChange(event.target.value as BlogSortBy)
              }
              className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            >
              <option value='publishedAt'>Published</option>
              <option value='createdAt'>Created</option>
            </select>
          </label>

          <label className='flex flex-col gap-2 text-sm font-medium text-[#111827]'>
            Order
            <select
              value={sortOrder}
              onChange={(event) =>
                onSortOrderChange(event.target.value as BlogSortOrder)
              }
              className='rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm font-normal text-[#111827] outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20'
            >
              <option value='desc'>Newest</option>
              <option value='asc'>Oldest</option>
            </select>
          </label>
        </div>
      </div>

      <label className='mt-4 flex w-fit items-center gap-2 text-sm font-medium text-[#111827]'>
        <input
          type='checkbox'
          checked={isFeatured}
          onChange={(event) => onFeaturedChange(event.target.checked)}
          className='h-4 w-4 rounded border-[#D1D5DB] text-[#7C3AED] focus:ring-[#7C3AED]/30'
        />
        Featured only
      </label>
    </div>
  );
}
