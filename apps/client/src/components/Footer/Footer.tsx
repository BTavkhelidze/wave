'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useMenu } from '@/store/useMenu';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import LabelInputContainer from '../ui/label-input-container';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ContactUs from './ContactUs';

function Footer() {
  const closeMenu = useMenu((state) => state.closeMenu);
  const isOpen = useMenu((state) => state.open);

  const contactT = useTranslations('Contact');
  const about = useTranslations('FooterAbout');
  useGSAP(() => {
    gsap.to('#contactUsDiv', {
      opacity: 1,
      x: isOpen ? '-100%' : '0%',
      duration: 0.4,
    });
  }, [isOpen]);

  return (
    <>
      <footer className='relative z-50    text-white'>
        <div className='max-w-[1440px] w-full mx-auto   xl:px-0 pb-12 flex flex-col relative'>
          <div className='flex mb-4 min-h-[260px]  justify-between gap-10 md:flex-row flex-col '>
            <div className='flex max-w-[500px] w-full b order-2 lg:-order-1  items-center justify-center lg:justify-center'>
              <ContactUs />
            </div>
            <div className=' flex max-w-[420px] flex-col py-10  '>
              <h2 className='text-2xl font-semibold mb-4'>
                {contactT('title')}
              </h2>

              <div className='text-gray-200   text-start md:text-start'>
                <p>
                  <span className='text-gray-400 text-base'>
                    {contactT('ProjectDirection')}:{' '}
                  </span>
                  <a href='tel: +995568684389'>(+995) 568 68 43 89</a>
                </p>
                <p>
                  {' '}
                  <span className='text-gray-400 '>
                    {contactT('InstalationDirection')}:{' '}
                  </span>{' '}
                  <a href='tel: +995598682899'> (+995) 598 68 28 99</a>
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col items-center md:items-start md:flex-row flex-wrap justify-between  md:gap-4 gap-8 lg:gap-8 mb-4'></div>

          <div className='flex flex-col sm:flex-row justify-between items-center border-t border-dotted border-gray-600 pt-6 text-sm gap-4'>
            <p className='text-center sm:text-start'>
              ©2025 WAVE. {about('copyrightText')}.
            </p>
          </div>
        </div>
      </footer>

      <div
        id='contactUsDiv'
        className='fixed cursor-pointer top-0 w-full right-[-100%]  h-full  z-[999] flex justify-end '
        onClick={() => closeMenu()}
      >
        <div
          className='md:w-[70%] w-[80%] lg:w-[600px] p-12 h-full cursor-default bg-[#18181B]'
          onClick={(e) => e.stopPropagation()}
        >
          <form action='' className='bg-white'>
            <LabelInputContainer>
              <Label htmlFor='name'></Label>
              <Input id='name' type='text' placeholder='Name' />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor='email'></Label>
              <Input id='email' type='email' placeholder='Email' />
            </LabelInputContainer>
            <LabelInputContainer className='border   '>
              <Label htmlFor='message'></Label>
              <textarea
                id='message'
                placeholder='Message'
                className='dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600'
              />
            </LabelInputContainer>
          </form>
        </div>
      </div>
    </>
  );
}

export default Footer;
