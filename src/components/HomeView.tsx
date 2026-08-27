import React from 'react';
import { User, ProviderProfile } from '../types';
import {
  HeroSection,
  ReassuranceSection,
  HowItWorksSection,
  RecognitionSection,
  IntroductionSection,
  SessionOptionsSection,
  AudioOnlySection,
  SafetySection,
  SageGatewaySection,
  ProviderSection,
  FinalCTASection
} from './landing/LandingSections';

interface HomeViewProps {
  currentUser?: User | null;
  onStartTalk: () => void;
  onQuickRebook?: (providerId: string) => void;
  preferredProvider?: ProviderProfile | null;
  onOpenHowItWorks: () => void;
  onBecomeProvider?: () => void;
  onOpenSafety?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  onStartTalk,
  onQuickRebook,
  preferredProvider,
  onOpenHowItWorks,
  onBecomeProvider,
  onOpenSafety
}) => {
  return (
    <div className="w-full flex flex-col space-y-0 text-left selection:bg-[#123B5D]/10">
      
      {/* 02 — Hero / Primary Emotional Entry */}
      <HeroSection
        onStartTalk={onStartTalk}
        onTryIntro={onStartTalk}
        onBecomeProvider={onBecomeProvider || onStartTalk}
        onOpenSafety={onOpenSafety || onStartTalk}
        onOpenHowItWorks={onOpenHowItWorks}
      />

      {/* 03 — Immediate Reassurance */}
      <ReassuranceSection />

      {/* 04 & 05 — How Safespace Works & Authentic Photography Story */}
      <HowItWorksSection onStartTalk={onStartTalk} />

      {/* 06 — What You Can Come For (Emotional Recognition) */}
      <RecognitionSection onStartTalk={onStartTalk} />

      {/* 07 — The 3-Minute Introduction */}
      <IntroductionSection onTryIntro={onStartTalk} />

      {/* 08 — Session Model (Transparent conversation options) */}
      <SessionOptionsSection onStartTalk={onStartTalk} />

      {/* 09 — Audio-Only Positioning */}
      <AudioOnlySection />

      {/* 10 — Safety & Trust */}
      <SafetySection onOpenSafety={onOpenSafety || onStartTalk} />

      {/* 11 — Sage Gateway (External Independent AI Companion) */}
      <SageGatewaySection />

      {/* 12 — Provider Invitation */}
      <ProviderSection onBecomeProvider={onBecomeProvider || onStartTalk} />

      {/* 13 — Final Emotional CTA */}
      <FinalCTASection onStartTalk={onStartTalk} />

    </div>
  );
};
