import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';

export const SITE_DEFAULT_TITLE = 'Wave Engineering';
export const SITE_DEFAULT_DESCRIPTION =
  'Wave Engineering provides coordinated MEP design, installation, and engineering consulting for building systems.';
export const SITE_NAME = 'Wave Engineering';
export const PUBLIC_CONTENT_REVALIDATE_SECONDS = 60;
export const SITE_SOCIAL_IMAGE_PATH = '/poster.jpg';

export type AppLocale = (typeof routing.locales)[number];
export type StaticSeoPage = 'home' | 'services' | 'blogs' | 'aboutUs' | 'calculator';
export type LocalizedSeo = {
  title: string;
  description: string;
};

type StaticSeoConfig = Record<StaticSeoPage, Record<AppLocale, LocalizedSeo>>;

const PUBLIC_CLIENT_BASE_URL =
  process.env.NEXT_PUBLIC_CLIENT_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_PUBLIC_WEBSITE_URL;

const STATIC_SEO: StaticSeoConfig = {
  home: {
    en: {
      title: 'MEP Engineering Solutions | Wave Engineering',
      description:
        'Explore coordinated MEP design, installation, and consulting for water, air, voltage, ventilation, and building systems.',
    },
    ka: {
      title: 'MEP საინჟინრო გადაწყვეტილებები | Wave Engineering',
      description:
        'გაეცანით MEP პროექტირებას, მონტაჟსა და კონსულტაციას წყლის, ჰაერის, ვოლტაჟის, ვენტილაციისა და შენობის სისტემებისთვის.',
    },
  },
  services: {
    en: {
      title: 'Engineering Services | Wave Engineering',
      description:
        'Review Wave Engineering services for design, installation, heating and cooling, ventilation, fire safety, electrical, and plumbing systems.',
    },
    ka: {
      title: 'საინჟინრო სერვისები | Wave Engineering',
      description:
        'იხილეთ Wave Engineering-ის სერვისები პროექტირების, მონტაჟის, გათბობა-გაგრილების, ვენტილაციის, სახანძრო, ელექტრო და წყლის სისტემებისთვის.',
    },
  },
  blogs: {
    en: {
      title: 'Engineering Blog | Wave Engineering',
      description:
        'Read Wave Engineering articles about building systems, ventilation, fire safety, electrical, plumbing, and practical engineering topics.',
    },
    ka: {
      title: 'საინჟინრო ბლოგი | Wave Engineering',
      description:
        'წაიკითხეთ Wave Engineering-ის სტატიები შენობის სისტემებზე, ვენტილაციაზე, სახანძრო უსაფრთხოებაზე, ელექტროობაზე და წყლის სისტემებზე.',
    },
  },
  aboutUs: {
    en: {
      title: 'About Wave Engineering',
      description:
        'Learn how Wave Engineering supports architects, developers, and end users with coordinated MEP systems, energy efficiency, and consulting.',
    },
    ka: {
      title: 'Wave Engineering-ის შესახებ',
      description:
        'გაიგეთ როგორ ეხმარება Wave Engineering არქიტექტორებს, დეველოპერებსა და მომხმარებლებს MEP სისტემებში, ენერგოეფექტურობასა და კონსულტაციაში.',
    },
  },
  calculator: {
    en: {
      title: 'Ventilation Shaft Calculator | Wave Engineering',
      description:
        'Use the ventilation calculator to estimate airflow, shaft dimensions, damper behavior, and natural or mechanical ventilation performance.',
    },
    ka: {
      title: 'ვენტილაციის შახტის კალკულატორი | Wave Engineering',
      description:
        'გამოიყენეთ ვენტილაციის კალკულატორი ჰაერის ნაკადის, შახტის ზომების, დამპერისა და ბუნებრივი ან მექანიკური სისტემის შესაფასებლად.',
    },
  },
};

export function normalizeAppLocale(locale: string): AppLocale | null {
  return routing.locales.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : null;
}

export function getOpenGraphLocale(locale: AppLocale): string {
  return locale === 'ka' ? 'ka_GE' : 'en_US';
}

export function getAlternateOpenGraphLocales(locale: AppLocale): string[] {
  return routing.locales
    .filter((supportedLocale) => supportedLocale !== locale)
    .map(getOpenGraphLocale);
}

export function getNonEmptyText(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    const normalizedValue = value?.trim();

    if (normalizedValue) {
      return normalizedValue;
    }
  }

  return undefined;
}

