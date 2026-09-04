'use client';
import { useEffect, useRef, useState } from 'react';
import { ChatMessage, InsightCard } from '@/types/agent';
import { PipelineStageInfo } from '@/types/pipeline';
import { StructuredMessage, StructuredResponse } from './StructuredMessage';
import { MinimisedTracePill, TracePanelState } from './TracePanel';
import { AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  pipelineStage: PipelineStageInfo | null;
  onSendMessage: (msg: string) => void;
  tracePanelState: TracePanelState;
  setTracePanelState: (state: TracePanelState) => void;
  timelineCard: InsightCard | null;
}

const AGENT_SUGGESTIONS = [
  "Trace TXN-005 - check amount mismatch",
  "List all recent exceptions",
  "Why is TXN-015 showing a timing anomaly?",
  "Analyse transactions between 2024-01-01 and today",
];

export function ChatPanel({ 
  messages, 
  isLoading, 
  pipelineStage, 
  onSendMessage,
  tracePanelState,
  setTracePanelState,
  timelineCard
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, pipelineStage]);

  // Open the trace panel automatically if we get a new timeline card
  useEffect(() => {
    if (timelineCard && tracePanelState === 'closed') {
      setTracePanelState('open');
    }
  }, [timelineCard, tracePanelState, setTracePanelState]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input.trim());
        setInput('');
      }
    }
  };

  const isEmpty = messages.length <= 1; // 1 is the welcome message in useChat

  const handleSendMessage = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Convert ChatMessage to StructuredResponse for the agent messages
  const mapToStructured = (msg: ChatMessage): StructuredResponse => {
    return {
      verdict: msg.content,
      exceptionCard: msg.insightCards?.find(c => c.type === 'exception'),
      metricsCards: msg.insightCards?.filter(c => c.type === 'summary'),
      hasTrace: !!msg.insightCards?.find(c => c.type === 'timeline'),
      txnId: (msg.insightCards?.find(c => c.type === 'timeline')?.data as any)?.gateway?.transaction_id || undefined
    };
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-chat)] relative">
      
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 pb-10">
            <div className="relative mb-7">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--primary)", boxShadow: "0 0 40px rgba(255,255,255,0.05)" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="2" fill="var(--primary-foreground)" />
                  <rect x="14" y="2" width="10" height="10" rx="2" fill="var(--primary-foreground)" opacity="0.35" />
                  <rect x="2" y="14" width="10" height="10" rx="2" fill="var(--primary-foreground)" opacity="0.35" />
                  <rect x="14" y="14" width="10" height="10" rx="2" fill="var(--primary-foreground)" />
                </svg>
              </div>
              <div className="absolute inset-0 spin-slow opacity-15 rounded-2xl" style={{ border: "1px solid var(--primary)", margin: "-10px", borderRadius: "22px" }} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight mb-1.5 text-center" style={{ color: "var(--foreground)" }}>Settly Command Center</h2>
            <p className="text-sm text-center max-w-sm mb-7 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Trace settlements, surface exceptions, and analyse your financial data in real time.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {AGENT_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} className="text-left px-4 py-3 rounded-xl text-sm leading-snug transition-all" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--card-foreground)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-5 py-8 flex flex-col gap-5">
            {/* Skip the first welcome message if it's there to show purely user flow, 
                or show it mapped as a structured message. */}
            {messages.map(msg => (
              <div key={msg.id} className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="flex flex-col gap-2 max-w-[80%] items-end">
                    <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <StructuredMessage response={mapToStructured(msg)} />
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message-enter">
                <div className="flex gap-2.5 items-start mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ color: "var(--foreground)" }}>
                      <circle cx="5.5" cy="3.5" r="1.8" fill="currentColor" />
                      <path d="M1.5 10c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed flex items-center gap-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--card-foreground)" }}>
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map(i => <span key={i} className="animate-typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted-foreground)" }} />)}
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] ml-2">{pipelineStage?.label || 'Processing...'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Minimised trace pill */}
      <AnimatePresence>
        {timelineCard && tracePanelState === "minimized" && (
          <div className="px-5 pb-2 flex justify-end">
            <MinimisedTracePill timelineCard={timelineCard} onClick={() => setTracePanelState("open")} />
          </div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="shrink-0 px-4 pb-5 pt-2 relative z-10 bg-[var(--bg-chat)]">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col rounded-2xl input-glow transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Trace a transaction, flag an exception, or run a forecast…"
              rows={1}
              className="w-full px-4 pt-3.5 pb-2 bg-transparent text-sm leading-relaxed resize-none focus:outline-none"
              style={{ color: "var(--foreground)", minHeight: "52px", maxHeight: "200px" }}
            />
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs transition-colors hover:bg-white/5" style={{ color: "var(--muted-foreground)" }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11.5 6.5l-5 5a3.75 3.75 0 01-5.3-5.3l5-5a2.5 2.5 0 013.54 3.54l-5 5a1.25 1.25 0 01-1.77-1.77l4.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Attach
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: input.trim() ? "var(--primary)" : "rgba(255,255,255,0.06)", color: input.trim() ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 10.5V1.5M6 1.5L2.5 5M6 1.5L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: "rgba(128,128,128,0.35)" }}>
            Settly may make errors. Always verify critical financial data before acting.
          </p>
        </div>
      </div>
    </div>
  );
}
