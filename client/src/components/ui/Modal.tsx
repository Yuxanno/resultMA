import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  footer?: ReactNode;
  className?: string;
}

const sizeConfig = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Overlay with Blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full glass rounded-xl sm:rounded-2xl shadow-2xl animate-scale-in',
          'max-h-[95vh] sm:max-h-[90vh] flex flex-col',
          sizeConfig[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 sm:p-6 pb-4 sm:pb-5 border-b border-border/50">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-1.5 truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-3 sm:ml-4 w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-muted/80 transition-all duration-200 hover:rotate-90 group flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 pt-4 sm:pt-5 border-t border-border/50 bg-muted/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Tasdiqlash',
  cancelText = 'Bekor qilish',
  variant = 'default',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} fullWidth className="sm:w-auto">
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            loading={loading}
            fullWidth
            className="sm:w-auto"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-center py-4 sm:py-6">
        <div className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl mx-auto mb-4 sm:mb-5 flex items-center justify-center",
          variant === 'destructive' ? 'bg-destructive-light' : 'bg-primary-light'
        )}>
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center",
            variant === 'destructive' ? 'bg-destructive/20' : 'bg-primary/20'
          )}>
            <span className={cn(
              "text-xl sm:text-2xl",
              variant === 'destructive' ? 'text-destructive' : 'text-primary'
            )}>
              {variant === 'destructive' ? '⚠️' : '❓'}
            </span>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Modal>
  );
}
