import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const remoteImageHostnames = [
  'fiverr-res.cloudinary.com',
  'files.oaiusercontent.com',
  'i.pinimg.com',
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(',') ?? []),
]
  .map((hostname) => hostname.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  /* config options here */
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
