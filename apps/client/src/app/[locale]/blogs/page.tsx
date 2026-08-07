import React from 'react';
import BlogsList from '../../../../fetures/Blogs/Blogs';

function page() {
  return (
    <section className='w-full min-h-[50vh] md:pt-30 flex-1 max-w-[1440px] mx-auto my-16 px-6  xl:px-0 2xl:mx-auto xl:pb-10 '>
      <h2 className='text-white text-center sm:text-start'>Blogs</h2>

      <BlogsList />
    </section>
  );
}

export default page;
