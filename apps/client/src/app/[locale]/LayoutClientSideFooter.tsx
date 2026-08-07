'use client';
import Footer from '@/components/Footer/Footer';
import MotionInViewSection from '@/components/ui/MotionInViewSectionProps';

import { usePathname } from 'next/navigation';
import React from 'react';

const LayoutClientSide = () => {
  const pathName = usePathname();

  if (pathName.includes('/admin')) return null;

  return (
    <MotionInViewSection delay={0.3}>
      {' '}
      <Footer />
    </MotionInViewSection>
  );
};

export default LayoutClientSide;
