import { useRef } from 'react';
import { useSearchParams } from 'react-router';

import { PreferencesSummary } from '@/features/preferences/components/preferences-summary';
import { RecipeList } from '@/features/recipes/components/recipe-list';
import { RecipeSearch } from '@/features/recipes/components/recipe-search';

export default function RecipesRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const searchRef = useRef<HTMLInputElement>(null);

  // Kept in the URL (?q=), so going back to the list keeps the search. Replaced, not pushed,
  // so each keystroke isn't a step in the history.
  const setSearch = (value: string) =>
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );

  return (
    <>
      <title>Recipes · Nosh</title>
      <h1 className="text-2xl">Recipes</h1>
      <RecipeSearch ref={searchRef} value={search} onChange={setSearch} />
      <RecipeList
        search={search}
        preferences={<PreferencesSummary />}
        onClearSearch={() => {
          setSearch('');
          searchRef.current?.focus();
        }}
      />
    </>
  );
}
