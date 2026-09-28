import { lazy, Suspense, useRef, useState } from 'react';

import { PageHeader } from '@/components/layout/page-header';
import { ClearWeek } from '@/features/plan/components/clear-week';
import { Week } from '@/features/plan/components/week';

const PlanAddMealSheet = lazy(() => import('./plan-add-meal-sheet'));

export function PlanRoute() {
  // The day stays set while the sheet closes, so its title doesn't change as it slides away.
  const [day, setDay] = useState(1);
  const [sheetOpen, setSheetOpen] = useState<boolean | null>(null);
  const mondayAddButton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <title>Plan · Nosh</title>
      <PageHeader
        title="Your week"
        description="Add meals to any day, and we'll make your shopping list from them."
        action={<ClearWeek finalFocus={mondayAddButton} />}
      />
      <Week
        mondayAddButton={mondayAddButton}
        onAdd={(chosenDay) => {
          setDay(chosenDay);
          setSheetOpen(true);
        }}
      />
      {sheetOpen !== null && (
        <Suspense fallback={null}>
          <PlanAddMealSheet day={day} open={sheetOpen} onOpenChange={setSheetOpen} />
        </Suspense>
      )}
    </>
  );
}
