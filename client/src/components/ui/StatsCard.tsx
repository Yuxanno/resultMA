import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo' | 'pink';
  subtitle?: string;
  action?: ReactNode;
  gradient?: boolean;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
    ring: 'ring-green-500/20'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    ring: 'ring-purple-500/20'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
    ring: 'ring-orange-500/20'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    ring: 'ring-red-500/20'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    ring: 'ring-indigo-500/20'
  },
  pink: {
    bg: 'bg-pink-50',
    icon: 'text-pink-600',
    gradient: 'from-pink-500 to-pink-600',
    ring: 'ring-pink-500/20'
  }
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  subtitle,
  action,
  gradient = false
}: StatsCardProps) {
  const colors = colorConfig[color];

  return (
    <div className="group relative glass-card rounded-xl sm:rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50 hover-lift">
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
      
      {/* Decorative Corner */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${colors.gradient} opacity-5 rounded-full blur-2xl`}></div>
      
      <div className="relative p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2 truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                {value}
              </h3>
              {trend && (
                <span className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${
                  trend.isPositive 
                    ? 'bg-success-light text-success' 
                    : 'bg-destructive-light text-destructive'
                }`}>
                  <span className="text-sm sm:text-base">{trend.isPositive ? '↑' : '↓'}</span>
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 line-clamp-1">{subtitle}</p>
            )}
          </div>
          
          <div className={`relative flex-shrink-0 ${
            gradient 
              ? `bg-gradient-to-br ${colors.gradient}` 
              : colors.bg
          } rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 shadow-md ring-2 sm:ring-4 ${colors.ring} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${gradient ? 'text-white' : colors.icon}`} />
          </div>
        </div>
        
        {action && (
          <div className="pt-3 sm:pt-4 border-t border-border/50">
            {action}
          </div>
        )}
      </div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
    </div>
  );
}
