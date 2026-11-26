import {SmartyFlatList} from '@smarty-app/controls';
import {
  SmartySecondaryButton,
  SmartySkeletonLoading,
  SmartyText,
} from '@smarty-app/controls-basic';
import {DateFormat, Payment, SmartyPrice} from '@smarty-app/core';
import {en} from '@smarty-app/language';
import {usePaymentHistoryApiInteraction} from '@smarty-app/ui-api-interaction';
import {JSX, useRef} from 'react';
import {FlatList, View, ViewProps} from 'react-native';

interface PaymentHistoryScreenViewProps extends ViewProps {
  showRefreshButton?: boolean;
}

/**
 * Main view for PaymentHistoryScreen.
 *
 * @param props Element properties.
 * @returns JSX.Element
 */
export function PaymentHistoryScreenView(
  props: PaymentHistoryScreenViewProps,
): JSX.Element {
  const {
    testID = 'payment-history-screen-view',
    showRefreshButton = false,
    ...rest
  } = props;

  const {
    payments,
    isPending,
    isFetching,
    isFetchingNextPage,
    isRefreshing,
    isInitialError,
    isNextPageError,
    isRefreshError,
    onEndReached,
    onRetryInitial,
    onRetryNextPage,
    onRefresh,
  } = usePaymentHistoryApiInteraction();

  const listRef = useRef<FlatList<Payment>>(null);
  const handleRefresh = () => {
    onRefresh(() =>
      listRef.current?.scrollToOffset({offset: 0, animated: false}),
    );
  };

  const isRetryDisabled = isFetching || isRefreshing;

  let statusMessage = '';
  if (isPending) {
    statusMessage = en.paymentHistoryLoading;
  } else if (isFetchingNextPage) {
    statusMessage = en.paymentHistoryLoadingMore;
  } else if (isRefreshing) {
    statusMessage = en.paymentHistoryRefreshing;
  }

  return (
    <View testID={testID} {...rest}>
      <SmartyText aria-live="polite" className="text-foreground-secondary">
        {statusMessage}
      </SmartyText>
      {showRefreshButton && payments.length > 0 && !isRefreshError && (
        <SmartySecondaryButton
          disabled={isPending || isRetryDisabled}
          onPress={handleRefresh}>
          {en.paymentHistoryRefresh}
        </SmartySecondaryButton>
      )}
      <View
        className="flex-1"
        aria-hidden={isPending || undefined}
        importantForAccessibility={isPending ? 'no-hide-descendants' : 'auto'}>
        <SmartyFlatList
          ref={listRef}
          testID="payment-history-list"
          isLoading={isPending}
          data={payments}
          ListHeaderComponent={
            isRefreshError ? (
              <PaymentRetry
                message={en.paymentHistoryRefreshError}
                label={en.paymentHistoryRetryRefresh}
                onRetry={handleRefresh}
                disabled={isRetryDisabled}
              />
            ) : null
          }
          keyExtractor={(payment, index) => payment.id || `missing-id-${index}`}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          renderItem={({item}) => <PaymentItem payment={item} />}
          ListEmptyComponent={
            isInitialError ? (
              <PaymentRetry
                message={en.paymentHistoryInitialError}
                label={en.paymentHistoryRetryInitial}
                onRetry={onRetryInitial}
                disabled={isRetryDisabled}
              />
            ) : (
              <SmartyText
                aria-live="polite"
                className="text-foreground-primary">
                {en.paymentHistoryEmpty}
              </SmartyText>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View aria-hidden importantForAccessibility="no-hide-descendants">
                <SmartySkeletonLoading className="my-2 h-20 w-full" />
              </View>
            ) : isNextPageError ? (
              <PaymentRetry
                message={en.paymentHistoryNextPageError}
                label={en.paymentHistoryRetryNextPage}
                onRetry={onRetryNextPage}
                disabled={isRetryDisabled}
              />
            ) : null
          }
        />
      </View>
    </View>
  );
}

function PaymentRetry({
  message,
  label,
  onRetry,
  disabled,
}: {
  message: string;
  label: string;
  onRetry: () => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <View className="smarty-gap-xs py-4">
      <SmartyText
        role="alert"
        aria-live="assertive"
        className="text-foreground-primary">
        {message}
      </SmartyText>
      <SmartySecondaryButton
        accessibilityLabel={label}
        disabled={disabled}
        onPress={onRetry}>
        {en.paymentHistoryRetry}
      </SmartySecondaryButton>
    </View>
  );
}

function PaymentItem({payment}: {payment: Payment}): JSX.Element {
  const formattedDate =
    payment.date?.formatDate(DateFormat.DayShortMonthYear) ??
    en.paymentHistoryMissingDate;

  const formattedAmount = payment.price
    ? new SmartyPrice(payment.price).formatPrice(true)
    : en.paymentHistoryMissingAmount;

  return (
    <View className="smarty-gap-xs border-b border-background-tertiary py-4">
      <SmartyText className="smarty-heading-xs text-foreground-primary">
        {payment.description ?? en.paymentHistoryMissingDescription}
      </SmartyText>
      <SmartyText className="text-foreground-primary">
        {formattedAmount}
      </SmartyText>
      <SmartyText className="text-foreground-secondary">
        {formattedDate}
      </SmartyText>
      <SmartyText className="text-foreground-secondary">
        {payment.status
          ? en.paymentHistoryStatuses[payment.status]
          : en.paymentHistoryMissingStatus}
      </SmartyText>
    </View>
  );
}
