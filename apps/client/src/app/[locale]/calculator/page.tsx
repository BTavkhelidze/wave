import Calculator from '@/components/Calculator/Calculator';
import { getTranslations } from 'next-intl/server';

async function page() {
  const calcI8N = await getTranslations('calculator');
  return (
    <main className='max-w-[1440px]  w-full min-h-screen mx-auto pt-8 xl:pt-20'>
      <div className='my-6 flex justify-between     text-center'>
        <h1 className='text-xl text-gray-400 font-semibold mb-4'>
          {calcI8N('title')}
        </h1>
        <p className='text-gray-300  max-w-2xl'>{calcI8N('mainDescription')}</p>
      </div>
      <Calculator />
    </main>
  );
}

export default page;