export function getPublicClientBaseUrl(): string | undefined {
  const baseUrl = getNonEmptyText(PUBLIC_CLIENT_BASE_URL);

  if (!baseUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(baseUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
    parsedUrl.search = '';
    parsedUrl.hash = '';

    return parsedUrl.toString().replace(/\/+$/, '');
  } catch {
    return undefined;
  }
}

export function buildStaticLocalizedPath(
  locale: AppLocale,
  page: StaticSeoPage,
): string {
  return `/${locale}/${page}`;
}

export function buildLocalizedPath(
  locale: AppLocale,
  section: 'blogs' | 'services',
  slug: string,
): string {
  return `/${locale}/${section}/${encodeURIComponent(slug)}`;
}

export function buildAbsolutePublicUrl(path: string): string | undefined {
  const baseUrl = getPublicClientBaseUrl();

  if (!baseUrl) {
    return undefined;
  }

  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function buildSiteSocialImageUrl(): string | undefined {
  return buildAbsolutePublicUrl(SITE_SOCIAL_IMAGE_PATH);
}

export function buildStaticLanguageAlternates(
  page: StaticSeoPage,
  currentLocale: AppLocale,
): Metadata['alternates'] | undefined {
  const canonical = buildAbsolutePublicUrl(
    buildStaticLocalizedPath(currentLocale, page),
  );
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const absoluteUrl = buildAbsolutePublicUrl(
      buildStaticLocalizedPath(locale, page),
    );

    if (absoluteUrl) {
      languages[locale] = absoluteUrl;
    }
  }

  const defaultUrl = buildAbsolutePublicUrl(
    buildStaticLocalizedPath(routing.defaultLocale, page),
  );

  if (defaultUrl) {
    languages['x-default'] = defaultUrl;
  }

  if (!canonical && Object.keys(languages).length === 0) {
    return undefined;
  }

  return {
    canonical,
    languages,
  };
}

export function getStaticSeo(page: StaticSeoPage, locale: AppLocale): LocalizedSeo {
  return STATIC_SEO[page][locale];
}

export function buildStaticPageMetadata(
  page: StaticSeoPage,
  locale: string,
): Metadata {
  const normalizedLocale = normalizeAppLocale(locale) ?? routing.defaultLocale;
  const seo = getStaticSeo(page, normalizedLocale);
  const pageUrl = buildAbsolutePublicUrl(
    buildStaticLocalizedPath(normalizedLocale, page),
  );
  const socialImageUrl = buildSiteSocialImageUrl();

  return {
    title: seo.title,
    description: seo.description,
    alternates: buildStaticLanguageAlternates(page, normalizedLocale),
    openGraph: {
      title: seo.title,
      description: seo.description,
      ...(pageUrl ? { url: pageUrl } : {}),
      locale: getOpenGraphLocale(normalizedLocale),
      alternateLocale: getAlternateOpenGraphLocales(normalizedLocale),
      siteName: SITE_NAME,
      type: 'website',
      ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
    },
    twitter: {
      title: seo.title,
      description: seo.description,
      card: socialImageUrl ? 'summary_large_image' : 'summary',
      ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
    },
  };
}

export function buildStaticPageJsonLd(
  page: StaticSeoPage,
  locale: string,
): Array<Record<string, unknown>> {
  const normalizedLocale = normalizeAppLocale(locale) ?? routing.defaultLocale;
  const homeUrl = buildAbsolutePublicUrl(
    buildStaticLocalizedPath(normalizedLocale, 'home'),
  );
  const pageUrl = buildAbsolutePublicUrl(
    buildStaticLocalizedPath(normalizedLocale, page),
  );
  const seo = getStaticSeo(page, normalizedLocale);
  const breadcrumbItems =
    page === 'home'
      ? [{ name: SITE_NAME, url: homeUrl }]
      : [
          { name: SITE_NAME, url: homeUrl },
          { name: seo.title, url: pageUrl },
        ];
  const breadcrumb = buildBreadcrumbJsonLd(breadcrumbItems);

  return [breadcrumb].filter(
    (item): item is Record<string, unknown> => item !== null,
  );
}

export function getAbsoluteHttpUrl(value: string): string | undefined {
  const normalizedValue = getNonEmptyText(value);

  if (!normalizedValue) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(normalizedValue);

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
      ? parsedUrl.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function buildLanguageAlternates(
  section: 'blogs' | 'services',
  currentLocale: AppLocale,
  currentSlug: string,
  slugsByLocale: Partial<Record<AppLocale, string | undefined>>,
): Metadata['alternates'] | undefined {
  const canonicalSlug = getNonEmptyText(currentSlug);

  if (!canonicalSlug) {
    return undefined;
  }

  const canonicalPath = buildLocalizedPath(currentLocale, section, canonicalSlug);
  const canonical = buildAbsolutePublicUrl(canonicalPath);
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const slug = getNonEmptyText(slugsByLocale[locale]);

    if (!slug) {
      continue;
    }

    const absoluteUrl = buildAbsolutePublicUrl(
      buildLocalizedPath(locale, section, slug),
    );

    if (absoluteUrl) {
      languages[locale] = absoluteUrl;
    }
  }

  const defaultSlug = getNonEmptyText(slugsByLocale[routing.defaultLocale]);
  const defaultUrl = defaultSlug
    ? buildAbsolutePublicUrl(
        buildLocalizedPath(routing.defaultLocale, section, defaultSlug),
      )
    : undefined;

  if (defaultUrl) {
    languages['x-default'] = defaultUrl;
  }

  if (!canonical && Object.keys(languages).length === 0) {
    return undefined;
  }

  return {
    canonical,
    languages,
  };
}

export function buildOrganizationJsonLd(locale: AppLocale): Record<string, unknown> | null {
  const websiteUrl = buildAbsolutePublicUrl(`/${locale}/home`);
  const logoUrl = buildAbsolutePublicUrl('/logo-16k.svg');

  if (!websiteUrl) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    url: websiteUrl,
    ...(logoUrl ? { logo: logoUrl } : {}),
    email: 'info@waveengineering.ge',
    areaServed: 'Georgia',
    serviceType: 'MEP engineering design, installation, and consulting',
  };
}

export function buildWebsiteJsonLd(locale: AppLocale): Record<string, unknown> | null {
  const websiteUrl = buildAbsolutePublicUrl(`/${locale}/home`);

  if (!websiteUrl) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: websiteUrl,
    inLanguage: locale === 'ka' ? 'ka-GE' : 'en-US',
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>,
): Record<string, unknown> | null {
  const itemListElement: Array<Record<string, unknown>> = [];

  items.forEach((item, index) => {
    if (!item.url) {
      return;
    }

    itemListElement.push({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    });
  });

  if (itemListElement.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

export function buildNoindexMetadata(
  title = SITE_DEFAULT_TITLE,
  description = SITE_DEFAULT_DESCRIPTION,
): Metadata {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export function buildPublicContentFetchInit(
  signal?: AbortSignal,
): RequestInit & { next: { revalidate: number } } {
  return {
    signal,
    next: {
      revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS,
    },
  };
}
