import { useState, useEffect } from 'react';

export interface UIException {
  id: string;
  label: string;
  severity: 'critical' | 'warning';
  resolved: boolean;
  txnId: string;
  code: string;
  reason: string;
  timestamp: string;
}

export interface UITransaction {
  id: string;
  status: 'settled' | 'failed' | 'pending';
  merchant: string;
  type: string;
  bank: string;
  amount: string;
}

export function useDashboardData() {
  const [exceptions, setExceptions] = useState<UIException[]>([]);
  const [transactions, setTransactions] = useState<UITransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.exceptions) {
          const uiExc = data.exceptions.map((e: any) => ({
            id: e.gateway?.transaction_id || Math.random().toString(),
            label: e.gateway?.amount > 50 ? 'Critical Failure' : 'Warning',
            severity: e.gateway?.amount > 50 ? 'critical' : 'warning',
            resolved: false,
            txnId: e.gateway?.transaction_id,
            code: 'SYNC_FAIL',
            reason: !e.bank ? 'Missing from bank settlement' : 'Missing from ledger',
            timestamp: e.gateway?.gateway_timestamp
          }));
          setExceptions(uiExc);
        }
        if (data.transactions) {
          const uiTxns = data.transactions.map((t: any) => ({
            id: t.gateway?.transaction_id,
            status: t.bank?.status === 'rejected' ? 'failed' : (t.ledger ? 'settled' : 'pending'),
            merchant: t.gateway?.merchant_id || 'Unknown',
            type: 'Payment',
            bank: 'GlobalBank',
            amount: `$${t.gateway?.amount}`
          }));
          setTransactions(uiTxns);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
        setLoading(false);
      });
  }, []);

  return { exceptions, transactions, loading };
}
