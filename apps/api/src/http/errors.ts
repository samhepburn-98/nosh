import type { ErrorRequestHandler, RequestHandler } from 'express';

import type { ErrorBody } from '@nosh/shared/errors';

export function errorBody(code: string, message: string): ErrorBody {
  return { error: { code, message } };
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
  console.error(err);
  res.status(500).json(errorBody('internal_error', 'Something went wrong. Please try again.'));
};
