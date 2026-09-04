export const agentTools = [
  {
    name: 'lookup_transaction',
    description: 'Lookup a transaction across gateway, bank, and ledger.',
    parameters: {
      type: 'OBJECT',
      properties: {
        transaction_id: { type: 'STRING' }
      },
      required: ['transaction_id']
    }
  },
  {
    name: 'list_exceptions',
    description: 'Find all transactions with anomalies or discrepancies.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: []
    }
  },
  {
    name: 'check_reconciliation',
    description: 'Check reconciliation status for a date range.',
    parameters: {
      type: 'OBJECT',
      properties: {
        from: { type: 'STRING', description: 'ISO 8601 start date' },
        to: { type: 'STRING', description: 'ISO 8601 end date' }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'auto_resolve_transaction',
    description: 'Use this tool when you detect a missing bank settlement or ledger entry and want to automatically resolve the exception by patching the database. Provide the transaction ID and a confidence score for your resolution plan. This tool will physically insert the missing records.',
    parameters: {
      type: 'OBJECT',
      properties: {
        transaction_id: { type: 'STRING', description: 'The TXN-XXX ID of the transaction to resolve.' },
        confidence_score: { type: 'NUMBER', description: 'Your confidence (0.0 to 1.0) that this missing record should be auto-resolved.' },
        resolution_reason: { type: 'STRING', description: 'A brief explanation of why you are auto-resolving this transaction.' }
      },
      required: ['transaction_id', 'confidence_score', 'resolution_reason']
    }
  }
];
