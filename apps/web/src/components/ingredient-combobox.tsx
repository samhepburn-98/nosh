import { useState, type Ref } from 'react';

import type { Ingredient } from '@nosh/shared/ingredients';
import type { NewRecipe } from '@nosh/shared/recipes';

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

/** A known ingredient by id, or a new name. */
export type IngredientChoice = NewRecipe['ingredients'][number]['ingredient'];

type Option = { key: string; name: string; choice: IngredientChoice };

/**
 * Pick a known ingredient, or type a new one. Typing suggests the known ingredients that contain
 * it ("carr" finds carrot and carrots). Unless it's exactly one of them, the last option adds what's
 * typed as a new ingredient. Leaving the field picks what's typed, even if nothing was chosen.
 */
export function IngredientCombobox({
  id,
  ingredients,
  value,
  onChange,
  onBlur,
  invalid,
  ref,
}: {
  id: string;
  ingredients: Ingredient[];
  value: IngredientChoice | undefined;
  onChange: (choice: IngredientChoice | undefined) => void;
  onBlur: () => void;
  invalid: boolean;
  ref?: Ref<HTMLInputElement>;
}) {
  const optionFor = (choice: IngredientChoice): Option => {
    if (choice.kind === 'new') return { key: `new:${choice.name}`, name: choice.name, choice };
    const name = ingredients.find((ingredient) => ingredient.id === choice.id)?.name ?? '';
    return { key: `id:${choice.id}`, name, choice };
  };

  const keyOf = (choice: IngredientChoice | undefined) => (choice ? optionFor(choice).key : '');

  const [input, setInput] = useState(() => (value ? optionFor(value).name : ''));
  const typed = input.trim();
  const exact = ingredients.find(
    (ingredient) => ingredient.name.toLowerCase() === typed.toLowerCase(),
  );
  // What's typed, as a choice: the known ingredient it names exactly, or a new one.
  const typedChoice: IngredientChoice | undefined = !typed
    ? undefined
    : exact
      ? { kind: 'existing', id: exact.id }
      : { kind: 'new', name: typed };

  const options = ingredients
    .filter((ingredient) => ingredient.name.toLowerCase().includes(typed.toLowerCase()))
    .map((ingredient) => optionFor({ kind: 'existing', id: ingredient.id }));
  if (typedChoice?.kind === 'new') options.push(optionFor(typedChoice));

  return (
    <Combobox
      items={options}
      // Already filtered above, so the "Add" option always stays last.
      filter={null}
      value={value ? optionFor(value) : null}
      onValueChange={(option: Option | null) => {
        onChange(option?.choice);
        setInput(option?.name ?? '');
      }}
      inputValue={input}
      onInputValueChange={setInput}
      itemToStringLabel={(option: Option) => option.name}
      isItemEqualToValue={(a: Option, b: Option) => a.key === b.key}
    >
      <ComboboxInput
        id={id}
        ref={ref}
        placeholder="Type to search, like “carrots”"
        aria-invalid={invalid}
        onBlur={() => {
          if (keyOf(typedChoice) !== keyOf(value)) onChange(typedChoice);
          onBlur();
        }}
      />
      <ComboboxContent>
        <ComboboxList>
          {(option: Option) => (
            <ComboboxItem key={option.key} value={option}>
              {option.choice.kind === 'new'
                ? `Add “${option.name}” as a new ingredient`
                : option.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
