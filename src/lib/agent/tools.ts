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
        from: { type: 'STRING' },
        to: { type: 'STRING' }
      },
      required: ['from', 'to']
    }
  }
];
