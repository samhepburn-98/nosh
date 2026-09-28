import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Preferences } from '@nosh/shared/preferences';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getPreferences = (): Promise<Preferences> => api.get('/preferences');

export const getPreferencesQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.preferences, queryFn: getPreferences });

export const usePreferences = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getPreferencesQueryOptions> } = {}) =>
  useQuery({ ...getPreferencesQueryOptions(), ...queryConfig });
