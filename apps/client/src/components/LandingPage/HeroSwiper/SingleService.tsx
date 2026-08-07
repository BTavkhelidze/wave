'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBolt, FaFireExtinguisher, FaFaucet } from 'react-icons/fa';
import { GiGearHammer } from 'react-icons/gi';
import { TbAirConditioning } from 'react-icons/tb';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ISingleServiceLanding } from '@/Interface/Interface';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';

function SingleService() {
  const [isHover, setIsHover] = useState<boolean>(false);

  const t = useTranslations('Services');

  const pathName = usePathname();

  const { locale } = useParams();

  const ka = pathName.includes('ka') ? true : false;

  const services: ISingleServiceLanding[] = [
    {
      id: ka ? 4 : 5,
      title: t('DesignAndInstallation'),
      icon: <GiGearHammer className='text-[rgb(37,99,235)] text-3xl' />,
    },
    {
      id: ka ? 4 : 5,
      title: t('Cooling'),
      icon: <TbAirConditioning className='text-blue-400 text-2xl' />,
    },
    {
      id: ka ? 7 : 6,
      title: t('FireSafety'),
      icon: <FaFireExtinguisher className='text-red-300 text-2xl' />,
    },
    {
      id: ka ? 11 : 10,
      title: t('Electrical'),
      icon: <FaBolt className='text-yellow-400 text-2xl' />,
    },
    {
      id: ka ? 8 : 9,
      title: t('Plumbing'),
      icon: <FaFaucet className='text-green-500 text-2xl' />,
    },
  ];

  return (
    <div
      className='w-full  max-w-[1440px] mx-auto my-6 px-6 
xl:px-0 
2xl:mx-auto '
    >
      <h2 className='text-white text-center sm:text-start'>
        {t('ServicesTitle')}
      </h2>
      <ul className='flex  gap-4 mt-4 w-full flex-col sm:flex-row xl:flex-nowrap flex-wrap justify-center sm:justify-start'>
        {services.map((ser, i) => {
          return (
            <li key={i} className='flex items-center justify-center '>
              <Link href={`/${locale}/services`} className='w-full text-center'>
                <motion.div
                  className='relative w-full  sm:w-[230px] h-[180px] cursor-pointer border border-[#18181B] bg-[#0C1013] rounded-[8px] overflow-hidden flex items-center justify-center '
                  whileHover={{
                    scale: [null, 1.04],
                    transition: {
                      duration: 0.5,
                      times: [0, 0.6],
                      ease: ['easeInOut', 'easeOut'],
                    },
                  }}
                  transition={{
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                >
                  {ser.icon}
                  <div className='absolute w-full text-base h-[55px] flex items-center bg-[#18181B] text-white bottom-0 text-start px-2'>
                    {ser.title}
                  </div>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        href={`/${locale}/services`}
        className='text-white mt-6 text-sm flex gap-2 cursor-pointer items-center justify-center sm:justify-start '
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        {t('SeeAllServises')}
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
  );
}

export default SingleService;
