import {
  isPaymentDto,
  useSubscriberPaymentQuery,
  useSubscriberPaymentRefreshMutation,
  useSubscriberPaymentRequestActivity,
} from '@smarty-app/api';
import {mapPaymentDtoToPayment} from '@smarty-app/core';
import {useMemo} from 'react';

/**
 * Expose payment history data and request state to the UI.
 *
 * @returns Payments in API order, request states, and actions.
 */
export function usePaymentHistory() {
  const isRequestActive = useSubscriberPaymentRequestActivity();
  const query = useSubscriberPaymentQuery();
  const refreshMutation = useSubscriberPaymentRefreshMutation();

  const payments = useMemo(
    () =>
      query.data?.pages
        .flat()
        .filter(isPaymentDto)
        .map(mapPaymentDtoToPayment) ?? [],
    [query.data],
  );

  return {
    payments,
    hasNextPage: query.hasNextPage,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isInitialError: query.isLoadingError,
    isNextPageError: query.isFetchNextPageError,
    isRefreshing: refreshMutation.isPending,
    isRefreshError: refreshMutation.isError,
    retryInitial: () => {
      void query.refetch();
    },
    loadNextPage: () => {
      void query.fetchNextPage();
    },
    refresh: (onSuccess?: () => void) => {
      refreshMutation.mutate(undefined, {onSuccess});
    },
    isRequestActive,
  };
}
