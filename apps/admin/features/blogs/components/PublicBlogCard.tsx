import { Link } from 'react-router-dom';
import type { BlogListItem } from '../model/blog.types';

type PublicBlogCardProps = {
  blog: BlogListItem;
};

export function PublicBlogCard({ blog }: PublicBlogCardProps) {
  return (
    <article className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
      <Link
        to={`/public/blogs/${blog.slug}`}
        className='block focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
      >
        <div className='aspect-[16/10] overflow-hidden bg-[#F3F4F6]'>
          <img
            src={blog.coverImageUrl}
            alt=''
            className='h-full w-full object-cover'
            loading='lazy'
          />
        </div>
        <div className='space-y-3 p-5'>
          <div className='flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
            <span>{blog.language}</span>
            {blog.isFeatured && (
              <span className='rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[#6D28D9]'>
                Featured
              </span>
            )}
          </div>
          <div>
            <h3 className='line-clamp-2 text-lg font-semibold leading-7 text-[#111827]'>
              {blog.title}
            </h3>
            <p className='mt-2 line-clamp-3 text-sm leading-6 text-[#6B7280]'>
              {blog.excerpt}
            </p>
          </div>
          <p className='text-xs font-medium text-[#6B7280]'>
            {formatBlogDate(blog.publishedAt ?? blog.createdAt)}
          </p>
        </div>
      </Link>
    </article>
  );
}

function formatBlogDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
