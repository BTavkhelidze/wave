'use client';

import React from 'react';

import { motion } from 'framer-motion';

import * as FaIcons from 'react-icons/fa';

import Link from 'next/link';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useLocale, useTranslations } from 'next-intl';
import { getLocalizedServiceTitle } from './services.locale';
import { usePublicServicesQuery } from './services.queries';

function ServisesListS2() {
  const locale = useLocale();
  const t = useTranslations('Services');
  const words = t('ServicesTitle');

  const {
    data: services,
    isPending,
    isError,
  } = usePublicServicesQuery(locale);

  if (isError)
    return (
      <section
        className='flex-1 w-full relative'
        aria-labelledby='services-heading'
      >
        <div className='max-w-[1440px] mx-auto w-full px-6 2xl:px-0'>
          <h2
            className='text-3xl md:text-4xl font-light tracking-wide dark:text-white leading-tight'
            id='services-heading'
          >
            {words}
          </h2>
          <p className='text-white mt-6' role='alert'>
            Error loading services.
          </p>
        </div>
      </section>
    );

  return (
    <section
      className='flex-1 w-full relative'
      aria-labelledby='services-heading'
      aria-busy={isPending}
    >
      <div className=' max-w-[1440px] mx-auto w-full px-6 2xl:px-0'>
        <div className='flex-1 text-center sm:text-start'>
          <h2 className='sr-only' id='services-heading'>
            {words}
          </h2>
          <div
            className='text-3xl md:text-4xl font-light tracking-wide dark:text-white leading-tight'
            aria-hidden='true'
          >
            <TextGenerateEffect words={words} duration={1.2} />
          </div>
        </div>
        <ul className='flex justify-stretch  w-full gap-2  mt-4 flex-col sm:flex-row  flex-wrap sm:justify-start'>
          {isPending &&
            Array.from({ length: 12 }, (_, x) => (
              <li key={x} className='flex  mt-4 sm:mt-10'>
                <div
                  className='relative w-full sm:w-[230px]'
                  role='status'
                  aria-label='Loading service'
                >
                  <Skeleton
                    className='relative w-full h-[180px] border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center'
                    aria-hidden='true'
                  >
                    <Skeleton
                      className='absolute w-full h-[65px]    bottom-0 text-start px-2 bg-[#18181B]'
                      key={x}
                    />
                  </Skeleton>
                </div>
              </li>
            ))}

          {services &&
            services.map((ser) => {
              const IconComponent =
                FaIcons[ser.icon as keyof typeof FaIcons] || FaIcons.FaTools;
              const serviceTitle =
                getLocalizedServiceTitle(ser, locale) ?? 'Service';

              return (
                <li key={ser.id} className='flex  mt-4 sm:mt-10'>
                  <Link
                    href={`/${locale}/services/${ser.id}`}
                    className='relative w-full sm:w-[230px] rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
                    aria-label={serviceTitle}
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
                          aria-hidden='true'
                          focusable='false'
                        />
                      }

                      <div
                        className={`absolute w-full min-h-[65px] text-sm flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 break-words leading-snug`}
                      >
                        {serviceTitle}
                      </div>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
        </ul>
        {!isPending && services?.length === 0 && (
          <p className='text-white mt-6' role='status'>
            No services found.
          </p>
        )}
      </div>
    </section>
  );
}

export default ServisesListS2;
