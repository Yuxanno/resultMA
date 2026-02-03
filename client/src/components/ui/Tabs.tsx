import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers - Scrollable on mobile */}
      <div
        className={cn(
          'flex gap-2 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide',
          variant === 'default' && 'border-b border-border',
          variant === 'pills' && 'bg-muted p-1 rounded-xl',
          variant === 'underline' && 'border-b-2 border-border'
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-medium transition-all duration-200 whitespace-nowrap text-sm sm:text-base',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'touch-target',
                
                // Default variant
                variant === 'default' && [
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                ],
                
                // Pills variant
                variant === 'pills' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-white text-primary shadow-soft'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50',
                ],
                
                // Underline variant
                variant === 'underline' && [
                  'border-b-2 -mb-0.5',
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ]
              )}
            >
              {tab.icon && (
                <span className={cn('w-4 h-4 sm:w-5 sm:h-5', isActive && 'text-primary')}>
                  {tab.icon}
                </span>
              )}
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTabContent}
      </div>
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <div className={cn('py-4', className)}>
      {children}
    </div>
  );
}
