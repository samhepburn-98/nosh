import { Link } from 'react-router';

import type { RecipeSummary } from '@nosh/shared/recipes';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { paths } from '@/config/paths';
import { formatDietary, formatMealTypes, formatTag } from '@/utils/format';

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const hasBadges = recipe.dietary.length > 0 || recipe.tags.length > 0;

  return (
    <Card className="relative h-full">
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg">
            {/* The link's ::after covers the card, so the whole card is one tap target. */}
            <Link
              to={paths.recipe(recipe.slug)}
              className="underline-offset-4 after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring"
            >
              {recipe.name}
            </Link>
          </h2>
        </CardTitle>
        <CardDescription>
          {formatMealTypes(recipe.mealTypes)} · Serves {recipe.serves}
        </CardDescription>
      </CardHeader>
      {hasBadges && (
        <CardContent className="flex flex-wrap gap-2">
          {recipe.dietary.map((dietary) => (
            <Badge key={dietary} variant="secondary">
              {formatDietary(dietary)}
            </Badge>
          ))}
          {/* Outline, so the client's other tags never read as dietary ones. */}
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {formatTag(tag)}
            </Badge>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
