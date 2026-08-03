import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { useAdminBlogsQuery } from '../api/blogs.queries';
import {
  getAdminBlogsParamsFromSearch,
  setAdminBlogsSearchParam,
} from '../model/adminBlogsSearchParams';
import type { AdminBlogsQueryParams } from '../model/blog.types';
import { BlogsFilters } from './BlogsFilters';
import { BlogsPagination } from './BlogsPagination';
import { BlogsStateCard } from './BlogsStateCard';
import { BlogsTable } from './BlogsTable';

export function BlogsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => getAdminBlogsParamsFromSearch(searchParams),
    [searchParams],
  );
  const blogsQuery = useAdminBlogsQuery(params);

  const handleFilterChange = (
    key: keyof AdminBlogsQueryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams(
      setAdminBlogsSearchParam(
        searchParams,
        key,
        value === undefined ? '' : String(value),
      ),
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const filters = (
    <BlogsFilters
      params={params}
      totalBlogs={blogsQuery.data?.pagination.totalItems}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
    />
  );

  if (
    blogsQuery.isError &&
    isApiRequestError(blogsQuery.error) &&
    blogsQuery.error.status === 403
  ) {
    return (
      <BlogsStateCard
        tone='warning'
        title='Access denied'
        message='You do not have permission to view blogs.'
      />
    );
  }

  if (blogsQuery.isLoading) {
    return (
      <div className='space-y-4'>
        {filters}
        <BlogsStateCard
          tone='neutral'
          title='Loading blogs'
          message='Fetching draft and published posts.'
        />
      </div>
    );
  }

  if (blogsQuery.isError) {
    return (
      <div className='space-y-4'>
        {filters}
        <BlogsStateCard
          tone='error'
          title='Could not load blogs'
          message='The blogs request failed.'
          actionLabel='Try again'
          onAction={() => void blogsQuery.refetch()}
        />
      </div>
    );
  }

  const blogs = blogsQuery.data?.data ?? [];
  const pagination = blogsQuery.data?.pagination;

  return (
    <div className='space-y-4'>
      {filters}

      {blogs.length > 0 ? (
        <BlogsTable blogs={blogs} />
      ) : (
        <BlogsStateCard
          tone='neutral'
          title='No blogs found'
          message='Create a blog or adjust the selected filters.'
        />
      )}

      {pagination && (
        <BlogsPagination
          pagination={pagination}
          onPageChange={(page) => handleFilterChange('page', page)}
        />
      )}
    </div>
  );
}
