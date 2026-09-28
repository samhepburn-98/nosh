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

/** One message per field, from zod's issues: the first message wins. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join('.');
    fields[field] ??= issue.message;
  }
  return fields;
}
