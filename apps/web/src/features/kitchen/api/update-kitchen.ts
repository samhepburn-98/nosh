import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Kitchen } from '@nosh/shared/kitchen';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const updateKitchen = (kitchen: Kitchen): Promise<Kitchen> => api.put('/kitchen', kitchen);

/** Shows what you picked straight away, and puts back what's saved if saving fails. */
export const useUpdateKitchen = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof updateKitchen> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    ...restConfig,
    onMutate: async (kitchen) => {
      // So a refresh already on its way can't overwrite what was just picked.
      await queryClient.cancelQueries({ queryKey: queryKeys.kitchen });
      queryClient.setQueryData(queryKeys.kitchen, kitchen);
    },
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.kitchenMatches });
      return onSuccess?.(...args);
    },
    onError: (...args) => {
      // Back to what's saved.
      void queryClient.invalidateQueries({ queryKey: queryKeys.kitchen });
      return onError?.(...args);
    },
    mutationFn: updateKitchen,
  });
};
