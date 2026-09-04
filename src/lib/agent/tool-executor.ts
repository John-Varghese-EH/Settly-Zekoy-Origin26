import { ClassifiedIntent, ToolResult } from '@/types/pipeline';
import { getTransactionRecord, listExceptions, getTransactionsByDateRange } from '@/lib/data/engine';
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
    if (intent.intent === 'lookup' || intent.intent === 'explain_status') {
      if (!intent.transaction_id) {
        result.errors.push('Missing transaction_id for lookup');
        return result;
      }
      const record = await getTransactionRecord(intent.transaction_id);
      const reconciliation = reconcileTransaction(record);
      result.data = record;
      result.metadata.reconciliation = reconciliation;
      result.success = true;
    } else if (intent.intent === 'list_exceptions') {
      const records = await listExceptions();
      result.data = records;
      result.success = true;
    } else if (intent.intent === 'compare' && intent.date_range) {
      const records = await getTransactionsByDateRange(intent.date_range.from, intent.date_range.to);
      result.data = records;
      result.success = true;
    } else {
      result.errors.push(`Unhandled intent: ${intent.intent}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error during tool execution';
    result.errors.push(message);
  }

  return result;
}
