import {usePaymentHistoryApiInteraction} from '@smarty-app/ui-api-interaction';
import {JSX} from 'react';
import {View, ViewProps} from 'react-native';

/**
 * Main view for PaymentHistoryScreen.
 *
 * @param props Element properties.
 * @returns JSX.Element
 */
export function PaymentHistoryScreenView(props: ViewProps): JSX.Element {
  const {testID = 'payment-history-screen-view', ...rest} = props;

  const {isFetching, isRefreshing} = usePaymentHistoryApiInteraction();

  return (
    <View
      testID={testID}
      {...rest}
      accessibilityState={{
        ...rest.accessibilityState,
        busy: isFetching || isRefreshing,
      }}
    />
  );
}
