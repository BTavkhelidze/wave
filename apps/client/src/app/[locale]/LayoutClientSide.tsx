'use client';
import Header from '@/components/Header/Header';
import { usePathname } from 'next/navigation';
import React from 'react';

const LayoutClientSide = () => {
  const pathName = usePathname();

  if (pathName.includes('/admin')) return null;

  return <Header />;
};

export default LayoutClientSide;
