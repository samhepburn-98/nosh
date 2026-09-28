import { Info } from 'lucide-react';
import { useId } from 'react';
import { toast } from 'sonner';

import { DIETARY, type Dietary } from '@nosh/shared/dietary';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDietary } from '@/utils/format';

import { usePreferences } from '../api/get-preferences';
import { useUpdatePreferences } from '../api/update-preferences';

/** The four dietary preferences, each a whole-row tap target, saved as they're ticked. */
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
    <>
      <FieldSet>
        <FieldLegend>Dietary preferences</FieldLegend>
        <FieldDescription>
          Recipes that fit every choice are shown first. The rest are still there, further down.
        </FieldDescription>
        <FieldGroup data-slot="checkbox-group">
          {DIETARY.map((value) => (
            <FieldLabel key={value} htmlFor={`${id}-${value}`}>
              <Field orientation="horizontal">
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
              </Field>
            </FieldLabel>
          ))}
        </FieldGroup>
      </FieldSet>
      <Alert>
        <Info />
        <AlertTitle>Have an allergy?</AlertTitle>
        <AlertDescription>
          Recipes are matched by their labels, which may not be complete. Always check the
          ingredients before you cook.
        </AlertDescription>
      </Alert>
    </>
  );
}
