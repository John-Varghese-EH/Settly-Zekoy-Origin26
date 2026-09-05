import { GoogleGenAI } from '@google/genai';
import { ToolResult } from '@/types/pipeline';
import { AgentResponse, InsightCard } from '@/types/agent';
import { SYNTHESIZER_SYSTEM_PROMPT } from './prompts';
import { ReconciliationResult } from '@/lib/utils/reconciliation';

function heuristicSynthesize(toolResult: ToolResult, reconciliation: ReconciliationResult | null): string {
  if (toolResult.tool_name === 'general_question') {
    return `Hello! I'm **Settly**, your Enterprise AI Settlement Architect.\n\nI can help you with:\n- **Trace a transaction** - e.g. "What happened to TXN-2013?"\n- **List exceptions** - e.g. "Show me all exceptions"\n- **Reconcile records** - e.g. "Check status of TXN-2021"\n- **Auto-resolve issues** - e.g. "Resolve TXN-2021"\n\nHow can I assist you today?`;
  }

  if (toolResult.tool_name === 'auto_resolve_transaction') {
    if (toolResult.success) {
      return `## Autonomous Resolution Complete\n\n✅ The transaction has been **automatically resolved**.\n\n${(toolResult.metadata as Record<string, unknown>)?.resolution_message || ''}\n\n*A notification has been sent to the customer.*`;
    }
    return `## Resolution Failed\n\n❌ Auto-resolution was not possible. ${(toolResult.metadata as Record<string, unknown>)?.resolution_message || 'The case has been escalated to the support team.'}`;
  }
  
  if ((toolResult.tool_name === 'lookup' || toolResult.tool_name === 'explain_status') && toolResult.data) {
    const record = toolResult.data as any;
    let report = `## Executive Summary\n\nTransaction **${record.gateway?.transaction_id || record.bank?.transaction_id || record.ledger?.transaction_id || 'UNKNOWN'}** has been scanned across Gateway, Bank, and Ledger systems.\n\n`;
    
    if ((toolResult.metadata as Record<string, unknown>)?.escalated) {
      report += `⚠️ **ESCALATED TO SUPPORT TEAM:** ${(toolResult.metadata as Record<string, unknown>)?.escalation_reason || 'This case requires manual review.'}\n\n`;
    }

    report += `**Reconciliation Category:** ${reconciliation?.category || 'UNKNOWN'}\n`;
    report += `**Confidence Score:** ${((reconciliation?.confidenceScore || 0) * 100).toFixed(0)}%\n\n---\n\n## Analysis Details\n\n`;

    if (reconciliation?.category === 'IN_CYCLE') {
      report += `This transaction is still within the standard T+1 settlement cycle. No action is required yet, the ledger will likely update tomorrow.`;
    } else if (reconciliation?.category === 'FEE_DEDUCTION') {
      report += `The discrepancy detected is likely due to **standard tax/fee deductions** (e.g., GST or platform fees) prior to settlement. The Gateway capture amount differs from the Bank settlement amount within expected margins.`;
    } else if (reconciliation?.category === 'DATA_LAG') {
      report += `We detected a **Data Lag**. The bank has successfully processed the settlement, but the internal ledger has not yet recorded the posting. The system has automatically triggered a ledger sync retry.`;
    } else if (reconciliation?.category === 'UNEXPLAINED') {
      report += `**CRITICAL ANOMALY:** A major discrepancy was found that cannot be automatically resolved. This transaction has been immediately escalated to the Admin Exception List for manual review.`;
    } else {
      report += `The transaction is perfectly reconciled across all systems. No missing data, amount mismatches, or timing anomalies were found.`;
    }

    if (reconciliation?.hasDiscrepancy) {
      report += `\n\n---\n\n## Discrepancies Detected\n\n`;
      if (reconciliation.missingFrom.length > 0) {
        report += `- **Missing Records:** This transaction is missing from ${reconciliation.missingFrom.join(', ')}.\n`;
      }
      if (reconciliation.amountMismatches.length > 0) {
        report += `- **Amount Mismatch:** Detected a difference of INR ${reconciliation.amountMismatches[0].difference.toFixed(2)} between ${reconciliation.amountMismatches[0].source1} and ${reconciliation.amountMismatches[0].source2}.\n`;
      }
      if (reconciliation.timingAnomalies.length > 0) {
        report += `- **Timing Anomaly:** ${reconciliation.timingAnomalies[0].description}.\n`;
      }
      if (reconciliation.statusConflicts.length > 0) {
        report += `- **Status Conflict:** Expected ${reconciliation.statusConflicts[0].expectedStatus} but got ${reconciliation.statusConflicts[0].status} in ${reconciliation.statusConflicts[0].source}.\n`;
      }
    }

    report += `\n\n---\n\n## Recommended Actions\n\n`;
    if (reconciliation?.hasDiscrepancy) {
      report += `Review the anomaly details. If autonomous resolution is available, type **"Resolve"** to trigger the AI resolution workflow.`;
    } else {
      report += `No action required. Transaction is closed.`;
    }

    return report;
  }

  if (toolResult.tool_name === 'list_exceptions') {
    if (Array.isArray(toolResult.data) && toolResult.data.length > 0) {
      return `## Exception Report\n\nFound **${toolResult.data.length}** transactions with exceptions in the current records. Please review them in the Admin Console.`;
    }
    return `## Exception Report\n\nNo exceptions found. All systems are currently fully reconciled.`;
  }
  
  if (toolResult.errors.length > 0) {
    return `⚠️ **Error Processing Request:**\n\n${toolResult.errors.join('\n')}`;
  }
  
  return `✅ **Request Processed**\n\nThe operation completed successfully based on available data.`;
}

