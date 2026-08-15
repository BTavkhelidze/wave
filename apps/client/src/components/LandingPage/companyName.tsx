'use client';
import React from 'react';

import { Spotlight } from '../ui/spotlight-new';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText, useGSAP);

function CompanyName() {
  useGSAP(() => {
    const companyNamePT = new SplitText('#companyName', {
      type: 'chars',
    });
    const tl = gsap.timeline();

    tl.fromTo(
      companyNamePT.chars,
      {
        duration: 1,
        opacity: 0,
        yPercent: 100,
      },
      {
        duration: 1,
        yPercent: 0,
        stagger: 0.1,

        opacity: 1,
      },
    ).to(
      '#CompanyDescText',
      {
        duration: 1,
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%) ',
      },
      '-=0.5',
    );
  }, []);

  return (
    <section className='w-full  flex-1 max-w-[1440px] px-6  xl:px-0   mx-auto pt-0 '>
      <div className='relative   pt-30  gap-6 flex flex-col  items-center justify-center h-full '>
        <div className=' w-full  z-10 h-full absolute top-0 left-0 '>
          <Spotlight />
        </div>
        <div className='overflow-hidden  '>
          <h1
            className='text-6xl relative   sm:text-9xl  font-bold text-[#3B82F6] overflow-hidden'
            id='companyName'
          >
            WAVE
          </h1>
        </div>
        <p
          className='justify-self-start bg-red font-light text-center text-lg md:text-xl lg:text-2xl text-[#898D8E]'
          style={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
          id='CompanyDescText'
        >
          {' '}
          Water Air Voltage Engeenering
        </p>
      </div>
    </section>
  );
}

export default CompanyName;
