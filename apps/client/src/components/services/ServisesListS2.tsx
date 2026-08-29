'use client';

import React from 'react';

import { motion } from 'framer-motion';

import type { IconType } from 'react-icons';
import {
  FaBolt,
  FaFaucet,
  FaFireExtinguisher,
  FaSnowflake,
  FaTools,
  FaWind,
} from 'react-icons/fa';

import Link from 'next/link';
import { TextGenerateEffect } from '../ui/text-generate-effect';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import {
  getLocalizedServiceSlug,
  getLocalizedServiceTitle,
} from './services.locale';
import { usePublicServicesQuery } from './services.queries';
import {
  PublicCardSkeleton,
  PublicContentState,
} from '../shared/public-content/PublicContentState';

const SERVICE_ICON_REGISTRY: Record<string, IconType> = {
  FaBolt,
  FaFaucet,
  FaFireExtinguisher,
  FaSnowflake,
  FaTools,
  FaWind,
};

function ServisesListS2() {
  const locale = useLocale();
  const t = useTranslations('Services');
  const words = t('ServicesTitle');

  const { data: services, isPending, isError } = usePublicServicesQuery(locale);

  if (isError)
    return (
      <section
        className='flex-1 w-full relative'
        aria-labelledby='services-heading'
      >
        <PublicContentState
          title={words}
          message='Error loading services.'
          role='alert'
        />
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
                <PublicCardSkeleton label='Loading service' />
              </li>
            ))}

          {services &&
            services.map((ser) => {
              const IconComponent =
                SERVICE_ICON_REGISTRY[ser.icon] ?? FaTools;
              const serviceTitle =
                getLocalizedServiceTitle(ser, locale) ?? 'Service';
              const serviceSlug =
                getLocalizedServiceSlug(ser, locale) ?? ser.id;

              return (
                <li key={ser.id} className='flex  mt-4 sm:mt-10'>
                  <Link
                    href={`/${locale}/services/${serviceSlug}`}
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
                        className={`absolute w-full min-h-[65px] text-sm flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 wrap-break-word leading-snug`}
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
