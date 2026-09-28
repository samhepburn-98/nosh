import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { toFieldErrors, type ErrorBody } from '@nosh/shared/errors';

export function errorBody(
  code: string,
  message: string,
  fields?: Record<string, string>,
): ErrorBody {
  return { error: fields ? { code, message, fields } : { code, message } };
}

/** A 400 for input that failed validation, with one message per bad field. */
export function invalidInput(fields: Record<string, string>): ErrorBody {
  return errorBody('invalid_input', 'Some details need changing.', fields);
}

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json(errorBody('not_found', "There's nothing at this address."));
};

export const handleErrors: ErrorRequestHandler = (err, _req, res, next) => {
  // Once a response has started, only Express's own handler can end it.
  if (res.headersSent) {
    next(err);
    return;
  }
  // Routes parse input with the shared zod schemas and let a failure land here.
  if (err instanceof ZodError) {
    res.status(400).json(invalidInput(toFieldErrors(err)));
    return;
  }
  if (isBadJson(err)) {
    res.status(400).json(errorBody('invalid_json', "We couldn't read that request."));
    return;
  }
  console.error(err);
  res.status(500).json(errorBody('internal_error', 'Something went wrong. Please try again.'));
};

/** express.json() throws a SyntaxError of this type for a body that isn't valid JSON. */
function isBadJson(err: unknown) {
  return err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed';
}
