import {SmartyFlatList} from '@smarty-app/controls';
import {SmartyText} from '@smarty-app/controls-basic';
import {Currency, DateFormat, SmartyDate, SmartyPrice} from '@smarty-app/core';
import {en} from '@smarty-app/language';
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

  const {payments, isFetching, isRefreshing, onEndReached} =
    usePaymentHistoryApiInteraction();

  return (
    <View
      testID={testID}
      {...rest}
      accessibilityState={{
        ...rest.accessibilityState,
        busy: isFetching || isRefreshing,
      }}>
      <SmartyFlatList
        testID="payment-history-list"
        data={payments}
        keyExtractor={(payment, index) => payment.id || `missing-id-${index}`}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        renderItem={({item}) => <PaymentItem payment={item} />}
      />
    </View>
  );
}

type Payment = ReturnType<
  typeof usePaymentHistoryApiInteraction
>['payments'][number];

function PaymentItem({payment}: {payment: Payment}): JSX.Element {
  const date = payment.paymentDate ? new Date(payment.paymentDate) : undefined;
  const formattedDate =
    date && Number.isFinite(date.getTime())
      ? new SmartyDate(date).formatDate(DateFormat.DayShortMonthYear)
      : en.paymentHistoryMissingDate;
  const formattedAmount =
    typeof payment.amount === 'number' &&
    Number.isFinite(payment.amount) &&
    payment.currency
      ? new SmartyPrice({
          value: payment.amount,
          currency: payment.currency as Currency,
        }).formatPrice(true)
      : en.paymentHistoryMissingAmount;

  return (
    <View className="smarty-gap-xs border-b border-background-tertiary py-4">
      <SmartyText className="smarty-heading-xs text-foreground-primary">
        {payment.description?.trim() || en.paymentHistoryMissingDescription}
      </SmartyText>
      <SmartyText className="text-foreground-primary">
        {formattedAmount}
      </SmartyText>
      <SmartyText className="text-foreground-secondary">
        {formattedDate}
      </SmartyText>
      <SmartyText className="text-foreground-secondary">
        {(payment.status && en.paymentHistoryStatuses[payment.status]) ||
          en.paymentHistoryMissingStatus}
      </SmartyText>
    </View>
  );
}
