'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import * as FaIcons from 'react-icons/fa';
import { useLocale, useTranslations } from 'next-intl';

import { ApiRequestError } from '@/lib/api';
import {
  getLocalizedBlogContent,
  getLocalizedBlogExcerpt,
  getLocalizedBlogTitle,
} from './blogs.locale';
import { usePublicBlogDetailQuery } from './blogs.queries';
import { SafeBlogContent } from './SafeBlogContent';

function formatPublicationDate(
  date: string | null,
  locale: string,
): string | null {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === 'ka' ? 'ka-GE' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export default function SingleBlog({ blog: blogSlug }: { blog: string }) {
  const [isHover, setIsHover] = useState(false);
  const locale = useLocale();
  const t = useTranslations('Blogs');
  const {
    data: blog,
    isPending,
    isError,
    error,
  } = usePublicBlogDetailQuery(locale, blogSlug);

  if (isPending) {
    return (
      <div
        className='absolute z-60 inset-0 bg-[#0B1012] flex items-center h-screen overflow-y-hidden justify-center'
        role='status'
        aria-live='polite'
      >
        <p>{t('loading')}</p>
      </div>
    );
  }

  const isNotFound = error instanceof ApiRequestError && error.status === 404;

  if (isError || !blog) {
    return (
      <div
        className='absolute z-60 inset-0 flex items-center justify-center px-6 text-center'
        role={isNotFound ? 'status' : 'alert'}
      >
        <p className='text-white'>
          {isNotFound ? t('notFound') : t('errorDetail')}
        </p>
      </div>
    );
  }

  const title = getLocalizedBlogTitle(blog, locale);
  const content = getLocalizedBlogContent(blog, locale);
  const publishedDate = formatPublicationDate(blog.publishedAt, locale);

  return (
    <article className='relative max-w-[1280px] pb-20  pt-30 text-white w-full px-7 xl:mx-auto'>
      <Link
        href={`/${locale}/blogs`}
        className='sm:flex gap-2 items-center mb-6 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 hidden focus-visible:ring-offset-[#0B1012] w-fit'
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <FaIcons.FaAngleLeft aria-hidden='true' focusable='false' />
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('goBack')}
        </motion.span>
      </Link>

      <header className='flex flex-col gap-5 max-w-[860px] mx-auto w-full  md:px-14 '>
        <h2 className='text-xl sm:text-2xl md:text-4xl lg:text-3xl font-bold text-white wrap-break-word leading-tight'>
          {title}
        </h2>
        {publishedDate && (
          <time
            dateTime={blog.publishedAt ?? undefined}
            className='flex items-center gap-2 text-xs text-[#898D8E]'
          >
            <CalendarDays size={14} aria-hidden='true' />
            {publishedDate}
          </time>
        )}
      </header>

      {blog.coverImageUrl && (
        <div className='mt-10   md:px-14 5 max-w-[860px] mx-auto w-full'>
          <div className='relative aspect-video max-h-[520px] w-full overflow-hidden rounded-lg border border-[#18181B] bg-[#0C1013]'>
            <Image
              src={blog.coverImageUrl}
              role='presentation'
              loading='lazy'
              alt={title}
              fill
              sizes='(min-width: 1280px) 1180px, 100vw'
              className='object-contain'
            />
          </div>
        </div>
      )}

      <section
        className='mt-10 max-w-[860px] mx-auto  md:px-14 text-start'
        aria-label={t('contentLabel')}
      >
        <SafeBlogContent html={content} />
      </section>
    </article>
  );
}
