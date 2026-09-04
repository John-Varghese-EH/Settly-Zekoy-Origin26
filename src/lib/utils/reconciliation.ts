import { TransactionRecord } from '@/types/transaction';

export interface ReconciliationResult {
  hasDiscrepancy: boolean;
  missingFrom: ('gateway' | 'bank' | 'ledger')[];
  amountMismatches: Array<{source1: string, source2: string, amount1: number, amount2: number, difference: number}>;
  timingAnomalies: Array<{description: string, timestamp1: string, timestamp2: string}>;
  statusConflicts: Array<{source: string, status: string, expectedStatus: string}>;
}

export function reconcileTransaction(record: TransactionRecord): ReconciliationResult {
  const result: ReconciliationResult = {
    hasDiscrepancy: false,
    missingFrom: [],
    amountMismatches: [],
    timingAnomalies: [],
    statusConflicts: [],
  };

  if (!record.gateway) result.missingFrom.push('gateway');
  if (!record.bank) result.missingFrom.push('bank');
  if (!record.ledger) result.missingFrom.push('ledger');

  // Amount mismatch checks > $0.01 threshold due to potential rounding weirdness
  const checkAmount = (s1: string, s2: string, a1?: number, a2?: number) => {
    if (a1 !== undefined && a2 !== undefined && Math.abs(a1 - a2) > 0.01) {
      result.amountMismatches.push({ source1: s1, source2: s2, amount1: a1, amount2: a2, difference: Math.abs(a1 - a2) });
    }
  };

  checkAmount('gateway', 'bank', record.gateway?.amount, record.bank?.amount);
  checkAmount('gateway', 'ledger', record.gateway?.amount, record.ledger?.amount);

  // Race condition between gateway capture and bank webhook means we can't assume strict temporal ordering 100% of time, but large gaps or ledger preceding gateway is an anomaly.
  if (record.gateway && record.ledger) {
    if (new Date(record.ledger.ledger_timestamp) < new Date(record.gateway.gateway_timestamp)) {
      result.timingAnomalies.push({
        description: 'Ledger posted before gateway capture',
        timestamp1: record.ledger.ledger_timestamp,
        timestamp2: record.gateway.gateway_timestamp,
      });
    }
  }

  // Status conflicts
  if (record.bank?.status === 'rejected' && record.ledger?.status === 'posted') {
    result.statusConflicts.push({ source: 'ledger', status: 'posted', expectedStatus: 'reversed/pending' });
  }

  if (
    result.missingFrom.length > 0 ||
    result.amountMismatches.length > 0 ||
    result.timingAnomalies.length > 0 ||
    result.statusConflicts.length > 0
  ) {
    result.hasDiscrepancy = true;
  }

  return result;
}
