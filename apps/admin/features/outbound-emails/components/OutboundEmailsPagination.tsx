import type { OutboundEmailsMeta } from '../model/outboundEmail.types';

type OutboundEmailsPaginationProps = {
  meta: OutboundEmailsMeta;
  onPageChange: (page: number) => void;
};

export function OutboundEmailsPagination({
  meta,
  onPageChange,
}: OutboundEmailsPaginationProps) {
  const firstItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const lastItem = Math.min(meta.page * meta.limit, meta.total);
  const hasPreviousPage = meta.page > 1;
  const hasNextPage = meta.page < meta.totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white px-5 py-4 text-sm text-[#6B7280] shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {firstItem}-{lastItem} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
          className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="min-w-24 text-center text-xs font-medium text-[#111827]">
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={!hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          className="rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
