import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Plan } from '@nosh/shared/plan';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getPlan = (): Promise<Plan> => api.get('/plan');

export const getPlanQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.plan, queryFn: getPlan });

export const usePlan = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getPlanQueryOptions> } = {}) =>
  useQuery({ ...getPlanQueryOptions(), ...queryConfig });
