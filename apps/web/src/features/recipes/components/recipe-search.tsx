import { Search } from 'lucide-react';
import { useId, type Ref } from 'react';

import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

export function RecipeSearch({
  value,
  onChange,
  ref,
}: {
  value: string;
  onChange: (value: string) => void;
  ref?: Ref<HTMLInputElement>;
}) {
  const id = useId();

  return (
    <Field>
      {/* Hidden, as the icon and placeholder say what the box is for, but still read out. */}
      <FieldLabel htmlFor={id} className="sr-only">
        Search recipes
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          ref={ref}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search recipes, like “soup”"
          autoComplete="off"
          enterKeyHint="search"
        />
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
