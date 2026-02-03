import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  className,
  gradient = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 sm:mb-8 animate-fade-in',
        gradient && 'gradient-mesh -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 sm:py-8 rounded-xl sm:rounded-2xl border border-border/50 shadow-soft',
        className
      )}
    >
      {breadcrumb && <div className="mb-4 sm:mb-5">{breadcrumb}</div>}
      
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-5 flex-1 w-full sm:w-auto">
          {Icon && (
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 gradient-primary rounded-xl sm:rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pt-1 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageHeaderStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
  }>;
}

export function PageHeaderStats({ stats }: PageHeaderStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8 animate-fade-in">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="glass-card rounded-xl sm:rounded-2xl border border-border/50 p-4 sm:p-6 shadow-soft hover:shadow-md transition-all duration-300 hover-lift group"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
            {stat.icon && (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {stat.value}
            </span>
            {stat.trend && stat.trendValue && (
              <span
                className={cn(
                  'text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full',
                  stat.trend === 'up' && 'bg-success-light text-success',
                  stat.trend === 'down' && 'bg-destructive-light text-destructive',
                  stat.trend === 'neutral' && 'bg-muted text-muted-foreground'
                )}
              >
                {stat.trendValue}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
