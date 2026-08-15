import BlogsList from '@/components/Blogs/BlogsList';
import CompanyName from '@/components/LandingPage/companyName';

function page() {
  return (
    <main className='relative flex-1   w-full  justify-center items-center  flex flex-col pt-0 md:pt-30    pb-[50px] xl:px-[8%]'>
      <div className='w-full' id='top'></div>
      <div className='w-full'>
        <CompanyName />
      </div>
      <div className='my-10 w-full'>
        <BlogsList />
      </div>
    </main>
  );
}

export default page;
