import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { queryConfig } from '@/lib/react-query';

export function AppProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: queryConfig }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
