'use client';
import React from 'react';
import { motion } from 'framer-motion';

function Blogs() {
  return (
    <ul className='flex gap-4 mt-4 flex-col sm:flex-row   xl:flex-nowrap  flex-wrap justify-center sm:justify-start'>
      <li className='flex items-center justify-center'>
        <motion.div
          onClick={() => (window.location.href = '/blogs/engineering-planning')}
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
        </motion.div>
      </li>
    </ul>
  );
}

export default Blogs;
