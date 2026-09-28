import { CalendarCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import type { Recipe } from '@nosh/shared/recipes';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api-client';
import { formatDays, formatMealTypes } from '@/utils/format';

import { useRecipe } from '../api/get-recipe';
import { RecipeBadges } from './recipe-badges';

/**
 * A recipe's page content. `notFound` is shown for a recipe that doesn't exist, and `actions`
 * (such as the page's "Add to plan") go under the badges.
 */
export function RecipeDetails({
  slug,
  notFound,
  actions,
}: {
  slug: string;
  notFound: ReactNode;
  actions?: (recipe: Recipe) => ReactNode;
}) {
  const { data: recipe, error, refetch } = useRecipe({ slug });

  if (error instanceof ApiError && error.status === 404) return notFound;

  if (!recipe && !error) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="sr-only">
          Loading the recipe
        </p>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load this recipe</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return <RecipeArticle recipe={recipe} actions={actions?.(recipe)} />;
}

function RecipeArticle({ recipe, actions }: { recipe: Recipe; actions: ReactNode }) {
  return (
    <article className="flex flex-col gap-6">
      <title>{`${recipe.name} · Nosh`}</title>
      {/* Stacked on phones. From lg, the details on the left, and the actions and when it's planned
          on the right, so the header uses the page's width. */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl">{recipe.name}</h1>
          <p className="text-muted-foreground">
            {formatMealTypes(recipe.mealTypes)} · Serves {recipe.serves}
          </p>
          <RecipeBadges recipe={recipe} />
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          {actions}
          {recipe.plannedOn.length > 0 && (
            <p className="flex items-center gap-2">
              <CalendarCheck aria-hidden className="size-4 shrink-0" />
              Planned for {formatDays(recipe.plannedOn)}
            </p>
          )}
        </div>
      </header>
      <Separator />

      {/* One column on phones. From lg, the ingredients take one column and stay in view while the
          method, in the other two, scrolls. Both start at the same line. */}
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <section className="flex flex-col gap-3 lg:sticky lg:top-6">
          <h2 className="text-lg">Ingredients</h2>
          {/* One bordered list, like the shopping list. */}
          <ul className="flex flex-col divide-y rounded-xl border px-4">
            {recipe.ingredients.map((line, index) => (
              <li key={index} className="py-3">
                {line.amount && <span className="font-semibold">{line.amount} </span>}
                {line.name}
                {line.prep && <span className="text-muted-foreground">, {line.prep}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="text-lg">Method</h2>
          {/* Numbered in circles rather than list markers. role="list" keeps it a list for Safari's
              screen reader, which drops it once the markers are gone. */}
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- see above */}
          <ol role="list" className="flex flex-col gap-4">
            {recipe.method.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-heading text-sm font-bold">
                  {index + 1}
                </span>
                <p className="pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
