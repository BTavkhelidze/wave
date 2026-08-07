'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const langMap: Record<string, 'GEO' | 'EN'> = { ka: 'GEO', en: 'EN' };

const LanguageSwitcher: React.FC = () => {
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const currentLanguage = langMap[params?.locale || 'en'] || 'EN';
  const newLocale = currentLanguage === 'EN' ? 'ka' : 'en';
  const [isOpen, setIsOpen] = useState(false);

  const getPathWithLocale = (locale: string): string => {
    if (!pathname || !params?.locale) return '/';
    return `/${locale}${pathname.slice(3)}`;
  };

  const handleLanguageChange = () => {
    setIsOpen(false);
    router.push(getPathWithLocale(newLocale));
  };

  return (
    <div className='relative z-50'>
      <div
        className='relative'
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className={`cursor-pointer px-3 py-1.5 w-[48px] text-center rounded-md text-sm font-light transition-colors duration-200 ${
            isOpen ? ' bg-gray-700' : 'bg-transparent'
          } text-gray-300 hover:bg-gray-700`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {currentLanguage}
        </button>
        <div
          className={`absolute -bottom-8  w-full rounded-md overflow-hidden transition-all duration-200 transform ${
            isOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-1 pointer-events-none'
          } bg-gray-800 z-50 border border-gray-700`}
        >
          <button
            onClick={handleLanguageChange}
            className={`w-full px-3 py-1.5 text-sm font-light text-gray-300 hover:bg-gray-700 transition-colors duration-200 cursor-pointer`}
          >
            {newLocale === 'en' ? 'EN' : 'GEO'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
