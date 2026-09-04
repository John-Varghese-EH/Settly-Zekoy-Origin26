'use client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ExceptionCardProps {
  missingSources: string[];
  foundSources: string[];
}

export function ExceptionCard({ missingSources, foundSources }: ExceptionCardProps) {
  return (
    <Card variant="warning" className="mb-4 shadow-[0_0_15px_var(--accent-warning-subtle)] border-[var(--accent-warning)]">
      <div className="p-5 border-b border-[var(--border-subtle)] flex items-center bg-[var(--accent-warning-subtle)]">
        <svg className="w-6 h-6 text-[var(--accent-warning)] mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-semibold text-[var(--accent-warning)] text-lg">Exception - Escalation Required</h3>
      </div>
      
      <div className="p-5">
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          The system could not automatically reconcile this transaction due to missing records.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--bg-elevated)] p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
            <span className="block text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Found Records</span>
            <ul className="text-sm font-medium text-[var(--text-primary)]">
              {foundSources.map(s => <li key={s} className="flex items-center"><span className="w-1.5 h-1.5 bg-[var(--accent-success)] rounded-full mr-2"/>{s}</li>)}
            </ul>
          </div>
          <div className="bg-[var(--bg-elevated)] p-3 rounded-[var(--radius-sm)] border border-[var(--accent-danger)]/30">
            <span className="block text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Missing Records</span>
            <ul className="text-sm font-medium text-[var(--accent-danger)]">
              {missingSources.map(s => <li key={s} className="flex items-center"><span className="w-1.5 h-1.5 bg-[var(--accent-danger)] rounded-full mr-2"/>{s}</li>)}
            </ul>
          </div>
        </div>
        
        <Button variant="danger" className="w-full justify-center">
          Escalate to Operations
        </Button>
      </div>
    </Card>
  );
}
