'use client';

import React from 'react';
import { motion } from 'framer-motion';

function BlogsLanding() {
  return (
    <section className='w-full max-w-[1440px] mx-auto my-16 px-6  xl:px-0 2xl:mx-auto xl:pb-10 '>
      <h2 className='text-white text-center sm:text-start'>Blogs</h2>

      <ul className='flex gap-4 mt-4 flex-col sm:flex-row   xl:flex-nowrap  flex-wrap justify-center sm:justify-start'>
        <li className='flex items-center justify-center'>
          <motion.div
            onClick={() =>
              (window.location.href = '/blogs/engineering-planning')
            }
            className='relative w-full sm:w-[230px] h-[180px] text-white text-center text0 cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'
            whileHover={{
              scale: [null, 1.04],
              transition: {
                duration: 0.5,
                times: [0, 0.6],
                ease: ['easeInOut', 'easeOut'],
              },
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            <div className='w-full h-full flex items-center bg-[#18181B] text-center text-white bottom-0  text-sm font-medium'>
              საინჟინრო სივრცეების წინასწარი დაგეგმვის მნიშვნელობა
            </div>
            {/* საინჟინრო სივრცეების წინასწარი დაგეგმვის მნიშვნელობა
            <div className='absolute w-full h-[55px] flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 text-sm font-medium'>
              look
            </div> */}
          </motion.div>
        </li>
      </ul>
      {/* 
      <Link
        href={'/aboutUs'}
        className='text-white mt-6 text-sm flex gap-2 cursor-pointer items-center justify-center sm:justify-start '
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        find more
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChevronRight />
        </motion.span>
      </Link> */}
    </section>
  );
}

export default BlogsLanding;
