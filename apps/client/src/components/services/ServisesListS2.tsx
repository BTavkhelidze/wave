'use client';

import React from 'react';

import { motion } from 'framer-motion';

import * as FaIcons from 'react-icons/fa';

import Link from 'next/link';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { IServices } from '@/Interface/Interface';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';

function ServisesListS2() {
  const patname = usePathname();

  const ka = patname.includes('ka');
  const t = useTranslations('Services');
  const words = t('ServicesTitle');

  const {
    data: services,
    isFetching,
    isError,
  } = useQuery<IServices[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/Services');
      return res.json();
    },
  });

  if (isError) return <div className='text-white'>Error loading services.</div>;

  return (
    <section className='flex-1 w-full relative '>
      <div className=' max-w-[1440px] mx-auto w-full px-6 2xl:px-0'>
        <div className='flex-1 text-center sm:text-start'>
          <h2 className='text-3xl md:text-4xl font-light tracking-wide  dark:text-white leading-tight'>
            <TextGenerateEffect words={words} duration={1.2} />
          </h2>
        </div>
        <ul className='flex justify-stretch  w-full gap-2  mt-4 flex-col sm:flex-row  flex-wrap sm:justify-start'>
          {isFetching &&
            Array.from({ length: 12 }, (_, x) => (
              <li key={x} className='flex  mt-4 sm:mt-10'>
                <div className='relative w-full sm:w-[230px]'>
                  <Skeleton className='relative w-full h-[180px] cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'>
                    <Skeleton
                      className='absolute w-full h-[65px]    bottom-0 text-start px-2 bg-[#18181B]'
                      key={x}
                    />
                  </Skeleton>
                </div>
              </li>
            ))}

          {services &&
            services.map((ser, index) => {
              const IconComponent =
                FaIcons[ser.icon as keyof typeof FaIcons] || FaIcons.FaTools;

              return (
                <li key={index} className='flex  mt-4 sm:mt-10'>
                  <Link
                    href={`/services/${ser.id}`}
                    className='relative w-full sm:w-[230px]'
                  >
                    <motion.div
                      className='relative w-full h-[180px] cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'
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
                      {
                        <IconComponent
                          className={cn(`text-3xl mb-14`)}
                          style={{ color: `${ser.iconColor}` }}
                        />
                      }

                      <div
                        className={`absolute w-full h-[65px] text-sm   flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 `}
                      >
                        {ka ? ser.title_ka : ser.title_en}
                      </div>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
}

export default ServisesListS2;
