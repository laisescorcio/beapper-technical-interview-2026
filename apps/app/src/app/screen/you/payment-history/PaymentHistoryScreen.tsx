import {PaymentHistoryScreenView} from '@smarty-app/components';
import {JSX} from 'react';

import {StackRootFlatList} from '../../../component/common/StackRootFlatList';

/**
 * Payment history screen.
 *
 * @returns A React element.
 */
export function PaymentHistoryScreen(): JSX.Element {
  return (
    <PaymentHistoryScreenView
      className="flex-1"
      testID="payment-history-screen"
      List={StackRootFlatList}
    />
  );
}
