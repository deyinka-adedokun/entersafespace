import React from 'react';
import { SafespaceLogo } from './SafespaceLogo';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Safespace is connecting...'
}) => {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
      <SafespaceLogo size="xl" showWordmark={false} className="animate-pulse" />
      <p className="text-xs font-medium text-[#59636B] tracking-wide">{message}</p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`bg-[#E3E2DE]/70 animate-pulse rounded-lg ${className}`} />
  );
};
