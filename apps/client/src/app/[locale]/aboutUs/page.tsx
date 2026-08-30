import type { Metadata } from 'next';

import { JsonLd } from '@/components/seo/JsonLd';
import { buildStaticPageJsonLd, buildStaticPageMetadata } from '@/lib/seo';
import { AboutUsContent } from './AboutUsContent';

type AboutUsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: AboutUsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildStaticPageMetadata('aboutUs', locale);
}

export default async function AboutUs({ params }: AboutUsPageProps) {
  const { locale } = await params;
  const jsonLd = buildStaticPageJsonLd('aboutUs', locale);

  return (
    <>
      <JsonLd data={jsonLd} />
      <AboutUsContent />
    </>
  );
}
