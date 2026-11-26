'use client';
import {PaymentHistoryScreenView} from '@smarty-app/components';
import {en} from '@smarty-app/language';
import {useRouter} from 'next/navigation';

import StackRootView from '@/components/common/StackRootView';

import styles from './PaymentHistory.module.css';

/**
 * PaymentHistoryScreen.
 *
 * @returns A React element.
 */
export default function PaymentHistoryScreen() {
  const router = useRouter();

  return (
    <StackRootView
      topBarOptions={{
        title: en.paymentHistoryTitle,
        goBack: () => router.push('/dashboard/account'),
      }}>
      <div className={styles.viewport}>
        <PaymentHistoryScreenView />
      </div>
    </StackRootView>
  );
}
