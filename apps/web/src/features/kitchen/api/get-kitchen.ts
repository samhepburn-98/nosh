import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Kitchen } from '@nosh/shared/kitchen';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getKitchen = (): Promise<Kitchen> => api.get('/kitchen');

export const getKitchenQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.kitchen, queryFn: getKitchen });

export const useKitchen = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getKitchenQueryOptions> } = {}) =>
  useQuery({ ...getKitchenQueryOptions(), ...queryConfig });
