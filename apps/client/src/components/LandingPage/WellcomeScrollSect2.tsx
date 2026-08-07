'use client';

import { motion, type Variants } from 'framer-motion';

import { useTranslations } from 'next-intl';
import { TextGenerateEffect } from '../ui/text-generate-effect';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function WellcomeScrollSect2() {
  const t = useTranslations('AboutUsHero');
  const words = `${t('title')}`;

  return (
    <motion.div
      className='relative px-6  xl:px-0 w-full  mx-auto flex  flex-col md:flex-row items-center max-w-[1440px]  xl:gap-8 sm:gap-6  flex-1'
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className='flex-1 justify-items-start'
        variants={itemVariants}
      >
        <div className='hidden xl:inline-block'>
          <TextGenerateEffect
            words={words}
            duration={1.2}
            className='text-2xl tracking-wide text-gray-800 dark:text-white leading-tight'
          />
        </div>
        <div className='hidden md:inline-block xl:hidden'>
          <TextGenerateEffect
            words={words}
            duration={1.2}
            className='text-xl tracking-wide text-gray-800 dark:text-white leading-tight'
          />
        </div>
        <div className='md:hidden'>
          <TextGenerateEffect
            words={words}
            duration={1.2}
            className='text-lg text-center tracking-wide text-gray-800 dark:text-white leading-tight'
          />
        </div>
      </motion.div>

      <motion.div
        className='flex-1 flex justify-center'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.6 }}
      >
        <p className='text-gray-600 dark:text-gray-400 lg:text-base text-sm text-center md:text-start leading-relaxed max-w-md'>
          {t('EngineeringText')}
        </p>
      </motion.div>
    </motion.div>
  );
}
