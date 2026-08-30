'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { IServices } from '@/Interface/Interface';
import type { AppLocale } from '@/lib/seo';
import { buildLocalizedPath } from '@/lib/seo';
import {
  getLocalizedServiceSlug,
  getLocalizedServiceTitle,
} from '@/components/services/services.locale';
import { useTranslations } from 'next-intl';
import { getServiceIcon } from '@/components/services/serviceIcons';
import type { IconType } from 'react-icons';

type SingleServiceProps = {
  hasServicesError?: boolean;
  locale: AppLocale;
  services: IServices[];
};

type LandingServiceCard = {
  id: string;
  href: string;
  IconComponent: IconType;
  iconColor: string;
  title: string;
};

function SingleService({
  hasServicesError = false,
  locale,
  services,
}: SingleServiceProps) {
  const [isHover, setIsHover] = useState<boolean>(false);

  const t = useTranslations('Services');
  const visibleServices = services.reduce<LandingServiceCard[]>(
    (items, service) => {
      const title = getLocalizedServiceTitle(service, locale);
      const slug = getLocalizedServiceSlug(service, locale);

      if (!title || !slug) {
        return items;
      }

      const IconComponent = getServiceIcon(service.icon);

      items.push({
        id: service.id,
        href: buildLocalizedPath(locale, 'services', slug),
        IconComponent,
        iconColor: service.iconColor || '#3B82F6',
        title,
      });

      return items;
    },
    [],
  );

  return (
    <div className='w-full  max-w-[1440px] mx-auto my-6 2xl:mx-auto  '>
      <h2 className='text-white text-center sm:text-start'>
        {t('ServicesTitle')}
      </h2>
      <ul className='flex  gap-4 mt-4 w-full flex-col sm:flex-row flex-wrap justify-center sm:justify-start'>
        {visibleServices.map((ser) => {
          return (
            <li key={ser.id} className='flex items-center justify-center '>
              <Link
                href={ser.href}
                className='w-full text-center outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012] rounded-[8px]'
                aria-label={ser.title}
              >
                <motion.div
                  className='relative w-full  sm:w-[230px] h-[180px] cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center '
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
                  <ser.IconComponent
                    className='text-3xl'
                    style={{ color: ser.iconColor }}
                    aria-hidden='true'
                    focusable='false'
                  />
                  <div className='absolute w-full text-sm h-[70px] flex items-center bg-[#18181B] text-white bottom-0 text-start px-2 break-words leading-snug'>
                    {ser.title}
                  </div>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
      {hasServicesError && (
        <p className='text-white/70 mt-4 text-sm' role='status'>
          {t('servicesUnavailable')}
        </p>
      )}
      {!hasServicesError && visibleServices.length === 0 && (
        <p className='text-white/70 mt-4 text-sm' role='status'>
          {t('noServicesFound')}
        </p>
      )}
      <Link
        href={`/${locale}/services`}
        className='text-white mt-6 text-sm flex gap-2 cursor-pointer items-center justify-center sm:justify-start '
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {t('SeeAllServises')}
        <motion.span
          className=''
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChevronRight />
        </motion.span>
      </Link>
    </div>
  );
}

export default SingleService;
