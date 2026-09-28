import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Ingredient } from '@nosh/shared/ingredients';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getIngredients = (): Promise<Ingredient[]> => api.get('/ingredients');

export const getIngredientsQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.ingredients, queryFn: getIngredients });

export const useIngredients = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getIngredientsQueryOptions> } = {}) =>
  useQuery({ ...getIngredientsQueryOptions(), ...queryConfig });
