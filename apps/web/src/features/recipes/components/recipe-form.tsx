import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus } from 'lucide-react';
import { useId, type Ref } from 'react';
import { Controller, useForm, type FieldPath } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { DIETARY } from '@nosh/shared/dietary';
import { MEAL_TYPES } from '@nosh/shared/meal-types';
import type { Recipe } from '@nosh/shared/recipes';

import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { paths } from '@/config/paths';
import { ApiError } from '@/lib/api-client';
import { formatDietary, formatMealTypes } from '@/utils/format';

import { useCreateRecipe } from '../api/create-recipe';
import {
  emptyIngredientLine,
  recipeFormSchema,
  toFormPath,
  toNewRecipe,
  type RecipeFormOutput,
  type RecipeFormValues,
} from '../utils/recipe-form';
import { IngredientLines } from './ingredient-lines';
import { MethodSteps } from './method-steps';

/**
 * The New recipe form (F3). The browser checks it against the shared schema, and the API checks
 * again: its field errors show on the same fields. `onSaved` runs once the recipe is saved.
 */
export function RecipeForm({ onSaved }: { onSaved: (recipe: Recipe) => void }) {
  const id = useId();
  const form = useForm<RecipeFormValues, unknown, RecipeFormOutput>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: '',
      serves: 1,
      mealTypes: [],
      dietary: [],
      ingredients: [emptyIngredientLine],
      method: [{ text: '' }],
    },
  });
  const createRecipe = useCreateRecipe({
    mutationConfig: {
      onSuccess: (recipe) => {
        toast.success('Recipe saved');
        onSaved(recipe);
      },
      onError: (error) => {
        if (!(error instanceof ApiError && error.fields)) {
          toast.error("We couldn't save your recipe. Please try again.");
          return;
        }
        // Said as well as marked on the fields, in case one isn't on screen or has nowhere to show.
        toast.error(error.message);
        Object.entries(error.fields).forEach(([path, message], index) => {
          form.setError(
            toFormPath(path) as FieldPath<RecipeFormValues>,
            { message },
            { shouldFocus: index === 0 },
          );
        });
      },
    },
  });
  const { errors } = form.formState;

  return (
    <form
      // The schema checks everything, with messages in the app's own words.
      noValidate
      onSubmit={(event) =>
        void form.handleSubmit((values) => createRecipe.mutate(toNewRecipe(values)))(event)
      }
    >
      <FieldGroup className="gap-8">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
          <Input
            id={`${id}-name`}
            placeholder="Like “Veggie chilli”"
            aria-invalid={Boolean(errors.name)}
            {...form.register('name')}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Controller
          control={form.control}
          name="serves"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${id}-serves`}>Serves</FieldLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Serves fewer"
                  disabled={field.value <= 1}
                  onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                >
                  <Minus />
                </Button>
                <Input
                  id={`${id}-serves`}
                  ref={field.ref}
                  type="number"
                  inputMode="numeric"
                  className="w-16"
                  aria-invalid={fieldState.invalid}
                  value={Number.isNaN(field.value) ? '' : field.value}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  onBlur={field.onBlur}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Serves more"
                  disabled={field.value >= 12}
                  onClick={() => field.onChange(Math.min(12, (field.value || 0) + 1))}
                >
                  <Plus />
                </Button>
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="mealTypes"
          render={({ field, fieldState }) => (
            <Choices
              id={`${id}-meal-types`}
              legend="Meal types"
              description="Tick all that fit."
              options={MEAL_TYPES}
              format={(mealType) => formatMealTypes([mealType])}
              value={field.value}
              onChange={field.onChange}
              firstRef={field.ref}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={form.control}
          name="dietary"
          render={({ field }) => (
            <Choices
              id={`${id}-dietary`}
              legend="Dietary (optional)"
              description="Only tick what's true for the whole recipe. It's how recipes are matched to preferences."
              options={DIETARY}
              format={formatDietary}
              value={field.value ?? []}
              onChange={field.onChange}
            />
          )}
        />

        <IngredientLines form={form} />
        <MethodSteps form={form} />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={createRecipe.isPending}>
            {createRecipe.isPending ? 'Saving…' : 'Save recipe'}
          </Button>
          <Link to={paths.recipes} className={buttonVariants({ variant: 'outline' })}>
            Cancel
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}

/** A set of checkboxes that makes one list of values, like the meal types. */
function Choices<Value extends string>({
  id,
  legend,
  description,
  options,
  format,
  value,
  onChange,
  firstRef,
  error,
}: {
  id: string;
  legend: string;
  description: string;
  options: readonly Value[];
  format: (value: Value) => string;
  value: Value[];
  onChange: (value: Value[]) => void;
  firstRef?: Ref<HTMLElement>;
  error?: string;
}) {
  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {options.map((option, index) => (
          <Field key={option} orientation="horizontal" className="w-auto">
            <Checkbox
              id={`${id}-${option}`}
              // So a missing choice can be focused when the form is checked.
              ref={index === 0 ? firstRef : undefined}
              aria-invalid={Boolean(error)}
              checked={value.includes(option)}
              onCheckedChange={(checked) =>
                onChange(checked ? [...value, option] : value.filter((v) => v !== option))
              }
            />
            <FieldLabel htmlFor={`${id}-${option}`}>{format(option)}</FieldLabel>
          </Field>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}
