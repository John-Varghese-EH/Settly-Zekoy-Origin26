import { getDb } from '@/lib/db';
import { GatewayLog, BankSettlement, LedgerEntry, TransactionRecord } from '@/types/transaction';

export async function getGatewayLog(transactionId: string): Promise<GatewayLog | null> {
  const db = getDb();
  const row = db.prepare('SELECT * FROM gateway_logs WHERE transaction_id = ?').get(transactionId) as any;
  if (!row) return null;
  return {
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : {}
  } as GatewayLog;
}

export async function getBankSettlement(transactionId: string): Promise<BankSettlement | null> {
  const db = getDb();
  const row = db.prepare('SELECT * FROM bank_settlements WHERE transaction_id = ?').get(transactionId) as any;
  return (row as BankSettlement) || null;
}

export async function getLedgerEntry(transactionId: string): Promise<LedgerEntry | null> {
  const db = getDb();
  const row = db.prepare('SELECT * FROM ledger_entries WHERE transaction_id = ?').get(transactionId) as any;
  if (!row) return null;
  return {
    ...row,
    reconciliation_flag: row.reconciliation_flag === 1
  } as LedgerEntry;
}

export async function getTransactionRecord(transactionId: string): Promise<TransactionRecord> {
  const [gateway, bank, ledger] = await Promise.all([
    getGatewayLog(transactionId),
    getBankSettlement(transactionId),
    getLedgerEntry(transactionId),
  ]);
  
  return {
    gateway: gateway || undefined,
    bank: bank || undefined,
    ledger: ledger || undefined,
  };
}

export async function listExceptions(): Promise<TransactionRecord[]> {
  const db = getDb();
  
  // Find transactions that exist in gateway but are missing in bank or ledger
  const rows = db.prepare(`
    SELECT g.transaction_id 
    FROM gateway_logs g
    LEFT JOIN bank_settlements b ON g.transaction_id = b.transaction_id
    LEFT JOIN ledger_entries l ON g.transaction_id = l.transaction_id
    WHERE b.transaction_id IS NULL OR l.transaction_id IS NULL
  `).all() as { transaction_id: string }[];

  const exceptions: TransactionRecord[] = [];
  for (const row of rows) {
    exceptions.push(await getTransactionRecord(row.transaction_id));
  }
  
  return exceptions;
}

export async function getTransactionsByDateRange(from: string, to: string): Promise<TransactionRecord[]> {
  const db = getDb();
  const rows = db.prepare(`
    SELECT transaction_id 
    FROM gateway_logs 
    WHERE gateway_timestamp >= ? AND gateway_timestamp <= ?
  `).all(from, to) as { transaction_id: string }[];

  const records: TransactionRecord[] = [];
  for (const row of rows) {
    records.push(await getTransactionRecord(row.transaction_id));
  }
  
  return records;
}

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  const db = getDb();
  const rows = db.prepare('SELECT transaction_id FROM gateway_logs').all() as { transaction_id: string }[];
  
  const records: TransactionRecord[] = [];
  for (const row of rows) {
    records.push(await getTransactionRecord(row.transaction_id));
  }
  return records;
}
