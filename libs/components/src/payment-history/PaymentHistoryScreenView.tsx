import {SmartyFlatList, SmartyFlatListRenderer} from '@smarty-app/controls';
import {
  SmartySecondaryButton,
  SmartySkeletonLoading,
  SmartyText,
} from '@smarty-app/controls-basic';
import {Currency, DateFormat, SmartyDate, SmartyPrice} from '@smarty-app/core';
import {en} from '@smarty-app/language';
import {usePaymentHistoryApiInteraction} from '@smarty-app/ui-api-interaction';
import {JSX, useState} from 'react';
import {View, ViewProps} from 'react-native';

interface PaymentHistoryScreenViewProps extends ViewProps {
  List?: SmartyFlatListRenderer;
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
    List = SmartyFlatList,
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

  const [listVersion, setListVersion] = useState(0);
  const handleRefresh = () => {
    // Start at the top when the refreshed first page replaces the previous pages.
    onRefresh(() => setListVersion((version) => version + 1));
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
      {showRefreshButton && !isRefreshError && (
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
        <List
          key={listVersion}
          testID="payment-history-list"
          isLoading={isPending}
          data={payments}
          onRefresh={showRefreshButton ? undefined : handleRefresh}
          refreshing={isRefreshing}
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
