import { Info } from 'lucide-react';
import { useId } from 'react';
import { toast } from 'sonner';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDietary } from '@/utils/format';

import { usePreferences } from '../api/get-preferences';
import { useUpdatePreferences } from '../api/update-preferences';

/** The four dietary preferences in one list, each row a tap target, saved as they're ticked. */
export function PreferencesForm() {
  const id = useId();
  const { data, isError, refetch } = usePreferences();
  const updatePreferences = useUpdatePreferences({
    mutationConfig: {
      onError: () => toast.error("We couldn't save that. Please try again."),
    },
  });

  if (!data && !isError) {
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="sr-only">
          Loading your preferences
        </p>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert variant="destructive">
          <AlertTitle>We couldn't load your preferences</AlertTitle>
          <AlertDescription>Check your connection, then try again.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const toggle = (value: Dietary, checked: boolean) => {
    const dietary = checked ? [...data.dietary, value] : data.dietary.filter((d) => d !== value);
    // In display order, as the API saves them.
    updatePreferences.mutate({ dietary: DIETARY.filter((d) => dietary.includes(d)) });
  };

  return (
    // From lg, the allergy note sits beside the choices rather than stretching under them.
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      <FieldSet className="lg:col-span-2">
        {/* A heading inside the legend, so the section looks like the app's other sections and screen
            readers can jump to it. */}
        <FieldLegend>
          <h2 className="text-lg">Dietary preferences</h2>
        </FieldLegend>
        <FieldDescription>
          Recipes that fit all your choices come first, and the rest are still there below. Changes
          save as you tick.
        </FieldDescription>
        {/* One bordered list, like the week and the shopping list. Each row is a label, so the whole
            row is the tap target, and shadcn tints it when it's ticked. */}
        <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
          {DIETARY.map((value) => (
            <li key={value}>
              <FieldLabel htmlFor={`${id}-${value}`} className="w-full items-start gap-3 p-4">
                <Checkbox
                  id={`${id}-${value}`}
                  checked={data.dietary.includes(value)}
                  onCheckedChange={(checked) => toggle(value, checked)}
                />
                <FieldContent>
                  <FieldTitle>{formatDietary(value)}</FieldTitle>
                  {value === 'vegan' && (
                    <FieldDescription>
                      Vegan recipes count as vegetarian and dairy-free too.
                    </FieldDescription>
                  )}
                </FieldContent>
              </FieldLabel>
            </li>
          ))}
        </ul>
      </FieldSet>
      <Alert>
        <Info />
        <AlertTitle>Have an allergy?</AlertTitle>
        <AlertDescription>
          Recipes are matched by their labels, which may not be complete. Always check the
          ingredients before you cook.
        </AlertDescription>
      </Alert>
    </div>
  );
}
