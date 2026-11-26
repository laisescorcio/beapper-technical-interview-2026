'use client';
import {PaymentHistoryScreenView} from '@smarty-app/components';
import {en} from '@smarty-app/language';

import StackRootView from '@/components/common/StackRootView';

import styles from './PaymentHistory.module.css';

/**
 * PaymentHistoryScreen.
 *
 * @returns A React element.
 */
export default function PaymentHistoryScreen() {
  return (
    <StackRootView
      topBarOptions={{
        title: en.paymentHistoryTitle,
      }}>
      <div className={styles.viewport}>
        <PaymentHistoryScreenView />
      </div>
    </StackRootView>
  );
}
