import { ClassifiedIntent, ToolResult } from '@/types/pipeline';
import { getTransactionRecord, listExceptions, getTransactionsByDateRange, autoResolveTransaction } from '@/lib/data/engine';
import { reconcileTransaction } from '@/lib/utils/reconciliation';

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
        const resolution = await autoResolveTransaction(id);
        result.success = resolution.resolved;
        result.metadata = { 
          resolution_message: resolution.message, 
          confidence_score: intent.raw_parameters?.confidence_score,
          resolution_reason: intent.raw_parameters?.resolution_reason
        };
        // Fetch the updated record to show the fixed state
        result.data = await getTransactionRecord(id);
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
