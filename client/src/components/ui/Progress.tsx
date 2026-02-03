import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gradient';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantConfig = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  gradient: 'bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-gradient-shift',
};

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className,
  animated = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Auto-select variant based on percentage if default
  let finalVariant = variant;
  if (variant === 'default') {
    if (percentage >= 100) {
      finalVariant = 'error';
    } else if (percentage >= 80) {
      finalVariant = 'warning';
    } else {
      finalVariant = 'success';
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeConfig[size])}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            variantConfig[finalVariant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm font-medium text-muted-foreground text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorConfig = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-destructive',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colorConfig[variant])}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
