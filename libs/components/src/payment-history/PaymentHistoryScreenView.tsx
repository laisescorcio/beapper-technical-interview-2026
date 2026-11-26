import {ReceiptText} from '@smarty-app/assets';
import {SmartyAlertPanel, SmartyFlatList} from '@smarty-app/controls';
import {
  SmartyIcon,
  SmartyIconSize,
  SmartySecondaryButton,
  SmartySkeletonLoading,
  SmartyTertiaryButton,
  SmartyText,
} from '@smarty-app/controls-basic';
import {DateFormat, Payment, SmartyPrice} from '@smarty-app/core';
import {en} from '@smarty-app/language';
import {usePaymentHistoryApiInteraction} from '@smarty-app/ui-api-interaction';
import {JSX} from 'react';
import {Platform, View} from 'react-native';

/**
 * Main view for PaymentHistoryScreen.
 *
 * @returns JSX.Element
 */
export function PaymentHistoryScreenView(): JSX.Element {
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

  const isListLoading = isPending || isRefreshing;
  const isRetryDisabled = isFetching || isRefreshing;

  return (
    <View testID="payment-history-screen-view">
      <SmartyText aria-live="polite" className="text-foreground-secondary">
        {isFetchingNextPage ? en.paymentHistoryLoadingMore : ''}
      </SmartyText>
      {Platform.OS === 'web' && payments.length > 0 && !isRefreshError && (
        <SmartyTertiaryButton
          className="self-end"
          textClassName="px-3 py-2"
          disabled={isPending || isRetryDisabled}
          onPress={() => onRefresh()}>
          {en.paymentHistoryRefresh}
        </SmartyTertiaryButton>
      )}
      <View
        className="flex-1"
        aria-hidden={isListLoading || undefined}
        importantForAccessibility={
          isListLoading ? 'no-hide-descendants' : 'auto'
        }>
        <SmartyFlatList
          testID="payment-history-list"
          contentContainerClassName="smarty-pb-2xl"
          isLoading={isListLoading}
          data={payments}
          ListHeaderComponent={
            isRefreshError ? (
              <View className="py-4">
                <SmartySecondaryButton
                  accessibilityLabel={en.paymentHistoryRetryRefresh}
                  disabled={isRetryDisabled}
                  onPress={() => onRefresh()}>
                  {en.paymentHistoryRetry}
                </SmartySecondaryButton>
              </View>
            ) : null
          }
          keyExtractor={(payment, index) => payment.id || `missing-id-${index}`}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          renderItem={({item}) => <PaymentItem payment={item} />}
          ListEmptyComponent={
            isInitialError ? (
              <PaymentLoadError
                className="min-h-48 justify-center py-8"
                message={en.paymentHistoryInitialError}
                label={en.paymentHistoryRetryInitial}
                onRetry={onRetryInitial}
                disabled={isRetryDisabled}
              />
            ) : (
              <View className="min-h-48 items-center justify-center smarty-gap-m px-4 py-8">
                <View
                  aria-hidden
                  importantForAccessibility="no-hide-descendants">
                  <SmartyIcon icon={ReceiptText} size={SmartyIconSize.Large} />
                </View>
                <SmartyText
                  aria-live="polite"
                  className="text-center text-foreground-primary">
                  {en.paymentHistoryEmpty}
                </SmartyText>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View aria-hidden importantForAccessibility="no-hide-descendants">
                <SmartySkeletonLoading className="my-2 h-20 w-full" />
              </View>
            ) : isNextPageError ? (
              <PaymentLoadError
                className="py-4"
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

function PaymentLoadError({
  className,
  message,
  label,
  onRetry,
  disabled,
}: {
  className: string;
  message: string;
  label: string;
  onRetry: () => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <View aria-live="assertive" className={`items-center px-4 ${className}`}>
      <SmartyAlertPanel
        className="w-full max-w-sm"
        alertType="error"
        alertBodyText={message}
        extraContent={
          <SmartyTertiaryButton
            className="self-start"
            textClassName="px-3 py-2"
            accessibilityLabel={label}
            disabled={disabled}
            onPress={onRetry}>
            {en.paymentHistoryRetry}
          </SmartyTertiaryButton>
        }
      />
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
