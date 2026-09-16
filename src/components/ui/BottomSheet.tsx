import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 bg-[#17212B]/50 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />
      <div 
        className="relative z-10 bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-[#E3E2DE] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250"
      >
        <div className="w-12 h-1 bg-[#E3E2DE] rounded-full mx-auto mb-4 sm:hidden" />
        
        <div className="flex items-center justify-between mb-4">
          {title ? <h3 className="font-display text-lg font-bold text-[#17212B]">{title}</h3> : <div />}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#59636B] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};