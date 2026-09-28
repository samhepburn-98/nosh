import { useId, type Ref } from 'react';

import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

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
      <FieldLabel htmlFor={id}>Search by name</FieldLabel>
      <Input
        id={id}
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
    </Field>
  );
}
