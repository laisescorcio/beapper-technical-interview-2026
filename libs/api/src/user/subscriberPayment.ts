import {Payment} from '@smarty-app/dx-api';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {useDxApi} from '../dxApiWrapper';

export const subscriberPaymentQueryKey = ['subscriberPayment'];
export const subscriberPaymentRefreshMutationKey = ['subscriberPaymentRefresh'];
const pageSize = 20;

function useSubscriberPaymentPageFetchFn() {
  const dxApi = useDxApi();

  return async (page: number): Promise<Payment[]> => {
    const response = await dxApi.subscriber.subscriberPaymentGet({
      page,
      size: pageSize,
      sort: ['paymentDate,desc'],
    });

    return response.data;
  };
}

/**
 * Fetch the subscriber's payments in newest-first order.
 *
 * @returns The infinite query result for payment history.
 */
export function useSubscriberPaymentQuery() {
  const fetchPage = useSubscriberPaymentPageFetchFn();

  return useInfiniteQuery({
    queryKey: subscriberPaymentQueryKey,
    initialPageParam: 0,
    queryFn: ({pageParam}) => fetchPage(pageParam),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < pageSize ? undefined : lastPageParam + 1,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Refresh the payment history and restart pagination from the new first page.
 *
 * @returns The mutation result for refreshing payment history.
 */
export function useSubscriberPaymentRefreshMutation() {
  const fetchPage = useSubscriberPaymentPageFetchFn();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: subscriberPaymentRefreshMutationKey,
    mutationFn: () => fetchPage(0),
    onSuccess: (firstPage) => {
      queryClient.setQueryData<InfiniteData<Payment[], number>>(
        subscriberPaymentQueryKey,
        {pages: [firstPage], pageParams: [0]},
      );
    },
  });
}
