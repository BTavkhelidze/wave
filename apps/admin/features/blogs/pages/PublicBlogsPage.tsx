import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { usePublicBlogsQuery } from '../api/blogs.queries';
import { PublicBlogCard } from '../components/PublicBlogCard';
import { PublicBlogStateCard } from '../components/PublicBlogStateCard';
import { PublicBlogsPagination } from '../components/PublicBlogsPagination';
import { PublicBlogsToolbar } from '../components/PublicBlogsToolbar';
import {
  getPublicBlogsParamsFromSearch,
  setPublicBlogsSearchParam,
} from '../model/blogSearchParams';
import type { BlogSortBy, BlogSortOrder } from '../model/blog.types';

export function PublicBlogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => getPublicBlogsParamsFromSearch(searchParams),
    [searchParams],
  );
  const publicBlogsQuery = usePublicBlogsQuery(params);

  const updateSearchParam = (
    key: 'page' | 'search' | 'language' | 'isFeatured' | 'sortBy' | 'sortOrder',
    value: string,
  ) => {
    setSearchParams(setPublicBlogsSearchParam(searchParams, key, value));
  };

  const toolbar = (
    <PublicBlogsToolbar
      search={params.search ?? ''}
      language={params.language}
      isFeatured={params.isFeatured ?? false}
      sortBy={params.sortBy ?? 'publishedAt'}
      sortOrder={params.sortOrder ?? 'desc'}
      totalBlogs={publicBlogsQuery.data?.pagination.totalItems}
      onSearchChange={(search) => updateSearchParam('search', search)}
      onLanguageChange={(language) => updateSearchParam('language', language)}
      onFeaturedChange={(isFeatured) =>
        updateSearchParam('isFeatured', isFeatured ? 'true' : '')
      }
      onSortByChange={(sortBy: BlogSortBy) =>
        updateSearchParam('sortBy', sortBy)
      }
      onSortOrderChange={(sortOrder: BlogSortOrder) =>
        updateSearchParam('sortOrder', sortOrder)
      }
    />
  );

  if (publicBlogsQuery.isLoading) {
    return (
      <PublicBlogsShell>
        {toolbar}
        <PublicBlogStateCard
          tone='neutral'
          title='Loading blogs'
          message='Fetching published blog posts.'
        />
      </PublicBlogsShell>
    );
  }

  if (publicBlogsQuery.isError) {
    const message =
      isApiRequestError(publicBlogsQuery.error) &&
      publicBlogsQuery.error.status === 404
        ? 'No matching blog endpoint was found.'
        : 'The blog request failed.';

    return (
      <PublicBlogsShell>
        {toolbar}
        <PublicBlogStateCard
          tone='error'
          title='Could not load blogs'
          message={message}
          actionLabel='Try again'
          onAction={() => void publicBlogsQuery.refetch()}
        />
      </PublicBlogsShell>
    );
  }

  const blogs = publicBlogsQuery.data?.data ?? [];
  const pagination = publicBlogsQuery.data?.pagination;

  return (
    <PublicBlogsShell>
      {toolbar}

      {blogs.length > 0 ? (
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {blogs.map((blog) => (
            <PublicBlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <PublicBlogStateCard
          tone='neutral'
          title='No published blogs found'
          message='Try adjusting the search, language, or featured filter.'
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <PublicBlogsPagination
          pagination={pagination}
          onPageChange={(page) => updateSearchParam('page', String(page))}
        />
      )}
    </PublicBlogsShell>
  );
}

type PublicBlogsShellProps = {
  children: ReactNode;
};

function PublicBlogsShell({ children }: PublicBlogsShellProps) {
  return (
    <main className='min-h-screen bg-[#F8FAFC] px-4 py-8 text-[#111827] sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl space-y-6'>
        <section>
          <p className='text-sm font-semibold uppercase tracking-wide text-[#7C3AED]'>
            Blog
          </p>
          <h1 className='mt-2 text-3xl font-semibold tracking-tight text-[#111827]'>
            Latest Published Articles
          </h1>
          <p className='mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]'>
            Read published posts served directly from the public Blog API.
          </p>
        </section>
        {children}
      </div>
    </main>
  );
}
