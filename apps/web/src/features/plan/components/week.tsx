import { Plus, X } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { dayName } from '@nosh/shared/days';
import type { PlannedMeal } from '@nosh/shared/plan';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { paths } from '@/config/paths';
import { cn } from '@/lib/utils';
import { todayDay } from '@/utils/today';

import { useClearPlan } from '../api/clear-plan';
import { usePlan } from '../api/get-plan';
import { useRemoveMeal } from '../api/remove-meal';

const ClearWeekDialog = lazy(() => import('./clear-week-dialog'));

/** The seven days in one bordered list, today highlighted. `onAdd` opens the page's recipe picker. */
export function Week({ onAdd }: { onAdd: (day: number) => void }) {
  const { data, isError, refetch } = usePlan();
  // Each day's "Add" button, so focus has somewhere to go when a meal is removed.
  const addButtons = useRef(new Map<number, HTMLButtonElement>());
  const firstAddButton = useRef<HTMLButtonElement | null>(null);
  const [clearing, setClearing] = useState<boolean | null>(null);

  const removeMeal = useRemoveMeal({
    mutationConfig: {
      onError: () => toast.error("We couldn't remove that meal. Please try again."),
    },
  });
  const clearPlan = useClearPlan({
    mutationConfig: {
      onSuccess: () => toast.success('Your week is clear'),
      onError: () => toast.error("We couldn't clear your week. Please try again."),
    },
  });

  if (!data && !isError) {
    return (
      <div className="flex flex-col gap-2">
        <p role="status" className="sr-only">
          Loading your week
        </p>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load your week</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const today = todayDay();
  const hasMeals = data.days.some((day) => day.meals.length > 0);

  return (
    <>
      <ul className="flex flex-col divide-y rounded-xl border">
        {data.days.map(({ day, meals }) => (
          <DayRow
            key={day}
            day={day}
            meals={meals}
            isToday={day === today}
            addButtonRef={(button) => {
              if (button) addButtons.current.set(day, button);
              if (day === 1) firstAddButton.current = button;
            }}
            onAdd={() => onAdd(day)}
            onRemove={(meal) => {
              // The meal's × is about to disappear, so focus moves to its day's "Add".
              addButtons.current.get(day)?.focus();
              removeMeal.mutate(meal.id);
            }}
          />
        ))}
      </ul>

      {hasMeals && (
        <Button variant="outline" className="self-start" onClick={() => setClearing(true)}>
          Clear week
        </Button>
      )}
      {clearing !== null && (
        <Suspense fallback={null}>
          <ClearWeekDialog
            open={clearing}
            onOpenChange={setClearing}
            // "Clear week" is gone once the week is empty, so focus goes to Monday's "Add".
            finalFocus={firstAddButton}
            onConfirm={() => {
              clearPlan.mutate();
              setClearing(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
}

function DayRow({
  day,
  meals,
  isToday,
  addButtonRef,
  onAdd,
  onRemove,
}: {
  day: number;
  meals: PlannedMeal[];
  isToday: boolean;
  addButtonRef: (button: HTMLButtonElement | null) => void;
  onAdd: () => void;
  onRemove: (meal: PlannedMeal) => void;
}) {
  const name = dayName(day);

  return (
    <li
      className={cn(
        'flex flex-col gap-3 p-4 first:rounded-t-xl last:rounded-b-xl',
        isToday && 'bg-accent',
      )}
      aria-current={isToday ? 'date' : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg">
          {name}
          {/* "Today" in words, so the highlight isn't only a colour. The space keeps screen
              readers from saying "MondayToday". */}
          {isToday && (
            <>
              {' '}
              <Badge>Today</Badge>
            </>
          )}
        </h2>
        <Button
          ref={addButtonRef}
          variant="outline"
          onClick={onAdd}
          aria-label={`Add a meal to ${name}`}
        >
          <Plus data-icon="inline-start" />
          Add
        </Button>
      </div>

      {meals.length === 0 ? (
        <p className="text-muted-foreground">Nothing planned yet.</p>
      ) : (
        <ItemGroup className="gap-2">
          {meals.map((meal) => (
            <Item key={meal.id} role="listitem" variant="outline" size="sm">
              <ItemContent>
                {/* Names wrap rather than being cut short on small phones. */}
                <ItemTitle className="line-clamp-none">
                  <Link
                    to={paths.recipe(meal.recipe.slug)}
                    state={{ back: paths.plan }}
                    className="underline-offset-4 hover:underline"
                  >
                    {meal.recipe.name}
                  </Link>
                </ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${meal.recipe.name} from ${name}`}
                  onClick={() => onRemove(meal)}
                >
                  <X />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}
    </li>
  );
}
