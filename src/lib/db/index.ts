import Database from 'better-sqlite3';
import path from 'path';

// Use a singleton pattern to reuse the database connection in the Next.js API
let db: Database.Database;

export function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'settly.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}
