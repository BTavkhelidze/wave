import Calculator from '@/components/Calculator/Calculator';
import CompanyName from '@/components/LandingPage/companyName';
import { getTranslations } from 'next-intl/server';

async function page() {
  const calcI8N = await getTranslations('calculator');
  return (
    <main className='relative flex-1   w-full  justify-center items-center  flex flex-col pt-0 md:pt-30  pb-[50px] xl:px-[8%] px-6'>
      <div className='w-full' id='top'></div>
      <div className='w-full'>
        <CompanyName />
      </div>
      <div className='max-w-[1440px] mx-auto my-20 w-full '>
        <div className='flex justify-between lg:flex-row flex-col items-center text-center  w-full'>
          <h1 className='text-xl text-gray-400 font-semibold mb-4'>
            {calcI8N('title')}
          </h1>
          <p className='text-gray-300  max-w-2xl text-[14px] lg:text-base'>
            {calcI8N('mainDescription')}
          </p>
        </div>
        <Calculator />
      </div>
    </main>
  );
}

export default page;
