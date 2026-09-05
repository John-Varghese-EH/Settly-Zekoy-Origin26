import * as fs from 'fs';
import * as path from 'path';

export interface ResolutionLogEntry {
  timestamp: string;
  transaction_id: string;
  action: 'auto_resolved' | 'escalated' | 'retry_settlement' | 'auto_closed' | 'notification_sent';
  category: string;
  confidence_score: number;
  details: string;
  agent_id: string;
}

// In-memory log for serverless environments
const resolutionLog: ResolutionLogEntry[] = [];

export function logResolution(entry: Omit<ResolutionLogEntry, 'timestamp' | 'agent_id'>): ResolutionLogEntry {
  const fullEntry: ResolutionLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    agent_id: 'settly-agent-v1',
  };
  resolutionLog.push(fullEntry);

  // Also attempt to append to CSV file for persistence (best-effort)
  try {
    const logPath = path.join(process.cwd(), 'mock_data', 'resolution_log.csv');
    const csvLine = `${fullEntry.timestamp},${fullEntry.transaction_id},${fullEntry.action},${fullEntry.category},${fullEntry.confidence_score},"${fullEntry.details}",${fullEntry.agent_id}\n`;
    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(logPath, 'timestamp,transaction_id,action,category,confidence_score,details,agent_id\n');
    }
    fs.appendFileSync(logPath, csvLine);
  } catch {
    // Serverless environments may not support writes - that's fine, we have in-memory
  }

  return fullEntry;
}

export function getResolutionLog(): ResolutionLogEntry[] {
  return [...resolutionLog];
}
