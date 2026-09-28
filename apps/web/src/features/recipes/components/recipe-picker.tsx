import { Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import type { RecipeGroups, RecipeSummary } from '@nosh/shared/recipes';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMealTypes } from '@/utils/format';

import { useRecipes } from '../api/get-recipes';
import { filterByName } from '../utils/search';
import { RecipeSearch } from './recipe-search';

/**
 * Every recipe as a button, with a search. When the preferences split them, those that fit come
 * first under their own heading, with `preferences` beneath it, and the rest follow under theirs.
 * Used wherever a recipe is chosen, like the plan's sheet.
 */
export function RecipePicker({
  onPick,
  disabled = false,
  preferences,
}: {
  onPick: (recipe: RecipeSummary) => void;
  disabled?: boolean;
  preferences?: ReactNode;
}) {
  const [search, setSearch] = useState('');
  const { data, isError, refetch } = useRecipes();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <RecipeSearch value={search} onChange={setSearch} />
      <RecipeChoices
        groups={
          data && {
            matching: filterByName(data.matching, search),
            others: filterByName(data.others, search),
          }
        }
        isSplit={Boolean(data && data.others.length > 0)}
        preferences={preferences}
        isError={isError}
        onRetry={() => void refetch()}
        onPick={onPick}
        disabled={disabled}
        search={search.trim()}
      />
    </div>
  );
}

function RecipeChoices({
  groups,
  isSplit,
  preferences,
  isError,
  onRetry,
  onPick,
  disabled,
  search,
}: {
  groups: RecipeGroups | undefined;
  isSplit: boolean;
  preferences: ReactNode;
  isError: boolean;
  onRetry: () => void;
  onPick: (recipe: RecipeSummary) => void;
  disabled: boolean;
  search: string;
}) {
  if (!groups && !isError) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (!groups) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load the recipes</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  const { matching, others } = groups;
  if (matching.length + others.length === 0) {
    return <p className="text-muted-foreground">No recipes match “{search}”.</p>;
  }

  const choices = (recipes: RecipeSummary[]) => (
    <ul className="flex flex-col">
      {recipes.map((recipe) => (
        <li key={recipe.slug}>
          <Item
            render={<button type="button" disabled={disabled} onClick={() => onPick(recipe)} />}
          >
            <ItemContent>
              <ItemTitle>{recipe.name}</ItemTitle>
              <ItemDescription>
                {formatMealTypes(recipe.mealTypes)} · Serves {recipe.serves}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Plus aria-hidden />
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );

  return (
    // Plain items, no gap: their own padding spaces them. Pulled out by that padding, so the names
    // line up with the search box.
    <div className="-mx-3 flex min-h-0 flex-col overflow-y-auto">
      {/* Headings only when the preferences split the recipes, so with none it's one list.
          The preferences stay in view even when none of the recipes fit them. */}
      {isSplit && (
        <div className="flex flex-col gap-2 px-3 pb-2">
          <h3>These fit your preferences</h3>
          {preferences}
        </div>
      )}
      {matching.length > 0 ? (
        choices(matching)
      ) : (
        <p className="px-3 text-muted-foreground">
          {search
            ? `None of the recipes that fit match “${search}”.`
            : 'None of the recipes fit all of these.'}
        </p>
      )}
      {others.length > 0 && (
        <>
          <h3 className="mt-4 px-3 pb-2">These don't quite fit your preferences</h3>
          {choices(others)}
        </>
      )}
    </div>
  );
}
