export type InsightCardType = 'timeline' | 'discrepancy' | 'exception' | 'summary';

export interface InsightCard {
  id: string;
  type: InsightCardType;
  title: string;
  data: unknown;
  mismatches?: Record<string, unknown> | null;
  missingSources?: string[];
  foundSources?: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  insightCards?: InsightCard[];
}

export interface AgentResponse {
  message: string;
  insightCards: InsightCard[];
  pipelineMetadata: {
    stages_completed: string[];
    timing: Record<string, number>;
  };
}
