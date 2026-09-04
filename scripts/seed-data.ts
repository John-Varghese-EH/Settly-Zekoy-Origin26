import { db } from '../src/lib/firebase/admin';
import * as fs from 'fs';
import * as path from 'path';

// Simple CSV parser
function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      let val = values[index]?.trim();
      // Auto-cast booleans and numbers
      if (val === 'false') val = false as any;
      else if (val === 'true') val = true as any;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val) as any;
      
      obj[header] = val;
    });
    return obj;
  });
}

async function seed() {
  console.log('Starting seed process for Firebase Firestore from CSVs...');
  
  // Clear existing collections
  const collections = ['gateway_logs', 'bank_settlements', 'ledger_entries'];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  // Parse CSVs
  const dataDir = path.join(process.cwd(), 'data');
  const gatewayLogs = parseCSV(path.join(dataDir, 'gateway_logs.csv'));
  const bankSettlements = parseCSV(path.join(dataDir, 'bank_settlements.csv'));
  const ledgerEntries = parseCSV(path.join(dataDir, 'ledger_entries.csv'));

  const batch = db.batch();
  
  for (const log of gatewayLogs) {
    const ref = db.collection('gateway_logs').doc();
    batch.set(ref, { id: ref.id, ...log, metadata: {} });
  }

  for (const settlement of bankSettlements) {
    const ref = db.collection('bank_settlements').doc();
    batch.set(ref, { id: ref.id, ...settlement });
  }

  for (const entry of ledgerEntries) {
    const ref = db.collection('ledger_entries').doc();
    batch.set(ref, { id: ref.id, ...entry });
  }

  await batch.commit();
  console.log('Seed completed successfully using CSV data!');
}

seed().catch(console.error);
