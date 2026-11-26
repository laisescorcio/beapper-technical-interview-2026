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
import {en} from '@smarty-app/language';
import {usePaymentHistoryApiInteraction} from '@smarty-app/ui-api-interaction';
import {JSX} from 'react';
import {Platform, View} from 'react-native';

import {PaymentItem} from './PaymentItem';

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
  const isWeb = Platform.OS === 'web';
  const showRefresh = isWeb && payments.length > 0 && !isRefreshError;
  const showRefreshPlaceholder = isWeb && isListLoading && !showRefresh;
  const handleRefresh = () => onRefresh();

  const refreshErrorHeader = isRefreshError ? (
    <View className="py-4">
      <SmartySecondaryButton
        accessibilityLabel={en.paymentHistoryRetryRefresh}
        disabled={isRetryDisabled}
        onPress={handleRefresh}>
        {en.paymentHistoryRetry}
      </SmartySecondaryButton>
    </View>
  ) : null;

  const emptyContent = isInitialError ? (
    <PaymentLoadError
      className="min-h-48 justify-center py-8"
      message={en.paymentHistoryInitialError}
      label={en.paymentHistoryRetryInitial}
      onRetry={onRetryInitial}
      disabled={isRetryDisabled}
    />
  ) : (
    <View className="min-h-48 items-center justify-center smarty-gap-m px-4 py-8">
      <View aria-hidden importantForAccessibility="no-hide-descendants">
        <SmartyIcon icon={ReceiptText} size={SmartyIconSize.Large} />
      </View>
      <SmartyText
        aria-live="polite"
        className="text-center text-foreground-primary">
        {en.paymentHistoryEmpty}
      </SmartyText>
    </View>
  );

  const renderPaginationFooter = () => {
    if (isFetchingNextPage) {
      return <SmartySkeletonLoading className="h-28 w-full" />;
    }

    if (isNextPageError) {
      return (
        <PaymentLoadError
          className="py-4"
          message={en.paymentHistoryNextPageError}
          label={en.paymentHistoryRetryNextPage}
          onRetry={onRetryNextPage}
          disabled={isRetryDisabled}
        />
      );
    }

    return null;
  };

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
          onPress={handleRefresh}>
          {en.paymentHistoryRefresh}
        </SmartyTertiaryButton>
      )}
      {showRefreshPlaceholder && <View aria-hidden className="h-9" />}
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
          ListHeaderComponent={refreshErrorHeader}
          keyExtractor={(payment, index) => payment.id || `missing-id-${index}`}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          renderItem={({item}) => <PaymentItem payment={item} />}
          ListEmptyComponent={emptyContent}
          ListFooterComponent={renderPaginationFooter()}
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
