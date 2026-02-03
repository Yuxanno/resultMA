import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  style,
  ...props 
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        {
          'rounded-full': variant === 'circular',
          'rounded-md': variant === 'rectangular',
          'rounded h-4': variant === 'text',
        },
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height={100} />
      <div className="flex space-x-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton variant="rectangular" width={40} height={40} />
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" width={100} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      ))}
    </div>
  );
}
