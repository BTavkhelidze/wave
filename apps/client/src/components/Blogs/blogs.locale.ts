import type {
  BlogDetail,
  BlogListItem,
  BlogListTranslation,
  BlogTranslation,
} from './blogs.api';
import type { AppLocale } from '@/lib/seo';

function getLocaleLanguage(locale: string): 'KA' | 'EN' {
  return locale === 'ka' ? 'KA' : 'EN';
}

export function getStrictBlogLanguage(locale: AppLocale): 'KA' | 'EN' {
  return getLocaleLanguage(locale);
}

function getLocalizedTranslation(
  blog: BlogListItem | BlogDetail,
  locale: string,
): BlogListTranslation | undefined {
  const language = getLocaleLanguage(locale);

  return blog.translations?.find((translation) => translation.language === language);
}

function getLocalizedDetailTranslation(
  blog: BlogDetail,
  locale: string,
): BlogTranslation | undefined {
  const language = getLocaleLanguage(locale);

  return blog.translations.find((translation) => translation.language === language);
}

export function getLocalizedBlogTitle(
  blog: BlogListItem | BlogDetail,
  locale: string,
): string {
  return getLocalizedTranslation(blog, locale)?.title ?? blog.title;
}

export function getLocalizedBlogExcerpt(
  blog: BlogListItem | BlogDetail,
  locale: string,
): string {
  return getLocalizedTranslation(blog, locale)?.excerpt ?? blog.excerpt;
}

export function getLocalizedBlogSlug(blog: BlogListItem | BlogDetail): string {
  return blog.slug;
}

export function getLocalizedBlogContent(blog: BlogDetail, locale: string): string {
  return getLocalizedDetailTranslation(blog, locale)?.content ?? blog.content;
}

export function getLocalizedBlogMetaTitle(
  blog: BlogDetail,
  locale: string,
): string | null {
  return getLocalizedTranslation(blog, locale)?.metaTitle ?? null;
}

export function getLocalizedBlogMetaDescription(
  blog: BlogDetail,
  locale: string,
): string | null {
  return getLocalizedTranslation(blog, locale)?.metaDescription ?? null;
}

export function getStrictLocalizedBlogTranslation(
  blog: BlogDetail,
  locale: AppLocale,
): BlogTranslation | undefined {
  return getLocalizedDetailTranslation(blog, locale);
}
