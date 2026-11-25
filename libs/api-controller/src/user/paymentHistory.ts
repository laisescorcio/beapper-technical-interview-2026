import {
  subscriberPaymentQueryKey,
  subscriberPaymentRefreshMutationKey,
  useSubscriberPaymentQuery,
  useSubscriberPaymentRefreshMutation,
} from '@smarty-app/api';
import {useQueryClient} from '@tanstack/react-query';
import {useMemo} from 'react';

/**
 * Expose payment history data and request state to the UI.
 *
 * @returns Payments in API order, request states, and actions.
 */
export function usePaymentHistory() {
  const queryClient = useQueryClient();
  const query = useSubscriberPaymentQuery();
  const refresh = useSubscriberPaymentRefreshMutation();

  const payments = useMemo(() => query.data?.pages.flat() ?? [], [query.data]);

  return {
    payments,
    hasNextPage: query.hasNextPage,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isInitialError: query.isLoadingError,
    isNextPageError: query.isFetchNextPageError,
    isRefreshing: refresh.isPending,
    isRefreshError: refresh.isError,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    refresh: refresh.mutate,
    // Read the cache at event time, before React has rendered the new state.
    isRequestActive: () =>
      queryClient.isFetching({
        queryKey: subscriberPaymentQueryKey,
        exact: true,
      }) > 0 ||
      queryClient.isMutating({
        mutationKey: subscriberPaymentRefreshMutationKey,
        exact: true,
      }) > 0,
  };
}
