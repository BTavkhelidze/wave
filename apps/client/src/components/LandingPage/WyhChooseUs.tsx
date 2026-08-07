'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTools, FaCheckCircle, FaClock, FaUsers } from 'react-icons/fa';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

function WhyChooseUs() {
  const [isHover, setIsHover] = useState(false);
  const t = useTranslations('WhyChooseUs');
  const reasons = [
    {
      title: t('first'),
      icon: <FaTools className='text-blue-500 text-2xl' />,
    },
    {
      title: t('second'),
      icon: <FaCheckCircle className='text-green-400 text-2xl' />,
    },
    {
      title: t('third'),
      icon: <FaClock className='text-yellow-400 text-2xl' />,
    },
    {
      title: t('forth'),
      icon: <FaUsers className='text-sky-400 text-2xl' />,
    },
  ];

  return (
    <section className='w-full xl:px-[8%]  mx-auto my-16 px-6  2xl:mx-auto xl:pb-10 '>
      <h2 className='text-white text-center sm:text-start'>{t('title')}?</h2>

      <ul className='flex gap-4 mt-4 flex-col sm:flex-row   xl:flex-nowrap  flex-wrap justify-center sm:justify-start'>
        {reasons.map((reason, i) => (
          <li key={i} className='flex items-center justify-center'>
            <motion.div
              onClick={() => (window.location.href = '/aboutUs')}
              className='relative w-full sm:w-[230px] h-[180px] cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'
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
              {reason.icon}
              <div className='absolute w-full h-[55px] flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 text-sm font-medium'>
                {reason.title}
              </div>
            </motion.div>
          </li>
        ))}
      </ul>

      <Link
        href={'/aboutUs'}
        className='text-white mt-6 text-sm flex gap-2 cursor-pointer items-center justify-center sm:justify-start '
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {t('btn')}
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChevronRight />
        </motion.span>
      </Link>
    </section>
  );
}

export default WhyChooseUs;
