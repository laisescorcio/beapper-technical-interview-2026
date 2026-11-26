import {SmartyDate} from './smartyDate';
import {PriceValue} from './smartyPrice';

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id?: string;
  description?: string;
  date?: SmartyDate;
  price?: PriceValue;
  status?: PaymentStatus;
}
