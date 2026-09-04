interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[var(--bg-elevated)]';
  
  let styles = {};
  if (width) styles = { ...styles, width };
  if (height) styles = { ...styles, height };

  const variants = {
    text: 'h-4 rounded-[var(--radius-sm)] w-3/4',
    card: 'h-32 rounded-[var(--radius-md)] w-full',
    circle: 'h-10 w-10 rounded-full'
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={styles}
    />
  );
}
