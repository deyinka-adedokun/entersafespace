import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  MicOff, 
  ExternalLink, 
  Check, 
  X as XIcon, 
  AlertCircle,
  PhoneCall,
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { SafespaceLogo } from '../ui/SafespaceLogo';

interface SafetyTrustViewProps {
  onStartTalk: () => void;
  onOpenHowItWorks: () => void;
  onOpenCrisisModal: () => void;
  onOpenReportModal: () => void;
  onBecomeProvider: () => void;
}

export const SafetyTrustView: React.FC<SafetyTrustViewProps> = ({
  onStartTalk,
  onOpenHowItWorks,
  onOpenCrisisModal,
  onOpenReportModal,
  onBecomeProvider
}) => {
  const fourDimensions = [
    {
      step: '01',
      title: 'Who you talk to',
      desc: "Providers participate subject to Safespace's verification, background screening, and eligibility requirements."
    },
    {
      step: '02',
      title: 'How you are connected',
      desc: 'Safespace uses service-led matching rather than asking you to browse and compare individuals in a public marketplace.'
    },
    {
      step: '03',
      title: 'How the conversation happens',
      desc: 'MVP conversations are strictly private and audio-only, removing the pressure to present yourself or manage video.'
    },
    {
      step: '04',
      title: "When something isn't right",
      desc: 'Safespace maintains structured safeguarding and escalation pathways whenever a situation requires additional support.'
    }
  ];

  const whatWeAre = [
    { title: 'Human emotional support', desc: 'Attentive, compassionate peer listening from verified people.' },
    { title: 'A private audio conversation', desc: 'Secure voice-only sessions with complete privacy.' },
    { title: 'Service-led matching', desc: 'Intentional connection based on your emotional request.' },
    { title: 'A space to be heard', desc: 'Room for what you carry without unsolicited advice or judgement.' }
  ];

  const whatWeAreNot = [
    { title: 'An emergency response service', desc: 'Not equipped for acute psychiatric or physical emergencies.' },
    { title: 'A clinical diagnostic platform', desc: 'Listeners do not provide psychiatric labelling or medical prescriptions.' },
    { title: 'A replacement for professional healthcare', desc: 'Individuals needing clinical therapy are directed to appropriate services.' },
    { title: 'A public Provider marketplace', desc: 'No public profile browsing, ratings shopping, or directory browsing.' }
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
                  src="/assets/safety-trust-hero.jpg"
                  alt="A calm, thoughtful person sitting peacefully near a sunlit window, feeling emotionally safe"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>

            {/* Left Column: Core Narrative */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 text-left">
              
              <div className="space-y-4">
                <h1 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl lg:text-[64px] text-[#17212B] leading-[1.08] tracking-tight">
                  Your safety matters.
                </h1>
                
                <p className="text-[#17212B] text-lg sm:text-xl font-medium leading-snug max-w-xl">
                  Safespace is designed to make human connection easier while taking privacy, responsibility and safeguarding seriously.
                </p>

                <p className="text-[#59636B] text-sm sm:text-base leading-relaxed max-w-xl">
                  We believe people should be able to talk without having to wonder whether the space around them has been thoughtfully designed.
                </p>
              </div>

              {/* Action CTAs */}
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
                    onClick={onOpenHowItWorks}
                    className="px-5 py-3.5 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] text-sm sm:text-base font-semibold rounded-lg transition-colors border border-[#E3E2DE] text-center cursor-pointer"
                  >
                    How Safespace works
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D]"></span>
                  <span className="text-xs sm:text-sm font-medium text-[#59636B]">
                    Care • Clarity • Responsibility
                  </span>
                </div>
              </div>

            </div>

            {/* Desktop Right Column: Authentic Photograph */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/safety-trust-hero.jpg"
                  alt="A calm, thoughtful person sitting peacefully near a sunlit window, feeling emotionally safe"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          07 — SAFETY IS MORE THAN A BUTTON (FOUR DIMENSIONS)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="max-w-2xl space-y-3 text-left">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Safety is part of the experience.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              From how people join Safespace to what happens during a conversation, safety considerations are built into the service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fourDimensions.map((dim, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-3 shadow-2xs flex flex-col justify-between text-left"
              >
                <div className="space-y-2.5">
                  <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2.5 py-1 rounded-md inline-block">
                    {dim.step}
                  </div>
                  <h3 className="text-base font-bold text-[#17212B]">
                    {dim.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                    {dim.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================================================
          08 & 09 — PROVIDER VERIFICATION & LISTENING ROLE
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              People matter. So does who we let listen.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is building a community of people who can create a respectful space for conversation. Providers are subject to appropriate verification and participation requirements before they can support Seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            <div className="p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-[#123B5D] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Verified human presence
              </h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Listeners undergo structured identity verification, orientation on active listening boundaries, and ongoing service standards reviews before taking calls.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#F3F1EC] border border-[#E3E2DE] text-[#123B5D] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Safespace is about listening.
              </h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Safespace Providers are there to listen and provide a respectful human presence. They are not presented as a replacement for emergency services or clinical healthcare.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          10 & 11 — PRIVACY, MINIMAL EXPOSURE & IDENTITY
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Your conversation deserves discretion.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is designed with privacy in mind, from the moment you enter the experience to the end of your conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-3">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Private Sessions</div>
              <h3 className="text-base font-bold text-[#17212B]">One-to-one dialogue</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Your Safespace session is designed as a private interaction between you and your matched Provider without public eavesdropping or recordings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-3">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Minimal Exposure</div>
              <h3 className="text-base font-bold text-[#17212B]">You control your story</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                The experience does not require you to disclose more personal information than is necessary to establish the connection.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-3">
              <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Responsible Data</div>
              <h3 className="text-base font-bold text-[#17212B]">Careful handling</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Personal and session metadata is handled according to Safespace's applicable data protection and security practices.
              </p>
            </div>

          </div>

          {/* Identity & Discretion Principle */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] text-left space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-[#17212B]">
              You control how much of yourself you share.
            </h3>
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed max-w-3xl">
              Safespace is designed to give people room to talk without requiring unnecessary personal disclosure. You can choose your display name and share only what feels right in the moment.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          12 — AUDIO-ONLY SAFETY
          ========================================================================== */}
      <section className="py-16 sm:py-20 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="w-12 h-12 rounded-full bg-[#EAF0F5] border border-[#C5D6E4] text-[#123B5D] flex items-center justify-center mx-auto">
            <MicOff className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B]">
              Sometimes privacy sounds like a voice.
            </h2>
            
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Safespace conversations begin with audio. There is no camera to manage, no need to be seen and no pressure to present yourself in a particular way.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#17212B]">
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">No camera management</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Voice-only intimacy</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Reduced social friction</span>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          13 & 14 — IN-SESSION SAFETY TOOLS
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="max-w-2xl text-left space-y-3">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">In-Session Support</div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Support is always within reach.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              If something happens during a conversation that makes you feel unsafe or uncomfortable, Safespace provides a way to access appropriate support without disrupting the entire experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <h3 className="text-sm font-bold text-[#17212B]">Clear & Visible Access</h3>
              <p className="text-xs text-[#59636B] leading-relaxed">
                The safety control is always accessible in your active session header, without loud warning graphics or distracting alarms.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <h3 className="text-sm font-bold text-[#17212B]">Immediate Session Exit</h3>
              <p className="text-xs text-[#59636B] leading-relaxed">
                You can pause or end a conversation at any moment if you ever feel uncomfortable or need to step away.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
              <h3 className="text-sm font-bold text-[#17212B]">Confidential Incident Review</h3>
              <p className="text-xs text-[#59636B] leading-relaxed">
                Dedicated safety reviewers follow up confidentially on reports to maintain trust and community safety.
              </p>
            </div>

          </div>

          <div className="text-left pt-2">
            <button
              onClick={onOpenReportModal}
              className="px-5 py-2.5 bg-white hover:bg-[#FAF9F6] text-[#123B5D] text-xs font-semibold rounded-lg border border-[#E3E2DE] transition-colors cursor-pointer"
            >
              Learn about incident reporting
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          15, 16, 17 & 18 — RESPONSIBLE ESCALATION, EMERGENCY BOUNDARIES & CRISIS RESOURCES
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Sometimes a conversation needs more support.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is designed around the understanding that human conversation has limits. Where a situation raises safeguarding concerns, established escalation processes guide what happens next.
            </p>
          </div>

          {/* Emergency Distinction Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] text-left space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C1D18] uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#8C1D18]" />
              <span>Important Distinction</span>
            </div>

            <h3 className="text-xl font-bold text-[#17212B]">
              Safespace is not an emergency service.
            </h3>

            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed max-w-3xl">
              If you or someone you know is in immediate physical danger, medical distress, or experiencing an acute psychiatric emergency, please contact national emergency services or accredited crisis helplines immediately.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenCrisisModal}
                className="px-5 py-2.5 bg-[#FAF9F6] hover:bg-[#F3F1EC] text-[#8C1D18] border border-[#F9C9C7] text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>View Emergency Crisis Helplines</span>
              </button>
            </div>
          </div>

          {/* Adults Only Boundary */}
          <div className="p-6 rounded-xl bg-white border border-[#E3E2DE] text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Eligibility</span>
              <h4 className="text-base font-bold text-[#17212B] mt-0.5">
                Safespace is currently available to adults aged 18 and over.
              </h4>
              <p className="text-xs text-[#59636B] mt-0.5">
                Our MVP listening framework is specifically designed for adult conversation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-md bg-[#F3F1EC] text-xs font-mono font-bold text-[#17212B] border border-[#E3E2DE] shrink-0">
              18+ ONLY
            </span>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          20 — WHAT SAFESPACE DOES AND DOES NOT DO
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Knowing what we are is part of being trustworthy.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Clarity about boundaries helps create a safer, more dependable space for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Safespace Is */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Check className="w-4 h-4 text-[#123B5D]" />
                <span>Safespace Is</span>
              </div>
              <div className="space-y-3">
                {whatWeAre.map((item, idx) => (
                  <div key={idx} className="pb-3 border-b border-[#E3E2DE] last:border-none last:pb-0 space-y-1">
                    <h4 className="text-sm font-bold text-[#17212B]">{item.title}</h4>
                    <p className="text-xs text-[#59636B] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safespace Is Not */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C1D18] uppercase tracking-wider">
                <XIcon className="w-4 h-4 text-[#8C1D18]" />
                <span>Safespace Is Not</span>
              </div>
              <div className="space-y-3">
                {whatWeAreNot.map((item, idx) => (
                  <div key={idx} className="pb-3 border-b border-[#E3E2DE] last:border-none last:pb-0 space-y-1">
                    <h4 className="text-sm font-bold text-[#17212B]">{item.title}</h4>
                    <p className="text-xs text-[#59636B] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          21 & 22 — THE HUMAN DIMENSION & PHOTOGRAPHY
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Documentary Image */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/safety-honesty-presence.jpg"
                  alt="A person in a calm sunlit room, reflecting in quiet peace and honest safety"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right: Emotional Statement */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">Human Dimension</div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
                  Safety makes space for honesty.
                </h2>
                
                <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
                  When people feel safe enough to speak without judgement, conversation can become easier. Having thoughtful boundaries around confidentiality, listeners, and expectations gives you the room to be real.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E3E2DE] flex items-center gap-3">
                <button
                  onClick={onStartTalk}
                  className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Talk with someone now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          23 — SAGE GATEWAY (EXTERNAL COMPANION)
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
                An AI-powered companion for human becoming.
              </h4>
              
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Sage is a separate digital space for journaling, intentional reflection, and thoughtful self-inquiry. Sage does not provide crisis intervention or replace human peer listening.
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
                * Sage is completely independent of Safespace human listener sessions.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          24 — FINAL TRUST STATEMENT
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
              Talk freely. Know the boundaries. Feel the care.
            </h2>
            
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
              Safespace is being built with human connection, privacy and responsible support at its centre.
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
              onClick={onOpenHowItWorks}
              className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base rounded-lg transition-colors border border-white/30 inline-flex items-center justify-center cursor-pointer"
            >
              How it works
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
