import dynamic from 'next/dynamic';
import { fetchPublicServices } from '@/components/services/services.api';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  buildStaticPageJsonLd,
  buildStaticPageMetadata,
  normalizeAppLocale,
} from '@/lib/seo';
import type { Metadata } from 'next';

const CompanyName = dynamic(() => import('@/components/LandingPage/companyName'));
const MotionInViewSection = dynamic(
  () => import('@/components/ui/MotionInViewSectionProps'),
);
const SingleService = dynamic(
  () => import('@/components/LandingPage/HeroSwiper/SingleService'),
);
const VentilationCalculatorHero = dynamic(
  () => import('@/components/LandingPage/VentilationCalculatorHero'),
);
const WellcomeScrollSect2 = dynamic(() =>
  import('@/components/LandingPage/WellcomeScrollSect2').then(
    (mod) => mod.WellcomeScrollSect2,
  ),
);

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: HomeProps): Promise<Metadata> {
  const { locale } = await params;

  return buildStaticPageMetadata('home', locale);
}

async function getLandingServices() {
  try {
    const services = await fetchPublicServices();

    return {
      services: services.slice(0, 5),
      hasServicesError: false,
    };
  } catch (error: unknown) {
    console.error('Landing services fetch failed', error);

    return {
      services: [],
      hasServicesError: true,
    };
  }
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const normalizedLocale = normalizeAppLocale(locale);
  const jsonLd = buildStaticPageJsonLd('home', locale);
  const { services, hasServicesError } = await getLandingServices();

  return (
    <main className='overflow-hidden '>
      <JsonLd data={jsonLd} />
      <div className='min-h-[100dvh] overflow-hidden  h-full w-full   flex flex-col'>
        <CompanyName />
        <WellcomeScrollSect2 />
      </div>

      <MotionInViewSection delay={0.3}>
        <SingleService
          hasServicesError={hasServicesError}
          locale={normalizedLocale ?? 'ka'}
          services={services}
        />
      </MotionInViewSection>
      <MotionInViewSection delay={0.3}>
        <VentilationCalculatorHero />
      </MotionInViewSection>
    </main>
  );
}
