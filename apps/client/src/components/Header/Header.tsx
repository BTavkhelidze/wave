import React from 'react';

import LanguageDropdown from '../ui/LanguageDropdown';
import BurgerMenu from './BurgerMenu';
import Link from 'next/link';
import { ButtonNav } from '../magniteButtonsNav/ButtonsNav';

function Header() {
  return (
    <header className='fixed  z-60 xl:px-[8%] top-10 w-full flex items-center justify-center '>
      <div className='relative    w-full  mx-2 rounded-[250px] 2xl:mx-auto   text-white border border-neutral-500'>
        <div className='absolute w-full h-full opacity-90  bg-[#0D1113]  rounded-[250px]'></div>
        <div className='flex items-center  justify-between py-2  md:py-3 px-5 '>
          <div className='sm:pl-2 z-10 flex items-center justify-center'>
            <h1 className='cursor-pointer'>
              <Link href={'/home'}>Wave</Link>{' '}
            </h1>
          </div>
          <div className='lg:flex hidden justify-center items-center gap-1 sm:gap-2'>
            <ButtonNav />
            <LanguageDropdown />
          </div>
          <BurgerMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
