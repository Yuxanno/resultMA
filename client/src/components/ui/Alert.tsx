import { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: boolean;
}

const variantConfig = {
  info: {
    container: 'bg-info/10 border-info/30 text-info-dark',
    icon: Info,
    iconBg: 'bg-info/20',
    iconColor: 'text-info',
  },
  success: {
    container: 'bg-success/10 border-success/30 text-success-dark',
    icon: CheckCircle2,
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
  },
  warning: {
    container: 'bg-warning/10 border-warning/30 text-warning-dark',
    icon: AlertTriangle,
    iconBg: 'bg-warning/20',
    iconColor: 'text-warning',
  },
  error: {
    container: 'bg-destructive/10 border-destructive/30 text-destructive-dark',
    icon: AlertCircle,
    iconBg: 'bg-destructive/20',
    iconColor: 'text-destructive',
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  icon = true,
}: AlertProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative rounded-lg sm:rounded-xl border-2 p-4 sm:p-5 animate-slide-down shadow-soft',
        config.container,
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {icon && (
          <div className={cn('w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm', config.iconBg)}>
            <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', config.iconColor)} />
          </div>
        )}
        
        <div className="flex-1 min-w-0 pt-0.5">
          {title && (
            <h4 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">
              {title}
            </h4>
          )}
          <div className="text-xs sm:text-sm leading-relaxed opacity-90">
            {children}
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200',
              'hover:bg-black/10 hover:rotate-90 touch-target'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
