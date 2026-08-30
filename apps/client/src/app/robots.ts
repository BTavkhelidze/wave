import type { MetadataRoute } from 'next';

import { buildAbsolutePublicUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const sitemap = buildAbsolutePublicUrl('/sitemap.xml');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    ...(sitemap ? { sitemap } : {}),
  };
}
