import SingleBlog from '@/components/Blogs/SingleBlog';
import { fetchPublicBlogBySlug } from '@/components/Blogs/blogs.api';
import { getStrictLocalizedBlogTranslation } from '@/components/Blogs/blogs.locale';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildAbsolutePublicUrl,
  buildBreadcrumbJsonLd,
  buildLanguageAlternates,
  buildLocalizedPath,
  buildNoindexMetadata,
  buildSiteSocialImageUrl,
  buildStaticLocalizedPath,
  getAbsoluteHttpUrl,
  getAlternateOpenGraphLocales,
  getNonEmptyText,
  getOpenGraphLocale,
  normalizeAppLocale,
  type AppLocale,
  SITE_NAME,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
} from '@/lib/seo';
import type { Metadata } from 'next';
import { cache } from 'react';

type BlogPageParams = {
  locale: string;
  blog: string;
};

const getPublicBlogForMetadata = cache(fetchPublicBlogBySlug);

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogPageParams>;
}): Promise<Metadata> {
  const { locale, blog: blogParam } = await params;
  const normalizedLocale = normalizeAppLocale(locale);

  if (!normalizedLocale) {
    return buildNoindexMetadata();
  }

  try {
    const blog = await getPublicBlogForMetadata(blogParam);
    const translation = getStrictLocalizedBlogTranslation(blog, normalizedLocale);
    const title =
      getNonEmptyText(translation?.metaTitle, translation?.title) ??
      SITE_DEFAULT_TITLE;
    const description =
      getNonEmptyText(translation?.metaDescription, translation?.excerpt) ??
      SITE_DEFAULT_DESCRIPTION;
    const currentSlug =
      getNonEmptyText(translation?.slug, blogParam) ?? blogParam;
    const currentPath = buildLocalizedPath(
      normalizedLocale,
      'blogs',
      currentSlug,
    );
    const pageUrl = buildAbsolutePublicUrl(currentPath);
    const imageUrl =
      getAbsoluteHttpUrl(blog.coverImageUrl) ?? buildSiteSocialImageUrl();
    const slugsByLocale = Object.fromEntries(
      blog.translations.map((blogTranslation) => [
        blogTranslation.language === 'KA' ? 'ka' : 'en',
        blogTranslation.slug,
      ]),
    );

    return {
      title,
      description,
      alternates: buildLanguageAlternates(
        'blogs',
        normalizedLocale,
        currentSlug,
        slugsByLocale,
      ),
      openGraph: {
        title,
        description,
        ...(pageUrl ? { url: pageUrl } : {}),
        ...(imageUrl ? { images: [imageUrl] } : {}),
        locale: getOpenGraphLocale(normalizedLocale),
        alternateLocale: getAlternateOpenGraphLocales(normalizedLocale),
        siteName: SITE_NAME,
        type: 'article',
        ...(blog.publishedAt ? { publishedTime: blog.publishedAt } : {}),
      },
      twitter: {
        title,
        description,
        ...(imageUrl ? { images: [imageUrl] } : {}),
        card: imageUrl ? 'summary_large_image' : 'summary',
      },
    };
  } catch {
    return buildNoindexMetadata(SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION);
  }
}

async function page({ params }: { params: Promise<BlogPageParams> }) {
  const { locale, blog } = await params;
  const normalizedLocale = normalizeAppLocale(locale);
  const jsonLd = normalizedLocale
    ? await buildBlogDetailJsonLd(normalizedLocale, blog)
    : [];

  return (
    <main className='text-white w-full overflow-hidden min-h-screen xl:px-[8%]'>
      <JsonLd data={jsonLd} />
      <SingleBlog blog={blog} />
    </main>
  );
}

export default page;

async function buildBlogDetailJsonLd(
  locale: AppLocale,
  blogParam: string,
): Promise<Array<Record<string, unknown>>> {
  try {
    const blog = await getPublicBlogForMetadata(blogParam);
    const translation = getStrictLocalizedBlogTranslation(blog, locale);
    const title = getNonEmptyText(translation?.title, blog.title);
    const description = getNonEmptyText(
      translation?.metaDescription,
      translation?.excerpt,
      blog.excerpt,
    );
    const slug = getNonEmptyText(translation?.slug, blogParam);
    const url = slug
      ? buildAbsolutePublicUrl(buildLocalizedPath(locale, 'blogs', slug))
      : undefined;
    const blogsUrl = buildAbsolutePublicUrl(
      buildStaticLocalizedPath(locale, 'blogs'),
    );
    const homeUrl = buildAbsolutePublicUrl(
      buildStaticLocalizedPath(locale, 'home'),
    );
    const imageUrl =
      getAbsoluteHttpUrl(blog.coverImageUrl) ?? buildSiteSocialImageUrl();
    const breadcrumb = buildBreadcrumbJsonLd([
      { name: SITE_NAME, url: homeUrl },
      { name: locale === 'ka' ? 'ბლოგები' : 'Blogs', url: blogsUrl },
      { name: title ?? SITE_NAME, url },
    ]);
    const blogPosting = url
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: title,
          description,
          url,
          ...(imageUrl ? { image: imageUrl } : {}),
          ...(blog.publishedAt ? { datePublished: blog.publishedAt } : {}),
          dateModified: blog.updatedAt,
          author: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
          inLanguage: locale === 'ka' ? 'ka-GE' : 'en-US',
        }
      : null;

    return [breadcrumb, blogPosting].filter(
      (item): item is Record<string, unknown> => item !== null,
    );
  } catch {
    return [];
  }
}
