'use client';
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { TracePanel, TracePanelState } from '@/components/chat/TracePanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Sidebar, type SidebarView } from '@/components/layout/Sidebar';
import { signOutUser } from '@/lib/firebase/client';
import { useTheme } from '@/hooks/useTheme';
import { useDashboardData } from '@/hooks/useDashboardData';

import { ExceptionsDashboard } from '@/components/dashboard/ExceptionsDashboard';
import { HistoryDashboard } from '@/components/dashboard/HistoryDashboard';
import { SettingsDashboard } from '@/components/dashboard/SettingsDashboard';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { messages, insightCards, isLoading, pipelineStage, sendMessage } = useChat();
  const { exceptions, transactions, loading: dataLoading } = useDashboardData();
  
  const [sidebarView, setSidebarView] = useState<SidebarView>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tracePanelState, setTracePanelState] = useState<TracePanelState>('closed');
  const { theme, toggleTheme } = useTheme();

  // Basic conversations mock for sidebar
  const [conversations, setConversations] = useState<{id: string, title: string, lastTrace?: any}[]>([
    { id: '1', title: 'Trace TXN-005', lastTrace: { txnId: 'TXN-005' } }
  ]);
  const [activeConvId, setActiveConvId] = useState<string | null>('1');

  if (authLoading) {
    return <div className="h-screen w-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent-brand)] animate-spin" />
    </div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const timelineCard = insightCards.find(c => c.type === 'timeline') || null;

  // Header styles logic similar to reference
  const headerBg = theme === 'light' ? "#ffffff" : "#000000";
  const headerBorder = theme === 'light' ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)";

  const handleTraceRequest = (txnId: string) => {
    sendMessage(`Trace ${txnId}`);
    setSidebarView('chat');
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden grid-texture" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen}
        view={sidebarView} 
        onViewChange={(v) => { setSidebarView(v); if (!sidebarOpen) setSidebarOpen(true); }}
        conversations={conversations}
        activeId={activeConvId}
        onSelect={(conv) => { setActiveConvId(conv.id); setSidebarView('chat'); }}
        onNewChat={(title) => {
          const id = Date.now().toString();
          setConversations([{ id, title }, ...conversations]);
          setActiveConvId(id);
          setSidebarView('chat');
        }}
        onRename={(id, title) => setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c))}
        onDelete={(id) => {
          setConversations(prev => prev.filter(c => c.id !== id));
          if (activeConvId === id) setActiveConvId(null);
        }}
        onTxnSelect={(txn) => {
          handleTraceRequest(txn.id);
        }}
        user={user}
        onSignOut={signOutUser}
        exceptions={exceptions}
        transactions={transactions}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">
        
        {/* Header - EXACTLY MATCHING REFERENCE */}
        <header className="shrink-0 flex items-center justify-between px-5 py-3 z-10 relative shadow-sm" style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}` }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(128,128,128,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="1" width="5" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8.5 4h5M8.5 7.5h5M8.5 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-strong)" }}>
                FINTECH AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </header>

        {/* Content Views */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Dynamic Column */}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative min-w-0">
            <ErrorBoundary>
              {sidebarView === 'chat' && (
                <ChatPanel
                  messages={messages}
                  isLoading={isLoading}
                  pipelineStage={pipelineStage}
                  onSendMessage={sendMessage}
                  tracePanelState={tracePanelState}
                  setTracePanelState={setTracePanelState}
                  timelineCard={timelineCard}
                />
              )}
              {sidebarView === 'exceptions' && (
                <ExceptionsDashboard 
                  exceptions={exceptions}
                  onTrace={handleTraceRequest}
                />
              )}
              {sidebarView === 'history' && (
                <HistoryDashboard 
                  transactions={transactions}
                  onTrace={handleTraceRequest}
                />
              )}
              {sidebarView === 'settings' && (
                <SettingsDashboard user={user} />
              )}
            </ErrorBoundary>
          </div>

          {/* Right Column - Trace Panel */}
          <TracePanel 
            timelineCard={timelineCard} 
            panelState={tracePanelState} 
            onClose={() => setTracePanelState('minimized')} 
          />
          
        </div>
      </div>
    </main>
  );
}
