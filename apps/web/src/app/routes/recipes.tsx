import { useRef } from 'react';
import { useSearchParams } from 'react-router';

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
      {/* The search sits in the first column of the card grid, so it lines up with the cards. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RecipeSearch ref={searchRef} value={search} onChange={setSearch} />
      </div>
      <RecipeList
        search={search}
        onClearSearch={() => {
          setSearch('');
          searchRef.current?.focus();
        }}
      />
    </>
  );
}
