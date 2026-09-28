import { useId, useState } from 'react';
import { toast } from 'sonner';

import { dayName } from '@nosh/shared/days';
import type { Recipe } from '@nosh/shared/recipes';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAddMeal } from '@/features/plan/api/add-meal';
import { DayPicker } from '@/features/plan/components/day-picker';
import { useMediaQuery } from '@/hooks/use-media-query';
import { todayDay } from '@/utils/today';

/**
 * "Add to plan" for one recipe, from its page or a From your kitchen result: the plan feature's
 * day picker. Today is picked to start with. Lazy-loaded, so it's downloaded when first opened.
 */
export default function RecipeAddToPlanSheet({
  recipe,
  open,
  onOpenChange,
}: {
  recipe: Pick<Recipe, 'slug' | 'name'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formId = useId();
  const isWide = useMediaQuery('(min-width: 48rem)');
  const [day, setDay] = useState(todayDay);
  const addMeal = useAddMeal({
    mutationConfig: {
      onSuccess: (meal) => {
        toast.success(`Added ${meal.recipe.name} to ${dayName(meal.day)}`);
        onOpenChange(false);
      },
      onError: () => toast.error("We couldn't add that meal. Please try again."),
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isWide ? 'right' : 'bottom'}>
        <SheetHeader>
          <SheetTitle>Add {recipe.name} to your plan</SheetTitle>
          <SheetDescription>
            It goes on the day you pick, after any meals already there.
          </SheetDescription>
        </SheetHeader>
        <form
          id={formId}
          className="min-h-0 overflow-y-auto px-4"
          onSubmit={(event) => {
            event.preventDefault();
            addMeal.mutate({ day, recipeSlug: recipe.slug });
          }}
        >
          <DayPicker value={day} onChange={setDay} />
        </form>
        <SheetFooter>
          <Button type="submit" form={formId} disabled={addMeal.isPending}>
            Add to {dayName(day)}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
