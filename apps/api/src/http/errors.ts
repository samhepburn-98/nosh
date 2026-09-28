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
  if (isBodyError(err)) {
    const code = err.type === 'entity.parse.failed' ? 'invalid_json' : 'invalid_request';
    res.status(err.status).json(errorBody(code, "We couldn't read that request."));
    return;
  }
  console.error(err);
  res.status(500).json(errorBody('internal_error', 'Something went wrong. Please try again.'));
};

/**
 * express.json() fails with a 4xx error and a `type` for a body it can't read: 400 for bad JSON
 * (entity.parse.failed), 413 for one over its 100 kB limit, 415 for an unknown charset.
 */
function isBodyError(err: unknown): err is { status: number; type: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    typeof err.type === 'string' &&
    'status' in err &&
    typeof err.status === 'number' &&
    err.status >= 400 &&
    err.status < 500
  );
}
