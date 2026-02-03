import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg sm:rounded-xl font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.97] transform relative overflow-hidden',
          'touch-target', // Минимум 44px для сенсорного ввода
          'before:absolute before:inset-0 before:bg-white/20 before:translate-y-full before:transition-transform before:duration-300',
          'hover:before:translate-y-0',
          {
            'bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft hover:shadow-medium hover:-translate-y-0.5': 
              variant === 'default',
            'bg-destructive text-destructive-foreground hover:opacity-90 shadow-soft hover:shadow-medium hover:-translate-y-0.5': 
              variant === 'destructive',
            'bg-success text-success-foreground hover:opacity-90 shadow-soft hover:shadow-medium hover:-translate-y-0.5': 
              variant === 'success',
            'bg-warning text-warning-foreground hover:opacity-90 shadow-soft hover:shadow-medium hover:-translate-y-0.5': 
              variant === 'warning',
            'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50': 
              variant === 'outline',
            'bg-secondary text-secondary-foreground hover:opacity-90 shadow-soft hover:-translate-y-0.5': 
              variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': 
              variant === 'ghost',
          },
          {
            'h-11 px-4 sm:px-5 py-2.5 text-sm': size === 'default',
            'h-9 px-3 text-xs rounded-lg': size === 'xs',
            'h-10 px-3 sm:px-4 text-sm rounded-lg': size === 'sm',
            'h-12 sm:h-13 px-6 sm:px-8 text-base': size === 'lg',
            'h-10 w-10 sm:h-11 sm:w-11': size === 'icon',
          },
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        <span className="relative z-10 flex items-center">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
