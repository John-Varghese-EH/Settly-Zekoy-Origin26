"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "firebase/auth";

export type SidebarView = "chat" | "exceptions" | "history" | "settings";

export interface Conversation {
  id: string;
  title: string;
  lastTrace?: any;
}

export interface SidebarProps {
  open: boolean;
  view: SidebarView;
  onViewChange: (v: SidebarView) => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (conv: Conversation) => void;
  onNewChat: (title: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onTxnSelect: (t: any) => void;
  user?: User | null;
  onSignOut?: () => void;
  exceptions: any[];
  transactions: any[];
}

const NAV_ITEMS: { id: SidebarView; label: string; icon: React.ReactNode }[] = [
  {
    id: "chat", label: "Chat Agent",
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2.5h11a.5.5 0 01.5.5v7a.5.5 0 01-.5.5H8.5l-3 2v-2H2a.5.5 0 01-.5-.5V3a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>,
  },
  {
    id: "exceptions", label: "Exceptions",
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L13.5 12H1.5L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M7.5 6v3M7.5 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>,
  },
  {
    id: "history", label: "Transaction History",
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 5h7M4 7.5h7M4 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  },
  {
    id: "settings", label: "Settings",
    icon: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" /><path d="M7.5 1v1.5M7.5 12.5V14M14 7.5h-1.5M2.5 7.5H1M12.36 2.64l-1.06 1.06M3.7 10.3l-1.06 1.06M12.36 12.36l-1.06-1.06M3.7 4.7L2.64 3.64" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  },
];

function ToggleRow({ label, sub, value, onChange }: { label: string, sub: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-8 h-4.5 rounded-full relative transition-colors"
        style={{ background: value ? "var(--primary)" : "rgba(128,128,128,0.2)" }}
      >
        <div className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform" style={{ background: "white", left: value ? "16px" : "2px" }} />
      </button>
    </div>
  );
}

function SidebarContent({ view, conversations, activeId, onSelect, onNewChat, onRename, onDelete, onTxnSelect, exceptions, transactions }: Omit<SidebarProps, "open" | "onViewChange" | "user" | "onSignOut">) {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [settings, setSettings] = useState({ shareData: true, storeHistory: true, realtimeAlerts: false, autoReconcile: false });
  const [excFilter, setExcFilter] = useState<"all" | "critical" | "warning" | "resolved">("all");
  const newRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (creating) newRef.current?.focus(); }, [creating]);
  useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    const t = newTitle.trim();
    if (t) onNewChat(t);
    setNewTitle(""); setCreating(false);
  }
  function submitRename(id: string) {
    const t = renameValue.trim();
    if (t) onRename(id, t);
    setRenamingId(null);
  }

  const filteredExc = exceptions.filter(e => {
    if (excFilter === "critical") return e.severity === "critical" && !e.resolved;
    if (excFilter === "warning") return e.severity === "warning" && !e.resolved;
    if (excFilter === "resolved") return e.resolved;
    return true;
  });

  if (view === "chat") return (
    <div className="flex flex-col h-full text-[var(--text-primary)]">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--text-secondary)" }}>Sessions</p>
        <button onClick={() => { setCreating(true); setMenuId(null); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: "var(--text-secondary)" }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        </button>
      </div>
      {creating && (
        <form onSubmit={submitNew} className="px-3 pb-2 shrink-0">
          <input ref={newRef} value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === "Escape" && setCreating(false)} placeholder="Session name…" className="w-full h-7 px-3 rounded-lg text-xs focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
          <div className="flex gap-1 mt-1">
            <button type="submit" className="flex-1 h-6 rounded text-[11px] font-medium hover:opacity-80 transition-opacity" style={{ background: "var(--accent-brand)", color: "#fff" }}>Create</button>
            <button type="button" onClick={() => setCreating(false)} className="flex-1 h-6 rounded text-[11px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>Cancel</button>
          </div>
        </form>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
        {conversations.length === 0 && !creating && (
          <p className="text-[11px] text-center px-4 py-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>No sessions yet.<br /><strong style={{ color: "var(--text-primary)" }}>+</strong> to begin.</p>
        )}
        {conversations.map(conv => (
          <div key={conv.id} className="relative group rounded-lg mb-0.5" style={{ background: activeId === conv.id ? "var(--bg-elevated)" : "transparent" }}>
            {renamingId === conv.id ? (
              <div className="px-2 py-1.5">
                <input ref={renameRef} value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitRename(conv.id); if (e.key === "Escape") setRenamingId(null); }} onBlur={() => submitRename(conv.id)} className="w-full h-6 px-2 rounded text-xs focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }} />
              </div>
            ) : (
              <button onClick={() => { onSelect(conv); setMenuId(null); }} className="w-full text-left px-3 py-2 pr-7">
                <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{conv.title}</p>
                {conv.lastTrace && <p className="text-[10px] mt-0.5 font-mono truncate" style={{ color: "var(--text-secondary)" }}>{conv.lastTrace.txnId}</p>}
              </button>
            )}
            {renamingId !== conv.id && (
              <button onClick={e => { e.stopPropagation(); setMenuId(menuId === conv.id ? null : conv.id); }} className="absolute right-1.5 top-2 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all" style={{ color: "var(--text-secondary)" }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="1.5" r="1" fill="currentColor" /><circle cx="5.5" cy="5.5" r="1" fill="currentColor" /><circle cx="5.5" cy="9.5" r="1" fill="currentColor" /></svg>
              </button>
            )}
            {menuId === conv.id && (
              <div className="absolute left-2 top-8 z-50 rounded-xl overflow-hidden w-32 shadow-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }} onMouseLeave={() => setMenuId(null)}>
                <button onClick={() => { setRenamingId(conv.id); setRenameValue(conv.title); setMenuId(null); }} className="w-full text-left px-3 py-2.5 text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M8 1l2 2-6 6H2V7l6-6z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg> Rename
                </button>
                <button onClick={() => { onDelete(conv.id); setMenuId(null); }} className="w-full text-left px-3 py-2.5 text-xs hover:bg-red-500/10 transition-colors flex items-center gap-2" style={{ color: "var(--accent-danger)" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 2.5h9M3.5 2.5V2h4v.5M4 4.5v3M7 4.5v3M2 2.5l.75 6h5.5L9 2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (view === "exceptions") return (
    <div className="flex flex-col h-full text-[var(--text-primary)]">
      <div className="px-4 pt-4 pb-3 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Exceptions</p>
        <div className="flex flex-wrap gap-1">
          {(["all", "critical", "warning", "resolved"] as const).map(f => (
            <button key={f} onClick={() => setExcFilter(f)} className="text-[10px] px-2 py-1 rounded-md capitalize transition-all" style={{ background: excFilter === f ? "var(--accent-brand)" : "var(--bg-elevated)", color: excFilter === f ? "#fff" : "var(--text-secondary)", border: `1px solid ${excFilter === f ? "transparent" : "var(--border-subtle)"}` }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3 flex flex-col gap-2">
        {filteredExc.map(exc => (
          <div key={exc.id} className="p-3 rounded-xl" style={{ background: exc.severity === "critical" ? "var(--accent-danger-subtle)" : "var(--accent-warning-subtle)", border: `1px solid ${exc.severity === "critical" ? "rgba(220, 38, 38, 0.18)" : "rgba(217, 119, 6, 0.18)"}` }}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-[11px] font-semibold leading-snug" style={{ color: exc.severity === "critical" ? "var(--accent-danger)" : "var(--accent-warning)" }}>{exc.label}</p>
              {exc.resolved && <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>Resolved</span>}
            </div>
            <p className="text-[10px] font-mono mb-1.5" style={{ color: "var(--text-tertiary)" }}>{exc.txnId} · {exc.code}</p>
            <p className="text-[10px] leading-snug" style={{ color: "var(--text-secondary)" }}>{exc.reason}</p>
            <p className="text-[10px] mt-1.5" style={{ color: "var(--text-tertiary)" }}>{exc.timestamp}</p>
          </div>
        ))}
        {filteredExc.length === 0 && <p className="text-[11px] text-center py-8" style={{ color: "var(--text-secondary)" }}>No exceptions in this filter.</p>}
      </div>
    </div>
  );

  if (view === "history") return (
    <div className="flex flex-col h-full text-[var(--text-primary)]">
      <div className="px-4 pt-4 pb-3 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--text-secondary)" }}>Transaction History</p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{transactions.length} records</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3 flex flex-col gap-1">
        {transactions.map(txn => {
          const statusColor = txn.status === "settled" ? "var(--text-primary)" : txn.status === "failed" ? "var(--accent-danger)" : "var(--accent-warning)";
          return (
            <button key={txn.id} onClick={() => onTxnSelect(txn)} className="w-full text-left px-3 py-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10 group" style={{ border: "1px solid transparent" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-[10px] font-mono" style={{ color: "var(--text-secondary)" }}>{txn.id}</p>
                <span className="text-[10px] font-mono shrink-0" style={{ color: statusColor }}>{txn.status.toUpperCase()}</span>
              </div>
              <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{txn.merchant}</p>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[10px]" style={{ color: "var(--text-secondary)" }}>{txn.type} · {txn.bank}</p>
                <p className="text-[10px] font-mono" style={{ color: "var(--text-primary)" }}>{txn.amount}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Settings
  return (
    <div className="flex flex-col h-full text-[var(--text-primary)]">
      <div className="px-4 pt-4 pb-3 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: "var(--text-secondary)" }}>Data & Permissions</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">
        <ToggleRow label="Share transaction data" sub="Allow AI to read your transaction records for analysis" value={settings.shareData} onChange={v => setSettings(s => ({ ...s, shareData: v }))} />
        <ToggleRow label="Store chat history" sub="Save sessions to your account for future reference" value={settings.storeHistory} onChange={v => setSettings(s => ({ ...s, storeHistory: v }))} />
        <ToggleRow label="Real-time alerts" sub="Notify me when exceptions are detected" value={settings.realtimeAlerts} onChange={v => setSettings(s => ({ ...s, realtimeAlerts: v }))} />
        <ToggleRow label="Auto-reconciliation" sub="Let the agent attempt to resolve minor exceptions automatically" value={settings.autoReconcile} onChange={v => setSettings(s => ({ ...s, autoReconcile: v }))} />
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>System Status</p>
          {[{ label: "Gateway API", ok: true }, { label: "NPCI Link", ok: true }, { label: "Ledger Sync", ok: false }, { label: "Settlement Batch", ok: true }].map(s => (
            <div key={s.label} className="flex items-center justify-between py-2">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: s.ok ? "var(--bg-elevated)" : "var(--accent-danger-subtle)", color: s.ok ? "var(--text-primary)" : "var(--accent-danger)", border: `1px solid ${s.ok ? "var(--border-subtle)" : "rgba(220, 38, 38, 0.2)"}` }}>
                {s.ok ? "LIVE" : "DOWN"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  const { open, view, onViewChange, user, onSignOut, conversations, activeId, onSelect, onNewChat, onRename, onDelete, onTxnSelect, exceptions, transactions } = props;
  const initials = user?.displayName
    ? user.displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "S";

  return (
    <aside className="shrink-0 flex h-full" style={{ borderRight: "1px solid var(--border-subtle)" }}>
      {/* Icon rail - always visible */}
      <div className="flex flex-col items-center gap-1 py-3 px-1.5 shrink-0" style={{ width: "48px", borderRight: open ? "1px solid var(--border-subtle)" : "none", background: "var(--bg-surface)" }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={item.label}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: view === item.id && open ? "var(--bg-elevated)" : "transparent",
              color: view === item.id && open ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            {item.icon}
          </button>
        ))}
        <div className="flex-1" />
        {/* Admin Link */}
        <button
          onClick={() => window.location.href = '/admin'}
          title="Admin Console"
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-1 group"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--accent-danger-subtle)")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="group-hover:text-[var(--accent-danger)] transition-colors"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
        </button>
        {/* User avatar + sign-out in icon rail */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-1"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "var(--accent-danger-subtle)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H3a1.5 1.5 0 00-1.5 1.5v7A1.5 1.5 0 003 12h2M9.5 10l3.5-3L9.5 4M13 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mb-2 overflow-hidden" style={{ background: "var(--accent-brand)", color: "#fff" }}>
          {user?.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : initials}
        </div>
      </div>

      {/* Content panel */}
      <div
        className="overflow-hidden transition-all duration-300 flex flex-col"
        style={{ width: open ? "220px" : "0px", background: "var(--bg-surface)" }}
      >
        <div className="w-[220px] h-full flex flex-col shrink-0">
          <SidebarContent {...props} />
        </div>
      </div>
    </aside>
  );
}
