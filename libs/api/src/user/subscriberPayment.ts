import {useInfiniteQuery} from '@tanstack/react-query';

import {useDxApi} from '../dxApiWrapper';

const subscriberPaymentQueryKey = ['subscriberPayment'];
const pageSize = 20;

/**
 * Fetch the subscriber's payments in newest-first order.
 * @returns The infinite query result for payment history.
 */
export function useSubscriberPaymentQuery() {
  const dxApi = useDxApi();

  return useInfiniteQuery({
    queryKey: subscriberPaymentQueryKey,
    initialPageParam: 0,
    queryFn: async ({pageParam}) => {
      const response = await dxApi.subscriber.subscriberPaymentGet({
        page: pageParam,
        size: pageSize,
        sort: ['paymentDate,desc'],
      });

      return response.data;
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < pageSize ? undefined : lastPageParam + 1,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
