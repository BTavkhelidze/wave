'use client';

import React, { useState } from 'react';
// import Calculator from '../Calculator/Calculator';
import { Calculator } from '../../../public';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

function VentilationCalculatorHero() {
  const { locale } = useParams();
  const t = useTranslations('VentilationHero');
  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <section className='w-full max-w-[1440px] flex  mx-auto my-16  2xl:mx-auto xl:pb-10 flex-col sm:flex-row items-center gap-10'>
      <div className='flex-1  text-center sm:text-start'>
        <h2 className=' mb-4 text-lg text-white'>{t('title')}</h2>
        <p className='text-[#898D8E] mb-6 font-light '>{t('description')}</p>
        <Link
          href={`/${locale}/calculator`}
          className='text-white mt-6 text-sm flex gap-2 cursor-pointer items-center  justify-center sm:justify-start'
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          {t('btnTitle')}
          <motion.span
            className=''
            initial={{ x: 0 }}
            animate={isHover ? { x: 10 } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ChevronRight />
          </motion.span>
        </Link>
      </div>

      <div className='flex-1 flex justify-end '>
        <Image src={Calculator} alt='calculator' width={200} className='' />
      </div>
    </section>
  );
}

export default VentilationCalculatorHero;
