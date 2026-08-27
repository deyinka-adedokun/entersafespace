import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17212B]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true"
      />
      <div 
        role="dialog"
        aria-modal="true"
        className={`relative z-10 bg-white w-full ${maxWidths[maxWidth]} rounded-xl p-6 sm:p-8 shadow-xl border border-[#E3E2DE] focus:outline-none`}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#59636B] hover:text-[#17212B] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
        >
          <X className="w-4 h-4" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h2 className="text-xl font-bold text-[#17212B] tracking-tight">{title}</h2>
            {description && <p className="text-sm text-[#59636B] mt-1">{description}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
