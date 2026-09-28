import { useId } from 'react';

import { DAYS } from '@nosh/shared/days';

import { Badge } from '@/components/ui/badge';
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { todayDay } from '@/utils/today';

/** The seven days as one choice, each a whole-row tap target. Today is labelled. */
export function DayPicker({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  const id = useId();
  const today = todayDay();

  return (
    <FieldSet>
      <FieldLegend>Which day?</FieldLegend>
      <RadioGroup value={String(value)} onValueChange={(day) => onChange(Number(day))}>
        {DAYS.map((name, index) => {
          const day = index + 1;
          return (
            <FieldLabel key={day} htmlFor={`${id}-${day}`}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>
                    {name}
                    {/* The space keeps screen readers from saying "MondayToday". */}
                    {day === today && (
                      <>
                        {' '}
                        <Badge>Today</Badge>
                      </>
                    )}
                  </FieldTitle>
                </FieldContent>
                <RadioGroupItem value={String(day)} id={`${id}-${day}`} />
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}