// Separate prompt for general/conversational questions
const GENERAL_CHAT_PROMPT = `You are Settly, an enterprise AI settlement reconciliation agent built for Indian FinTech. 
You're friendly, professional, and helpful. Keep responses concise (2-4 sentences).
If the user greets you, greet them back warmly and briefly describe what you can do.
If asked about your capabilities, explain: tracing transactions across Gateway/Bank/Ledger, detecting discrepancies, auto-resolving exceptions, and providing audit trails.
Always be confident and professional. Use markdown formatting.
Do NOT make up transaction data. Do NOT reference specific transaction IDs unless the user mentioned them.`;

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
      
      // Use a simpler prompt for general/conversational questions
      const isGeneralQuestion = toolResult.tool_name === 'general_question';
      
      const promptData = isGeneralQuestion
        ? `User message: ${scrubbed_input}`
        : `User Query: ${scrubbed_input}\nTool Results: ${JSON.stringify(toolResult, null, 2)}\nReconciliation: ${JSON.stringify(reconciliation, null, 2)}`;

      const systemPrompt = isGeneralQuestion ? GENERAL_CHAT_PROMPT : SYNTHESIZER_SYSTEM_PROMPT;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptData,
        config: {
          systemInstruction: systemPrompt,
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
    const txnData = toolResult.data as Record<string, {amount?: number}>;
    const amount = txnData.gateway?.amount || txnData.bank?.amount || txnData.ledger?.amount;
    if (amount) {
      insightCards.push({
        id: 'summary-amt-' + Date.now(),
        type: 'summary',
        title: 'Amount',
        data: amount,
        priority: 'low'
      });
    }

    // Add category card if available
    if (reconciliation?.category && reconciliation.category !== 'CLEAN') {
      insightCards.push({
        id: 'summary-cat-' + Date.now(),
        type: 'summary',
        title: 'Category',
        data: reconciliation.category,
        priority: reconciliation.category === 'UNEXPLAINED' ? 'high' : 'medium'
      });
    }

    // Add confidence card
    if (reconciliation?.confidenceScore !== undefined) {
      insightCards.push({
        id: 'summary-conf-' + Date.now(),
        type: 'summary',
        title: 'Confidence',
        data: `${(reconciliation.confidenceScore * 100).toFixed(0)}%`,
        priority: reconciliation.confidenceScore < 0.6 ? 'high' : 'low'
      });
    }
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
      title: `${reconciliation.category} - Discrepancy Detected`,
      data: reconciliation,
      mismatches: reconciliation.amountMismatches.length > 0 ? { amounts: reconciliation.amountMismatches } : null,
      missingSources: reconciliation.missingFrom,
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

  // Add autonomy action cards
  if ((toolResult.metadata as Record<string, unknown>)?.escalated) {
    insightCards.push({
      id: 'action-esc-' + Date.now(),
      type: 'exception',
      title: 'Escalated to Support Team',
      data: (toolResult.metadata as Record<string, unknown>)?.escalation_reason || 'Low confidence - requires manual review',
      priority: 'high'
    });
  }

  if ((toolResult.metadata as Record<string, unknown>)?.notification_sent) {
    insightCards.push({
      id: 'action-notif-' + Date.now(),
      type: 'summary',
      title: 'Notification',
      data: 'Sent to customer',
      priority: 'low'
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
