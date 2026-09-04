'use client';
import { Card } from '@/components/ui/Card';

interface Mismatch {
  source1: string;
  source2: string;
  field: string;
  val1: string | number;
  val2: string | number;
  diff?: string;
}

interface DiscrepancyCardProps {
  mismatches: Mismatch[];
}

export function DiscrepancyCard({ mismatches }: DiscrepancyCardProps) {
  return (
    <Card variant="danger" className="mb-4 animate-shake">
      <div className="bg-[var(--accent-danger-subtle)] p-4 border-b border-[var(--accent-danger)]/20 flex items-center">
        <svg className="w-5 h-5 text-[var(--accent-danger)] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="font-semibold text-[var(--accent-danger)]">Discrepancy Detected</h3>
      </div>
      
      <div className="p-4">
        {mismatches.map((m, idx) => (
          <div key={idx} className="mb-4 last:mb-0 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] p-3">
            <div className="text-sm font-medium text-[var(--text-secondary)] mb-2 capitalize">
              {m.field} Mismatch
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1 bg-[var(--bg-elevated)] p-2 rounded">
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{m.source1}</div>
                <div className="font-mono text-sm mt-1">{m.val1}</div>
              </div>
              <div className="px-4 text-[var(--text-tertiary)]">vs</div>
              <div className="flex-1 bg-[var(--bg-elevated)] p-2 rounded">
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{m.source2}</div>
                <div className="font-mono text-sm mt-1">{m.val2}</div>
              </div>
            </div>
            {m.diff && (
              <div className="mt-2 text-xs font-semibold text-[var(--accent-danger)] text-right">
                Difference: {m.diff}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
