import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';

import type { RecipeFormOutput, RecipeFormValues } from '../utils/recipe-form';

/**
 * The method's numbered steps, each with move up, move down and remove. Focus follows a moved
 * step, so pressing "Up" again keeps moving it.
 */
export function MethodSteps({
  form,
}: {
  form: UseFormReturn<RecipeFormValues, unknown, RecipeFormOutput>;
}) {
  const id = useId();
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'method' });
  const errors = form.formState.errors.method;
  // The element to focus once the steps have re-rendered in their new order.
  const focusNext = useRef<string | null>(null);

  useEffect(() => {
    if (!focusNext.current) return;
    document.getElementById(focusNext.current)?.focus();
    focusNext.current = null;
  });

  const moveStep = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    move(from, to);
    // The same button in its new place, or the step's text once it can't move that way again.
    const canMoveAgain = direction === 'up' ? to > 0 : to < fields.length - 1;
    focusNext.current = canMoveAgain ? `${id}-${to}-${direction}` : `${id}-${to}-text`;
  };

  return (
    <FieldSet>
      {/* A heading inside the legend, so the section looks like the app's other sections and screen
          readers can jump to it. */}
      <FieldLegend>
        <h2 className="text-lg">Method</h2>
      </FieldLegend>
      <ol className="flex flex-col gap-6">
        {fields.map((field, index) => {
          const step = `${id}-${index}`;
          const error = errors?.[index]?.text;
          return (
            <li key={field.id}>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor={`${step}-text`}>Step {index + 1}</FieldLabel>
                <Textarea
                  id={`${step}-text`}
                  aria-invalid={Boolean(error)}
                  {...form.register(`method.${index}.text`)}
                />
                <FieldError errors={[error]} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    id={`${step}-up`}
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Move step ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => moveStep(index, 'up')}
                  >
                    <ArrowUp data-icon="inline-start" />
                    Up
                  </Button>
                  <Button
                    id={`${step}-down`}
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Move step ${index + 1} down`}
                    disabled={index === fields.length - 1}
                    onClick={() => moveStep(index, 'down')}
                  >
                    <ArrowDown data-icon="inline-start" />
                    Down
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove step ${index + 1}`}
                    // A recipe needs at least one step, so the last one stays.
                    disabled={fields.length === 1}
                    onClick={() => {
                      remove(index);
                      // The step that takes its place, or the one before if it was last.
                      focusNext.current = `${id}-${Math.min(index, fields.length - 2)}-text`;
                    }}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
              </Field>
            </li>
          );
        })}
      </ol>
      <FieldError>{errors?.message ?? errors?.root?.message}</FieldError>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => append({ text: '' })}
      >
        <Plus data-icon="inline-start" />
        Add a step
      </Button>
    </FieldSet>
  );
}
