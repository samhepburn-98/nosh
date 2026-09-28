import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MutationConfig } from '@/lib/react-query';

export const clearPlan = (): Promise<void> => api.delete('/plan');

export const useClearPlan = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof clearPlan> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig ?? {};

  return useMutation({
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.plan });
      // Recipe pages say which days they're planned for.
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes });
      return onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: clearPlan,
  });
};
