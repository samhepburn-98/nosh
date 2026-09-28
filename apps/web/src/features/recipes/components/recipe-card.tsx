import { Link, useLocation } from 'react-router';

import type { RecipeSummary } from '@nosh/shared/recipes';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { formatMealTypes } from '@/utils/format';

import { RecipeBadges } from './recipe-badges';

/** `heading` is h3 when the card sits under a group's heading, such as "These fit your preferences". */
export function RecipeCard({
  recipe,
  heading: Heading = 'h2',
}: {
  recipe: RecipeSummary;
  heading?: 'h2' | 'h3';
}) {
  const location = useLocation();
  const hasBadges = recipe.isOwn || recipe.dietary.length > 0 || recipe.tags.length > 0;

  return (
    <Card className="relative h-full">
      <CardHeader>
        <CardTitle>
          <Heading>
            {/* The link's ::after covers the card, so the whole card is one tap target.
                `back` lets the recipe page link back to this list with its search. */}
            <Link
              to={paths.recipe(recipe.slug)}
              state={{ back: location.pathname + location.search }}
              className="underline-offset-4 after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
            >
              {recipe.name}
            </Link>
          </Heading>
        </CardTitle>
        <CardDescription>
          {formatMealTypes(recipe.mealTypes)} · Serves {recipe.serves}
        </CardDescription>
      </CardHeader>
      {hasBadges && (
        <CardContent>
          <RecipeBadges recipe={recipe} />
        </CardContent>
      )}
    </Card>
  );
}
