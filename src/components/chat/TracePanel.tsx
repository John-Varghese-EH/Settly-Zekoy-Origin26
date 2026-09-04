'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/types/agent';
import { TransactionRecord } from '@/types/transaction';

export type TracePanelState = 'open' | 'minimized' | 'closed';
type NodeStatus = 'success' | 'failed' | 'pending' | 'skipped';

interface TraceNode {
  stage: string;
  status: NodeStatus;
  time: string;
  detail: string;
  amount?: string;
}

interface TracePanelProps {
  timelineCard: InsightCard | null;
  panelState: TracePanelState;
  onClose: () => void;
}

export function TracePanel({ timelineCard, panelState, onClose }: TracePanelProps) {
  const visible = timelineCard && panelState === 'open';

  // Helper function to build trace nodes from a TransactionRecord
  const buildNodes = (record: TransactionRecord): TraceNode[] => {
    const nodes: TraceNode[] = [];
    const formatCurrency = (amt: number, curr: string = 'USD') => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(amt);

    const formatTime = (ts: string) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    };

    // Gateway Node
    if (record.gateway) {
      nodes.push({
        stage: 'Gateway',
        status: record.gateway.status === 'failed' ? 'failed' : 'success',
        time: formatTime(record.gateway.gateway_timestamp),
        detail: `Status: ${record.gateway.status}`,
        amount: formatCurrency(record.gateway.amount, record.gateway.currency),
      });
    } else {
      nodes.push({ stage: 'Gateway', status: 'skipped', time: '-', detail: 'No record found' });
    }

    // Bank Node
    if (record.bank) {
      nodes.push({
        stage: 'Bank',
        status: record.bank.status === 'settled' ? 'success' : record.bank.status === 'rejected' ? 'failed' : 'pending',
        time: formatTime(record.bank.bank_timestamp),
        detail: `Status: ${record.bank.status}`,
        amount: formatCurrency(record.bank.amount),
      });
    } else {
      nodes.push({ stage: 'Bank', status: 'skipped', time: '-', detail: 'No record found' });
    }

    // Ledger Node
    if (record.ledger) {
      nodes.push({
        stage: 'Ledger',
        status: record.ledger.status === 'posted' ? 'success' : record.ledger.status === 'reversed' ? 'failed' : 'pending',
        time: formatTime(record.ledger.ledger_timestamp),
        detail: `Status: ${record.ledger.status}`,
        amount: formatCurrency(record.ledger.amount),
      });
    } else {
      nodes.push({ stage: 'Ledger', status: 'skipped', time: '-', detail: 'No record found' });
    }

    return nodes;
  };

  const statusColor = (s: NodeStatus) => s === "success" ? "#fff" : s === "failed" ? "#ff4444" : s === "pending" ? "#ffaa00" : "rgba(255,255,255,0.2)";
  const statusBg = (s: NodeStatus) => s === "success" ? "rgba(255,255,255,0.08)" : s === "failed" ? "rgba(255,68,68,0.1)" : s === "pending" ? "rgba(255,170,0,0.08)" : "rgba(255,255,255,0.03)";
  const nodeClass = (s: NodeStatus) => s === "success" ? "node-success" : s === "failed" ? "node-error" : s === "pending" ? "node-pending" : "";
  const statusLabel = (s: NodeStatus) => s === "success" ? "OK" : s === "failed" ? "FAIL" : s === "pending" ? "WAIT" : "SKIP";

  let txnId = "UNKNOWN";
  let nodes: TraceNode[] = [];
  if (timelineCard?.data && typeof timelineCard.data === 'object' && !Array.isArray(timelineCard.data)) {
    const record = timelineCard.data as TransactionRecord;
    txnId = record.gateway?.transaction_id || record.bank?.transaction_id || record.ledger?.transaction_id || "UNKNOWN";
    nodes = buildNodes(record);
  }

  return (
    <aside
      className="shrink-0 flex flex-col overflow-hidden transition-all duration-300 relative z-20"
      style={{
        width: visible ? "288px" : "0px",
        borderLeft: visible ? "1px solid var(--border)" : "none",
        background: "rgba(255,255,255,0.015)",
        backdropFilter: "blur(20px)",
      }}
    >
      {visible && (
        <AnimatePresence>
          <motion.div
            key={txnId + "-panel"}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex flex-col h-full w-[288px]"
          >
            {/* Header */}
            <div className="px-5 pt-4 pb-3 shrink-0 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] mb-0.5 font-semibold" style={{ color: "var(--muted-foreground)" }}>
                  Transaction Trace
                </p>
                <p className="text-sm font-mono font-medium" style={{ color: "var(--foreground)" }}>
                  {txnId}
                </p>
                
                {/* Status pill */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {nodes.some(n => n.status === "failed") && <StatusPill label="FAILED" color="#ff4444" bg="rgba(255,68,68,0.1)" border="rgba(255,68,68,0.2)" />}
                  {nodes.every(n => n.status === "success" || n.status === 'skipped') && !nodes.some(n => n.status === 'failed') && nodes.length > 0 && <StatusPill label="OK" color="rgba(255,255,255,0.8)" bg="rgba(255,255,255,0.07)" border="rgba(255,255,255,0.15)" />}
                  {!nodes.some(n => n.status === "failed") && nodes.some(n => n.status === "pending") && <StatusPill label="IN PROGRESS" color="#ffaa00" bg="rgba(255,170,0,0.08)" border="rgba(255,170,0,0.2)" />}
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
                title="Minimise trace"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 flex flex-col gap-5">
              {/* Node timeline */}
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-3 font-semibold" style={{ color: "var(--muted-foreground)" }}>Settlement Path</p>
                <div className="relative">
                  {nodes.map((node, i) => (
                    <motion.div key={node.stage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.25 }} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0" style={{ width: "24px" }}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${nodeClass(node.status)}`} style={{ background: statusBg(node.status), border: `1.5px solid ${statusColor(node.status)}` }}>
                          {node.status === "success" && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          {node.status === "failed" && <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 1l5 5M6 1L1 6" stroke="#ff4444" strokeWidth="1.3" strokeLinecap="round" /></svg>}
                          {node.status === "pending" && <div className="w-2 h-2 rounded-full" style={{ background: "#ffaa00" }} />}
                          {node.status === "skipped" && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />}
                        </div>
                        {i < nodes.length - 1 && (
                          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.08 + 0.12, duration: 0.35 }} className="w-px origin-top" style={{ background: node.status === "failed" || node.status === "skipped" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.14)", minHeight: "28px", flex: 1 }} />
                        )}
                      </div>
                      <div className="pb-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{node.stage}</span>
                          <span className="text-[10px] font-mono" style={{ color: statusColor(node.status) }}>{statusLabel(node.status)}</span>
                        </div>
                        <p className="text-[11px] leading-snug mb-1" style={{ color: "var(--muted-foreground)" }}>{node.detail}</p>
                        <div className="flex items-center gap-2">
                          {node.time !== "-" && <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>{node.time}</span>}
                          {node.amount && <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{node.amount}</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </aside>
  );
}

function StatusPill({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: bg, color, border: `1px solid ${border}` }}>{label}</span>
  );
}

export function MinimisedTracePill({ timelineCard, onClick }: { timelineCard: InsightCard | null; onClick: () => void }) {
  let txnId = "";
  if (timelineCard?.data && typeof timelineCard.data === 'object' && !Array.isArray(timelineCard.data)) {
    const record = timelineCard.data as TransactionRecord;
    txnId = record.gateway?.transaction_id || record.bank?.transaction_id || record.ledger?.transaction_id || "";
  }
  if (!txnId) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all hover:bg-white/10 shadow-lg"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--muted-foreground)" }}>
        <rect x="1" y="1" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.1" />
        <path d="M7 3h4M7 6h4M7 9h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
      <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>Trace:</span>
      <span className="text-xs font-mono font-semibold" style={{ color: "var(--foreground)" }}>{txnId}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="ml-1" style={{ color: "var(--muted-foreground)" }}>
        <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
}
