import dynamic from 'next/dynamic';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildStaticPageJsonLd, buildStaticPageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

const BlogsList = dynamic(() => import('@/components/Blogs/BlogsList'));
const CompanyName = dynamic(() => import('@/components/LandingPage/companyName'));

type BlogsPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: BlogsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildStaticPageMetadata('blogs', locale);
}

async function page({ params }: BlogsPageProps) {
  const { locale } = await params;
  const jsonLd = buildStaticPageJsonLd('blogs', locale);

  return (
    <main className='relative flex-1   w-full  justify-center items-center  flex flex-col pt-0 md:pt-30    pb-[50px] xl:px-[8%]'>
      <JsonLd data={jsonLd} />
      <div className='w-full' id='top'></div>
      <div className='w-full'>
        <CompanyName />
      </div>
      <div className='my-10 w-full'>
        <BlogsList />
      </div>
    </main>
  );
}

export default page;
