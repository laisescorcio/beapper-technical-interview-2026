import {Payment as PaymentDto} from '@smarty-app/dx-api';

import {Payment} from '../model/payment';
import {SmartyDate} from '../model/smartyDate';
import {PriceValue} from '../model/smartyPrice';
import {currencyOrUndefined, dateOrUndefined} from './utilMapper';

/**
 * Maps a payment DTO to the app model, leaving unavailable fields undefined.
 *
 * @param dto - The payment DTO to map.
 * @returns A payment model.
 */
export function mapPaymentDtoToPayment(dto: PaymentDto): Payment {
  const date = dateOrUndefined(dto.paymentDate);

  return {
    id: dto.id?.trim() || undefined,
    description: dto.description?.trim() || undefined,
    date: date ? new SmartyDate(date) : undefined,
    price: priceOrUndefined(dto.amount, dto.currency),
    status: dto.status,
  };
}

function priceOrUndefined(
  amount?: number,
  currencyCode?: string,
): PriceValue | undefined {
  const currency = currencyOrUndefined(currencyCode);
  return amount !== undefined && currency
    ? {value: amount, currency}
    : undefined;
}
