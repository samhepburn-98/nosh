import { z } from 'zod';

/** Every API error has this body. `fields` holds one message per bad field. */
export const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ErrorBody = z.infer<typeof errorBodySchema>;
