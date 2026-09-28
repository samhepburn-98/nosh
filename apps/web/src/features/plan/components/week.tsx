import { Plus, X } from 'lucide-react';
import { useRef, type RefObject } from 'react';
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

import { usePlan } from '../api/get-plan';
import { useRemoveMeal } from '../api/remove-meal';

/**
 * The seven days in one bordered list (two columns of boxes from lg), today highlighted. `onAdd` opens the page's recipe picker.
 * `mondayAddButton` is set to Monday's "Add", so the page can send focus there after clearing.
 */
export function Week({
  onAdd,
  mondayAddButton,
}: {
  onAdd: (day: number) => void;
  mondayAddButton: RefObject<HTMLButtonElement | null>;
}) {
  const { data, isError, refetch } = usePlan();
  // Each day's "Add" button, so focus has somewhere to go when a meal is removed.
  const addButtons = useRef(new Map<number, HTMLButtonElement>());

  const removeMeal = useRemoveMeal({
    mutationConfig: {
      onError: () => toast.error("We couldn't remove that meal. Please try again."),
    },
  });

  if (!data && !isError) {
    return (
      <div className="grid gap-2 lg:grid-cols-2 lg:gap-4">
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

  return (
    // One bordered list on phones. From lg, each day is its own box in two columns, so a meal's ×
    // stays near its name.
    <ul className="flex flex-col divide-y rounded-xl border lg:grid lg:grid-cols-2 lg:gap-4 lg:divide-y-0 lg:border-0">
      {data.days.map(({ day, meals }) => (
        <DayRow
          key={day}
          day={day}
          meals={meals}
          isToday={day === today}
          // Its × is disabled while it's being removed, so a second tap can't ask again and fail.
          removingId={removeMeal.isPending ? removeMeal.variables : undefined}
          addButtonRef={(button) => {
            if (button) addButtons.current.set(day, button);
            if (day === 1) mondayAddButton.current = button;
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
  );
}

function DayRow({
  day,
  meals,
  isToday,
  removingId,
  addButtonRef,
  onAdd,
  onRemove,
}: {
  day: number;
  meals: PlannedMeal[];
  isToday: boolean;
  removingId: number | undefined;
  addButtonRef: (button: HTMLButtonElement | null) => void;
  onAdd: () => void;
  onRemove: (meal: PlannedMeal) => void;
}) {
  const name = dayName(day);

  return (
    <li
      className={cn(
        'flex flex-col gap-1 p-4 first:rounded-t-xl last:rounded-b-xl lg:rounded-xl lg:border',
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
        <ItemGroup className="-mx-2.5 w-auto gap-0 has-data-[size=xs]:gap-0">
          {/* Plain, compact items with no gap: their own padding spaces them. Pulled out by that
              padding on both sides (w-auto, as ItemGroup's w-full would stop the right side), so
              names line up with the day's name and × with the Add button. */}
          {meals.map((meal) => (
            <Item key={meal.id} role="listitem" size="xs">
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
                  size="icon-sm"
                  aria-label={`Remove ${meal.recipe.name} from ${name}`}
                  disabled={meal.id === removingId}
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
