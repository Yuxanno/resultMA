import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 sm:h-12 w-full rounded-lg sm:rounded-xl border-2 border-input bg-background px-3 sm:px-4 py-2.5 text-sm sm:text-base',
            'placeholder:text-muted-foreground/60',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-0 focus:border-primary',
            'hover:border-primary/50',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'touch-target', // Минимум 44px для сенсорного ввода
            error && 'border-destructive focus:ring-destructive/20 focus:border-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p className="mt-1.5 text-xs text-destructive font-semibold animate-slide-in-left">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
