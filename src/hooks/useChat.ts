'use client';
import { useState } from 'react';
import { ChatMessage, InsightCard, AgentResponse } from '@/types/agent';
import { PipelineStageInfo } from '@/types/pipeline';

/**
 * Manages the full chat lifecycle: messages, loading states, pipeline stage tracking,
 * and insight card accumulation. Each user message triggers a POST to the agent pipeline
 * and the response is parsed into both a chat message and structured insight cards.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-message',
      role: 'agent',
      content: 'Welcome to **Settly**. I am your Enterprise AI Settlement Architect. I can reconcile transactions, analyze gateway logs, and trace ledger entries in real-time.\n\nTry asking:\n• "What is the status of TXN-001?"\n• "Show me all current exceptions"\n• "Compare TXN-005 across all systems"',
      timestamp: new Date().toISOString()
    }
  ]);
  const [insightCards, setInsightCards] = useState<InsightCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<PipelineStageInfo | null>(null);

  const sendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setPipelineStage({ stage: 'scrubbing', label: 'Scanning for PII...' });

    try {
      // Simulate stage progression for UX - the actual pipeline runs server-side
      // but we show users what's happening conceptually
      const stageTimer = setTimeout(() => {
        setPipelineStage({ stage: 'classifying', label: 'Classifying intent...' });
        setTimeout(() => {
          setPipelineStage({ stage: 'executing', label: 'Querying settlement records...' });
          setTimeout(() => {
            setPipelineStage({ stage: 'synthesizing', label: 'Analyzing results...' });
          }, 800);
        }, 600);
      }, 300);

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });

      clearTimeout(stageTimer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Agent failed to respond' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data: AgentResponse = await res.json();

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'agent',
        content: data.message,
        timestamp: new Date().toISOString(),
        insightCards: data.insightCards
      };

      setMessages((prev) => [...prev, agentMsg]);

      // Accumulate insight cards - newer queries replace older cards
      if (data.insightCards && data.insightCards.length > 0) {
        setInsightCards(data.insightCards);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'agent',
          content: `⚠️ I encountered an error: **${errorMessage}**. Please check that your Supabase and Gemini API credentials are configured in \`.env.local\`.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      setPipelineStage(null);
    }
  };

  return { messages, insightCards, isLoading, pipelineStage, sendMessage };
}
