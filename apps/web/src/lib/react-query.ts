import type { DefaultOptions, UseMutationOptions } from '@tanstack/react-query';

import { ApiError } from './api-client';

export const queryConfig = {
  queries: {
    // One retry for a network or server error, so a failure shows "Try again" after about a
    // second rather than seven. None for a 4xx: asking again for a missing recipe won't find it.
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof ApiError && error.status < 500),
  },
} satisfies DefaultOptions;

/** Options a `use…` hook accepts, on top of its own `…QueryOptions`. */
export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;

/** Options a mutation's `use…` hook accepts. Its own `onSuccess` runs after the invalidation. */
export type MutationConfig<MutationFn extends (...args: never[]) => Promise<unknown>> =
  UseMutationOptions<Awaited<ReturnType<MutationFn>>, Error, Parameters<MutationFn>[0]>;
