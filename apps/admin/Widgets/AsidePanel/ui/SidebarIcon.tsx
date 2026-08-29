import type { ComponentProps } from 'react';

import type { SidebarIconName } from '../model/sidebar.types';

type SidebarIconProps = {
  name: SidebarIconName;
} & Omit<ComponentProps<'svg'>, 'children' | 'viewBox'>;

const iconPaths: Record<SidebarIconName, string[]> = {
  dashboard: [
    'M4 5.75A1.75 1.75 0 0 1 5.75 4h4.5A1.75 1.75 0 0 1 12 5.75v4.5A1.75 1.75 0 0 1 10.25 12h-4.5A1.75 1.75 0 0 1 4 10.25v-4.5Z',
    'M14 5.75A1.75 1.75 0 0 1 15.75 4h2.5A1.75 1.75 0 0 1 20 5.75v2.5A1.75 1.75 0 0 1 18.25 10h-2.5A1.75 1.75 0 0 1 14 8.25v-2.5Z',
    'M14 13.75A1.75 1.75 0 0 1 15.75 12h2.5A1.75 1.75 0 0 1 20 13.75v4.5A1.75 1.75 0 0 1 18.25 20h-2.5A1.75 1.75 0 0 1 14 18.25v-4.5Z',
    'M4 15.75A1.75 1.75 0 0 1 5.75 14h4.5A1.75 1.75 0 0 1 12 15.75v2.5A1.75 1.75 0 0 1 10.25 20h-4.5A1.75 1.75 0 0 1 4 18.25v-2.5Z',
  ],
  analytics: [
    'M5 19V10',
    'M12 19V5',
    'M19 19v-7',
    'M3 19h18',
  ],
  users: [
    'M16 19c0-2.2-2.7-4-6-4s-6 1.8-6 4',
    'M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M20 19c0-1.8-1.5-3.3-3.8-3.8',
    'M15 5.3a3 3 0 0 1 0 5.4',
  ],
  userPlus: [
    'M15 19c0-2.2-2.7-4-6-4s-6 1.8-6 4',
    'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    'M18 8v6',
    'M15 11h6',
  ],
  services: [
    'M5 7.75A2.75 2.75 0 0 1 7.75 5h8.5A2.75 2.75 0 0 1 19 7.75v8.5A2.75 2.75 0 0 1 16.25 19h-8.5A2.75 2.75 0 0 1 5 16.25v-8.5Z',
    'M9 9h6',
    'M9 12h6',
    'M9 15h3',
  ],
  blogs: [
    'M6.5 4.5h8.25L19 8.75v10.75H6.5A1.5 1.5 0 0 1 5 18V6a1.5 1.5 0 0 1 1.5-1.5Z',
    'M14.5 4.5V9H19',
    'M8.5 12h7',
    'M8.5 15h5',
  ],
  logs: [
    'M7 5h10',
    'M7 9h10',
    'M7 13h6',
    'M5.75 20h12.5A1.75 1.75 0 0 0 20 18.25V5.75A1.75 1.75 0 0 0 18.25 4H5.75A1.75 1.75 0 0 0 4 5.75v12.5A1.75 1.75 0 0 0 5.75 20Z',
    'M8 17h1',
  ],
  messages: [
    'M4.75 6.75A1.75 1.75 0 0 1 6.5 5h11a1.75 1.75 0 0 1 1.75 1.75v10.5A1.75 1.75 0 0 1 17.5 19h-11a1.75 1.75 0 0 1-1.75-1.75V6.75Z',
    'm5.25 3.5 4.9 3.6a1.5 1.5 0 0 0 1.8 0l4.9-3.6',
  ],
};

export function SidebarIcon({ name, className, ...props }: SidebarIconProps) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='1.8'
      viewBox='0 0 24 24'
      {...props}
    >
      {iconPaths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
