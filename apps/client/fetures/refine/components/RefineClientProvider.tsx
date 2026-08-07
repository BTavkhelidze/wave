'use client';

import { Refine } from '@refinedev/core';
import { RefineThemes } from '@refinedev/antd';
import { ConfigProvider } from 'antd';
import routerProvider from '@refinedev/nextjs-router/app';
import { dataProvider } from '@refinedev/supabase';
import { supabase } from '@/lib/supabaseClient';
import { authProvider } from './authProvider';

export default function RefineClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal auth provider (mock)

  return (
    <ConfigProvider theme={RefineThemes.Blue}>
      <Refine
        dataProvider={dataProvider(supabase)}
        routerProvider={routerProvider}
        // authProvider={authProvider}
        resources={[
          {
            name: 'posts',
            list: '/posts',
            create: '/posts/create',
            edit: '/posts/edit/:id',
            show: '/posts/show/:id',
          },
        ]}
      >
        {children}
      </Refine>
    </ConfigProvider>
  );
}
