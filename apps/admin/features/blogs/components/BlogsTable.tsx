import { Link } from 'react-router-dom';

import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { BlogStatusBadge } from './BlogStatusBadge';
import type { BlogListItem } from '../model/blog.types';

type BlogsTableProps = {
  blogs: BlogListItem[];
};

export function BlogsTable({ blogs }: BlogsTableProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='min-w-full text-left'>
          <thead className='bg-[#F8FAFC]'>
            <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              <th scope='col' className='px-5 py-3'>
                Blog
              </th>
              <th scope='col' className='px-5 py-3'>
                Status
              </th>
              <th scope='col' className='px-5 py-3'>
                Language
              </th>
              <th scope='col' className='px-5 py-3'>
                Featured
              </th>
              <th scope='col' className='px-5 py-3'>
                Views
              </th>
              <th scope='col' className='px-5 py-3'>
                Published
              </th>
              <th scope='col' className='px-5 py-3'>
                Updated
              </th>
              <th scope='col' className='px-5 py-3'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr
                key={blog.id}
                className='border-b border-[#E5E7EB] last:border-b-0'
              >
                <td className='min-w-[320px] px-5 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-14 w-20 shrink-0 overflow-hidden rounded-md border border-[#E5E7EB] bg-[#F3F4F6]'>
                      <img
                        src={blog.coverImageUrl}
                        alt=''
                        className='h-full w-full object-cover'
                        loading='lazy'
                      />
                    </div>
                    <div className='min-w-0'>
                      <p className='line-clamp-1 text-sm font-semibold text-[#111827]'>
                        {blog.title}
                      </p>
                      <p className='mt-1 line-clamp-1 font-mono text-xs text-[#6B7280]'>
                        {blog.slug}
                      </p>
                      <p className='mt-1 line-clamp-1 text-xs text-[#6B7280]'>
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <BlogStatusBadge status={blog.status} />
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm font-medium text-[#111827]'>
                  {blog.language}
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
                  {blog.isFeatured ? 'Yes' : 'No'}
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#111827]'>
                  {formatNumber(blog.viewCount)}
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
                  {blog.publishedAt ? formatDate(blog.publishedAt) : 'Not set'}
                </td>
                <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
                  {formatDate(blog.updatedAt)}
                </td>
                <td className='whitespace-nowrap px-5 py-4'>
                  <Link
                    to={`${ADMIN_ROUTE_PATHS.blogs}/${blog.id}`}
                    className='rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en').format(value);
}
