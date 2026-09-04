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

export async function autoResolveTransaction(transactionId: string): Promise<{ resolved: boolean; message: string }> {
  const db = getDb();
  const record = await getTransactionRecord(transactionId);
  
  if (!record.gateway) {
    return { resolved: false, message: 'Cannot resolve: No gateway record found. Transaction does not exist.' };
  }
  
  let resolvedBank = false;
  let resolvedLedger = false;
  
  db.transaction(() => {
    // If it's missing in bank, insert a pending settlement
    if (!record.bank) {
      const insertBank = db.prepare(`
        INSERT INTO bank_settlements (id, transaction_id, settlement_batch_id, amount, status, bank_timestamp, settlement_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      insertBank.run(
        `bs_auto_${Math.random().toString(36).substr(2, 9)}`,
        transactionId,
        'BATCH-AUTO-RESOLVE',
        record.gateway!.amount,
        'pending',
        new Date().toISOString(),
        new Date().toISOString().split('T')[0]
      );
      resolvedBank = true;
    }
    
    // If it's missing in ledger, insert a posted entry
    if (!record.ledger) {
      const insertLedger = db.prepare(`
        INSERT INTO ledger_entries (id, transaction_id, debit_account, credit_account, amount, status, ledger_timestamp, reconciliation_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insertLedger.run(
        `le_auto_${Math.random().toString(36).substr(2, 9)}`,
        transactionId,
        'ACCT-REC-AUTO',
        'ACCT-REV-AUTO',
        record.gateway!.amount,
        'posted',
        new Date().toISOString(),
        1 // 1 for true
      );
      resolvedLedger = true;
    }
  })();
  
  if (resolvedBank && resolvedLedger) {
    return { resolved: true, message: 'Automatically resolved missing Bank Settlement and Ledger Entry records.' };
  } else if (resolvedBank) {
    return { resolved: true, message: 'Automatically resolved missing Bank Settlement record.' };
  } else if (resolvedLedger) {
    return { resolved: true, message: 'Automatically resolved missing Ledger Entry record.' };
  }
  
  return { resolved: false, message: 'No missing records found to resolve. Anomaly might be a timing or amount mismatch which requires manual review.' };
}
