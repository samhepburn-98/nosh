import { lazy, Suspense, useRef, useState } from 'react';

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl">Your week</h1>
        <ClearWeek finalFocus={mondayAddButton} />
      </div>
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
