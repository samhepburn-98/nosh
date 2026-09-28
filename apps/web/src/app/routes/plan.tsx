import { lazy, Suspense, useState } from 'react';

import { Week } from '@/features/plan/components/week';

const PlanAddMealSheet = lazy(() => import('./plan-add-meal-sheet'));

export function PlanRoute() {
  // The day stays set while the sheet closes, so its title doesn't change as it slides away.
  const [day, setDay] = useState(1);
  const [sheetOpen, setSheetOpen] = useState<boolean | null>(null);

  return (
    <>
      <title>Plan · Nosh</title>
      <h1 className="text-2xl">Your week</h1>
      <Week
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
