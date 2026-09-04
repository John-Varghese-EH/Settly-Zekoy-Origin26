'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

interface ElevatedRequest {
  gateway?: { transaction_id: string; amount: number; merchant_id: string; gateway_timestamp: string };
  bank?: any;
  ledger?: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [requests, setRequests] = useState<ElevatedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<ElevatedRequest | null>(null);

  useEffect(() => {
    fetch('/api/admin/elevated')
      .then(res => res.json())
      .then(data => {
        setRequests(data.elevated || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load elevated requests", err);
        setLoading(false);
      });
  }, []);

  const headerBg = theme === 'light' ? "#ffffff" : "#000000";
  const headerBorder = theme === 'light' ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)";

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden grid-texture" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 z-10 relative shadow-sm" style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 h-7 px-3 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}
          >
            &larr; Back to App
          </button>
          <div className="w-[1px] h-4 mx-2" style={{ background: "var(--border-strong)" }} />
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--text-primary)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="1" fill="var(--bg-primary)" />
                <rect x="7" y="1" width="4" height="4" rx="1" fill="var(--bg-primary)" opacity="0.4" />
                <rect x="1" y="7" width="4" height="4" rx="1" fill="var(--bg-primary)" opacity="0.4" />
                <rect x="7" y="7" width="4" height="4" rx="1" fill="var(--bg-primary)" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>Settly</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--accent-danger-subtle)", color: "var(--accent-danger)", border: "1px solid var(--accent-danger-subtle)" }}>
              ADMIN CONSOLE
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleTheme()}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {theme === 'light'
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.5 8A5.5 5.5 0 015.5 2 5.5 5.5 0 1011.5 8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M7 1v1.5M7 11.5V13M13 7h-1.5M2.5 7H1M11.24 2.76l-1.06 1.06M3.82 10.18l-1.06 1.06M11.24 11.24l-1.06-1.06M3.82 3.82L2.76 2.76" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
          }
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Elevated Requests</h1>
            <p className="text-[var(--text-secondary)] text-sm mb-8">
              Review and resolve complex discrepancies escalated by the autonomous agent.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">Pending Escalations</p>
                <p className="text-3xl font-light">{requests.length}</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'var(--accent-danger-subtle)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <p className="text-[11px] uppercase tracking-widest text-[var(--accent-danger)] mb-2">High Priority</p>
                <p className="text-3xl font-light text-[var(--accent-danger)]">{requests.length > 0 ? requests.length - 1 : 0}</p>
              </div>
              <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <p className="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-2">SLA Status</p>
                <p className="text-lg font-medium text-[var(--accent-success)]">Within Limits</p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Merchant</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Issue</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)]">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-[var(--text-secondary)] text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] text-sm">
                        Loading requests...
                      </td>
                    </tr>
                  )}
                  {!loading && requests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)] text-sm">
                        No elevated requests at this time.
                      </td>
                    </tr>
                  )}
                  {requests.map((req, i) => {
                    const id = req.gateway?.transaction_id || `Unknown-${i}`;
                    const merchant = req.gateway?.merchant_id || 'Unknown Merchant';
                    const amount = req.gateway?.amount ? `$${req.gateway.amount.toFixed(2)}` : '---';
                    const issue = !req.bank ? 'Missing Bank Settlement' : 'Critical Amount Discrepancy';
                    
                    return (
                      <tr 
                        key={id}
                        className="transition-colors group"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-6 py-4 text-xs font-mono">{id}</td>
                        <td className="px-6 py-4 text-sm font-medium">{merchant}</td>
                        <td className="px-6 py-4 text-xs text-[var(--accent-danger)]">{issue}</td>
                        <td className="px-6 py-4 text-sm font-mono">{amount}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedTxn(req)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            style={{ background: 'var(--accent-brand)', color: '#fff' }}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Slide-out Review Panel */}
        <AnimatePresence>
          {selectedTxn && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-[400px] h-full shrink-0 border-l flex flex-col z-20"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border-strong)" }}
            >
              <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <h2 className="text-sm font-semibold">Review Escalation</h2>
                <button onClick={() => setSelectedTxn(null)} className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">Transaction ID</p>
                  <p className="text-lg font-mono tracking-tight">{selectedTxn.gateway?.transaction_id}</p>
                </div>
                
                <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: "var(--accent-danger-subtle)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                  <p className="text-xs font-semibold text-[var(--accent-danger)]">Exception Details</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {!selectedTxn.bank 
                      ? "The transaction was successfully captured by the gateway, but no corresponding settlement batch was received from the bank within the T+2 window. This requires manual verification with the acquirer."
                      : "A critical amount discrepancy was detected between the gateway capture and the ledger entry. This exceeds the autonomous reconciliation threshold."}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-3">System Records</p>
                  <div className="flex flex-col gap-2">
                    <div className="p-3 rounded-lg text-xs font-mono flex justify-between items-center" style={{ background: "var(--bg-elevated)" }}>
                      <span className="text-[var(--text-secondary)]">Gateway</span>
                      <span className="text-[var(--accent-success)]">FOUND (${selectedTxn.gateway?.amount})</span>
                    </div>
                    <div className="p-3 rounded-lg text-xs font-mono flex justify-between items-center" style={{ background: "var(--bg-elevated)" }}>
                      <span className="text-[var(--text-secondary)]">Bank Batch</span>
                      {selectedTxn.bank ? (
                        <span className="text-[var(--accent-success)]">FOUND</span>
                      ) : (
                        <span className="text-[var(--accent-danger)]">MISSING</span>
                      )}
                    </div>
                    <div className="p-3 rounded-lg text-xs font-mono flex justify-between items-center" style={{ background: "var(--bg-elevated)" }}>
                      <span className="text-[var(--text-secondary)]">Ledger</span>
                      {selectedTxn.ledger ? (
                        <span className="text-[var(--accent-success)]">FOUND</span>
                      ) : (
                        <span className="text-[var(--accent-warning)]">PENDING</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t flex flex-col gap-2" style={{ borderColor: "var(--border-subtle)" }}>
                <button className="w-full h-9 rounded-lg text-xs font-medium transition-colors" style={{ background: "var(--accent-brand)", color: "#fff" }}>
                  Force Ledger Sync
                </button>
                <button className="w-full h-9 rounded-lg text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: "var(--text-secondary)" }}>
                  Dismiss Escalation
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
