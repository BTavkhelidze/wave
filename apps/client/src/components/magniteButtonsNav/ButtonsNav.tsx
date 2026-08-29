'use client';

import { useState, FC } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';

interface IType {
  onSetOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ButtonNav: FC<IType> = ({ onSetOpen }) => {
  const [active, setActive] = useState('');
  const pathName = usePathname();

  const t = useTranslations('HeaderNav');
  const handleClick = () => {
    if (onSetOpen) {
      setTimeout(() => {
        onSetOpen((prev) => !prev);
      }, 300);
    }
  };
  return (
    <>
      <nav className='flex lg:flex-row flex-col  gap-6'>
        <Link
          href={'/home'}
          className={`sm:text-sm text-xs font-light tracking-wide relative transition-colors duration-200 ${
            active.includes('home') ? 'text-[#FFFFFF] ' : 'text-[#F9F9F9] '
          } hover:text-white`}
          onClick={() => handleClick()}
          onMouseEnter={() => setActive('home')}
          onMouseLeave={() => setActive('')}
        >
          {t('Home')}
          {active === 'home' && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'home' ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          )}
          {pathName.includes('home') && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'services' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
        </Link>

        <Link
          onClick={() => handleClick()}
          href='/calculator'
          className={`sm:text-sm  text-xs  font-light tracking-wide relative transition-colors duration-200 ${
            active.includes('calculator')
              ? 'text-[#FFFFFF] '
              : 'text-[#F9F9F9] '
          } hover:text-white`}
          onMouseEnter={() => setActive('calculator')}
          onMouseLeave={() => setActive('')}
        >
          {t('Calculator')}
          {active === 'calculator' && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'calculator' ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          )}
          {pathName.includes('calculator') && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'services' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
        </Link>

        <Link
          onClick={() => handleClick()}
          href='/services'
          className={`sm:text-sm text-xs font-light tracking-wide relative transition-colors duration-200 ${
            active === 'services' ? 'text-[#FFFFFF] ' : 'text-[#F9F9F9] '
          } hover:text-white`}
          onMouseEnter={() => setActive('services')}
          onMouseLeave={() => setActive('')}
        >
          {t('Services')}
          {active === 'services' && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'services' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
          {pathName.includes('services') && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'services' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
        </Link>
        <Link
          onClick={() => handleClick()}
          href='/blogs'
          className={`sm:text-sm text-xs font-light tracking-wide relative transition-colors duration-200 ${
            active === 'blogs' ? 'text-[#FFFFFF] ' : 'text-[#F9F9F9] '
          } hover:text-white`}
          onMouseEnter={() => setActive('blogs')}
          onMouseLeave={() => setActive('')}
        >
          {t('Blogs')}
          {active === 'blogs' && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'blogs' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
          {pathName.includes('blogs') && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'blogs' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
        </Link>
        <Link
          onClick={() => handleClick()}
          href='/aboutUs'
          className={`sm:text-sm text-xs font-light tracking-wide relative transition-colors duration-200 ${
            active === 'services' ? 'text-[#FFFFFF] ' : 'text-[#F9F9F9] '
          } hover:text-white`}
          onMouseEnter={() => setActive('aboutUs')}
          onMouseLeave={() => setActive('')}
        >
          {t('AboutUs')}
          {active === 'aboutUs' && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'aboutUs' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
          {pathName.includes('aboutUs') && (
            <span
              className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full mt-2 ${
                active === 'aboutUs' ? 'bg-white' : 'bg-gray-400 '
              }`}
            />
          )}
        </Link>
      </nav>
    </>
  );
};
