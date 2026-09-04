import { UIException } from '@/hooks/useDashboardData';
import { motion } from 'framer-motion';

export function ExceptionsDashboard({ 
  exceptions, 
  onTrace 
}: { 
  exceptions: UIException[], 
  onTrace: (txnId: string) => void 
}) {
  const critical = exceptions.filter(e => e.severity === 'critical').length;
  const warnings = exceptions.filter(e => e.severity === 'warning').length;

  return (
    <div className="flex-1 overflow-y-auto p-8 text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Exceptions Center</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          Review and resolve automated settlement discrepancies flagged by the system.
        </p>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Total Exceptions</p>
            <p className="text-3xl font-light">{exceptions.length}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'var(--accent-danger-subtle)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <p className="text-[11px] uppercase tracking-widest text-[var(--accent-danger)] mb-2">Critical Failures</p>
            <p className="text-3xl font-light text-[var(--accent-danger)]">{critical}</p>
          </div>
          <div className="p-5 rounded-2xl" style={{ background: 'var(--accent-warning-subtle)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
            <p className="text-[11px] uppercase tracking-widest text-[var(--accent-warning)] mb-2">Warnings</p>
            <p className="text-3xl font-light text-[var(--accent-warning)]">{warnings}</p>
          </div>
        </div>

        {/* Exceptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exceptions.map((exc, i) => (
            <motion.div 
              key={exc.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onTrace(exc.txnId)}
              className="p-5 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ 
                background: exc.severity === "critical" ? "var(--accent-danger-subtle)" : "var(--accent-warning-subtle)", 
                border: `1px solid ${exc.severity === "critical" ? "rgba(220, 38, 38, 0.18)" : "rgba(217, 119, 6, 0.18)"}` 
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold leading-snug" style={{ color: exc.severity === "critical" ? "var(--accent-danger)" : "var(--accent-warning)" }}>{exc.label}</p>
              </div>
              <p className="text-xs font-mono mb-2" style={{ color: "var(--text-tertiary)" }}>{exc.txnId} · {exc.code}</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{exc.reason}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{new Date(exc.timestamp).toLocaleString()}</p>
                <button className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: exc.severity === "critical" ? "var(--accent-danger)" : "var(--accent-warning)" }}>
                  Trace &rarr;
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
