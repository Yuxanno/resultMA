import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            className={cn(
              'w-full h-11 sm:h-12 rounded-lg sm:rounded-xl border-2 border-input bg-background px-3 sm:px-4 py-2.5 text-sm sm:text-base appearance-none cursor-pointer',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-0 focus:border-primary',
              'hover:border-primary/50',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',
              'touch-target',
              error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="mt-1.5 text-xs text-destructive font-semibold animate-slide-in-left">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
