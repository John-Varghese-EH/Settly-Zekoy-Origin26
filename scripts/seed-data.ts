import { getDb } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      let val = values[index]?.trim();
      if (val === 'false') val = 0 as any; // SQLite stores booleans as 0/1
      else if (val === 'true') val = 1 as any;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val) as any;
      
      obj[header] = val;
    });
    return obj;
  });
}

function seed() {
  console.log('Starting seed process for SQLite Database from CSVs...');
  const db = getDb();

  // Create tables
  db.exec(`
    DROP TABLE IF EXISTS gateway_logs;
    DROP TABLE IF EXISTS bank_settlements;
    DROP TABLE IF EXISTS ledger_entries;

    CREATE TABLE gateway_logs (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      merchant_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      card_last_four TEXT NOT NULL,
      status TEXT NOT NULL,
      gateway_timestamp TEXT NOT NULL,
      metadata TEXT
    );

    CREATE TABLE bank_settlements (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      settlement_batch_id TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      bank_timestamp TEXT NOT NULL,
      settlement_date TEXT NOT NULL
    );

    CREATE TABLE ledger_entries (
      id TEXT PRIMARY KEY,
      transaction_id TEXT UNIQUE NOT NULL,
      debit_account TEXT NOT NULL,
      credit_account TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      ledger_timestamp TEXT NOT NULL,
      reconciliation_flag INTEGER NOT NULL
    );
  `);

  const dataDir = path.join(process.cwd(), 'mock_data');
  
  if (!fs.existsSync(dataDir)) {
    console.error('No mock_data folder found. Skipping seed.');
    return;
  }

  const gatewayLogs = parseCSV(path.join(dataDir, 'gateway_logs.csv'));
  const bankSettlements = parseCSV(path.join(dataDir, 'bank_settlements.csv'));
  const ledgerEntries = parseCSV(path.join(dataDir, 'ledger_entries.csv'));

  const insertGateway = db.prepare(`
    INSERT INTO gateway_logs (id, transaction_id, merchant_id, amount, currency, card_last_four, status, gateway_timestamp, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertBank = db.prepare(`
    INSERT INTO bank_settlements (id, transaction_id, settlement_batch_id, amount, status, bank_timestamp, settlement_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const insertLedger = db.prepare(`
    INSERT INTO ledger_entries (id, transaction_id, debit_account, credit_account, amount, status, ledger_timestamp, reconciliation_flag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const log of gatewayLogs) {
      insertGateway.run(`gl_${Math.random().toString(36).substr(2, 9)}`, log.transaction_id, log.merchant_id, log.amount, log.currency, log.card_last_four, log.status, log.gateway_timestamp, '{}');
    }
    for (const settlement of bankSettlements) {
      insertBank.run(`bs_${Math.random().toString(36).substr(2, 9)}`, settlement.transaction_id, settlement.settlement_batch_id, settlement.amount, settlement.status, settlement.bank_timestamp, settlement.settlement_date);
    }
    for (const entry of ledgerEntries) {
      insertLedger.run(`le_${Math.random().toString(36).substr(2, 9)}`, entry.transaction_id, entry.debit_account, entry.credit_account, entry.amount, entry.status, entry.ledger_timestamp, entry.reconciliation_flag);
    }
  })();

  console.log('Seed completed successfully using SQLite!');
}

seed();
