import type { MetadataRoute } from 'next';

import { fetchPublicBlogs } from '@/components/Blogs/blogs.api';
import { fetchPublicServices } from '@/components/services/services.api';
import { getStrictLocalizedServiceSlug } from '@/components/services/services.locale';
import { routing } from '@/i18n/routing';
import {
  buildAbsolutePublicUrl,
  buildLocalizedPath,
  buildStaticLocalizedPath,
  type AppLocale,
  type StaticSeoPage,
} from '@/lib/seo';

const STATIC_SITEMAP_PAGES: StaticSeoPage[] = [
  'home',
  'services',
  'blogs',
  'aboutUs',
  'calculator',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = buildStaticSitemapEntries();
  const [serviceEntries, blogEntries] = await Promise.all([
    buildServiceSitemapEntries(),
    buildBlogSitemapEntries(),
  ]);

  return [...staticEntries, ...serviceEntries, ...blogEntries];
}

function buildStaticSitemapEntries(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    STATIC_SITEMAP_PAGES.flatMap((page) => {
      const url = buildAbsolutePublicUrl(buildStaticLocalizedPath(locale, page));

      return url ? [{ url }] : [];
    }),
  );
}

async function buildServiceSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const services = await fetchPublicServices();

    return services.flatMap((service) =>
      routing.locales.flatMap((locale) => {
        const slug = getStrictLocalizedServiceSlug(service, locale);
        const url = slug
          ? buildAbsolutePublicUrl(buildLocalizedPath(locale, 'services', slug))
          : undefined;

        return url ? [{ url }] : [];
      }),
    );
  } catch {
    return [];
  }
}

async function buildBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const blogs = await fetchPublicBlogs();

    return blogs.data.flatMap((blog) =>
      blog.translations?.flatMap((translation) => {
        const locale: AppLocale = translation.language === 'KA' ? 'ka' : 'en';
        const url = buildAbsolutePublicUrl(
          buildLocalizedPath(locale, 'blogs', translation.slug),
        );

        if (!url) {
          return [];
        }

        return [
          {
            url,
            lastModified: new Date(blog.updatedAt),
          },
        ];
      }) ?? [],
    );
  } catch {
    return [];
  }
}
