import type { BlogsPagination as BlogsPaginationData } from '../model/blog.types';

type BlogsPaginationProps = {
  pagination: BlogsPaginationData;
  onPageChange: (page: number) => void;
};

export function BlogsPagination({
  pagination,
  onPageChange,
}: BlogsPaginationProps) {
  const firstItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  );
  const hasPreviousPage = pagination.page > 1;
  const hasNextPage = pagination.page < pagination.totalPages;

  return (
    <div className='flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 text-sm text-[#6B7280] shadow-sm sm:flex-row sm:items-center sm:justify-between'>
      <p>
        Showing {firstItem}-{lastItem} of {pagination.totalItems}
      </p>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className='rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Previous
        </button>
        <span className='min-w-24 text-center text-xs font-medium text-[#111827]'>
          Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
        </span>
        <button
          type='button'
          disabled={!hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className='rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
}
