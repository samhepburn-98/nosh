import { Plus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import {
  Controller,
  get,
  useFieldArray,
  type FieldErrors,
  type UseFormReturn,
} from 'react-hook-form';

import { UNITS, type Unit } from '@nosh/shared/units';

import { IngredientCombobox } from '@/components/ingredient-combobox';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';

import { useIngredients } from '../api/get-ingredients';
import {
  emptyIngredientLine,
  type RecipeFormOutput,
  type RecipeFormValues,
} from '../utils/recipe-form';

const units = Object.keys(UNITS) as Unit[];

/**
 * The recipe's ingredient rows, each reading like the line it makes: amount and unit, ingredient,
 * prep. Stacked on phones, one line per row from `lg`.
 */
export function IngredientLines({
  form,
}: {
  form: UseFormReturn<RecipeFormValues, unknown, RecipeFormOutput>;
}) {
  const id = useId();
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'ingredients' });
  const { data: ingredients = [] } = useIngredients();
  const addButton = useRef<HTMLButtonElement>(null);
  const { errors } = form.formState;

  return (
    <FieldSet>
      {/* A heading inside the legend, so the section looks like the app's other sections and screen
          readers can jump to it. */}
      <FieldLegend>
        <h2 className="text-lg">Ingredients</h2>
      </FieldLegend>
      <FieldDescription>
        Leave the amount blank for things like salt and pepper. Anything else, like “a pinch” or “a
        bunch”, can go in Prep.
      </FieldDescription>
      <ul className="flex flex-col divide-y rounded-xl border">
        {fields.map((field, index) => {
          const row = `${id}-${index}`;
          const line = `ingredients.${index}`;
          const quantityError = messageAt(errors, `${line}.quantity`);
          // A missing ingredient, a blank new name, or an id the API doesn't know.
          const ingredientError =
            messageAt(errors, `${line}.ingredient`) ?? messageAt(errors, `${line}.ingredient.name`);
          const prepError = messageAt(errors, `${line}.prep`);

          return (
            <li key={field.id} className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-12">
              <Field data-invalid={Boolean(quantityError)} className="lg:col-span-2">
                <FieldLabel htmlFor={`${row}-quantity`}>Amount</FieldLabel>
                <Input
                  id={`${row}-quantity`}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  aria-invalid={Boolean(quantityError)}
                  {...form.register(`ingredients.${index}.quantity`, {
                    // Blank is no amount. The empty default arrives as null, which Number() would make 0.
                    setValueAs: (value: string | null) =>
                      value === '' || value === null ? null : Number(value),
                  })}
                />
                <FieldError>{quantityError}</FieldError>
              </Field>
              <Field className="lg:col-span-2">
                <FieldLabel htmlFor={`${row}-unit`}>Unit</FieldLabel>
                <NativeSelect
                  id={`${row}-unit`}
                  className="w-full"
                  {...form.register(`ingredients.${index}.unit`, {
                    setValueAs: (value: string) => value || null,
                  })}
                >
                  <NativeSelectOption value="">No unit (e.g. 2 onions)</NativeSelectOption>
                  {units.map((unit) => (
                    <NativeSelectOption key={unit} value={unit}>
                      {unit}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field data-invalid={Boolean(ingredientError)} className="col-span-2 lg:col-span-4">
                <FieldLabel htmlFor={`${row}-ingredient`}>Ingredient</FieldLabel>
                <Controller
                  control={form.control}
                  name={`ingredients.${index}.ingredient`}
                  render={({ field: ingredient }) => (
                    <IngredientCombobox
                      id={`${row}-ingredient`}
                      ref={ingredient.ref}
                      ingredients={ingredients}
                      value={ingredient.value}
                      onChange={ingredient.onChange}
                      onBlur={ingredient.onBlur}
                      invalid={Boolean(ingredientError)}
                    />
                  )}
                />
                <FieldError>{ingredientError}</FieldError>
              </Field>
              <Field data-invalid={Boolean(prepError)} className="col-span-2 lg:col-span-3">
                <FieldLabel htmlFor={`${row}-prep`}>Prep (optional)</FieldLabel>
                <Input
                  id={`${row}-prep`}
                  placeholder="Like “chopped”"
                  aria-invalid={Boolean(prepError)}
                  {...form.register(`ingredients.${index}.prep`)}
                />
                <FieldError>{prepError}</FieldError>
              </Field>
              <div className="col-span-2 lg:col-span-1 lg:mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`Remove ingredient ${index + 1}`}
                  // A recipe needs at least one ingredient, so the last row stays.
                  disabled={fields.length === 1}
                  onClick={() => {
                    remove(index);
                    addButton.current?.focus();
                  }}
                >
                  <Trash2 data-icon="inline-start" />
                  <span className="lg:sr-only">Remove</span>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <FieldError>{errors.ingredients?.message ?? errors.ingredients?.root?.message}</FieldError>
      <Button
        ref={addButton}
        type="button"
        variant="outline"
        className="self-start"
        onClick={() => append(emptyIngredientLine)}
      >
        <Plus data-icon="inline-start" />
        Add an ingredient
      </Button>
    </FieldSet>
  );
}

/** The error message at a path in the form's errors, if there is one. */
function messageAt(errors: FieldErrors, path: string): string | undefined {
  const message: unknown = get(errors, `${path}.message`);
  return typeof message === 'string' ? message : undefined;
}
