import * as fs from 'fs';
import * as path from 'path';
import { GatewayLog, BankSettlement, LedgerEntry, TransactionRecord } from '@/types/transaction';

function parseCSV<T>(filePath: string): T[] {
  try {
    const fullPath = path.join(process.cwd(), 'data', filePath);
    if (!fs.existsSync(fullPath)) return [];
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        let val: any = values[index]?.trim();
        // Auto-cast
        if (val === 'false') val = false;
        else if (val === 'true') val = true;
        else if (!isNaN(Number(val)) && val !== '') val = Number(val);

        obj[header] = val;
      });
      return obj as T;
    });
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return [];
  }
}

let gatewayLogsCache: GatewayLog[] | null = null;
let bankSettlementsCache: BankSettlement[] | null = null;
let ledgerEntriesCache: LedgerEntry[] | null = null;

function loadData() {
  if (!gatewayLogsCache) gatewayLogsCache = parseCSV<GatewayLog>('gateway_logs.csv');
  if (!bankSettlementsCache) bankSettlementsCache = parseCSV<BankSettlement>('bank_settlements.csv');
  if (!ledgerEntriesCache) ledgerEntriesCache = parseCSV<LedgerEntry>('ledger_entries.csv');
}

export async function getGatewayLog(transactionId: string): Promise<GatewayLog | null> {
  loadData();
  return gatewayLogsCache?.find(log => log.transaction_id === transactionId) || null;
}

export async function getBankSettlement(transactionId: string): Promise<BankSettlement | null> {
  loadData();
  return bankSettlementsCache?.find(log => log.transaction_id === transactionId) || null;
}

export async function getLedgerEntry(transactionId: string): Promise<LedgerEntry | null> {
  loadData();
  return ledgerEntriesCache?.find(log => log.transaction_id === transactionId) || null;
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
  loadData();
  const exceptions: TransactionRecord[] = [];
  
  for (const log of gatewayLogsCache || []) {
    const bank = await getBankSettlement(log.transaction_id);
    const ledger = await getLedgerEntry(log.transaction_id);
    // Basic exception criteria: missing bank or ledger
    if (!bank || !ledger) {
      exceptions.push({ gateway: log, bank: bank || undefined, ledger: ledger || undefined });
    }
  }
  return exceptions;
}

export async function getTransactionsByDateRange(from: string, to: string): Promise<TransactionRecord[]> {
  loadData();
  const records: TransactionRecord[] = [];
  
  for (const log of gatewayLogsCache || []) {
    if (log.gateway_timestamp >= from && log.gateway_timestamp <= to) {
      records.push(await getTransactionRecord(log.transaction_id));
    }
  }
  
  return records;
}

export async function getAllTransactions(): Promise<TransactionRecord[]> {
  loadData();
  const records: TransactionRecord[] = [];
  for (const log of gatewayLogsCache || []) {
    records.push(await getTransactionRecord(log.transaction_id));
  }
  return records;
}
