export interface GatewayLog {
  id: string;
  transaction_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  card_last_four: string;
  status: 'captured' | 'authorized' | 'failed' | 'refunded';
  gateway_timestamp: string;
  metadata: Record<string, unknown>;
}

export interface BankSettlement {
  id: string;
  transaction_id: string;
  settlement_batch_id: string;
  amount: number;
  status: 'pending' | 'settled' | 'rejected' | 'returned';
  bank_timestamp: string;
  settlement_date: string;
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  debit_account: string;
  credit_account: string;
  amount: number;
  status: 'posted' | 'pending' | 'reversed';
  ledger_timestamp: string;
  reconciliation_flag: boolean;
}

export interface TransactionRecord {
  gateway?: GatewayLog;
  bank?: BankSettlement;
  ledger?: LedgerEntry;
}
