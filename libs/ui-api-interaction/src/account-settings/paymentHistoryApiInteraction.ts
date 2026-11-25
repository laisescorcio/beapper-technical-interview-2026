import {usePaymentHistory} from '@smarty-app/api-controller';

/**
 * Coordinate payment history actions for both platforms.
 *
 * @returns Payment history state and guarded screen handlers.
 */
export function usePaymentHistoryApiInteraction() {
  const {refetch, fetchNextPage, refresh, isRequestActive, ...state} =
    usePaymentHistory();

  return {
    ...state,
    onEndReached: () => {
      if (state.hasNextPage && !state.isNextPageError && !isRequestActive()) {
        void fetchNextPage();
      }
    },
    onRetryNextPage: () => {
      if (state.hasNextPage && state.isNextPageError && !isRequestActive()) {
        void fetchNextPage();
      }
    },
    onRetryInitial: () => {
      if (state.isInitialError && !isRequestActive()) {
        void refetch();
      }
    },
    onRefresh: (onSuccess?: () => void) => {
      if (!isRequestActive()) {
        refresh(undefined, {onSuccess});
      }
    },
  };
}
