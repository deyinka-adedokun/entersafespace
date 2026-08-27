import React from 'react';
import { 
  ArrowRight, 
  MicOff, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  X as XIcon,
  Sparkles,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { SafespaceLogo } from '../ui/SafespaceLogo';

interface HowItWorksViewProps {
  onStartTalk: () => void;
  onTryIntro: () => void;
  onBecomeProvider: () => void;
  onOpenSafety: () => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({
  onStartTalk,
  onTryIntro,
  onBecomeProvider,
  onOpenSafety
}) => {
  const intentions = [
    "I need to clear my head.",
    "I'm overwhelmed.",
    "I've had a difficult day.",
    "I need someone to listen.",
    "I want to talk something through.",
    "I don't want advice right now.",
    "I don't know where to begin."
  ];

  const canonicalPackages = [
    { name: 'Quick Talk', duration: '15 minutes', price: '₦1,000', desc: 'A short check-in to clear your thoughts and center yourself.' },
    { name: 'Open Conversation', duration: '30 minutes', price: '₦3,000', desc: 'Enough time to untangle what is on your mind at your own pace.' },
    { name: 'Deep Conversation', duration: '60 minutes', price: '₦5,000', desc: 'A dedicated, unhurried hour of attentive, uninterrupted listening.' },
    { name: 'Stay With Me', duration: '90 minutes', price: '₦10,000', desc: 'An extended, spacious session when thoughts feel especially heavy.' }
  ];

  const sessionFlow = [
    { title: 'Connected', desc: 'You are connected privately with your matched Provider in a secure audio environment.' },
    { title: 'Present', desc: "The Provider's role is to listen attentively and make room for your experience." },
    { title: 'Conversation', desc: 'You speak at your own pace without unsolicited advice or pressure.' },
    { title: 'Time', desc: 'The session continues for the duration selected, with clear mutual awareness.' },
    { title: 'Closing', desc: 'When the session ends, the conversation concludes unless an extension is chosen.' }
  ];

  const whatItIsNot = [
    { title: 'A public Provider marketplace', desc: 'You never have to compare or shop for listeners.' },
    { title: 'A social network or dating app', desc: 'Conversations are strictly confidential and bound to the session.' },
    { title: 'A replacement for emergency services', desc: 'Crisis escalations exist for critical health situations.' },
    { title: 'A clinical diagnostic service', desc: 'Listeners offer human empathy, not psychiatric labelling.' },
    { title: 'A place where you need the right words', desc: 'You can arrive completely unsure and speak freely.' }
  ];

  return (
    <div className="w-full flex flex-col space-y-0 text-left selection:bg-[#123B5D]/10 selection:text-[#123B5D]">
      
      {/* ==========================================================================
          05 — PAGE OPENING / HERO
          ========================================================================== */}
      <section className="relative overflow-hidden pt-4 pb-12 sm:pb-20 md:pb-24 border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Mobile Image (narrative order) */}
            <div className="lg:hidden w-full">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE]">
                <img
                  src="/assets/how-it-works-hero.jpg"
                  alt="A calm, thoughtful person in an armchair listening and feeling heard"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>

            {/* Left: Headline & Core Narrative */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 text-left">
              
              <div className="space-y-4">
                <h1 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#17212B] leading-[1.08] tracking-tight">
                  How Safespace works.
                </h1>
                
                <p className="text-[#17212B] text-lg sm:text-xl font-medium leading-snug max-w-xl">
                  Sometimes, getting the support you need should be as simple as saying that you need someone to talk to.
                </p>

                <p className="text-[#59636B] text-sm sm:text-base leading-relaxed max-w-xl">
                  Safespace connects you with a verified human who is ready to listen. You tell us what you need, we help make the connection, and you talk privately by audio.
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    onClick={onStartTalk}
                    className="px-7 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Find someone to talk to</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={onTryIntro}
                    className="px-5 py-3.5 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] text-sm sm:text-base font-semibold rounded-lg transition-colors border border-[#E3E2DE] text-center cursor-pointer"
                  >
                    Try the 3-minute introduction
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D]"></span>
                  <span className="text-xs sm:text-sm font-medium text-[#59636B]">
                    Audio-only • No directory browsing • Verified human listeners
                  </span>
                </div>
              </div>

            </div>

            {/* Desktop Right: Authentic Photograph */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/how-it-works-hero.jpg"
                  alt="A calm, thoughtful person in an armchair listening and feeling heard"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          07 — THE THREE-STAGE JOURNEY
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="max-w-2xl space-y-3 text-left">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Three simple steps.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              A clear, unhurried path from arriving to being heard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            
            {/* Step 01 */}
            <div className="p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-3 py-1 rounded-md inline-block">
                  STEP 01
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  Tell us what you need.
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  Share as much or as little as you want. You can choose a general emotional intention or simply ask for an open conversation.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E3E2DE] text-[11px] font-medium text-[#7E8890]">
                No clinical diagnosis required
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-3 py-1 rounded-md inline-block">
                  STEP 02
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  We'll connect you with someone appropriate.
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  Safespace uses service-led matching to help connect you with an attentive, verified human who is available to listen.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E3E2DE] text-[11px] font-medium text-[#7E8890]">
                No searching through public profiles
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-3 py-1 rounded-md inline-block">
                  STEP 03
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  Talk. Take your time. Be heard.
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  Join a private audio-only session and speak freely at your own pace.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E3E2DE] text-[11px] font-medium text-[#123B5D]">
                No cameras • No performance • No pressure
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          08 & 09 — MATCHING EXPLANATION & NO DIRECTORY (CX PRINCIPLE)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Tell us what you need. We'll help make the connection.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is service-led by design. We match based on what you are experiencing rather than asking you to browse a directory.
            </p>
          </div>

          {/* 3 Steps of Service-Led Matching */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">What you need</div>
              <h3 className="text-base font-bold text-[#17212B]">Your emotional intention</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                The experience begins with your emotional intention, whether that is untangling a problem or needing quiet company.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">What we consider</div>
              <h3 className="text-base font-bold text-[#17212B]">Provider capability</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Safespace considers the nature of your request, active availability, and verified listener experience.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">What happens next</div>
              <h3 className="text-base font-bold text-[#17212B]">Immediate connection</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                An appropriate available Provider is identified and your private audio conversation can begin.
              </p>
            </div>

          </div>

          {/* Important CX Principle: No Directory */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] text-left space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-[#17212B]">
              You don't have to search through profiles.
            </h3>
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed max-w-3xl">
              Safespace is designed to help you find the right kind of support without turning a vulnerable moment into a shopping experience. You focus on what you feel; we handle the matching.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          10 & 11 — WHAT CAN I TALK ABOUT? (EMOTIONAL INTENTION MODEL)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Section Header */}
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              You don't need to know exactly what you need.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Sometimes you know what happened. Sometimes you only know that something feels heavy.
            </p>
          </div>

          {/* Typographic Asymmetrical Arrangement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            
            {/* Left Large Thought */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4">
              <span className="font-display italic text-4xl text-[#123B5D]">“</span>
              <p className="font-display text-2xl sm:text-3xl text-[#17212B] leading-snug">
                There is room for whatever you are carrying.
              </p>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                You never need to have a structured agenda or formal diagnosis. A simple human starting point is enough.
              </p>
            </div>

            {/* Right Intentions List */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {intentions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={onStartTalk}
                  className="p-4 rounded-xl bg-white border border-[#E3E2DE] hover:border-[#123B5D] hover:bg-[#F3F1EC] transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <span className="text-sm font-medium text-[#17212B] group-hover:text-[#123B5D]">
                    {item}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#59636B] group-hover:text-[#123B5D] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          12 — AUDIO-ONLY EXPERIENCE
          ========================================================================== */}
      <section className="py-16 sm:py-20 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="w-12 h-12 rounded-full bg-[#EAF0F5] border border-[#C5D6E4] text-[#123B5D] flex items-center justify-center mx-auto">
            <MicOff className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B]">
              Sometimes it's easier when you don't have to be seen.
            </h2>
            
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Safespace sessions begin with audio. You can focus on speaking, listening and being present without worrying about how you look.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#17212B]">
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Audio-only</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Private conversation</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">No camera</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">No pressure to perform</span>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          13 — SESSION LENGTH & CANONICAL PACKAGES
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Choose the time you need.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Transparent, upfront conversation lengths. Sessions are private and paid simply before joining.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {canonicalPackages.map((pkg, i) => (
              <div
                key={i}
                onClick={onStartTalk}
                className="p-6 rounded-2xl bg-white border border-[#E3E2DE] hover:border-[#123B5D] transition-colors cursor-pointer space-y-4 flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">{pkg.name}</div>
                  <div className="text-xl font-bold text-[#17212B]">{pkg.duration}</div>
                  <p className="text-xs text-[#59636B] leading-relaxed">{pkg.desc}</p>
                </div>
                <div className="pt-4 border-t border-[#E3E2DE] flex items-center justify-between">
                  <span className="font-bold text-base text-[#123B5D]">{pkg.price}</span>
                  <span className="text-xs font-semibold text-[#59636B]">Select</span>
                </div>
              </div>
            ))}
          </div>

          {/* Intro Reminder */}
          <div className="p-5 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <p className="text-sm font-bold text-[#17212B]">New to Safespace?</p>
              <p className="text-xs text-[#59636B]">Start with a one-time 3-minute introduction to experience the service gently.</p>
            </div>
            <button
              onClick={onTryIntro}
              className="px-5 py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Try 3-minute intro
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          14 & 15 — SESSION EXPERIENCE & CREDIT PROTECTION PRINCIPLE
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              What happens during a session.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              A calm, structured environment designed to keep your conversation focused and safe.
            </p>
          </div>

          {/* Sequence Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left">
            {sessionFlow.map((step, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
                <div className="font-mono text-xs font-bold text-[#123B5D]">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-bold text-[#17212B]">{step.title}</h3>
                <p className="text-xs text-[#59636B] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Credit Protection Principle */}
          <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] text-left space-y-2">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Session Lifecycle & Protection</div>
            <h3 className="text-base font-bold text-[#17212B]">Your session time is protected.</h3>
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Sessions run continuously for the chosen duration. If a Safespace-side technical interruption affects your session, your remaining entitlement is protected and preserved.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          16 — THE 3-MINUTE INTRODUCTION (PERMISSION & REASSURANCE)
          ========================================================================== */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B]">
              Not sure yet?
            </h2>
            <p className="text-lg font-medium text-[#17212B]">
              That's okay.
            </p>
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Start with a one-time 3-minute introduction and experience what it feels like to have someone simply listen.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onTryIntro}
              className="px-7 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Try the 3-minute introduction
            </button>
          </div>

          <p className="text-xs text-[#7E8890]">
            Permission, not pressure • A gentle human first step
          </p>

        </div>
      </section>

      {/* ==========================================================================
          17 & 18 — SAFETY & TRUST
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Your safety matters.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is designed with privacy, responsible matching and safeguarding at its foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Privacy</div>
              <h3 className="text-base font-bold text-[#17212B]">Private by design</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Your conversation is designed to remain private within the Safespace experience. No video recordings or public disclosure.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Responsible Support</div>
              <h3 className="text-base font-bold text-[#17212B]">Appropriate human care</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Safespace is designed around supportive human listening rather than clinical diagnosis or unrequested medical advice.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Safeguarding</div>
              <h3 className="text-base font-bold text-[#17212B]">Protected escalation</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Where a situation requires additional safeguarding or emergency response, established escalation processes apply.
              </p>
            </div>

          </div>

          <div className="text-left pt-2">
            <button
              onClick={onOpenSafety}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] text-[#123B5D] text-xs font-semibold rounded-lg border border-[#E3E2DE] transition-colors cursor-pointer"
            >
              Learn about safety
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          19 — WHAT SAFESPACE IS NOT
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Safespace is a place to talk.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Clarity about what Safespace is — and what it is intentionally not.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {whatItIsNot.map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-[#E3E2DE] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C1D18]">
                  <XIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>NOT</span>
                </div>
                <h3 className="text-sm font-bold text-[#17212B]">{item.title}</h3>
                <p className="text-xs text-[#59636B] leading-relaxed">{item.desc}</p>
              </div>
            ))}
            <div className="p-5 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-1.5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>SAFESPACE IS</span>
              </div>
              <h3 className="text-sm font-bold text-[#17212B]">A quiet, dignified human listening space</h3>
              <p className="text-xs text-[#59636B] leading-relaxed">On-demand, private, audio-only human connection.</p>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          20 & 21 — HUMAN LISTENING & PROVIDER INVITATION
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Attentive Listener Image */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/listening-presence.jpg"
                  alt="A compassionate, attentive listener ready to make space for others"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right: Listening Skill & Provider Invitation */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Human Listening</div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
                  Listening is a skill.
                </h2>
                
                <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
                  Safespace brings together people who are willing to make room for another person's experience. Good listeners know how to be attentive without judgment or rushing in with advice.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E3E2DE] space-y-3">
                <h3 className="text-base font-bold text-[#17212B]">
                  Good listeners matter.
                </h3>
                <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                  Safespace is also creating a community of thoughtful people who know how to listen and want to make that ability useful.
                </p>
                <div className="pt-1">
                  <button
                    onClick={onBecomeProvider}
                    className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Become a Provider</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          22 — SAGE GATEWAY (EXTERNAL AI COMPANION)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-2xl border border-[#E3E2DE] p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Sage Logo */}
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

            {/* Sage Copy & External Link */}
            <div className="md:col-span-8 space-y-4 text-left">
              <h4 className="font-display font-normal text-2xl sm:text-3xl text-[#17212B]">
                Another kind of conversation.
              </h4>
              
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Sage is an AI-powered companion for human becoming. When you are ready for reflection, journal-like exploration and intentional growth, Sage offers a completely independent space.
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
                * Sage is an external companion and does not replace human peer listening on Safespace.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          23 — FINAL CTA
          ========================================================================== */}
      <section className="py-20 sm:py-28 bg-[#123B5D] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex justify-center">
            <SafespaceLogo
              size="xl"
              showWordmark={false}
              variant="white"
            />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
              Ready when you are.
            </h2>
            
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
              You don't need to have everything figured out before you talk.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartTalk}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FAF9F6] text-[#123B5D] font-bold text-sm sm:text-base rounded-lg transition-colors shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Find someone to talk to</span>
              <ArrowRight className="w-4 h-4 text-[#123B5D]" />
            </button>

            <button
              onClick={onTryIntro}
              className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base rounded-lg transition-colors border border-white/30 inline-flex items-center justify-center cursor-pointer"
            >
              Try the 3-minute introduction
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
