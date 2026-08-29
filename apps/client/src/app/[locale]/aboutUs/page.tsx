'use client';
import React from 'react';
import { Clutch, Group, Plumb } from '../../../../public';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
function AboutUs() {
  const t = useTranslations('AboutUs');
  return (
    <main className='w-full flex pt-[100px] text-center '>
      <div className='max-w-[1260px] min-h-[140vh] mb-10 px-6 flex flex-col  mx-auto w-full text-white'>
        <div className='w-full flex-4 md:flex-1 flex flex-col md:flex-row  h-full '>
          <p className='mb-2 md:mb-10 flex-1 md:max-w-[50%] text-sm sm:text-base md:text-xl font-light flex justify-center items-center h-full'>
            {t('firstText')}
          </p>
          <div className='w-full  h-full hidden md:flex :mt-20  justify-end md:justify-center flex-1 '>
            <Image
              src={Group}
              alt='engeenering icon'
              className='h-full w-[20%] md:w-[50%]  object-contain'
            />
          </div>
        </div>
        <div className='w-full  h-[100px] my-2 md:my-10'>
          <Image
            src={Clutch}
            alt='Clutch decoration '
            className='h-full object-contain'
          />
        </div>
        <div className='flex-1 flex w-full flex-col md:flex-row mt-6 md:mt-0 pt-4'>
          <div className='flex-1 order-1 md:flex hidden md:-order-1'>
            <Image
              src={Plumb}
              alt='Plumb icon'
              className=' h-full  w-[20%] md:w-[60%]'
            />
          </div>
          <p className='flex-1 text-sm sm:text-base md:text-xl font-light'>
            {t('secondText')}
          </p>
        </div>
      </div>
    </main>
  );
}

export default AboutUs;
