import { UITransaction } from '@/hooks/useDashboardData';

export function HistoryDashboard({ 
  transactions,
  onTrace
}: { 
  transactions: UITransaction[],
  onTrace: (txnId: string) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto p-8 text-[var(--text-primary)]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Transaction History</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-8">
          A comprehensive view of all processed settlements across gateways and banks.
        </p>

        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Transaction ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Merchant</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Type & Bank</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => {
                const statusColor = txn.status === "settled" ? "var(--accent-success)" : txn.status === "failed" ? "var(--accent-danger)" : "var(--accent-warning)";
                const statusBg = txn.status === "settled" ? "var(--accent-success-subtle)" : txn.status === "failed" ? "var(--accent-danger-subtle)" : "var(--accent-warning-subtle)";

                return (
                  <tr 
                    key={txn.id + i} 
                    onClick={() => onTrace(txn.id)}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4 text-xs font-mono">{txn.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{txn.merchant}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">{txn.type} · {txn.bank}</td>
                    <td className="px-6 py-4 text-sm font-mono">{txn.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full" style={{ color: statusColor, background: statusBg }}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-12 text-center text-[var(--text-secondary)] text-sm">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
