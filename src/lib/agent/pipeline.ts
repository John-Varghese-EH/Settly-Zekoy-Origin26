import { PipelineResult, PipelineStage } from '@/types/pipeline';
import { scrubPII } from '@/lib/pii/scrubber';
import { classifyIntent } from './classifier';
import { executeTool } from './tool-executor';
import { synthesizeResponse } from './synthesizer';
import { ReconciliationResult } from '@/lib/utils/reconciliation';

export async function runPipeline(userInput: string): Promise<PipelineResult> {
  const timing: Record<string, number> = {};
  const stages_completed: PipelineStage[] = [];
  
  // Step 1: PII Scrubbing
  let start = performance.now();
  const { scrubbed } = scrubPII(userInput);
  timing['scrubbing'] = performance.now() - start;
  stages_completed.push('scrubbing');

  // Fast-path for simple greetings to avoid 10-second Gemini roundtrips
  const lowerInput = scrubbed.toLowerCase().trim();
  const isGreeting = /^hi$|^hello$|^hey$|^sup$|^how are you\??$/.test(lowerInput);
  if (isGreeting) {
    const fastResponse = {
      message: `Hello! I'm **Settly**, your Enterprise AI Settlement Architect.\n\nI can help you with:\n- **Trace a transaction** - e.g. "What happened to TXN-2013?"\n- **List exceptions** - e.g. "Show me all exceptions"\n- **Reconcile records** - e.g. "Check status of TXN-2021"\n- **Auto-resolve issues** - e.g. "Resolve TXN-2021"\n\nHow can I assist you today?`,
      insightCards: [],
      pipelineMetadata: {
        stages_completed: ['scrubbing', 'classifying', 'synthesizing'] as PipelineStage[],
        timing: { scrubbing: timing['scrubbing'], classifying: 10, synthesizing: 10 }
      }
    };
    return {
      stages_completed: ['scrubbing', 'classifying', 'synthesizing'],
      response: fastResponse,
      timing: { scrubbing: timing['scrubbing'], classifying: 10, synthesizing: 10 },
      scrubbed_input: scrubbed
    };
  }

  // Step 2 & 3: Classification (Query Extraction + Intent Classification)
  start = performance.now();
  const intent = await classifyIntent(scrubbed);
  timing['classifying'] = performance.now() - start;
  stages_completed.push('classifying');

  // Step 4: Confidence Check is enforced inside executeTool
  // Step 2 (CSV Trace) + Step 6 (Tool Execution) + Step 7 (Audit Logging)
  start = performance.now();
  const toolResult = await executeTool(intent);
  timing['executing'] = performance.now() - start;
  stages_completed.push('executing');

  // Step 5: AI Narration (Synthesize Response)
  start = performance.now();
  const reconciliation = toolResult.metadata.reconciliation as ReconciliationResult | null;
  const response = await synthesizeResponse(scrubbed, toolResult, reconciliation);
  timing['synthesizing'] = performance.now() - start;
  stages_completed.push('synthesizing');

  response.pipelineMetadata = {
    stages_completed,
    timing
  };

  return {
    stages_completed,
    response,
    timing,
    scrubbed_input: scrubbed
  };
}
