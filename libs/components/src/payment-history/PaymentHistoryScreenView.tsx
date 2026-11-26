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
import {
  DateFormat,
  Payment,
  PaymentStatus,
  SmartyPrice,
} from '@smarty-app/core';
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
  const showRefresh =
    Platform.OS === 'web' && payments.length > 0 && !isRefreshError;

  return (
    <View testID="payment-history-screen-view">
      <SmartyText aria-live="polite" className="text-foreground-secondary">
        {isFetchingNextPage ? en.paymentHistoryLoadingMore : ''}
      </SmartyText>
      {showRefresh && (
        <SmartyTertiaryButton
          className="self-end"
          textClassName="px-3 py-2"
          disabled={isPending || isRetryDisabled}
          onPress={() => onRefresh()}>
          {en.paymentHistoryRefresh}
        </SmartyTertiaryButton>
      )}
      {Platform.OS === 'web' && isListLoading && !showRefresh && (
        <View aria-hidden className="h-9" />
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
          skeletonClassName="h-28 my-0"
          skeletonContainerClassName="smarty-gap-m"
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
                <SmartySkeletonLoading className="h-28 w-full" />
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

const paymentItemClassName =
  'min-h-28 justify-center smarty-gap-s smarty-px-l smarty-py-xl border-b border-background-tertiary';
const paymentItemLineClassName =
  'flex-row items-center justify-between smarty-gap-xl';

const neutralStatusStyle = {
  background: 'bg-background-tertiary',
  text: 'text-foreground-secondary',
};

const paymentStatusStyles: Record<
  PaymentStatus,
  {background: string; text: string}
> = {
  PAID: {background: 'bg-background-accent', text: 'text-brand-slate-800'},
  PENDING: {background: 'bg-background-promo', text: 'text-brand-slate-800'},
  FAILED: {
    background: 'bg-background-primary border border-stroke-medium',
    text: 'text-foreground-warning',
  },
  REFUNDED: neutralStatusStyle,
};

function PaymentItem({payment}: {payment: Payment}): JSX.Element {
  const formattedDate =
    payment.date?.formatDate(DateFormat.DayShortMonthYear) ??
    en.paymentHistoryMissingDate;

  const formattedAmount = payment.price
    ? new SmartyPrice(payment.price).formatPrice(true)
    : en.paymentHistoryMissingAmount;

  const {status} = payment;
  const statusStyle = status ? paymentStatusStyles[status] : neutralStatusStyle;

  return (
    <View className={paymentItemClassName}>
      <View className={paymentItemLineClassName}>
        <SmartyText className="min-w-0 flex-1 smarty-body-l font-semibold text-foreground-primary">
          {payment.description ?? en.paymentHistoryMissingDescription}
        </SmartyText>
        <SmartyText className="text-right smarty-body-l font-semibold text-foreground-primary">
          {formattedAmount}
        </SmartyText>
      </View>
      <View className={paymentItemLineClassName}>
        <SmartyText className="min-w-0 flex-1 smarty-caption-l text-foreground-secondary">
          {formattedDate}
        </SmartyText>
        <View
          className={`min-h-6 justify-center smarty-rounded-l smarty-px-m ${statusStyle.background}`}>
          <SmartyText className={`smarty-caption-l ${statusStyle.text}`}>
            {status
              ? en.paymentHistoryStatuses[status]
              : en.paymentHistoryMissingStatus}
          </SmartyText>
        </View>
      </View>
    </View>
  );
}
