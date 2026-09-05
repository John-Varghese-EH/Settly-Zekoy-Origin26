import { GoogleGenAI } from '@google/genai';
import { ToolResult } from '@/types/pipeline';
import { AgentResponse, InsightCard } from '@/types/agent';
import { SYNTHESIZER_SYSTEM_PROMPT } from './prompts';
import { ReconciliationResult } from '@/lib/utils/reconciliation';

function heuristicSynthesize(toolResult: ToolResult, reconciliation: ReconciliationResult | null): string {
  if (toolResult.tool_name === 'lookup' && toolResult.data) {
    if (reconciliation?.hasDiscrepancy) {
      return "I found the transaction, but there is a critical discrepancy in the records. I have escalated this issue to the Admin Console for manual review. See the trace for details.";
    }
    return "I found the transaction and it looks properly reconciled.";
  }
  if (toolResult.tool_name === 'list_exceptions') {
    if (Array.isArray(toolResult.data) && toolResult.data.length > 0) {
      return `I found ${toolResult.data.length} transactions with exceptions in the current records.`;
    }
    return "I found no exceptions in the current records.";
  }
  
  if (toolResult.errors.length > 0) {
    return "I encountered an error trying to process your request.";
  }
  
  return "I have processed your request based on the available data.";
}

export async function synthesizeResponse(
  scrubbed_input: string,
  toolResult: ToolResult,
  reconciliation: ReconciliationResult | null
): Promise<AgentResponse> {
  let message = '';
  
  if (!process.env.GEMINI_API_KEY) {
    console.warn('No GEMINI_API_KEY found, using heuristic fallback for synthesizer.');
    message = heuristicSynthesize(toolResult, reconciliation);
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptData = `
User Query: ${scrubbed_input}
Tool Results: ${JSON.stringify(toolResult, null, 2)}
Reconciliation: ${JSON.stringify(reconciliation, null, 2)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptData,
        config: {
          systemInstruction: SYNTHESIZER_SYSTEM_PROMPT,
        }
      });
      message = response.text || heuristicSynthesize(toolResult, reconciliation);
    } catch (error) {
      console.error('Synthesizer error:', error);
      message = heuristicSynthesize(toolResult, reconciliation);
    }
  }

  const insightCards: InsightCard[] = [];
  
  // Generate timeline card for individual transaction lookup
  if (toolResult.data && !Array.isArray(toolResult.data)) {
    insightCards.push({
      id: 'timeline-' + Date.now(),
      type: 'timeline',
      title: 'Transaction Trace',
      data: toolResult.data,
      priority: 'low'
    });
    
    // Add summary metrics
    insightCards.push({
      id: 'summary-amt-' + Date.now(),
      type: 'summary',
      title: 'Amount',
      data: (toolResult.data as Record<string, {amount?: number}>).gateway?.amount || (toolResult.data as Record<string, {amount?: number}>).bank?.amount || (toolResult.data as Record<string, {amount?: number}>).ledger?.amount || 'N/A',
      priority: 'low'
    });
  } else if (Array.isArray(toolResult.data) && toolResult.tool_name === 'list_exceptions') {
    insightCards.push({
      id: 'summary-exc-' + Date.now(),
      type: 'summary',
      title: 'Total Exceptions',
      data: toolResult.data.length,
      priority: 'medium'
    });
  }

  if (reconciliation?.hasDiscrepancy) {
    insightCards.push({
      id: 'disc-' + Date.now(),
      type: 'discrepancy',
      title: 'Reconciliation Discrepancy Found',
      data: reconciliation,
      priority: 'high'
    });
  }

  if (toolResult.errors.length > 0 || (reconciliation?.missingFrom && reconciliation.missingFrom.length > 0)) {
    const errorMsg = toolResult.errors.length > 0 ? `Errors: ${toolResult.errors.join(', ')}` : '';
    const missingMsg = reconciliation?.missingFrom && reconciliation.missingFrom.length > 0 ? `Missing from: ${reconciliation.missingFrom.join(', ')}` : '';
    
    insightCards.push({
      id: 'exc-' + Date.now(),
      type: 'exception',
      title: toolResult.errors.length > 0 ? 'Execution Error' : 'Missing Records',
      data: [errorMsg, missingMsg].filter(Boolean).join(' | '),
      priority: 'high'
    });
  }

  return {
    message,
    insightCards,
    pipelineMetadata: {
      stages_completed: [],
      timing: {}
    }
  };
}
