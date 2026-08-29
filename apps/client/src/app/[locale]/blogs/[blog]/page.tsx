import SingleBlog from '@/components/Blogs/SingleBlog';

type BlogPageParams = {
  blog: string;
};

async function page({ params }: { params: Promise<BlogPageParams> }) {
  const { blog } = await params;

  return (
    <main className='text-white w-full overflow-hidden min-h-screen xl:px-[8%]'>
      <SingleBlog blog={blog} />
    </main>
  );
}

export default page;
