import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import type { Recipe } from '@nosh/shared/recipes';

import { Button, buttonVariants } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { RecipeDetails } from '@/features/recipes/components/recipe-details';
import { cn } from '@/lib/utils';

import NotFoundRoute from './not-found';

const RecipeAddToPlanSheet = lazy(() => import('./recipe-add-to-plan-sheet'));

type Adding = { recipe: Pick<Recipe, 'slug' | 'name'>; open: boolean; opened: number };

export default function RecipeRoute() {
  const { slug = '' } = useParams();
  const location = useLocation();
  // `opened` counts openings. It's the sheet's key, so each opening starts again from today.
  const [adding, setAdding] = useState<Adding | null>(null);

  return (
    <>
      {/* A link styled as a button: Button with nativeButton={false} would announce it as a button. */}
      <Link
        to={backLink(location.state)}
        className={cn(buttonVariants({ variant: 'ghost' }), 'self-start')}
      >
        <ArrowLeft data-icon="inline-start" />
        Back
      </Link>
      <RecipeDetails
        slug={slug}
        notFound={<NotFoundRoute />}
        actions={(recipe) => (
          <Button
            size="lg"
            // Full width on phones, where it's the page's main action and easy to reach.
            className="w-full lg:w-auto"
            onClick={() =>
              setAdding((previous) => ({ recipe, open: true, opened: (previous?.opened ?? 0) + 1 }))
            }
          >
            <CalendarPlus data-icon="inline-start" />
            Add to plan
          </Button>
        )}
      />
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

/** Back to the list the recipe was opened from, with its search, or to all recipes. */
function backLink(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'back' in state) {
    const { back } = state;
    if (typeof back === 'string' && back.startsWith('/')) return back;
  }
  return paths.recipes;
}
