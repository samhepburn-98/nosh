import { Suspense } from 'react';
import { Outlet } from 'react-router';

import { TabBar } from './tab-bar';
import { TopBar } from './top-bar';

/** Every page sits in this width. Pages never set their own `max-w-*` or `mx-auto`. */
export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <TabBar />
    </div>
  );
}
