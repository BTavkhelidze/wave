'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import {
  PublicCardSkeleton,
  PublicContentState,
} from '@/components/shared/public-content/PublicContentState';
import {
  getLocalizedBlogExcerpt,
  getLocalizedBlogSlug,
  getLocalizedBlogTitle,
} from './blogs.locale';
import { usePublicBlogsQuery } from './blogs.queries';

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

export default function BlogsList() {
  const locale = useLocale();
  const t = useTranslations('Blogs');
  const { data, isPending, isError } = usePublicBlogsQuery(locale);
  const blogs = data?.data;

  if (isError) {
    return (
      <section
        className='flex-1 w-full relative'
        aria-labelledby='blogs-heading'
      >
        <PublicContentState
          title={t('title')}
          message={t('error')}
          role='alert'
        />
      </section>
    );
  }

  return (
    <section
      className='flex-1 w-full relative'
      aria-labelledby='blogs-heading'
      aria-busy={isPending}
    >
      <div className='max-w-[1440px] mx-auto w-full px-6 2xl:px-0'>
        <h1
          className='text-3xl md:text-4xl font-light tracking-wide dark:text-white leading-tight text-center sm:text-start'
          id='blogs-heading'
        >
          {t('title')}
        </h1>

        <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8'>
          {isPending &&
            Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <PublicCardSkeleton label={t('loadingCard')} />
              </li>
            ))}

          {blogs?.map((blog) => {
            const title = getLocalizedBlogTitle(blog, locale);
            const excerpt = getLocalizedBlogExcerpt(blog, locale);
            const slug = getLocalizedBlogSlug(blog, locale);
            const publishedDate = formatPublicationDate(
              blog.publishedAt,
              locale,
            );

            return (
              <li key={blog.id} className='flex'>
                <Link
                  href={`/${locale}/blogs/${slug}`}
                  className='group w-full rounded-[8px] outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1012]'
                  aria-label={`${t('readMore')} ${title}`}
                >
                  <motion.article
                    className='h-full min-h-[320px] border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex flex-col'
                    whileHover={{
                      scale: [null, 1.02],
                      transition: {
                        duration: 0.5,
                        times: [0, 0.6],
                        ease: ['easeInOut', 'easeOut'],
                      },
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {blog.coverImageUrl ? (
                      <div className='relative h-[170px] w-full bg-[#18181B]'>
                        <Image
                          src={blog.coverImageUrl}
                          alt={title}
                          fill
                          sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                          className='object-contain'
                        />
                      </div>
                    ) : (
                      <div
                        className='h-[170px] w-full bg-[#18181B]'
                        aria-hidden='true'
                      />
                    )}

                    <div className='flex flex-1 flex-col p-4'>
                      <h2 className='text-base font-medium text-white leading-snug wrap-break-word'>
                        {title}
                      </h2>

                      <span className='mt-auto pt-5 text-sm text-white underline underline-offset-4'>
                        {t('readMore')}
                      </span>
                    </div>
                  </motion.article>
                </Link>
              </li>
            );
          })}
        </ul>

        {!isPending && blogs?.length === 0 && (
          <p className='text-white mt-6' role='status'>
            {t('empty')}
          </p>
        )}
      </div>
    </section>
  );
}
