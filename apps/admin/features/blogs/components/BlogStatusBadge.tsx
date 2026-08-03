import { getBlogStatusLabel } from '../model/blog.constants';
import type { BlogStatus } from '../model/blog.types';

type BlogStatusBadgeProps = {
  status: BlogStatus;
};

export function BlogStatusBadge({ status }: BlogStatusBadgeProps) {
  const classNameByStatus: Record<BlogStatus, string> = {
    DRAFT: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
    PUBLISHED: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${classNameByStatus[status]}`}
    >
      {getBlogStatusLabel(status)}
    </span>
  );
}
