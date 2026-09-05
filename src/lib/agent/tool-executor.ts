import { ClassifiedIntent, ToolResult } from '@/types/pipeline';
import { getTransactionRecord, listExceptions, getTransactionsByDateRange, autoResolveTransaction } from '@/lib/data/engine';
import { reconcileTransaction } from '@/lib/utils/reconciliation';
import { logResolution } from '@/lib/data/resolution-log';

export async function executeTool(intent: ClassifiedIntent): Promise<ToolResult> {
  const result: ToolResult = {
    tool_name: intent.intent,
    success: false,
    data: null,
    errors: [],
    metadata: {}
  };

  try {
    switch (intent.intent) {
      case 'lookup':
      case 'explain_status': {
        if (!intent.transaction_id) {
          result.errors.push('Missing transaction_id for lookup');
          return result;
        }
        const record = await getTransactionRecord(intent.transaction_id);
        
        if (!record.gateway && !record.bank && !record.ledger) {
          result.errors.push(`Transaction ${intent.transaction_id} not found in any system.`);
          return result;
        }
        
        const reconciliation = reconcileTransaction(record);
        result.data = record;
        result.metadata.reconciliation = reconciliation;
        result.metadata.category = reconciliation.category;
        result.metadata.confidenceScore = reconciliation.confidenceScore;
        
        // Guardrail: If confidence < 0.6 or UNEXPLAINED, auto-escalate
        if (reconciliation.confidenceScore < 0.6 || reconciliation.category === 'UNEXPLAINED') {
          result.metadata.escalated = true;
          result.metadata.escalation_reason = reconciliation.confidenceScore < 0.6 
            ? `Low confidence score (${reconciliation.confidenceScore})` 
            : 'Unexplained discrepancy - requires manual review';
          
          logResolution({
            transaction_id: intent.transaction_id,
            action: 'escalated',
            category: reconciliation.category,
            confidence_score: reconciliation.confidenceScore,
            details: `Auto-escalated: ${result.metadata.escalation_reason}`,
          });
        }
        
        // Log the lookup action
        logResolution({
          transaction_id: intent.transaction_id,
          action: reconciliation.hasDiscrepancy ? 'escalated' : 'auto_closed',
          category: reconciliation.category,
          confidence_score: reconciliation.confidenceScore,
          details: reconciliation.hasDiscrepancy 
            ? `Discrepancy found: ${reconciliation.category}` 
            : 'Transaction fully reconciled - auto-closed',
        });
        
        result.success = true;
        break;
      }
      case 'list_exceptions': {
        const records = await listExceptions();
        result.data = records;
        result.success = true;
        break;
      }
      case 'compare': {
        if (!intent.date_range) {
          result.errors.push('Missing date_range for compare');
          break;
        }
        const records = await getTransactionsByDateRange(intent.date_range.from, intent.date_range.to);
        result.data = records;
        result.success = true;
        break;
      }
      case 'general_question': {
        result.success = true;
        result.data = null;
        break;
      }
      case 'auto_resolve_transaction': {
        const id = intent.transaction_id || (intent.raw_parameters?.transaction_id as string);
        if (!id) {
          result.errors.push('No transaction ID provided for auto-resolution.');
          break;
        }
        
        // Pre-check reconciliation
        const preRecord = await getTransactionRecord(id);
        const preRecon = preRecord.gateway ? reconcileTransaction(preRecord) : null;
        
        // Guardrail: Only auto-resolve if confidence is reasonable
        if (preRecon && preRecon.confidenceScore < 0.4) {
          result.errors.push('Confidence too low for autonomous resolution. Escalating to human support team.');
          logResolution({
            transaction_id: id,
            action: 'escalated',
            category: preRecon.category,
            confidence_score: preRecon.confidenceScore,
            details: 'Auto-resolution blocked: confidence below threshold',
          });
          result.metadata.escalated = true;
          break;
        }
        
        // Simulate retry settlement for DATA_LAG
        if (preRecon?.category === 'DATA_LAG') {
          logResolution({
            transaction_id: id,
            action: 'retry_settlement',
            category: 'DATA_LAG',
            confidence_score: preRecon.confidenceScore,
            details: 'Simulated ledger-sync retry for DATA_LAG issue',
          });
          result.metadata.retried_settlement = true;
        }
        
        const resolution = await autoResolveTransaction(id);
        result.success = resolution.resolved;
        result.metadata = { 
          ...result.metadata,
          resolution_message: resolution.message, 
          confidence_score: intent.raw_parameters?.confidence_score || preRecon?.confidenceScore,
          resolution_reason: intent.raw_parameters?.resolution_reason || preRecon?.category,
        };
        
        // Fetch the updated record to show the fixed state
        result.data = await getTransactionRecord(id);
        
        // Log the resolution
        logResolution({
          transaction_id: id,
          action: resolution.resolved ? 'auto_resolved' : 'escalated',
          category: preRecon?.category || 'UNKNOWN',
          confidence_score: preRecon?.confidenceScore || 0,
          details: resolution.message,
        });
        
        // Simulate notification
        if (resolution.resolved) {
          logResolution({
            transaction_id: id,
            action: 'notification_sent',
            category: preRecon?.category || 'RESOLVED',
            confidence_score: 1.0,
            details: 'Mock notification sent to customer confirming resolution',
          });
          result.metadata.notification_sent = true;
        }
        
        break;
      }
      default:
        result.errors.push(`Unhandled intent: ${intent.intent}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during tool execution';
    result.errors.push(message);
  }

  return result;
}
