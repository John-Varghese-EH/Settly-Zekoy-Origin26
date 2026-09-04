export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatTransactionId(id: string): string {
  return id.toUpperCase();
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'captured':
    case 'settled':
    case 'posted':
      return 'var(--success)';
    case 'pending':
    case 'authorized':
      return 'var(--warning)';
    case 'failed':
    case 'rejected':
    case 'returned':
    case 'reversed':
      return 'var(--danger)';
    default:
      return 'var(--muted)';
  }
}

export function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
