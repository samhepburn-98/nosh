import type { DefaultOptions } from '@tanstack/react-query';

export const queryConfig = {
  // One retry, so a failure shows "Try again" after about a second rather than seven.
  queries: { retry: 1 },
} satisfies DefaultOptions;

/** Options a `use…` hook accepts, on top of its own `…QueryOptions`. */
export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>;
