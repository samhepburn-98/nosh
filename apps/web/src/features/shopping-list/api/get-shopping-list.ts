import { queryOptions, useQuery } from '@tanstack/react-query';

import type { ShoppingList } from '@nosh/shared/shopping-list';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { QueryConfig } from '@/lib/react-query';

export const getShoppingList = (): Promise<ShoppingList> => api.get('/shopping-list');

export const getShoppingListQueryOptions = () =>
  queryOptions({ queryKey: queryKeys.shoppingList, queryFn: getShoppingList });

export const useShoppingList = ({
  queryConfig,
}: { queryConfig?: QueryConfig<typeof getShoppingListQueryOptions> } = {}) =>
  useQuery({ ...getShoppingListQueryOptions(), ...queryConfig });
