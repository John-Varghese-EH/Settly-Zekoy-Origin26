import * as fs from 'fs';
import * as path from 'path';
import { GatewayLog, BankSettlement, LedgerEntry, TransactionRecord } from '@/types/transaction';

// Global in-memory data store for serverless environments
let gatewayLogs: GatewayLog[] = [];
let bankSettlements: BankSettlement[] = [];
let ledgerEntries: LedgerEntry[] = [];
let isInitialized = false;

function parseCSV(filePath: string) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map((line, idx) => {
    const values = line.split(',');
    const obj: Record<string, any> = { id: `csv_${idx}_${Math.random().toString(36).substring(2, 9)}` };
    headers.forEach((header, index) => {
      let val: any = values[index]?.trim();
      if (val === 'false') val = false;
      else if (val === 'true') val = true;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      obj[header] = val;
    });
    return obj;
  });
}

function initData() {
  if (isInitialized) return;
  const dataDir = path.join(process.cwd(), 'mock_data');
  gatewayLogs = parseCSV(path.join(dataDir, 'gateway_logs.csv')) as GatewayLog[];
  bankSettlements = parseCSV(path.join(dataDir, 'bank_settlements.csv')) as BankSettlement[];
  ledgerEntries = parseCSV(path.join(dataDir, 'ledger_entries.csv')) as LedgerEntry[];
  
  // Ensure booleans are proper booleans and metadata is parsed
  gatewayLogs = gatewayLogs.map(g => ({ ...g, metadata: typeof g.metadata === 'string' ? JSON.parse(g.metadata || '{}') : {} }));
  isInitialized = true;
}

export async function getGatewayLog(transactionId: string): Promise<GatewayLog | null> {
  initData();
  const log = gatewayLogs.find(g => g.transaction_id === transactionId);
  return log || null;
}

export async function getBankSettlement(transactionId: string): Promise<BankSettlement | null> {
  initData();
  const settlement = bankSettlements.find(b => b.transaction_id === transactionId);
  return settlement || null;
}

export async function getLedgerEntry(transactionId: string): Promise<LedgerEntry | null> {
  initData();
  const entry = ledgerEntries.find(l => l.transaction_id === transactionId);
  return entry || null;
}

export async function getTransactionRecord(transactionId: string): Promise<TransactionRecord> {
  initData();
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
  initData();
  // Find transactions that exist in gateway but are missing in bank or ledger
  const exceptionIds = gatewayLogs
    .filter(g => !bankSettlements.some(b => b.transaction_id === g.transaction_id) || 
                 !ledgerEntries.some(l => l.transaction_id === g.transaction_id))
    .map(g => g.transaction_id);

  const exceptions: TransactionRecord[] = [];
  for (const id of exceptionIds) {
    exceptions.push(await getTransactionRecord(id));
  }
  
  return exceptions;
}

export async function getTransactionsByDateRange(from: string, to: string): Promise<TransactionRecord[]> {
  initData();
  const records: TransactionRecord[] = [];
  const matches = gatewayLogs.filter(g => g.gateway_timestamp >= from && g.gateway_timestamp <= to);
  for (const match of matches) {
    records.push(await getTransactionRecord(match.transaction_id));
  }
  return records;
}

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  initData();
  const records: TransactionRecord[] = [];
  for (const g of gatewayLogs) {
    records.push(await getTransactionRecord(g.transaction_id));
  }
  return records;
}

export async function autoResolveTransaction(transactionId: string): Promise<{ resolved: boolean; message: string }> {
  initData();
  const record = await getTransactionRecord(transactionId);
  
  if (!record.gateway) {
    return { resolved: false, message: 'Cannot resolve: No gateway record found. Transaction does not exist.' };
  }
  
  let resolvedBank = false;
  let resolvedLedger = false;
  
  // If it's missing in bank, insert a pending settlement
  if (!record.bank) {
    bankSettlements.push({
      id: `bs_auto_${Math.random().toString(36).substr(2, 9)}`,
      transaction_id: transactionId,
      settlement_batch_id: 'BATCH-AUTO-RESOLVE',
      amount: record.gateway.amount,
      status: 'pending',
      bank_timestamp: new Date().toISOString(),
      settlement_date: new Date().toISOString().split('T')[0]
    });
    resolvedBank = true;
  }
  
  // If it's missing in ledger, insert a posted entry
  if (!record.ledger) {
    ledgerEntries.push({
      id: `le_auto_${Math.random().toString(36).substr(2, 9)}`,
      transaction_id: transactionId,
      debit_account: 'ACCT-REC-AUTO',
      credit_account: 'ACCT-REV-AUTO',
      amount: record.gateway.amount,
      status: 'posted',
      ledger_timestamp: new Date().toISOString(),
      reconciliation_flag: true
    });
    resolvedLedger = true;
  }
  
  if (resolvedBank && resolvedLedger) {
    return { resolved: true, message: 'Automatically resolved missing Bank Settlement and Ledger Entry records.' };
  } else if (resolvedBank) {
    return { resolved: true, message: 'Automatically resolved missing Bank Settlement record.' };
  } else if (resolvedLedger) {
    return { resolved: true, message: 'Automatically resolved missing Ledger Entry record.' };
  }
  
  return { resolved: false, message: 'No missing records found to resolve. Anomaly might be a timing or amount mismatch which requires manual review.' };
}
