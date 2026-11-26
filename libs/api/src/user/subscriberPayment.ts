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

const paymentStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];

/**
 * Checks the optional fields of an entry from the payment history API.
 *
 * @param payment - The entry to check.
 * @returns Whether the entry can be mapped as a payment.
 */
export function isPaymentDto(
  payment: Payment | null | undefined,
): payment is Payment {
  if (!payment || typeof payment !== 'object' || Array.isArray(payment)) {
    return false;
  }

  const {id, description, paymentDate, currency, amount, status} = payment;
  return (
    [id, description, paymentDate, currency].every(
      (value) => value === undefined || typeof value === 'string',
    ) &&
    (amount === undefined || Number.isFinite(amount)) &&
    (status === undefined || paymentStatuses.includes(status))
  );
}

function useSubscriberPaymentPageFetchFn() {
  const dxApi = useDxApi();

  return async (page: number): Promise<Payment[]> => {
    const response = await dxApi.subscriber.subscriberPaymentGet({
      page,
      size: pageSize,
      sort: ['paymentDate,desc'],
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid payment history response: expected an array.');
    }

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
