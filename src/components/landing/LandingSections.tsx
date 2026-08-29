import React from 'react';
import { ArrowRight, Clock, ShieldCheck, HeartHandshake, MicOff, ExternalLink } from 'lucide-react';
import { SafespaceLogo } from '../ui/SafespaceLogo';

interface LandingProps {
  onStartTalk: () => void;
  onTryIntro: () => void;
  onBecomeProvider: () => void;
  onOpenSafety: () => void;
  onOpenHowItWorks?: () => void;
}

/* ==========================================================================
   02 — HERO / PRIMARY EMOTIONAL ENTRY
   ========================================================================== */
export const HeroSection: React.FC<LandingProps> = ({ onStartTalk, onTryIntro }) => {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pb-20 md:pb-24 border-b border-[#E3E2DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Mobile Video (rendered first on mobile as per mobile narrative order) */}
          <div className="lg:hidden w-full">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE]">
              <video
                src="/assets/Hero-Video.mp4"
                aria-label="A calm, supportive human moment of listening and presence"
                className="w-full h-full object-cover object-center"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>

          {/* Left Column: Emotional Invitation & Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 text-left">
            
            <div className="space-y-4">
              <h1 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl lg:text-[68px] text-[#17212B] leading-[1.06] tracking-tight">
                Someone to talk to.
              </h1>
              
              <p className="text-[#59636B] text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                When you need someone to listen, Safespace connects you with a caring, verified human on-demand.
              </p>
            </div>

            {/* CTAs & Reassurance */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={onStartTalk}
                  className="px-7 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Find someone to talk to</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <a
                  href="#how-it-works"
                  className="px-5 py-3.5 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] text-sm sm:text-base font-semibold rounded-lg transition-colors border border-[#E3E2DE] text-center"
                >
                  How it works
                </a>
              </div>

              {/* Low-Friction Entry Reassurance */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D]"></span>
                <button
                  onClick={onTryIntro}
                  className="text-xs sm:text-sm font-medium text-[#59636B] hover:text-[#123B5D] underline underline-offset-4 transition-colors"
                >
                  Try a 3-minute introduction
                </button>
                <span className="text-xs text-[#7E8890]">• No pressure, start gently</span>
              </div>
            </div>

          </div>

          {/* Desktop Right Column: Large Authentic Video */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE] shadow-xs">
              <video
                src="/assets/Hero-Video.mp4"
                aria-label="A calm, supportive human moment of listening and presence"
                className="w-full h-full object-cover object-center"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   03 — IMMEDIATE REASSURANCE
   ========================================================================== */
export const ReassuranceSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#F3F1EC] border-b border-[#E3E2DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="max-w-2xl space-y-2 mb-10 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17212B] tracking-tight">
            Human support, when you need it.
          </h2>
          <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
            Safespace makes it simple to reach a real person for a private, audio-only conversation.
          </p>
        </div>

        {/* 3 Principles with subtle dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-[#E3E2DE]">
          
          <div className="pt-6 md:pt-0 md:pr-6 space-y-2 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Real People
            </div>
            <p className="text-sm font-medium text-[#17212B]">
              Verified human Providers.
            </p>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Carefully screened, compassionate listeners prepared to give you their undivided attention.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6 space-y-2 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              Private By Design
            </div>
            <p className="text-sm font-medium text-[#17212B]">
              A discreet space to talk.
            </p>
            <p className="text-xs text-[#59636B] leading-relaxed">
              No judgment, no video cameras, and no requirement to share identifying personal details.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:pl-6 space-y-2 text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[#123B5D]">
              On-Demand
            </div>
            <p className="text-sm font-medium text-[#17212B]">
              Support when you need someone to listen.
            </p>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Reach someone when thoughts are heavy, without waiting weeks for an appointment.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   04 & 05 — HOW SAFESPACE WORKS & PHOTOGRAPHY STORY
   ========================================================================== */
export const HowItWorksSection: React.FC<{ onStartTalk: () => void }> = ({ onStartTalk }) => {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#E3E2DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Editorial Heading */}
        <div className="max-w-2xl space-y-3 text-left">
          <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
            Sometimes, you don't need an answer.
          </h2>
          <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
            Sometimes you just need someone who will listen.
          </p>
        </div>

        {/* Editorial Sequence with Narrative Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* 3 Step Sequence (Desktop Horizontal, Mobile Stack) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="space-y-6">
              
              {/* Step 01 */}
              <div className="flex items-start gap-4 pb-6 border-b border-[#E3E2DE]">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2.5 py-1 rounded-md shrink-0">
                  01
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#17212B]">
                    Tell us what you need.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                    Share as much or as little as you want. Select a general topic or simply ask for an open ear.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="flex items-start gap-4 pb-6 border-b border-[#E3E2DE]">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2.5 py-1 rounded-md shrink-0">
                  02
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#17212B]">
                    We'll connect you with someone appropriate.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                    Our service-led matching pairs you with an attentive, verified listener ready right now.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="flex items-start gap-4">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2.5 py-1 rounded-md shrink-0">
                  03
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#17212B]">
                    Talk. Take your time. Be heard.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                    Join an audio-only live session. Speak freely at your own pace without pressure or unsolicited advice.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={onStartTalk}
                className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <span>Find someone to talk to</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Authentic Photograph Story */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE]">
              <img
                src="/assets/conversation-presence.jpg"
                alt="Two people engaged in a supportive, genuine conversation"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   06 — WHAT CAN YOU COME TO SAFESPACE FOR? (RECOGNITION)
   ========================================================================== */
export const RecognitionSection: React.FC<{ onStartTalk: () => void }> = ({ onStartTalk }) => {
  const intentions = [
    "I'm overwhelmed.",
    "I've had a difficult day.",
    "I don't know what I'm feeling.",
    "I need to talk something through.",
    "I don't want to burden someone I know.",
    "I just need someone to listen."
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3 text-left">
          <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
            You don't need to have the right words.
          </h2>
          <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
            You can come to Safespace when you simply need somewhere to put things into words.
          </p>
        </div>

        {/* Intention Grid — Typographic, Spacious & Dignified */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
          {intentions.map((text, idx) => (
            <div
              key={idx}
              onClick={onStartTalk}
              className="p-6 rounded-xl bg-white border border-[#E3E2DE] hover:border-[#123B5D] hover:bg-[#F3F1EC] transition-all cursor-pointer group space-y-3 shadow-2xs"
            >
              <span className="font-display italic text-2xl text-[#123B5D]">“</span>
              <p className="text-base sm:text-lg font-medium text-[#17212B] group-hover:text-[#123B5D] transition-colors leading-snug">
                {text}
              </p>
              <div className="pt-2 text-[11px] font-semibold text-[#59636B] group-hover:text-[#123B5D] flex items-center gap-1">
                <span>Talk with someone</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   07 — THE 3-MINUTE INTRODUCTION
   ========================================================================== */
export const IntroductionSection: React.FC<{ onTryIntro: () => void }> = ({ onTryIntro }) => {
  return (
    <section className="py-14 sm:py-20 bg-[#F3F1EC] border-b border-[#E3E2DE]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B]">
            Not sure if Safespace is for you?
          </h2>
          <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
            Start with a 3-minute introduction. You can decide what you want next.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onTryIntro}
            className="w-full sm:w-auto px-7 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
          >
            Try the 3-minute introduction
          </button>
        </div>

        <p className="text-xs text-[#7E8890]">
          Low commitment • No pressure • A simple human greeting
        </p>

      </div>
    </section>
  );
};

/* ==========================================================================
   08 — SESSION MODEL (TRANSPARENT SERVICE EXPLANATION)
   ========================================================================== */
export const SessionOptionsSection: React.FC<{ onStartTalk: () => void }> = ({ onStartTalk }) => {
  const packages = [
    { name: 'Quick Talk', duration: '15 minutes', price: '₦1,000', desc: 'A short check-in to clear your thoughts.' },
    { name: 'Open Conversation', duration: '30 minutes', price: '₦3,000', desc: 'Enough time to untangle what is on your mind.' },
    { name: 'Deep Conversation', duration: '60 minutes', price: '₦5,000', desc: 'A dedicated hour of undivided, attentive listening.' },
    { name: 'Stay With Me', duration: '90 minutes', price: '₦10,000', desc: 'An extended, unhurried space to be fully heard.' }
  ];

  return (
    <section className="py-16 sm:py-24 border-b border-[#E3E2DE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="max-w-2xl text-left space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17212B] tracking-tight">
            Transparent conversation lengths.
          </h2>
          <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
            Choose what feels right for today. Sessions are private, audio-only, and billed clearly upfront.
          </p>
        </div>

        {/* 4 Packages in clean, restrained geometry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {packages.map((pkg, i) => (
            <div
              key={i}
              onClick={onStartTalk}
              className="p-5 rounded-xl bg-white border border-[#E3E2DE] hover:border-[#123B5D] transition-colors cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">{pkg.name}</div>
                <div className="text-lg font-bold text-[#17212B]">{pkg.duration}</div>
                <p className="text-xs text-[#59636B] leading-relaxed">{pkg.desc}</p>
              </div>
              <div className="pt-3 border-t border-[#E3E2DE] flex items-center justify-between">
                <span className="font-bold text-sm text-[#123B5D]">{pkg.price}</span>
                <span className="text-[11px] font-semibold text-[#59636B]">Select</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   09 — AUDIO-ONLY POSITIONING
   ========================================================================== */
export const AudioOnlySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#F3F1EC] border-b border-[#E3E2DE]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        
        <div className="w-10 h-10 rounded-full bg-[#EAF0F5] border border-[#C5D6E4] text-[#123B5D] flex items-center justify-center mx-auto">
          <MicOff className="w-5 h-5" />
        </div>

        <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B]">
          Sometimes it's easier to talk when you don't have to be seen.
        </h2>
        
        <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed max-w-xl mx-auto">
          Safespace conversations are audio-only, giving you room to focus on what you want to say.
        </p>

      </div>
    </section>
  );
};

/* ==========================================================================
   10 — SAFETY & TRUST
   ========================================================================== */
export const SafetySection: React.FC<{ onOpenSafety: () => void }> = ({ onOpenSafety }) => {
  return (
    <section className="py-16 sm:py-24 border-b border-[#E3E2DE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="max-w-2xl text-left space-y-3">
          <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#17212B]">
            A space designed with care.
          </h2>
          <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
            Safespace is built around privacy, responsible matching and clear safeguarding practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
            <h3 className="text-sm font-bold text-[#17212B]">Verified Providers</h3>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Human Providers are reviewed and verified before participating.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
            <h3 className="text-sm font-bold text-[#17212B]">Responsible matching</h3>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Safespace matches based on what the Seeker needs rather than asking users to browse a public Provider directory.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
            <h3 className="text-sm font-bold text-[#17212B]">Safety matters</h3>
            <p className="text-xs text-[#59636B] leading-relaxed">
              Safeguarding processes exist for situations that require additional intervention.
            </p>
          </div>

        </div>

        <div className="text-left pt-2">
          <button
            onClick={onOpenSafety}
            className="px-5 py-2.5 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#123B5D] text-xs font-semibold rounded-lg border border-[#E3E2DE] transition-colors"
          >
            Learn about safety
          </button>
        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   11 — SAGE GATEWAY (EXTERNAL AI COMPANION)
   ========================================================================== */
export const SageGatewaySection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-2xl border border-[#E3E2DE] p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Sage Identity / Line Art Mark */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F3F1EC] border border-[#E3E2DE] p-3 flex items-center justify-center">
              <img
                src="/assets/sage-logo.png"
                alt="Sage"
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#59636B] uppercase">Independent Space</span>
              <h3 className="text-2xl font-bold text-[#17212B]">Sage</h3>
            </div>
          </div>

          {/* Sage Positioning & Copy */}
          <div className="md:col-span-8 space-y-4 text-left">
            <h4 className="font-display font-normal text-2xl sm:text-3xl text-[#17212B]">
              An AI-powered companion for human becoming.
            </h4>
            
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              When you're ready to explore the person you're becoming, Sage offers a different kind of space for reflection, conversation and intentional growth.
            </p>

            <div className="pt-2">
              <a
                href="https://becomingwithsage.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#17212B] hover:bg-[#000000] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
              >
                <span>Meet Sage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-[#7E8890] italic">
              * Sage is an independent AI companion and does not replace human peer listening on Safespace.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   12 — PROVIDER INVITATION
   ========================================================================== */
export const ProviderSection: React.FC<{ onBecomeProvider: () => void }> = ({ onBecomeProvider }) => {
  return (
    <section className="py-16 sm:py-24 border-b border-[#E3E2DE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Attentive Human Presence Photograph */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE] shadow-xs">
              <img
                src="/assets/provider-listening.jpg"
                alt="A thoughtful, attentive person listening"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Invitation Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="space-y-3">
              <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
                Some people are good at making space for others.
              </h2>
              
              <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
                Safespace is building a community of thoughtful, responsible people who are willing to listen.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onBecomeProvider}
                className="px-6 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Become a Provider</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7E8890]">
              Flexible schedule • Audio-only • Supported by automated safeguarding
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};

/* ==========================================================================
   13 — FINAL EMOTIONAL CTA
   ========================================================================== */
export const FinalCTASection: React.FC<{ onStartTalk: () => void }> = ({ onStartTalk }) => {
  return (
    <section className="py-20 sm:py-28 bg-[#123B5D] text-white text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Subtle Reversed Brand Logo mark */}
        <div className="flex justify-center">
          <SafespaceLogo
            size="xl"
            showWordmark={false}
            variant="white"
          />
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
            You don't have to carry everything alone.
          </h2>
          
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
            When you're ready, someone can listen.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onStartTalk}
            className="px-8 py-4 bg-white hover:bg-[#FAF9F6] text-[#123B5D] font-bold text-sm sm:text-base rounded-lg transition-colors shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Find someone to talk to</span>
            <ArrowRight className="w-4 h-4 text-[#123B5D]" />
          </button>
        </div>

      </div>
    </section>
  );
};
