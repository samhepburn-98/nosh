import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { toast } from 'sonner';

import type { Ingredient } from '@nosh/shared/ingredients';

import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';

import { useKitchen } from '../api/get-kitchen';
import { useUpdateKitchen } from '../api/update-kitchen';

/**
 * Pick what's in your kitchen from the known ingredients, saved as it changes. Each pick is a
 * chip button below the field, A–Z, that removes it: shadcn's in-field chips are about 21px, under
 * the 24px minimum. Removing a chip moves focus to the next one, so the keyboard never gets lost.
 */
export function KitchenPicker({ ingredients }: { ingredients: Ingredient[] }) {
  const id = useId();
  const { data } = useKitchen();
  const updateKitchen = useUpdateKitchen({
    mutationConfig: {
      onError: () => toast.error("We couldn't save that. Please try again."),
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  // The element to focus once the chips have re-rendered.
  const focusNext = useRef<string | null>(null);

  useEffect(() => {
    if (!focusNext.current) return;
    document.getElementById(focusNext.current)?.focus();
    focusNext.current = null;
  });

  // A–Z, as the ingredients are.
  const picked = ingredients.filter((ingredient) => data?.ingredientIds.includes(ingredient.id));
  const save = (next: Ingredient[]) =>
    updateKitchen.mutate({ ingredientIds: next.map((ingredient) => ingredient.id) });

  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor={`${id}-input`}>What's in your kitchen?</FieldLabel>
        <Combobox
          multiple
          items={ingredients}
          value={picked}
          onValueChange={(next: Ingredient[], { reason }) => {
            // Base UI clears every pick on Escape once the list is closed. That's too easy to do
            // by accident, as picks are saved straight away, so Escape only closes the list.
            if (reason === 'escape-key') return;
            save(next);
          }}
          itemToStringLabel={(ingredient: Ingredient) => ingredient.name}
          isItemEqualToValue={(a: Ingredient, b: Ingredient) => a.id === b.id}
        >
          <ComboboxInput
            id={`${id}-input`}
            ref={inputRef}
            placeholder="Type what you have, like “onion”"
          />
          <ComboboxContent>
            <ComboboxEmpty>No ingredients match.</ComboboxEmpty>
            <ComboboxList>
              {(ingredient: Ingredient) => (
                <ComboboxItem key={ingredient.id} value={ingredient}>
                  {ingredient.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          Pick what you already have, and the recipes that need the fewest extra things come first.
          It goes by what you have, not how much of it.
        </FieldDescription>
      </Field>
      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <ul className="flex flex-wrap gap-2" aria-label="What you have">
            {picked.map((ingredient, index) => (
              <li key={ingredient.id}>
                <Button
                  id={`${id}-chip-${index}`}
                  variant="secondary"
                  size="sm"
                  aria-label={`Remove ${ingredient.name}`}
                  onClick={() => {
                    save(picked.filter((other) => other.id !== ingredient.id));
                    // The chip that takes its place, or the one before if it was last.
                    focusNext.current =
                      picked.length > 1
                        ? `${id}-chip-${Math.min(index, picked.length - 2)}`
                        : `${id}-input`;
                  }}
                >
                  {ingredient.name}
                  <X data-icon="inline-end" />
                </Button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              save([]);
              inputRef.current?.focus();
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
