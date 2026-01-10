'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { DPadNavigationProvider } from '@/contexts/dpad-navigation-context';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,        // 5 minutes (increased from 1 minute)
            gcTime: 30 * 60 * 1000,          // 30 minutes garbage collection time
            refetchOnWindowFocus: false,
            refetchOnMount: false,            // Don't refetch if data is fresh
            retry: 2,                         // Retry failed requests twice
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DPadNavigationProvider>
          {children}
        </DPadNavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
