'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import { motion } from 'framer-motion';

import { WavyBackground } from '../ui/wavy-background';
import { IServices } from '@/Interface/Interface';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface SingleServiceProps {
  service: string;
}

function SingleService({ service }: SingleServiceProps) {
  const [curIndex, setCurIndex] = useState<number | null>(null);
  const [isHover, setIsHover] = useState<boolean>(false);

  const {
    data: services,
    isFetching,
    isError,
  } = useQuery<IServices[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/Services');
      return res.json();
    },
  });

  useEffect(() => {
    if (!services) return;

    const index = services.findIndex((el) => el.id === +service);

    if (index !== -1) {
      setCurIndex(index);
    } else {
      setCurIndex(0);
    }
  }, [service, services]);

  if (isFetching || curIndex === null)
    return (
      <div className='absolute z-60 inset-0 bg-[#0B1012] flex items-center justify-center'>
        <p>Loading...</p>
      </div>
    );

  const currentService = services![curIndex];

  const IconComponent =
    FaIcons[currentService.icon as keyof typeof FaIcons] || FaIcons.FaTools;

  const handlePrev = () => {
    if (curIndex > 0) {
      setCurIndex((prev) => prev! - 1);
    }
  };

  const handleNext = () => {
    if (curIndex < services!.length - 1) {
      setCurIndex((prev) => prev! + 1);
    }
  };
  if (isError)
    return (
      <div className='absolute z-60 inset-0 flex items-center justify-center'>
        <p className='text-white'>Error loading service.</p>
      </div>
    );

  return (
    <main className='max-w-[1440px] overflow-hidden mx-auto px-[2%] pt-30 flex flex-col h-screen '>
      <Link
        href='/services'
        className='flex gap-2 items-center '
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <FaIcons.FaAngleLeft />
        <motion.span
          initial={{ x: 0 }}
          animate={isHover ? { x: 10 } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Go Back
        </motion.span>
      </Link>

      <section className='w-full  overflow-hidden overflow-y-visible flex-1 flex flex-col items-center  text-center   justify-center  '>
        <div className='mb-4 absolute  overflow-hidden -top-50 left-0 w-full h-full -z-1'>
          <WavyBackground
            className='w-full h-[10%]'
            colors={currentService?.colors}
          ></WavyBackground>
        </div>

        <div
          key={curIndex}
          className='flex flex-col gap-10 max-w-[100%] w-full md:max-w-[80%] lg:max-w-[70%] px-6 sm:px-10 md:px-14 '
        >
          <IconComponent
            className={cn(`text-2xl md:text-4xl self-center mt-10`)}
            style={{ color: `${currentService.iconColor}` }}
          />
          <h2 className='text-lg sm:text-xl md:text-4xl lg:text-3xl font-bold inter-var text-center text-white '>
            {currentService?.title_ka || currentService?.title_en}
          </h2>
          <p className='text-sm sm:text-base text-[#898D8E]'>
            {currentService?.description_ka || currentService?.description_en}
          </p>
        </div>

        <div className='absolute bottom-10 right-10 z-10 flex gap-4'>
          {curIndex > 0 && (
            <motion.button
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              type='button'
              title='Prev'
              className='flex gap-1 items-center px-3 py-2 justify-center bg-[#141C1D] text-sm rounded-sm cursor-pointer'
              onClick={handlePrev}
            >
              <FaIcons.FaAngleLeft /> PREV
            </motion.button>
          )}

          {curIndex < services!.length - 1 && (
            <motion.button
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              type='button'
              title='Next'
              className='flex gap-1 items-center px-3 py-2 justify-center bg-[#141C1D] text-sm rounded-sm cursor-pointer'
              onClick={handleNext}
            >
              NEXT <FaIcons.FaAngleRight />
            </motion.button>
          )}
        </div>
      </section>
    </main>
  );
}

export default SingleService;
