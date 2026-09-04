'use client';

import { motion } from 'framer-motion';
import { InsightCard } from '@/types/agent';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface StructuredResponse {
  verdict: string;
  exceptionCard?: InsightCard;
  metricsCards?: InsightCard[];
  hasTrace?: boolean;
  txnId?: string;
}

export function StructuredMessage({ response }: { response: StructuredResponse }) {
  return (
    <div className="flex flex-col gap-3 max-w-[88%]">
      <div className="flex gap-2.5 items-start">
        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ color: "var(--foreground)" }}>
            <circle cx="5.5" cy="3.5" r="1.8" fill="currentColor" />
            <path d="M1.5 10c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--card-foreground)" }}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node: _node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              strong: ({node: _node, ...props}) => <strong className="font-semibold text-white" {...props} />,
              ul: ({node: _node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
              li: ({node: _node, ...props}) => <li className="pl-1" {...props} />,
              h1: ({node: _node, ...props}) => <h1 className="text-lg font-semibold text-white mb-2 mt-3" {...props} />,
              h2: ({node: _node, ...props}) => <h2 className="text-md font-semibold text-white mb-2 mt-3" {...props} />,
              h3: ({node: _node, ...props}) => <h3 className="text-sm font-semibold text-white mb-1 mt-2" {...props} />,
              table: ({node: _node, ...props}) => (
                <div className="overflow-x-auto my-3 border rounded-lg border-white/10">
                  <table className="w-full text-left border-collapse text-xs" {...props} />
                </div>
              ),
              th: ({node: _node, ...props}) => <th className="border-b border-white/10 p-2 font-medium text-white/70 bg-white/5" {...props} />,
              td: ({node: _node, ...props}) => <td className="border-b border-white/5 p-2 align-top last:border-b-0" {...props} />,
              code: ({node: _node, ...props}) => <code className="px-1 py-0.5 rounded bg-white/10 font-mono text-[10px]" {...props} />
            }}
          >
            {response.verdict}
          </ReactMarkdown>
        </motion.div>
      </div>

      {response.exceptionCard && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12 }} className="pl-8">
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: response.exceptionCard.priority === "high" ? "rgba(255,68,68,0.06)" : "rgba(255,170,0,0.05)", border: `1px solid ${response.exceptionCard.priority === "high" ? "rgba(255,68,68,0.18)" : "rgba(255,170,0,0.18)"}` }}>
            <span className="text-base mt-0.5 shrink-0">{response.exceptionCard.priority === "high" ? "⚠️" : "⚡"}</span>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: response.exceptionCard.priority === "high" ? "#ff6b6b" : "#ffcc44" }}>{response.exceptionCard.title}</p>
              {!!response.exceptionCard.data && typeof response.exceptionCard.data === 'object' && (
                <p className="text-[10px] font-mono mt-1 leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {JSON.stringify(response.exceptionCard.data, null, 2)}
                </p>
              )}
              {!!response.exceptionCard.data && typeof response.exceptionCard.data === 'string' && (
                <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                  {response.exceptionCard.data}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {response.metricsCards && response.metricsCards.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="pl-8 grid grid-cols-2 gap-2">
          {response.metricsCards.map((m, i) => (
            <div key={i} className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>{m.title}</p>
              <p className="text-sm font-semibold font-mono" style={{ color: "var(--foreground)" }}>
                {typeof m.data === 'object' ? JSON.stringify(m.data) : String(m.data ?? '')}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {response.hasTrace && response.txnId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="pl-8">
          <p className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Trace panel updated →
            <span className="font-mono" style={{ color: "var(--foreground)" }}>{response.txnId}</span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
