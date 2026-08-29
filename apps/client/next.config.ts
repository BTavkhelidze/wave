import type { NextConfig } from 'next';
import path from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

const remoteImageHostnames = [
  'betawave.hel1.your-objectstorage.com',
  'fiverr-res.cloudinary.com',
  'files.oaiusercontent.com',
  'i.pinimg.com',
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(',') ?? []),
]
  .map((hostname) => hostname.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  images: {
    remotePatterns: remoteImageHostnames.map((hostname) => ({
      protocol: 'https',
      hostname,
    })),
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ka/home',
        permanent: true,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
