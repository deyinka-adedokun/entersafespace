import React from 'react';
import { AlertCircle } from 'lucide-react';
import { SafespaceLogo } from './SafespaceLogo';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="py-12 px-6 text-center bg-white rounded-xl border border-[#E3E2DE] max-w-md mx-auto space-y-4 shadow-xs">
      <div className="flex justify-center">
        {icon || <SafespaceLogo size="lg" showWordmark={false} />}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-lg text-[#17212B]">{title}</h3>
        <p className="text-xs text-[#59636B] leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry
}) => {
  return (
    <div className="py-10 px-6 text-center bg-[#FDF2F2] rounded-xl border border-[#F9C9C7] max-w-md mx-auto space-y-3">
      <div className="w-10 h-10 rounded-full bg-[#FDF2F2] text-[#B3261E] flex items-center justify-center mx-auto border border-[#F9C9C7]">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#17212B]">{title}</h3>
        <p className="text-xs text-[#59636B]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#123B5D] text-white hover:bg-[#0D2A42] rounded-lg text-xs font-semibold transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
