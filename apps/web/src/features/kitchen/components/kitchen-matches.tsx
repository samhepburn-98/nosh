import { CalendarPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import type { KitchenMatch } from '@nosh/shared/kitchen';
import type { RecipeSummary } from '@nosh/shared/recipes';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { formatMealTypes, formatSerialList } from '@/utils/format';

import { useKitchen } from '../api/get-kitchen';
import { useKitchenMatches } from '../api/get-kitchen-matches';

const gridClassName = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

/**
 * Every recipe ranked by what you'd buy (F8). When the preferences split them, those that fit come
 * first under their own heading, with `preferences` beneath it. With nothing picked, it's A–Z
 * without counts. `onAddToPlan` opens the page's "Add to plan" sheet.
 */
export function KitchenMatches({
  preferences,
  onAddToPlan,
}: {
  preferences?: ReactNode;
  onAddToPlan: (recipe: RecipeSummary) => void;
}) {
  const { data: kitchen } = useKitchen();
  const { data, isError, refetch } = useKitchenMatches();
  const hasPicks = (kitchen?.ingredientIds.length ?? 0) > 0;

  if (!data && !isError) {
    return (
      <>
        <p role="status" className="sr-only">
          Loading recipes
        </p>
        <div className={gridClassName} aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
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

  // Split by the preferences, the cards sit under a heading for each group.
  const isSplit = data.others.length > 0;

  const grid = (matches: KitchenMatch[]) => (
    <ul className={gridClassName}>
      {matches.map((match) => (
        <li key={match.recipe.slug}>
          <MatchCard
            match={match}
            heading={isSplit ? 'h3' : 'h2'}
            hasPicks={hasPicks}
            onAddToPlan={onAddToPlan}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Headings only when the preferences split the recipes, so with none it's one list.
          The preferences stay in view even when none of the recipes fit them. */}
      {isSplit && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg">These fit your preferences</h2>
          {preferences}
        </div>
      )}
      {data.matching.length > 0 ? (
        grid(data.matching)
      ) : (
        <p className="text-muted-foreground">None of the recipes fit all of these.</p>
      )}
      {data.others.length > 0 && (
        <>
          <h2 className="mt-4 text-lg">These don't quite fit your preferences</h2>
          {grid(data.others)}
        </>
      )}
    </>
  );
}

function MatchCard({
  match: { recipe, haveCount, ingredientCount, toBuy },
  heading: Heading,
  hasPicks,
  onAddToPlan,
}: {
  match: KitchenMatch;
  heading: 'h2' | 'h3';
  hasPicks: boolean;
  onAddToPlan: (recipe: RecipeSummary) => void;
}) {
  const location = useLocation();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Heading>
            <Link
              to={paths.recipe(recipe.slug)}
              state={{ back: location.pathname + location.search }}
              className="underline-offset-4 hover:underline"
            >
              {recipe.name}
            </Link>
          </Heading>
        </CardTitle>
        <CardDescription>
          {hasPicks
            ? haveLine(haveCount, ingredientCount)
            : `${formatMealTypes(recipe.mealTypes)} · Serves ${recipe.serves}`}
        </CardDescription>
      </CardHeader>
      {hasPicks && toBuy.length > 0 && (
        <CardContent>
          <p>To buy: {formatSerialList(toBuy)}</p>
        </CardContent>
      )}
      <CardFooter className="mt-auto">
        <Button
          variant="outline"
          // Read out with its recipe, as there's one on every card.
          aria-label={`Add to plan: ${recipe.name}`}
          onClick={() => onAddToPlan(recipe)}
        >
          <CalendarPlus data-icon="inline-start" />
          Add to plan
        </Button>
      </CardFooter>
    </Card>
  );
}

/** "You have 4 of 6 · buy 2 more", in plain words at either end. */
function haveLine(haveCount: number, ingredientCount: number) {
  if (haveCount === ingredientCount) return `You have all ${ingredientCount}`;
  if (haveCount === 0) return `Buy all ${ingredientCount}`;
  return `You have ${haveCount} of ${ingredientCount} · buy ${ingredientCount - haveCount} more`;
}
