'use client';
import Footer from '@/components/Footer/Footer';
import MotionInViewSection from '@/components/ui/MotionInViewSectionProps';

import React from 'react';

const LayoutClientSide = () => {
  return (
    <MotionInViewSection delay={0.3}>
      {' '}
      <Footer />
    </MotionInViewSection>
  );
};

export default LayoutClientSide;
