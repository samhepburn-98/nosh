import { ChefHat } from 'lucide-react';

import type { RecipeSummary } from '@nosh/shared/recipes';

import { Badge } from '@/components/ui/badge';
import { formatDietary, formatTag } from '@/utils/format';

/**
 * "Your recipe" for the user's own, then dietary tags (light green), then the client's other tags
 * (outline, so they never read as dietary).
 */
export function RecipeBadges({
  recipe,
}: {
  recipe: Pick<RecipeSummary, 'dietary' | 'tags' | 'isOwn'>;
}) {
  if (!recipe.isOwn && recipe.dietary.length === 0 && recipe.tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {recipe.isOwn && (
        <Badge>
          <ChefHat data-icon="inline-start" />
          Your recipe
        </Badge>
      )}
      {recipe.dietary.map((dietary) => (
        <Badge key={dietary} variant="secondary">
          {formatDietary(dietary)}
        </Badge>
      ))}
      {recipe.tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {formatTag(tag)}
        </Badge>
      ))}
    </div>
  );
}
