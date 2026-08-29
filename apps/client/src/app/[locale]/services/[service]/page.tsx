import SingleService from '@/components/services/SingleService';
import { fetchPublicServices } from '@/components/services/services.api';
import {
  getLocalizedServiceDescription,
  getLocalizedServiceMetaDescription,
  getLocalizedServiceMetaTitle,
  getLocalizedServiceTitle,
  matchesLocalizedServiceSlug,
} from '@/components/services/services.locale';
import type { Metadata } from 'next';
import React from 'react';

type ServicePageParams = {
  locale: string;
  service: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<ServicePageParams>;
}): Promise<Metadata> {
  const { locale, service: serviceParam } = await params;

  try {
    const services = await fetchPublicServices();
    const service = services.find((item) =>
      matchesLocalizedServiceSlug(item, locale, serviceParam),
    );

    if (!service) {
      return {
        title: 'Service not found',
      };
    }

    return {
      title:
        getLocalizedServiceMetaTitle(service, locale) ??
        getLocalizedServiceTitle(service, locale) ??
        'Service',
      description:
        getLocalizedServiceMetaDescription(service, locale) ??
        getLocalizedServiceDescription(service, locale),
    };
  } catch {
    return {
      title: 'Service',
    };
  }
}

async function page({ params }: { params: Promise<ServicePageParams> }) {
  const { service } = await params;

  return (
    <main className='text-white w-full overflow-hidden '>
      <SingleService service={service} />
    </main>
  );
}

export default page;
