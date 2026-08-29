import { useMemo, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { usePublicBlogBySlugQuery } from '../api/blogs.queries';
import { PublicBlogStateCard } from '../components/PublicBlogStateCard';
import { sanitizeBlogContentHtml } from '../model/blogHtml';

export function PublicBlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to='/public/blogs' replace />;
  }

  return <PublicBlogDetailContent slug={slug} />;
}

type PublicBlogDetailContentProps = {
  slug: string;
};

function PublicBlogDetailContent({ slug }: PublicBlogDetailContentProps) {
  const blogQuery = usePublicBlogBySlugQuery(slug);
  const sanitizedContent = useMemo(
    () => sanitizeBlogContentHtml(blogQuery.data?.content ?? ''),
    [blogQuery.data?.content],
  );

  if (blogQuery.isLoading) {
    return (
      <PublicBlogDetailShell>
        <PublicBlogStateCard
          tone='neutral'
          title='Loading blog'
          message='Fetching the selected published post.'
        />
      </PublicBlogDetailShell>
    );
  }

  if (blogQuery.isError) {
    const message =
      isApiRequestError(blogQuery.error) && blogQuery.error.status === 404
        ? 'This blog post is not published or does not exist.'
        : 'The blog detail request failed.';

    return (
      <PublicBlogDetailShell>
        <PublicBlogStateCard
          tone='error'
          title='Could not load blog'
          message={message}
          actionLabel='Try again'
          onAction={() => void blogQuery.refetch()}
        />
      </PublicBlogDetailShell>
    );
  }

  const blog = blogQuery.data;

  if (!blog) {
    return null;
  }

  return (
    <PublicBlogDetailShell>
      <article className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
        <div className='aspect-[16/7] bg-[#F3F4F6]'>
          <img
            src={blog.coverImageUrl}
            alt=''
            className='h-full w-full object-cover'
          />
        </div>
        <div className='px-5 py-6 sm:px-8 sm:py-8'>
          <div className='flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
            <span>{blog.language}</span>
            {blog.isFeatured && (
              <span className='rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[#6D28D9]'>
                Featured
              </span>
            )}
            <span>{formatBlogDate(blog.publishedAt ?? blog.createdAt)}</span>
          </div>
          <h1 className='mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl'>
            {blog.title}
          </h1>
          <p className='mt-4 max-w-3xl text-base leading-7 text-[#6B7280]'>
            {blog.excerpt}
          </p>
          <div
            className='public-blog-content mt-8'
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </article>
    </PublicBlogDetailShell>
  );
}

type PublicBlogDetailShellProps = {
  children: ReactNode;
};

function PublicBlogDetailShell({ children }: PublicBlogDetailShellProps) {
  return (
    <main className='min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#111827] sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <Link
          to='/public/blogs'
          className='inline-flex rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-sm font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          Back to blogs
        </Link>
        {children}
      </div>
    </main>
  );
}

function formatBlogDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}
