import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted',
        {
          'animate-pulse': animation === 'pulse',
          'animate-shimmer': animation === 'wave',
          'rounded-full': variant === 'circular',
          'rounded-lg': variant === 'rounded',
          'rounded': variant === 'rectangular',
          'rounded-md h-4': variant === 'text',
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

// Pre-built skeleton components
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" height="1.5rem" />
        <Skeleton variant="text" width="40%" height="1rem" />
        <div className="space-y-2 pt-4">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="50%" />
          </div>
          <Skeleton variant="rounded" width="80px" height="32px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={`${size}px`}
      height={`${size}px`}
    />
  );
}

export function SkeletonButton() {
  return <Skeleton variant="rounded" width="120px" height="40px" />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}
