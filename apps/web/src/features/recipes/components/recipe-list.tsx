import { SearchX } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useRecipes } from '../api/get-recipes';
import { RecipeCard } from './recipe-card';

const gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

/** Every recipe, filtered by name. The search comes from the page, so it can live in the URL. */
export function RecipeList({
  search,
  onClearSearch,
}: {
  search: string;
  onClearSearch: () => void;
}) {
  const { data, isError, refetch } = useRecipes();

  // A failed background refresh keeps the recipes already shown, so the error only replaces
  // the list when there's nothing to show.
  if (!data && !isError) {
    return (
      <>
        <p role="status" className="sr-only">
          Loading recipes
        </p>
        <ul className={gridClassName} aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-32 rounded-xl" />
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load the recipes</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const term = search.trim();
  const recipes = term
    ? data.filter((recipe) => recipe.name.toLowerCase().includes(term.toLowerCase()))
    : data;

  return (
    <>
      {/* Read out as the results change. Hidden when nothing matches, as the empty state says it. */}
      <p role="status" className={cn('text-muted-foreground', recipes.length === 0 && 'sr-only')}>
        {term && matchCount(recipes.length, term)}
      </p>
      {recipes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>
              <h2 className="text-lg">No recipes match “{term}”</h2>
            </EmptyTitle>
            <EmptyDescription>Try part of a name, like “soup” or “chicken”.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ul className={gridClassName}>
          {recipes.map((recipe) => (
            <li key={recipe.slug}>
              <RecipeCard recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function matchCount(count: number, term: string) {
  if (count === 0) return `No recipes match “${term}”`;
  return `${count} ${count === 1 ? 'recipe matches' : 'recipes match'} “${term}”`;
}
