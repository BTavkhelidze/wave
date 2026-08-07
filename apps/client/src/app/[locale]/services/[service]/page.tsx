import SingleService from '@/components/services/SingleService';
import React from 'react';

async function page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;

  return (
    <main className='text-white w-full overflow-hidden'>
      <SingleService service={service} />
    </main>
  );
}

export default page;
