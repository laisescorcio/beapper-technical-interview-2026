import {SmartyText} from '@smarty-app/controls-basic';
import {
  DateFormat,
  Payment,
  PaymentStatus,
  SmartyPrice,
} from '@smarty-app/core';
import {en} from '@smarty-app/language';
import {JSX} from 'react';
import {View} from 'react-native';

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

/**
 * Renders one payment with its formatted amount, date and status.
 *
 * @param props - Component props.
 * @param props.payment - The payment to display.
 * @returns A row in the payment history list.
 */
export function PaymentItem({payment}: {payment: Payment}): JSX.Element {
  const formattedDate =
    payment.date?.formatDate(DateFormat.DayShortMonthYear) ??
    en.paymentHistoryMissingDate;

  const formattedAmount = payment.price
    ? new SmartyPrice(payment.price).formatPrice(true)
    : en.paymentHistoryMissingAmount;

  const {status} = payment;
  const statusStyle = status ? paymentStatusStyles[status] : neutralStatusStyle;
  const statusLabel = status
    ? en.paymentHistoryStatuses[status]
    : en.paymentHistoryMissingStatus;

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
            {statusLabel}
          </SmartyText>
        </View>
      </View>
    </View>
  );
}
