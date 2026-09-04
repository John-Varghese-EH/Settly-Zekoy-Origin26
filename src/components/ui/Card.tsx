'use client';
import { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'danger' | 'warning';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  animate?: boolean;
}

export function Card({ children, variant = 'default', className = '', animate = true }: CardProps) {
  const baseClasses = 'bg-[var(--bg-surface)] rounded-[var(--radius-md)] overflow-hidden transition-shadow duration-[var(--transition-base)]';
  
  const variants = {
    default: 'shadow-[var(--shadow-card)] border border-[var(--border-subtle)]',
    elevated: 'shadow-[var(--shadow-elevated)] border border-[var(--border-subtle)]',
    outlined: 'border-2 border-[var(--border-strong)]',
    danger: 'border border-[var(--accent-danger)] shadow-[var(--shadow-card)]',
    warning: 'border border-[var(--accent-warning)] shadow-[var(--shadow-card)]'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${animate ? 'animate-card-enter' : ''} ${className}`}>
      {children}
    </div>
  );
}
