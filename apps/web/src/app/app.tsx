import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';

import { AppShell } from '@/components/layout/app-shell';
import { paths } from '@/config/paths';

import { PlanRoute } from './routes/plan';

// Only the Plan page is in the first download. The rest load when first opened (PLAN.md §5).
const RecipesRoute = lazy(() => import('./routes/recipes'));
const ShoppingListRoute = lazy(() => import('./routes/shopping-list'));
const PreferencesRoute = lazy(() => import('./routes/preferences'));
const NotFoundRoute = lazy(() => import('./routes/not-found'));

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path={paths.plan} element={<PlanRoute />} />
          <Route path={paths.recipes} element={<RecipesRoute />} />
          <Route path={paths.shoppingList} element={<ShoppingListRoute />} />
          <Route path={paths.preferences} element={<PreferencesRoute />} />
          <Route path="*" element={<NotFoundRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
