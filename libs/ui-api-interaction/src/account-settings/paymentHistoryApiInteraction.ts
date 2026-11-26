import {usePaymentHistory} from '@smarty-app/api-controller';

/**
 * Coordinate payment history actions for both platforms.
 *
 * @returns Payment history state and guarded screen handlers.
 */
export function usePaymentHistoryApiInteraction() {
  const {retryInitial, loadNextPage, refresh, isRequestActive, ...state} =
    usePaymentHistory();

  return {
    ...state,
    onEndReached: () => {
      if (state.hasNextPage && !state.isNextPageError && !isRequestActive()) {
        loadNextPage();
      }
    },
    onRetryNextPage: () => {
      if (state.hasNextPage && state.isNextPageError && !isRequestActive()) {
        loadNextPage();
      }
    },
    onRetryInitial: () => {
      if (state.isInitialError && !isRequestActive()) {
        retryInitial();
      }
    },
    onRefresh: (onSuccess?: () => void) => {
      if (!isRequestActive()) {
        refresh(onSuccess);
      }
    },
  };
}
