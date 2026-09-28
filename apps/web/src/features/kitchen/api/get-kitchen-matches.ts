import { queryOptions, useQuery } from '@tanstack/react-query';

import type { KitchenMatches } from '@nosh/shared/kitchen';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getKitchenMatches = (): Promise<KitchenMatches> => api.get('/kitchen/matches');

export const getKitchenMatchesQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.kitchenMatches, queryFn: getKitchenMatches });

export const useKitchenMatches = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getKitchenMatchesQueryOptions> } = {}) =>
  useQuery({ ...getKitchenMatchesQueryOptions(), ...queryConfig });
