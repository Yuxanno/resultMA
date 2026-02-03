import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-200',
        'hover:scale-105 transform',
        {
          'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-glow-primary': variant === 'default',
          'bg-success/10 text-success border border-success/20 hover:bg-success/20 hover:shadow-glow-success': variant === 'success',
          'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 hover:shadow-glow-warning': variant === 'warning',
          'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20': variant === 'danger',
          'bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20': variant === 'info',
          'bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20': variant === 'purple',
          'bg-muted text-muted-foreground border border-border hover:bg-muted/80': variant === 'secondary',
          'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50': variant === 'outline',
        },
        {
          'px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs': size === 'sm',
          'px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm': size === 'md',
          'px-2.5 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base': size === 'lg',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
