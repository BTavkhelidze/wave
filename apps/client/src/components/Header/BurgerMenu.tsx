'use client';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { ButtonNav } from '../magniteButtonsNav/ButtonsNav';
import LanguageDropdown from '../ui/LanguageDropdown';

function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='block lg:hidden cursor-pointer z-60 overflow-hidden'>
      <div
        className='flex flex-col gap-[6px]   p-2'
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div
          className={cn(
            'bg-white w-4 h-[2px] transform origin-bottom transition-transform duration-300',
            isOpen ? 'rotate-45 origin-center translate-y-[200%]' : 'rotate-0'
          )}
        ></div>
        <div
          className={cn(
            'bg-white w-4 h-[2px] transform origin-center transition-transform duration-300',
            isOpen ? '-rotate-45 -translate-y-[200%]' : 'rotate-0'
          )}
        ></div>
      </div>
      <div
        className={cn(
          'fixed top-0 right-0 h-full mt-24 w-full   bg-[#0E1215] transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className='flex flex-col justify-center px-6  gap-1 sm:gap-2'>
          <div className='max-w-[350px] w-full flex flex-col gap-10 mt-10'>
            <ButtonNav onSetOpen={setIsOpen} />
            <div className='max-w-[200px]'>
              <LanguageDropdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BurgerMenu;
