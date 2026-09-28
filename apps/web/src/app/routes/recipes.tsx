import { Plus } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import type { RecipeSummary } from '@nosh/shared/recipes';

import { PageHeader } from '@/components/layout/page-header';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { paths } from '@/config/paths';
import { KitchenMatches } from '@/features/kitchen/components/kitchen-matches';
import { KitchenPicker } from '@/features/kitchen/components/kitchen-picker';
import { PreferencesSummary } from '@/features/preferences/components/preferences-summary';
import { useIngredients } from '@/features/recipes/api/get-ingredients';
import { RecipeList } from '@/features/recipes/components/recipe-list';
import { RecipeSearch } from '@/features/recipes/components/recipe-search';

const RecipeAddToPlanSheet = lazy(() => import('./recipe-add-to-plan-sheet'));

type Adding = { recipe: Pick<RecipeSummary, 'slug' | 'name'>; open: boolean; opened: number };

/**
 * All recipes, or those ranked by what's in your kitchen (F8). Both views are kept in the URL
 * (`?q=` and `?view=kitchen`), so going back to the page keeps them.
 */
export default function RecipesRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const view = searchParams.get('view') === 'kitchen' ? 'kitchen' : 'all';
  const searchRef = useRef<HTMLInputElement>(null);
  // Only the kitchen picker needs them, so they're fetched when that tab is first opened.
  const { data: ingredients = [] } = useIngredients({
    queryConfig: { enabled: view === 'kitchen' },
  });
  // `opened` counts openings. It's the sheet's key, so each opening starts again from today.
  const [adding, setAdding] = useState<Adding | null>(null);

  // Replaced, not pushed, so each keystroke isn't a step in the history.
  const setParam = (name: string, value: string | null) =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (value) next.set(name, value);
        else next.delete(name);
        return next;
      },
      { replace: true },
    );

  return (
    <>
      <title>Recipes · Nosh</title>
      <PageHeader
        title="Recipes"
        description="Find something to cook, or add a recipe of your own."
        action={
          // Green, as the page's own action.
          <Link to={paths.newRecipe} className={buttonVariants()}>
            <Plus data-icon="inline-start" />
            New recipe
          </Link>
        }
      />
      <Tabs
        value={view}
        onValueChange={(value) => setParam('view', value === 'kitchen' ? 'kitchen' : null)}
      >
        <TabsList>
          <TabsTrigger value="all">All recipes</TabsTrigger>
          <TabsTrigger value="kitchen">From your kitchen</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="flex flex-col gap-4 pt-2">
          <RecipeSearch ref={searchRef} value={search} onChange={(value) => setParam('q', value)} />
          <RecipeList
            search={search}
            preferences={<PreferencesSummary />}
            onClearSearch={() => {
              setParam('q', null);
              searchRef.current?.focus();
            }}
          />
        </TabsContent>
        <TabsContent value="kitchen" className="flex flex-col gap-4 pt-2">
          <KitchenPicker ingredients={ingredients} />
          <KitchenMatches
            preferences={<PreferencesSummary />}
            onAddToPlan={(recipe) =>
              setAdding((previous) => ({ recipe, open: true, opened: (previous?.opened ?? 0) + 1 }))
            }
          />
        </TabsContent>
      </Tabs>
      {adding && (
        <Suspense fallback={null}>
          <RecipeAddToPlanSheet
            key={adding.opened}
            recipe={adding.recipe}
            open={adding.open}
            onOpenChange={(open) => setAdding((previous) => previous && { ...previous, open })}
          />
        </Suspense>
      )}
    </>
  );
}
