import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  PhoneCall, 
  ExternalLink,
  Shield,
  HeartHandshake
} from 'lucide-react';
import { PublicInfoTopic } from './PublicInfoModal';
import { TabType } from './BottomNav';
import { SafespaceLogo } from './ui/SafespaceLogo';

interface FooterProps {
  onOpenPublicInfo: (topic: PublicInfoTopic) => void;
  onOpenEmergency: () => void;
  onOpenSafetyReport: () => void;
  onStartTalk: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPublicInfo,
  onOpenEmergency,
  onOpenSafetyReport,
  onStartTalk,
  onSelectTab
}) => {
  return (
    <footer className="bg-[#FAF9F6] text-[#17212B] border-t border-[#E3E2DE] mt-16 pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Brand Banner & Primary Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#E3E2DE]">
          <div className="space-y-2 max-w-xl">
            <SafespaceLogo size="lg" />
            <p className="text-sm text-[#59636B] leading-relaxed pt-2">
              On-demand human emotional support. Connecting people with caring, verified listeners in a private, audio-only sanctuary.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onStartTalk}
              className="px-5 py-2.5 rounded-lg bg-[#123B5D] text-white font-semibold text-xs sm:text-sm hover:bg-[#0D2A42] transition-colors shadow-xs"
            >
              Find Support
            </button>
            <button
              onClick={onOpenEmergency}
              className="px-4 py-2.5 rounded-lg border border-[#F9C9C7] bg-[#FDF2F2] hover:bg-[#FCEBEA] text-[#8C1D18] text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-[#8C1D18]" />
              <span>Crisis Helplines</span>
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-[#59636B]">
          <div className="space-y-3">
            <h4 className="font-semibold text-[#17212B] uppercase tracking-wider text-[11px]">Service</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('HOW_IT_WORKS')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPublicInfo('HOW_IT_WORKS')} className="hover:text-[#123B5D] transition-colors">
                  Conversation Packages
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('GIFT')} className="hover:text-[#123B5D] transition-colors">
                  Gift a Conversation
                </button>
              </li>
              <li>
                <a 
                  href="https://becomingwithsage.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#123B5D] transition-colors inline-flex items-center gap-1"
                >
                  <span>Sage Companion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[#17212B] uppercase tracking-wider text-[11px]">Providers</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('FOR_PROVIDERS')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  For Providers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('FOR_PROVIDERS')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Listening Standards
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('LISTENER')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Provider Portal
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[#17212B] uppercase tracking-wider text-[11px]">Safeguarding</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('SAFETY')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Safety & Trust Overview
                </button>
              </li>
              <li>
                <button onClick={onOpenEmergency} className="text-[#8C1D18] font-medium hover:underline cursor-pointer">
                  Emergency Resources
                </button>
              </li>
              <li>
                <button onClick={onOpenSafetyReport} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Report a Safety Concern
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPublicInfo('PRIVACY_POLICY')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Privacy & Confidentiality
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPublicInfo('TERMS_OF_SERVICE')} className="hover:text-[#123B5D] transition-colors cursor-pointer">
                  Terms of Service (18+)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-[#17212B] uppercase tracking-wider text-[11px]">Trust & Architecture</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#123B5D]" />
                <span>Audio-Only Sessions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#123B5D]" />
                <span>No Call Recording</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-[#123B5D]" />
                <span>Human Emotional Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-[#E3E2DE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#59636B]">
          <p>© {new Date().getFullYear()} Safespace. Accessing Human Emotional Support.</p>
          <p className="text-[11px] text-[#7E8890] text-center sm:text-right">
            Safespace provides peer emotional support, not clinical therapy or medical intervention.
          </p>
        </div>

      </div>
    </footer>
  );
};
