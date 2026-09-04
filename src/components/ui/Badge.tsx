'use client';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'exception';

interface BadgeProps {
  status: BadgeVariant;
  label: string;
  animated?: boolean;
}

export function Badge({ status, label, animated = true }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[var(--accent-success-subtle)] text-[var(--accent-success)] border-[var(--accent-success)]/20',
    warning: `bg-[var(--accent-warning-subtle)] text-[var(--accent-warning)] border-[var(--accent-warning)]/20 ${animated ? 'animate-pulse-amber' : ''}`,
    danger: `bg-[var(--accent-danger-subtle)] text-[var(--accent-danger)] border-[var(--accent-danger)]/20 ${animated ? 'animate-shake' : ''}`,
    info: 'bg-[var(--accent-brand-subtle)] text-[var(--accent-brand)] border-[var(--accent-brand)]/20',
    neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    exception: `bg-[var(--accent-danger)] text-white border-[var(--accent-danger)] ${animated ? 'animate-pulse-danger' : ''}`
  };

  const dotColors: Record<BadgeVariant, string> = {
    success: 'bg-[var(--accent-success)]',
    warning: 'bg-[var(--accent-warning)]',
    danger: 'bg-[var(--accent-danger)]',
    info: 'bg-[var(--accent-brand)]',
    neutral: 'bg-[var(--text-tertiary)]',
    exception: 'bg-white'
  };

  return (
    <span className={`${baseClasses} ${variantStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[status]}`} />
      {label}
    </span>
  );
}
