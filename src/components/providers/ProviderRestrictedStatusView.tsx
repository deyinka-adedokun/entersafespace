import React from 'react';
import { SafespaceLogo } from '../ui/SafespaceLogo';
import { ShieldAlert, Mail } from 'lucide-react';

interface ProviderRestrictedStatusViewProps {
  status: 'RESTRICTED' | 'SUSPENDED' | 'REMOVED' | string;
  onExit: () => void;
}

export const ProviderRestrictedStatusView: React.FC<ProviderRestrictedStatusViewProps> = ({
  status,
  onExit
}) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17212B] flex flex-col justify-between selection:bg-[#123B5D]/10 selection:text-[#123B5D] animate-in fade-in duration-200">
      
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#E3E2DE]">
        <SafespaceLogo size="sm" showWordmark={true} />
        <button
          onClick={onExit}
          className="text-xs font-semibold text-[#59636B] hover:text-[#17212B] transition-colors cursor-pointer"
        >
          Return to Home
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 space-y-6 text-left">
        <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] shadow-2xs space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#FEF3F2] border border-[#FECDCA] flex items-center justify-center text-[#B42318]">
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#17212B]">
              Provider Account Access Notice
            </h2>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Your Safespace Provider privileges are currently {status.toLowerCase().replace('_', ' ')}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE] text-xs text-[#59636B] space-y-2">
            <p>
              This may occur during periodic quality reviews, safeguarding audits, or administrative adjustments.
            </p>
            <p>
              If you have questions regarding this review or wish to request clarification, please contact our trust and safety team.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={onExit}
              className="px-4 py-2.5 rounded-xl border border-[#E3E2DE] bg-white text-xs font-semibold text-[#17212B] hover:bg-[#FAF9F6] cursor-pointer"
            >
              Exit to Home
            </button>

            <a
              href="mailto:trust-safety@safespace.ng"
              className="px-4 py-2.5 bg-[#123B5D] text-white rounded-xl text-xs font-bold hover:bg-[#0D2A42] transition-colors inline-flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Safety Team</span>
            </a>
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#7E8890] border-t border-[#E3E2DE]/40">
        Safespace • Human emotional support network
      </footer>

    </div>
  );
};
