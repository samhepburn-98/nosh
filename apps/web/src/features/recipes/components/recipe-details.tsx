import { CalendarCheck } from 'lucide-react';
import type { ReactNode } from 'react';

import type { Recipe } from '@nosh/shared/recipes';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl">{recipe.name}</h1>
        <p className="text-muted-foreground">
          {formatMealTypes(recipe.mealTypes)} · Serves {recipe.serves}
        </p>
        <RecipeBadges recipe={recipe} />
        {recipe.plannedOn.length > 0 && (
          <p className="flex items-center gap-2">
            <CalendarCheck aria-hidden className="size-4 shrink-0" />
            Planned for {formatDays(recipe.plannedOn)}
          </p>
        )}
        {actions}
      </header>

      {/* One column on phones. From lg, ingredients take one column and the method two. */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="flex flex-col gap-3">
          <h2 className="text-xl">Ingredients</h2>
          <ul className="flex flex-col divide-y">
            {recipe.ingredients.map((line, index) => (
              <li key={index} className="py-2">
                {line.amount && <span className="font-semibold">{line.amount} </span>}
                {line.name}
                {line.prep && <span className="text-muted-foreground">, {line.prep}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 lg:col-span-2">
          <h2 className="text-xl">Method</h2>
          <ol className="flex list-decimal flex-col gap-4 pl-6 marker:font-bold">
            {recipe.method.map((step, index) => (
              <li key={index} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
