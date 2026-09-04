'use client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TransactionRecord } from '@/types/transaction';

interface TimelineProps {
  record: TransactionRecord;
}

export function TransactionTimeline({ record }: TimelineProps) {
  const nodes = [
    { source: 'gateway', data: record.gateway, label: 'Gateway Log', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { source: 'bank', data: record.bank, label: 'Bank Settlement', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { source: 'ledger', data: record.ledger, label: 'Ledger Entry', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
  ];

  const formatCurrency = (amt: number, cur: string = 'USD') => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(amt);

  return (
    <Card className="p-6 mb-4">
      <h3 className="font-semibold text-[var(--text-primary)] mb-6 flex items-center">
        <svg className="w-4 h-4 mr-2 text-[var(--accent-brand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        Transaction Flow
      </h3>
      
      <div className="relative">
        {nodes.map((node, i) => (
          <div key={node.source} className="flex mb-8 last:mb-0 relative z-10" style={{ animation: `slide-up 0.4s ease-out ${i * 0.15}s both` }}>
            {/* Connecting line */}
            {i < nodes.length - 1 && (
              <div className="absolute left-6 top-12 bottom-[-2rem] w-[2px]">
                {node.data && nodes[i+1].data ? (
                  <div className="w-full h-full animate-glow-line rounded-full" />
                ) : (
                  <div className="w-full h-full bg-[var(--border-strong)] border-dashed border-l-2 opacity-50" />
                )}
              </div>
            )}
            
            {/* Icon Node */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-[var(--bg-surface)] ${node.data ? 'border-[var(--accent-brand)] text-[var(--accent-brand)] shadow-[0_0_12px_var(--accent-brand-subtle)]' : 'border-[var(--border-strong)] border-dashed text-[var(--text-tertiary)]'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={node.icon} />
              </svg>
            </div>
            
            {/* Content */}
            <div className="ml-6 flex-grow pt-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className={`font-medium ${node.data ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                  {node.label}
                </h4>
                {node.data ? (
                  <Badge 
                    status={(node.data as any).status === 'settled' || (node.data as any).status === 'success' || (node.data as any).status === 'posted' || (node.data as any).status === 'captured' ? 'success' : 'warning'} 
                    label={(node.data as any).status.toUpperCase()} 
                    animated={false}
                  />
                ) : (
                  <Badge status="danger" label="NOT FOUND" animated={true} />
                )}
              </div>
              
              {node.data ? (
                <div className="bg-[var(--bg-elevated)] p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] flex justify-between items-center">
                  <span className="font-mono text-lg font-semibold text-[var(--text-primary)]">
                    {formatCurrency(node.data.amount, (node.data as any).currency || 'USD')}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                    {new Date((node.data as any).gateway_timestamp || (node.data as any).bank_timestamp || (node.data as any).ledger_timestamp || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                  </span>
                </div>
              ) : (
                <div className="h-[46px] border border-dashed border-[var(--border-strong)] rounded-[var(--radius-sm)] bg-transparent opacity-50" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
