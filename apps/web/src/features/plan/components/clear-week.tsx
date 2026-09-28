import { lazy, Suspense, useRef, useState, type RefObject } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { useClearPlan } from '../api/clear-plan';
import { usePlan } from '../api/get-plan';

const ClearWeekDialog = lazy(() => import('./clear-week-dialog'));

/**
 * "Clear week", shown when there's something to clear. It asks first. Once the week is cleared
 * the button is gone, so focus moves to `finalFocus` (the page passes Monday's "Add"). Keeping the
 * plan returns focus to this button as usual.
 */
export function ClearWeek({ finalFocus }: { finalFocus: RefObject<HTMLElement | null> }) {
  const { data } = usePlan();
  // null until first opened, so the dialog is only downloaded when it's needed.
  const [open, setOpen] = useState<boolean | null>(null);
  const cleared = useRef(false);
  const clearPlan = useClearPlan({
    mutationConfig: {
      onSuccess: () => toast.success('Your week is clear'),
      onError: () => toast.error("We couldn't clear your week. Please try again."),
    },
  });
  const hasMeals = data?.days.some((day) => day.meals.length > 0) ?? false;

  return (
    <>
      {hasMeals && (
        <Button
          variant="outline"
          onClick={() => {
            cleared.current = false;
            setOpen(true);
          }}
        >
          Clear week
        </Button>
      )}
      {open !== null && (
        <Suspense fallback={null}>
          <ClearWeekDialog
            open={open}
            onOpenChange={setOpen}
            finalFocus={() => (cleared.current ? finalFocus.current : true)}
            onConfirm={() => {
              cleared.current = true;
              clearPlan.mutate();
              setOpen(false);
            }}
          />
        </Suspense>
      )}
    </>
  );
}
