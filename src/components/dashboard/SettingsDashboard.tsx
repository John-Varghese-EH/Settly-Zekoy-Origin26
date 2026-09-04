import { useState } from 'react';
import { User } from 'firebase/auth';

function ToggleCard({ label, sub, value, onChange }: { label: string, sub: string, value: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-10 h-6 rounded-full relative transition-colors duration-300 shrink-0"
        style={{ background: value ? "var(--accent-brand)" : "var(--bg-surface)", border: '1px solid var(--border-strong)' }}
      >
        <div 
          className="w-4 h-4 rounded-full absolute top-[3px] transition-transform duration-300" 
          style={{ background: "#fff", left: value ? "20px" : "4px" }} 
        />
      </button>
    </div>
  );
}

export function SettingsDashboard({ user }: { user?: User | null }) {
  const [settings, setSettings] = useState({
    shareData: true,
    storeHistory: true,
    realtimeAlerts: false,
    autoReconcile: false
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Settings & Preferences</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-10">
          Manage your account data and autonomous agent permissions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Preferences Column */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-2">Agent Permissions</h2>
            
            <ToggleCard 
              label="Share transaction data" 
              sub="Allow AI to read your transaction records for analysis" 
              value={settings.shareData} 
              onChange={v => setSettings(s => ({ ...s, shareData: v }))} 
            />
            <ToggleCard 
              label="Store chat history" 
              sub="Save sessions to your account for future reference" 
              value={settings.storeHistory} 
              onChange={v => setSettings(s => ({ ...s, storeHistory: v }))} 
            />
            <ToggleCard 
              label="Real-time alerts" 
              sub="Notify me when exceptions are detected" 
              value={settings.realtimeAlerts} 
              onChange={v => setSettings(s => ({ ...s, realtimeAlerts: v }))} 
            />
            <ToggleCard 
              label="Auto-reconciliation" 
              sub="Let the agent attempt to resolve minor exceptions automatically" 
              value={settings.autoReconcile} 
              onChange={v => setSettings(s => ({ ...s, autoReconcile: v }))} 
            />
          </div>

          {/* System Status & Account Column */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-4">System Status</h2>
              <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                {[{ label: "Gateway API", ok: true }, { label: "NPCI Link", ok: true }, { label: "Ledger Sync", ok: false }, { label: "Settlement Batch", ok: true }].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{s.label}</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-widest font-bold" style={{ 
                      background: s.ok ? "var(--accent-success-subtle)" : "var(--accent-danger-subtle)", 
                      color: s.ok ? "var(--accent-success)" : "var(--accent-danger)", 
                      border: `1px solid ${s.ok ? "rgba(5, 150, 105, 0.2)" : "rgba(220, 38, 38, 0.2)"}` 
                    }}>
                      {s.ok ? "LIVE" : "DOWN"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)] mb-4">Account Profile</h2>
              <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: 'var(--accent-brand)', color: '#fff' }}>
                  {user?.displayName ? user.displayName.charAt(0) : (user?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.displayName || 'Admin User'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email || 'admin@settly.ai'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
