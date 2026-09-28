import { useId } from 'react';

import { DAYS } from '@nosh/shared/days';

import { Badge } from '@/components/ui/badge';
import { FieldContent, FieldLabel, FieldLegend, FieldSet, FieldTitle } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { todayDay } from '@/utils/today';

/**
 * The seven days as one choice, in one bordered list like the week, each row a tap target. Today
 * is labelled.
 */
export function DayPicker({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  const id = useId();
  const today = todayDay();

  return (
    <FieldSet>
      <FieldLegend>Which day?</FieldLegend>
      <RadioGroup
        value={String(value)}
        onValueChange={(day) => onChange(Number(day))}
        className="gap-0 divide-y overflow-hidden rounded-xl border"
      >
        {DAYS.map((name, index) => {
          const day = index + 1;
          return (
            // Each row is a label, so the whole row is the tap target, and shadcn tints it when
            // it's picked.
            <FieldLabel key={day} htmlFor={`${id}-${day}`} className="w-full gap-3 p-4">
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
            </FieldLabel>
          );
        })}
      </RadioGroup>
    </FieldSet>
  );
}
