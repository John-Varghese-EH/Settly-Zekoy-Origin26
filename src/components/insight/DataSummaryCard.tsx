'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TransactionRecord } from '@/types/transaction';

interface DataSummaryCardProps {
  record: TransactionRecord;
}

export function DataSummaryCard({ record }: DataSummaryCardProps) {
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const renderSection = (title: string, data: any) => {
    if (!data) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{title}</h4>
        <div className="grid grid-cols-2 gap-4 bg-[var(--bg-elevated)] p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'id') return null; // usually redundant with main title
            let displayValue = String(value);
            let isMonospace = key.toLowerCase().includes('id') || key.toLowerCase().includes('amount');
            
            if (key === 'amount' && data.currency) {
              displayValue = formatAmount(value as number, data.currency as string);
            } else if (key.toLowerCase().includes('timestamp') || key.toLowerCase().includes('date')) {
              displayValue = new Date(value as string).toLocaleString();
              isMonospace = false;
            }

            return (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-[var(--text-tertiary)] mb-1 capitalize">{key.replace(/_/g, ' ')}</span>
                {key === 'status' ? (
                  <Badge 
                    status={value === 'settled' || value === 'success' ? 'success' : value === 'failed' ? 'danger' : 'warning'} 
                    label={displayValue.toUpperCase()} 
                    animated={false} 
                  />
                ) : (
                  <span className={`text-sm text-[var(--text-primary)] ${isMonospace ? 'font-mono' : ''}`}>{displayValue}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card variant="default" className="p-5 mb-4">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-[var(--border-subtle)]">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center">
          <svg className="w-4 h-4 mr-2 text-[var(--accent-brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Record View
        </h3>
        <span className="font-mono text-xs bg-[var(--bg-elevated)] px-2 py-1 rounded text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          {record.gateway?.transaction_id || record.bank?.transaction_id || record.ledger?.transaction_id || 'UNKNOWN'}
        </span>
      </div>
      
      {renderSection('Gateway Log', record.gateway)}
      {renderSection('Bank Settlement', record.bank)}
      {renderSection('Ledger Entry', record.ledger)}
    </Card>
  );
}
