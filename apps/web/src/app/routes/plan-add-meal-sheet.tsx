import { toast } from 'sonner';

import { dayName } from '@nosh/shared/days';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAddMeal } from '@/features/plan/api/add-meal';
import { PreferencesSummary } from '@/features/preferences/components/preferences-summary';
import { RecipePicker } from '@/features/recipes/components/recipe-picker';
import { useMediaQuery } from '@/hooks/use-media-query';

/**
 * The Plan page's "Add" sheet: the recipes feature's picker, adding to the plan feature.
 * From the bottom on phones, from the right from md. Lazy-loaded, so it's downloaded when first opened.
 */
export default function PlanAddMealSheet({
  day,
  open,
  onOpenChange,
}: {
  day: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isWide = useMediaQuery('(min-width: 48rem)');
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
      {/* Five-sixths of the screen on phones, so the list scrolls inside the sheet. */}
      <SheetContent side={isWide ? 'right' : 'bottom'} className="data-[side=bottom]:h-5/6">
        <SheetHeader>
          <SheetTitle>Add a meal to {dayName(day)}</SheetTitle>
          <SheetDescription>Pick a recipe to add it to your plan.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
          <PreferencesSummary />
          <RecipePicker
            disabled={addMeal.isPending}
            onPick={(recipe) => addMeal.mutate({ day, recipeSlug: recipe.slug })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
