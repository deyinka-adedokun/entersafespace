import React, { useState } from 'react';
import { 
  ArrowRight, 
  MicOff, 
  Check, 
  X as XIcon, 
  ShieldCheck, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  Lock, 
  AlertCircle, 
  ExternalLink,
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { SafespaceLogo } from '../ui/SafespaceLogo';

interface ForProvidersViewProps {
  onBecomeProvider: () => void;
  onOpenHowItWorks: () => void;
  onOpenSafety: () => void;
}

export const ForProvidersView: React.FC<ForProvidersViewProps> = ({
  onBecomeProvider,
  onOpenHowItWorks,
  onOpenSafety
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const providerCharacteristics = [
    {
      title: 'Present',
      description: 'They can give another person their full, undivided attention without distraction.'
    },
    {
      title: 'Non-judgemental',
      description: 'They can listen without rushing to label, correct, or condemn the person sharing.'
    },
    {
      title: 'Emotionally responsible',
      description: 'They understand the vital importance of personal and relational boundaries.'
    },
    {
      title: 'Respectful',
      description: "They treat another person's lived experience and story with dignity."
    },
    {
      title: 'Reliable',
      description: 'When they mark themselves available, people can depend on their presence.'
    },
    {
      title: 'Calm',
      description: 'They remain grounded and composed when a conversation touches on emotional depth.'
    }
  ];

  const whatProvidersDo = [
    'Receives an appropriate matched conversation based on availability',
    'Joins a private, audio-only session with the Seeker',
    'Gives the Seeker genuine, uninterrupted human attention',
    'Listens without rushing to offer unsolicited advice or diagnoses',
    'Maintains professional and emotional boundaries throughout',
    'Adheres strictly to Safespace safety and safeguarding protocols',
    'Concludes the conversation with dignity and care'
  ];

  const whatProvidersDoNotDo = [
    'Do not diagnose mental health or psychiatric conditions',
    'Do not prescribe medications or medical interventions',
    'Do not provide formal clinical therapy or psychological treatment',
    'Do not offer medical, legal, or financial professional counsel',
    'Do not act as frontline emergency or crisis response workers'
  ];

  const dispatchSteps = [
    {
      step: '01',
      title: 'Make yourself available',
      description: 'Choose when you are ready and able to offer your time and presence on the platform.'
    },
    {
      step: '02',
      title: 'A matching request arrives',
      description: 'When an appropriate conversation request is created, Safespace alerts eligible available Providers.'
    },
    {
      step: '03',
      title: 'Respond',
      description: 'Accept the opportunity when you are prepared to give your undivided attention.'
    },
    {
      step: '04',
      title: 'Listen',
      description: 'Enter the private audio session and create a calm space for the person to be heard.'
    }
  ];

  const sessionPackages = [
    { name: 'Quick Talk', duration: '15 mins', gross: '₦1,000', note: 'Focused emotional check-in' },
    { name: 'Open Conversation', duration: '30 mins', gross: '₦3,000', note: 'Standard exploratory talk' },
    { name: 'Deep Conversation', duration: '60 mins', gross: '₦5,000', note: 'Extended unhurried listening' },
    { name: 'Stay With Me', duration: '90 mins', gross: '₦10,000', note: 'Deep presence & grounding space' }
  ];

  const disqualifiers = [
    'Give unsolicited advice or tell people how to live',
    'Diagnose psychological or medical symptoms',
    'Debate or challenge someone’s personal feelings and experiences',
    'Persuade people to adopt your personal beliefs, religion, or lifestyle',
    'Build a personal social media following or promote your own brand',
    'Sell external services, products, or coaching programs to Seekers',
    'Exploit or share confidential personal stories',
    'Pursue romantic, dating, or personal relationships with Seekers'
  ];

  const applicationSteps = [
    {
      step: '01',
      title: 'Apply',
      description: 'Tell us about your background, active listening perspective, and why you wish to support others.'
    },
    {
      step: '02',
      title: 'Verify',
      description: 'Complete our identity confirmation, age verification (18+), and foundational background review.'
    },
    {
      step: '03',
      title: 'Prepare',
      description: 'Review Safespace listening standards, emotional boundaries, and safeguarding protocols.'
    },
    {
      step: '04',
      title: 'Go Live',
      description: 'Set your availability status when you are in a quiet, private environment ready to listen.'
    },
    {
      step: '05',
      title: 'Listen',
      description: 'Receive dispatched session opportunities and offer your presence to someone who needs to talk.'
    }
  ];

  const faqs = [
    {
      q: 'Who can become a Safespace Provider?',
      a: 'Adults aged 18 and over who possess strong active listening skills, empathy, emotional maturity, and the discipline to maintain clear boundaries. All applicants undergo identity verification and participation screening before approval.'
    },
    {
      q: 'Do I need to be a licensed therapist or psychologist?',
      a: 'No. Safespace provides human emotional support and peer listening, not clinical psychotherapy or medical care. If you are a professional, you participate strictly within the listening and peer support framework without clinical representation.'
    },
    {
      q: 'Are sessions audio-only or do they involve video?',
      a: 'All MVP Safespace sessions are strictly audio-only. There is no camera, no video setup, and no visual performance required. This preserves privacy and helps both parties focus entirely on the voice.'
    },
    {
      q: 'How does matching work? Can I choose which Seeker I talk to?',
      a: 'Safespace uses service-led matching. Seekers do not browse a public directory of Providers, and Providers do not browse Seekers. When a conversation is requested, Safespace dispatches the session to eligible available Providers based on language and availability.'
    },
    {
      q: 'How do I become available for calls?',
      a: 'Once verified, you simply switch your status to Available in your Provider portal whenever you are in a quiet, private setting and ready to take a session. You choose when you offer your time.'
    },
    {
      q: 'How is Provider compensation calculated?',
      a: 'Providers receive a 40% base share of the applicable session value. Payment-processing fees are handled transparently according to Safespace’s financial model, with earnings deposited directly to your bank account.'
    },
    {
      q: 'What happens if a conversation becomes difficult or unsafe?',
      a: 'Safespace provides clear in-session safety controls and structured escalation pathways. Providers are trained to recognize when a situation exceeds ordinary conversation and how to access safeguarding support.'
    },
    {
      q: 'Is Safespace an emergency service?',
      a: 'No. Safespace is strictly not an emergency or crisis intervention service. If a Seeker is in acute danger or medical crisis, our safeguarding framework directs them immediately to emergency helplines.'
    },
    {
      q: 'How do I apply to become a Provider?',
      a: 'Click "Become a Provider" on this page to create your account and submit your initial application. Our onboarding team will guide you through verification and orientation.'
    }
  ];

  return (
    <div className="w-full flex flex-col space-y-0 text-left selection:bg-[#123B5D]/10 selection:text-[#123B5D]">
      
      {/* ==========================================================================
          04 & 05 — HERO & AUTHENTIC PHOTOGRAPHY
          ========================================================================== */}
      <section className="relative overflow-hidden pt-4 pb-12 sm:pb-20 md:pb-24 border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Mobile Hero Image (Narrative sequence) */}
            <div className="lg:hidden w-full">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE]">
                <img
                  src="/assets/provider-hero-presence.jpg"
                  alt="An attentive, thoughtful person listening peacefully in a calm, sunlit room"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Left Column: Core Hero Narrative */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 text-left">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F3F1EC] border border-[#E3E2DE] text-xs font-semibold text-[#123B5D]">
                  <span>For Listeners & Providers</span>
                </div>

                <h1 className="font-display font-normal text-4xl sm:text-5xl md:text-6xl lg:text-[62px] text-[#17212B] leading-[1.08] tracking-tight">
                  Some people are good at making space for others.
                </h1>
                
                <p className="text-[#17212B] text-lg sm:text-xl font-medium leading-snug max-w-xl">
                  Safespace connects thoughtful, responsible listeners with people who simply need someone to talk to.
                </p>

                <p className="text-[#59636B] text-sm sm:text-base leading-relaxed max-w-xl">
                  If you know how to listen without judgement, there may be a place for you here.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    onClick={onBecomeProvider}
                    className="px-7 py-3.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-sm sm:text-base font-semibold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Become a Provider</span>
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
                    Structured listening • Verified community • Audio-only
                  </span>
                </div>
              </div>

            </div>

            {/* Desktop Right Column: Authentic Documentary Photograph */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/provider-hero-presence.jpg"
                  alt="An attentive, thoughtful person listening peacefully in a calm, sunlit room"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          06 — THE CORE PROPOSITION
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
          
          <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
            The Philosophy of Listening
          </div>

          <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
            Listening is a skill. Presence is a gift.
          </h2>

          <p className="text-base sm:text-lg text-[#17212B] font-medium leading-relaxed">
            Safespace is building a community of people who are willing to give another person their attention when they need it.
          </p>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#F3F1EC] border border-[#E3E2DE] space-y-3">
            <p className="text-sm sm:text-base text-[#17212B] leading-relaxed">
              You don't need to have all the answers. Sometimes what someone needs most is a person who can listen, stay present and create room for them to speak.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          07 — WHO THIS IS FOR (EDITORIAL CHARACTERISTICS)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="max-w-2xl space-y-3 text-left">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Who makes a good Safespace Provider?
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              A good Provider isn't necessarily the person with the most advice. It's often the person who knows when to listen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerCharacteristics.map((item, idx) => (
              <div 
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E3E2DE] space-y-2.5 shadow-2xs text-left flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-2 h-2 rounded-full bg-[#123B5D]"></div>
                  <h3 className="text-lg font-bold text-[#17212B]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-[#E3E2DE] text-xs text-[#59636B] max-w-2xl">
            * These qualities reflect empathetic peer listening capabilities and do not confer or represent clinical psychotherapy qualifications.
          </div>

        </div>
      </section>

      {/* ==========================================================================
          08 — WHAT PROVIDERS ACTUALLY DO & BOUNDARIES
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              What does a Provider do?
            </h2>
            <p className="text-xl sm:text-2xl text-[#123B5D] font-serif italic">
              You listen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            
            {/* Responsibilities */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                <Check className="w-4 h-4 text-[#123B5D]" />
                <span>Your Active Role</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#17212B]">
                {whatProvidersDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D] mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clear Role Boundaries */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8C1D18] uppercase tracking-wider">
                <XIcon className="w-4 h-4 text-[#8C1D18]" />
                <span>Outside the Scope</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-[#59636B]">
                {whatProvidersDoNotDo.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C1D18] mt-1.5 shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          09 — AUDIO-ONLY MVP
          ========================================================================== */}
      <section className="py-16 sm:py-20 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="w-12 h-12 rounded-full bg-[#EAF0F5] border border-[#C5D6E4] text-[#123B5D] flex items-center justify-center mx-auto">
            <MicOff className="w-6 h-6" />
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B]">
              Just your voice.
            </h2>
            
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace conversations begin with audio. No camera. No performing for the screen. Just two people and the space to talk.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#17212B]">
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">No video equipment required</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Zero appearance anxiety</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-white border border-[#E3E2DE]">Protected personal privacy</span>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          10 & 27 — SERVICE-LED MATCHING (NO PUBLIC MARKETPLACE)
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              No Public Marketplace
            </div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              You don't have to market yourself.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace does not ask Seekers to browse a public directory of Providers. Conversations are matched through the service based on the needs of the moment and Provider availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <h4 className="text-sm font-bold text-[#17212B]">No Public Directory</h4>
              <p className="text-xs text-[#59636B] leading-relaxed">
                You will not be listed in a public catalogue or rated on a public score board.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <h4 className="text-sm font-bold text-[#17212B]">No Bidding or Pitching</h4>
              <p className="text-xs text-[#59636B] leading-relaxed">
                You never compete with other listeners or discount your time to win calls.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
              <h4 className="text-sm font-bold text-[#17212B]">Service-Led Dispatch</h4>
              <p className="text-xs text-[#59636B] leading-relaxed">
                The platform intelligently pairs incoming emotional requests with available listeners.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          11 & 12 — HOW PROVIDERS RECEIVE SESSIONS
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              How receiving sessions works
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              When you're available, Safespace can let you know when someone needs a listener.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dispatchSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-3 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2.5 py-1 rounded-md inline-block">
                    {step.step}
                  </div>
                  <h3 className="text-base font-bold text-[#17212B]">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-[#E3E2DE] text-xs text-[#59636B] max-w-2xl">
            * Session opportunities depend entirely on Seeker demand and active availability. Safespace does not promise guaranteed session volumes.
          </div>

        </div>
      </section>

      {/* ==========================================================================
          13, 14 & 15 — FLEXIBILITY, SESSIONS & 40% BASE SHARE
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Listen when you're available.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace is designed around availability. You decide when you are able to offer your time, subject to the participation and operational requirements of the service.
            </p>
          </div>

          {/* Transparent Session Packages */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#17212B]">Current Service Structure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sessionPackages.map((pkg, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-white border border-[#E3E2DE] space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-[#17212B]">{pkg.name}</span>
                    <span className="text-xs font-mono text-[#59636B]">{pkg.duration}</span>
                  </div>
                  <div className="text-lg font-bold text-[#123B5D]">{pkg.gross}</div>
                  <div className="text-[11px] text-[#59636B]">{pkg.note}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#59636B] italic">
              Plus a one-time 3-minute Free Introduction available to first-time Seekers.
            </p>
          </div>

          {/* Provider Share Model */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-4 shadow-2xs">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Transparent Financial Constitution
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#17212B]">
              Your time has value.
            </h3>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed max-w-3xl">
              Providers receive a <strong className="text-[#17212B]">40% base share</strong> of the applicable session value, with payment-processing fees handled according to Safespace's current financial model.
            </p>
            <div className="pt-2 text-xs text-[#59636B] border-t border-[#E3E2DE]">
              * Safespace does not make hypothetical monthly earnings claims. We prioritize intentional, respectful support over financial speculation.
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          16 — RESPONSIBILITY BEFORE REWARD & GROUNDED PRESENCE PHOTOGRAPHY
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Photograph */}
            <div className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#E3E2DE] shadow-xs">
                <img
                  src="/assets/provider-presence-grounded.jpg"
                  alt="A calm, grounded person sitting thoughtfully in a warm, dignified space"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Right Column: Statement of Responsibility */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
                  Ethical Foundation
                </div>
                <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
                  Safespace is a responsibility before it is an opportunity.
                </h2>
                
                <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
                  When someone enters a conversation with you, they are trusting you with something personal. That trust matters. It demands your respect, discretion, and undivided emotional focus.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E3E2DE] text-xs text-[#17212B]">
                "The person who arrives is giving you their vulnerability. We honor that space by arriving fully prepared to listen."
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          17 & 18 — SAFEGUARDING & DIFFICULT CONVERSATIONS
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Listening comes with boundaries.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Safespace provides Providers with clear expectations around responsible listening, boundaries and safeguarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#F3F1EC] text-[#123B5D] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">Protected Boundaries</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                Providers are never expected to handle acute emergencies, clinical crises, or inappropriate behavior. Established safety pathways exist to support you at all times.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#F3F1EC] text-[#123B5D] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">You won't always know what to say</h3>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
                That's okay. Safespace is not asking Providers to have every answer. It is asking them to listen responsibly and recognise when a situation requires something beyond an ordinary conversation.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================================================================
          19 & 20 — WHO SHOULD NOT BECOME A PROVIDER & ROLE BOUNDARIES
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Safespace may not be for you if...
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              We care deeply about creating a safe emotional space. If your primary intention aligns with any of the following, this platform is not the right fit:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {disqualifiers.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-[#E3E2DE] flex items-start gap-3">
                <XIcon className="w-4 h-4 text-[#8C1D18] mt-0.5 shrink-0" />
                <span className="text-xs sm:text-sm text-[#17212B] font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#E3E2DE] space-y-2">
            <h3 className="text-base font-bold text-[#17212B]">
              Your role has boundaries. So does ours.
            </h3>
            <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed">
              Safespace does not ask Providers to become therapists, doctors, emergency responders, or saviours. It asks them to be <strong>present, respectful, and responsible listeners</strong>.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          21 & 22 — APPLICATION JOURNEY & ELIGIBILITY
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-bold text-[#123B5D] uppercase tracking-wider">
              Onboarding Process
            </div>
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              From application to your first conversation.
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              A clear, thoughtful verification journey designed to uphold trust for both Seekers and Providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {applicationSteps.map((step, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white border border-[#E3E2DE] space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="font-mono text-xs font-bold text-[#123B5D] bg-[#F3F1EC] border border-[#E3E2DE] px-2 py-0.5 rounded inline-block">
                    {step.step}
                  </div>
                  <h4 className="text-sm font-bold text-[#17212B]">{step.title}</h4>
                  <p className="text-xs text-[#59636B] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#F3F1EC] border border-[#E3E2DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-[#17212B]">Eligibility Requirements</h4>
              <p className="text-xs sm:text-sm text-[#59636B] mt-0.5">
                Adults aged 18+ with government ID verification, background screening, and active listening orientation.
              </p>
            </div>
            <button
              onClick={onBecomeProvider}
              className="px-6 py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Start Application
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          26 — PROVIDER FAQ
          ========================================================================== */}
      <section className="py-16 sm:py-24 bg-[#F3F1EC] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="max-w-2xl space-y-3">
            <h2 className="font-display font-normal text-3xl sm:text-4xl md:text-5xl text-[#17212B] leading-tight">
              Frequently asked questions
            </h2>
            <p className="text-sm sm:text-base text-[#59636B] leading-relaxed">
              Common questions about becoming and participating as a Safespace Provider.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl bg-white border border-[#E3E2DE] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#17212B] hover:text-[#123B5D] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#123B5D]' : 'text-[#59636B]'}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#59636B] leading-relaxed border-t border-[#E3E2DE]/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==========================================================================
          28 — SAGE BOUNDARY
          ========================================================================== */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-[#E3E2DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3E2DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1 text-left">
              <span className="text-xs font-mono font-bold tracking-widest text-[#59636B] uppercase">Independent Space</span>
              <h4 className="text-lg font-bold text-[#17212B]">Sage — Reflection & Journaling</h4>
              <p className="text-xs sm:text-sm text-[#59636B] leading-relaxed max-w-xl">
                Sage is a separate self-inquiry companion completely independent of Safespace human listener sessions.
              </p>
            </div>

            <a
              href="https://becomingwithsage.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#F3F1EC] hover:bg-[#EAE7E0] text-[#17212B] text-xs font-semibold rounded-lg border border-[#E3E2DE] transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Meet Sage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ==========================================================================
          29 — FINAL TRUST STATEMENT / INVITATION
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
              Ready to make some space?
            </h2>
            
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
              If you know how to listen and want to offer your presence, we invite you to begin the application process.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onBecomeProvider}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#FAF9F6] text-[#123B5D] font-bold text-sm sm:text-base rounded-lg transition-colors shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Become a Provider</span>
              <ArrowRight className="w-4 h-4 text-[#123B5D]" />
            </button>

            <button
              onClick={onOpenHowItWorks}
              className="w-full sm:w-auto px-6 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base rounded-lg transition-colors border border-white/30 inline-flex items-center justify-center cursor-pointer"
            >
              How Safespace works
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
