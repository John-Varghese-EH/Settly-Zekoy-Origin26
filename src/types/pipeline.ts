import { TransactionRecord } from './transaction';
import { AgentResponse } from './agent';

export type PipelineStage = 'scrubbing' | 'classifying' | 'executing' | 'synthesizing';

/**
 * Rich stage info for the UI - the pipeline internally tracks stages as strings,
 * but the chat UI needs a human-readable label to show during processing.
 */
export interface PipelineStageInfo {
  stage: PipelineStage;
  label: string;
}

export interface ClassifiedIntent {
  intent: 'lookup' | 'compare' | 'explain_status' | 'list_exceptions' | 'general_question' | 'auto_resolve_transaction';
  transaction_id: string | null;
  date_range?: {
    from: string;
    to: string;
  };
  merchant_id: string | null;
  confidence: number;
  raw_parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool_name: string;
  success: boolean;
  data: TransactionRecord | TransactionRecord[] | null;
  errors: string[];
  metadata: Record<string, unknown>;
}

export interface PipelineResult {
  stages_completed: PipelineStage[];
  response: AgentResponse;
  timing: Record<string, number>;
  scrubbed_input: string;
}
