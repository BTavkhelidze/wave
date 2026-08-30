import SingleService from '@/components/services/SingleService';
import { fetchPublicServices } from '@/components/services/services.api';
import {
  matchesLocalizedServiceSlug,
  getStrictLocalizedServiceDescription,
  getStrictLocalizedServiceMetaDescription,
  getStrictLocalizedServiceMetaTitle,
  getStrictLocalizedServiceSlug,
  getStrictLocalizedServiceTitle,
} from '@/components/services/services.locale';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildAbsolutePublicUrl,
  buildBreadcrumbJsonLd,
  buildLanguageAlternates,
  buildLocalizedPath,
  buildNoindexMetadata,
  buildSiteSocialImageUrl,
  buildStaticLocalizedPath,
  getNonEmptyText,
  getAlternateOpenGraphLocales,
  getOpenGraphLocale,
  normalizeAppLocale,
  type AppLocale,
  SITE_NAME,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
} from '@/lib/seo';
import type { Metadata } from 'next';
import { cache } from 'react';

type ServicePageParams = {
  locale: string;
  service: string;
};

const getPublicServicesForMetadata = cache(fetchPublicServices);

export async function generateMetadata({
  params,
}: {
  params: Promise<ServicePageParams>;
}): Promise<Metadata> {
  const { locale, service: serviceParam } = await params;
  const normalizedLocale = normalizeAppLocale(locale);

  if (!normalizedLocale) {
    return buildNoindexMetadata();
  }

  try {
    const services = await getPublicServicesForMetadata();
    const service = services.find((item) =>
      matchesLocalizedServiceSlug(item, normalizedLocale, serviceParam),
    );

    if (!service) {
      return buildNoindexMetadata();
    }

    const title =
      getNonEmptyText(
        getStrictLocalizedServiceMetaTitle(service, normalizedLocale),
        getStrictLocalizedServiceTitle(service, normalizedLocale),
      ) ?? SITE_DEFAULT_TITLE;
    const description =
      getNonEmptyText(
        getStrictLocalizedServiceMetaDescription(service, normalizedLocale),
        getStrictLocalizedServiceDescription(service, normalizedLocale),
      ) ?? SITE_DEFAULT_DESCRIPTION;
    const currentSlug =
      getNonEmptyText(
        getStrictLocalizedServiceSlug(service, normalizedLocale),
        serviceParam,
      ) ?? serviceParam;
    const currentPath = buildLocalizedPath(
      normalizedLocale,
      'services',
      currentSlug,
    );
    const pageUrl = buildAbsolutePublicUrl(currentPath);
    const socialImageUrl = buildSiteSocialImageUrl();

    return {
      title,
      description,
      alternates: buildLanguageAlternates(
        'services',
        normalizedLocale,
        currentSlug,
        {
          en: getStrictLocalizedServiceSlug(service, 'en'),
          ka: getStrictLocalizedServiceSlug(service, 'ka'),
        },
      ),
      openGraph: {
        title,
        description,
        ...(pageUrl ? { url: pageUrl } : {}),
        locale: getOpenGraphLocale(normalizedLocale),
        alternateLocale: getAlternateOpenGraphLocales(normalizedLocale),
        siteName: SITE_NAME,
        type: 'website',
        ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
      },
      twitter: {
        title,
        description,
        card: socialImageUrl ? 'summary_large_image' : 'summary',
        ...(socialImageUrl ? { images: [socialImageUrl] } : {}),
      },
    };
  } catch {
    return buildNoindexMetadata(SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION);
  }
}

async function page({ params }: { params: Promise<ServicePageParams> }) {
  const { locale, service } = await params;
  const normalizedLocale = normalizeAppLocale(locale);
  const jsonLd = normalizedLocale
    ? await buildServiceDetailJsonLd(normalizedLocale, service)
    : [];

  return (
    <main className='text-white w-full overflow-hidden '>
      <JsonLd data={jsonLd} />
      <SingleService service={service} />
    </main>
  );
}

export default page;

async function buildServiceDetailJsonLd(
  locale: AppLocale,
  serviceParam: string,
): Promise<Array<Record<string, unknown>>> {
  try {
    const services = await getPublicServicesForMetadata();
    const service = services.find((item) =>
      matchesLocalizedServiceSlug(item, locale, serviceParam),
    );

    if (!service) {
      return [];
    }

    const title = getNonEmptyText(
      getStrictLocalizedServiceTitle(service, locale),
      SITE_DEFAULT_TITLE,
    );
    const description = getNonEmptyText(
      getStrictLocalizedServiceDescription(service, locale),
      SITE_DEFAULT_DESCRIPTION,
    );
    const slug = getNonEmptyText(
      getStrictLocalizedServiceSlug(service, locale),
      serviceParam,
    );
    const url = slug
      ? buildAbsolutePublicUrl(buildLocalizedPath(locale, 'services', slug))
      : undefined;
    const servicesUrl = buildAbsolutePublicUrl(
      buildStaticLocalizedPath(locale, 'services'),
    );
    const homeUrl = buildAbsolutePublicUrl(
      buildStaticLocalizedPath(locale, 'home'),
    );
    const breadcrumb = buildBreadcrumbJsonLd([
      { name: SITE_NAME, url: homeUrl },
      { name: locale === 'ka' ? 'სერვისები' : 'Services', url: servicesUrl },
      { name: title ?? SITE_NAME, url },
    ]);
    const serviceJsonLd = url
      ? {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: title,
          description,
          url,
          provider: {
            '@type': 'ProfessionalService',
            name: SITE_NAME,
          },
        }
      : null;

    return [breadcrumb, serviceJsonLd].filter(
      (item): item is Record<string, unknown> => item !== null,
    );
  } catch {
    return [];
  }
}
