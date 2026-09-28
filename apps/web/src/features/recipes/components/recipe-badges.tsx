import type { RecipeSummary } from '@nosh/shared/recipes';

import { Badge } from '@/components/ui/badge';
import { formatDietary, formatTag } from '@/utils/format';

/** Dietary tags (green), then the client's other tags (outline, so they never read as dietary). */
export function RecipeBadges({ recipe }: { recipe: Pick<RecipeSummary, 'dietary' | 'tags'> }) {
  if (recipe.dietary.length === 0 && recipe.tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
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
