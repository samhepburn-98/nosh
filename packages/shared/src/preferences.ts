import { z } from 'zod';

import { DIETARY } from './dietary.ts';

/** The saved dietary preferences. A recipe must meet every one to fit. */
export const preferencesSchema = z.object({
  /** Each once, in display order, however they're sent. */
  dietary: z
    .array(z.enum(DIETARY, { error: 'Choose vegetarian, vegan, gluten-free or dairy-free.' }), {
      error: 'Choose your dietary preferences.',
    })
    .transform((dietary) => DIETARY.filter((value) => dietary.includes(value))),
});
export type Preferences = z.infer<typeof preferencesSchema>;
