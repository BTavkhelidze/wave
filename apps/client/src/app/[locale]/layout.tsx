import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';
import '../globals.css';

import { routing } from '@/i18n/routing';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import LayoutClientSide from './LayoutClientSide';
import LayoutClientSideFooter from './LayoutClientSideFooter';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from '@/lib/queryClient';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildOrganizationJsonLd,
  buildSiteSocialImageUrl,
  buildWebsiteJsonLd,
  getAlternateOpenGraphLocales,
  getOpenGraphLocale,
  getPublicClientBaseUrl,
  normalizeAppLocale,
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  SITE_NAME,
} from '@/lib/seo';

const metadataBase = getPublicClientBaseUrl();
const defaultSocialImage = buildSiteSocialImageUrl();

export const metadata: Metadata = {
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  ...(metadataBase ? { metadataBase: new URL(metadataBase) } : {}),
  openGraph: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: 'website',
    locale: getOpenGraphLocale('ka'),
    alternateLocale: getAlternateOpenGraphLocales('ka'),
    ...(defaultSocialImage ? { images: [defaultSocialImage] } : {}),
  },
  twitter: {
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    card: defaultSocialImage ? 'summary_large_image' : 'summary',
    ...(defaultSocialImage ? { images: [defaultSocialImage] } : {}),
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const normalizedLocale = normalizeAppLocale(locale) ?? routing.defaultLocale;

  return (
    <html lang={locale}>
      <body className={`bg-[#0B1012]`}>
        <NextIntlClientProvider>
          <Providers>
            <main className='flex flex-col  justify-between overflow-hidden '>
              <JsonLd
                data={[
                  buildOrganizationJsonLd(normalizedLocale),
                  buildWebsiteJsonLd(normalizedLocale),
                ].filter(
                  (item): item is Record<string, unknown> => item !== null,
                )}
              />
              <LayoutClientSide />
              <div className='flex-1'>{children}</div>
              <SpeedInsights />
              <LayoutClientSideFooter />
              <GoogleAnalytics gaId='G-0B93WP5255' />
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
