import { PipelineResult, PipelineStage } from '@/types/pipeline';
import { scrubPII } from '@/lib/pii/scrubber';
import { classifyIntent } from './classifier';
import { executeTool } from './tool-executor';
import { synthesizeResponse } from './synthesizer';
import { ReconciliationResult } from '@/lib/utils/reconciliation';

export async function runPipeline(userInput: string): Promise<PipelineResult> {
  const timing: Record<string, number> = {};
  const stages_completed: PipelineStage[] = [];
  
  let start = performance.now();
  const { scrubbed } = scrubPII(userInput);
  timing['scrubbing'] = performance.now() - start;
  stages_completed.push('scrubbing');

  start = performance.now();
  const intent = await classifyIntent(scrubbed);
  timing['classifying'] = performance.now() - start;
  stages_completed.push('classifying');

  start = performance.now();
  const toolResult = await executeTool(intent);
  timing['executing'] = performance.now() - start;
  stages_completed.push('executing');

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
