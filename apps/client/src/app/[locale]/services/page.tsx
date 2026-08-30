import dynamic from 'next/dynamic';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildStaticPageJsonLd, buildStaticPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

const CompanyName = dynamic(() => import('@/components/LandingPage/companyName'));
const ServisesListS2 = dynamic(
  () => import('@/components/services/ServisesListS2'),
);

type ServicesPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildStaticPageMetadata('services', locale);
}

async function page({ params }: ServicesPageProps) {
  const { locale } = await params;
  const jsonLd = buildStaticPageJsonLd('services', locale);

  return (
    <main className='relative xl:px-[8%] flex-1   w-full  justify-center items-center  flex flex-col pt-0 md:pt-30    pb-[50px]'>
      <JsonLd data={jsonLd} />
      <div className='w-full' id='top'></div>
      <div className='w-full'>
        <CompanyName />
      </div>
      <div className='my-20 w-full'>
        <ServisesListS2 />
      </div>
    </main>
  );
}

export default page;
