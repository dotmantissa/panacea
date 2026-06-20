'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#bef542',
          logo: '/logo.png',
        },
        loginMethods: ['email'],
      }}
    >
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
}
