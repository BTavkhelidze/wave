'use client';

// 1. Import the hooks from Refine core
import { useTable, useGetIdentity, useNavigation } from '@refinedev/core';
// Assuming Shadcn

export default function AdminDashboard() {
  const { data: user } = useGetIdentity<{ name: string; email: string }>();

  const { tableQuery } = useTable({
    resource: 'services',
    pagination: {
      mode: 'off', // This disables the 10-item limit
    },
  });

  // 4. Access the Routing Context (To navigate)
  const { create } = useNavigation();
  console.log(tableQuery?.data?.data);

  const posts = tableQuery?.data?.data ?? [];
  if (tableQuery.isLoading) return <p>Loading your blogs...</p>;

  return (
    <div className='p-6 space-y-6 text-amber-50'>
      <header className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Welcome back, {user?.name}!</h1>
          <p className='text-gray-500'>Managing: {user?.email}</p>
        </div>
        <button
          onClick={() => create('admin/posts')}
          className='cursor-pointer'
        >
          + Create New Blog
        </button>
      </header>

      <section className='bg-amber-700 border rounded-lg p-4'>
        <h2 className='text-lg font-semibold mb-4 text-black'>Recent Posts</h2>
        {posts.length < 1 ? (
          <p>no posts yet</p>
        ) : (
          <div className='space-y-2'>
            {posts.map((post) => (
              <div
                key={post.id}
                className='p-3 border rounded flex justify-between'
              >
                <span>{post.title_en ? post.title_en : post.title_ka}</span>
                <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
