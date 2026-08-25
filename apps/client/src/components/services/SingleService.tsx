'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IconType } from 'react-icons';
import {
  FaAngleLeft,
  FaAngleRight,
  FaBolt,
  FaFaucet,
  FaFireExtinguisher,
  FaSnowflake,
  FaTools,
  FaWind,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { usePublicServicesQuery } from './services.queries';
import {
  getLocalizedServiceDescription,
  matchesLocalizedServiceSlug,
  getLocalizedServiceTitle,
} from './services.locale';
import { PublicDetailState } from '../shared/public-content/PublicDetailState';

const WavyBackground = dynamic(
  () => import('../ui/wavy-background').then((mod) => mod.WavyBackground),
  { ssr: false },
);

const SERVICE_ICON_REGISTRY: Record<string, IconType> = {
  FaBolt,
  FaFaucet,
  FaFireExtinguisher,
  FaSnowflake,
  FaTools,
  FaWind,
};

interface SingleServiceProps {
  service: string;
}

function SingleService({ service }: SingleServiceProps) {
  const [curIndex, setCurIndex] = useState<number | null>(null);
  const [isHover, setIsHover] = useState<boolean>(false);
  const locale = useLocale();
  const t = useTranslations('Services');

  const { data: services, isPending, isError } = usePublicServicesQuery(locale);

  useEffect(() => {
    if (!services) return;

    const index = services.findIndex((el) =>
      matchesLocalizedServiceSlug(el, locale, service),
    );

    setCurIndex(index);
  }, [locale, service, services]);

  if (isPending)
    return (
      <PublicDetailState
        title={t('loading')}
        message={t('loadingDescription')}
        isLoading
      />
    );

  if (isError)
    return (
      <PublicDetailState
        title={t('errorDetail')}
        message={t('errorDescription')}
        tone='error'
        actions={[
          { href: `/${locale}/services`, label: t('backToServices') },
          { href: `/${locale}/home`, label: t('backToHome') },
        ]}
      />
    );

  if (curIndex === null)
    return (
      <PublicDetailState
        title={t('loading')}
        message={t('loadingDescription')}
        isLoading
      />
    );

  const currentService =
    services && curIndex >= 0 ? services[curIndex] : undefined;

  if (!currentService)
    return (
      <PublicDetailState
        title={t('notFound')}
        message={t('notFoundDescription')}
        actions={[
          { href: `/${locale}/services`, label: t('backToServices') },
          { href: `/${locale}/home`, label: t('backToHome') },
        ]}
      />
    );

  const IconComponent =
    SERVICE_ICON_REGISTRY[currentService.icon] ?? FaTools;
  const serviceTitle =
    getLocalizedServiceTitle(currentService, locale) ?? 'Service';
  const serviceDescription =
    getLocalizedServiceDescription(currentService, locale) ?? '';

  const handlePrev = () => {
    if (curIndex > 0) {
      setCurIndex((prev) => (prev === null ? prev : prev - 1));
    }
  };

  const handleNext = () => {
    if (services && curIndex < services.length - 1) {
      setCurIndex((prev) => (prev === null ? prev : prev + 1));
    }
  };

  return (
    <article className='max-w-[1440px] overflow-hidden mx-auto px-[2%] pt-30 flex flex-col min-h-screen'>
      <Link
        href={`/${locale}/services`}
        className='flex gap-2 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012] w-fit px-6 xl:px-[8%]'
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <FaAngleLeft aria-hidden='true' focusable='false' />
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Go Back
        </motion.span>
      </Link>

      <section
        className='w-full overflow-hidden overflow-y-visible flex-1 flex flex-col items-center text-center justify-center'
        aria-labelledby='service-title'
      >
        <div
          className='mb-4 absolute  overflow-hidden -top-50 left-0 w-full h-full -z-1'
          aria-hidden='true'
        >
          <WavyBackground
            className='w-full h-[10%]'
            colors={currentService.animationColors}
          ></WavyBackground>
        </div>

        <div
          key={curIndex}
          className='flex flex-col gap-10 max-w-[100%] w-full md:max-w-[80%] lg:max-w-[70%] px-6 sm:px-10 md:px-14 '
        >
          <IconComponent
            className={cn(`text-2xl md:text-4xl self-center mt-6`)}
            style={{ color: `${currentService.iconColor}` }}
            aria-hidden='true'
            focusable='false'
          />
          <h1
            className='text-xl sm:2xl md:text-4xl lg:text-3xl font-bold inter-var text-center text-white wrap-break-word leading-tight'
            id='service-title'
          >
            {serviceTitle}
          </h1>
          <p className='text-base sm:text-xl text-[#898D8E] wrap-break-word leading-relaxed'>
            {serviceDescription}
          </p>
        </div>

        <div className='absolute bottom-10 right-10 z-10 flex gap-4'>
          {curIndex > 0 && (
            <motion.button
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              type='button'
              title='Prev'
              aria-label='Previous service'
              className='flex gap-1 items-center px-3 py-2 justify-center bg-[#141C1D] text-sm rounded-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
              onClick={handlePrev}
            >
              <FaAngleLeft aria-hidden='true' focusable='false' /> PREV
            </motion.button>
          )}

          {services && curIndex < services.length - 1 && (
            <motion.button
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              type='button'
              title='Next'
              aria-label='Next service'
              className='flex gap-1 items-center px-3 py-2 justify-center bg-[#141C1D] text-sm rounded-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
              onClick={handleNext}
            >
              NEXT <FaAngleRight aria-hidden='true' focusable='false' />
            </motion.button>
          )}
        </div>
      </section>
    </article>
  );
}

export default SingleService;
