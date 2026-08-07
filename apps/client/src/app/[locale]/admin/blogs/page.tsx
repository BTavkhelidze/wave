import React from 'react';

function page() {
  return (
    <div className='relative max-w-[1280px] flex flex-col gap-10 pb-20 pt-20 text-white min-h-screen  w-full mx-2 xl:mx-auto'>
      <div className='flex gap-4'>
        <span className='bg-amber-300 text-black px-4 py-2 cursor-pointer'>
          Add Section
        </span>
        <span className='bg-amber-300 text-black px-4 py-2 cursor-pointer'>
          Add Image
        </span>
      </div>

      <label className='flex flex-col gap-2'>
        Title:
        <input
          type='text'
          placeholder='title'
          className='border-white border py-4 px-3'
        />
      </label>
      <label className='flex flex-col gap-2'>
        Section:
        <input
          type='text'
          placeholder='title'
          className='border-white border py-4 px-3'
        />
      </label>
      <div>save</div>
    </div>
  );
}

export default page;
