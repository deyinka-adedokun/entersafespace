import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  ShieldAlert, 
  HeartHandshake, 
  HelpCircle, 
  AlertTriangle, 
  Cookie, 
  Building, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Search, 
  ExternalLink,
  Users,
  Briefcase,
  PhoneCall,
  DollarSign,
  Heart,
  MessageCircle,
  Clock,
  BookOpen,
  Mail,
  Handshake,
  Palette,
  Compass
} from 'lucide-react';
import { ColourSystemViewer } from './ui/ColourSystemViewer';
import { DesignIntelligenceViewer } from './ui/DesignIntelligenceViewer';
import { SafespaceLogo } from './ui/SafespaceLogo';

export type PublicInfoTopic = 
  | 'PRIVACY_POLICY'
  | 'PRIVACY_BY_DESIGN'
  | 'TERMS_OF_SERVICE'
  | 'SAFEGUARDING'
  | 'COMMUNITY_STANDARDS'
  | 'REPORT_CONCERN'
  | 'COOKIE_POLICY'
  | 'SAFETY'
  | 'HOW_IT_WORKS'
  | 'PROVIDER_STANDARDS'
  | 'EARNINGS'
  | 'CODE_OF_CONDUCT'
  | 'ABOUT'
  | 'CONTACT'
  | 'CAREERS'
  | 'PARTNERSHIPS'
  | 'COLOUR_SYSTEM'
  | 'DESIGN_INTELLIGENCE';

interface PublicInfoModalProps {
  isOpen: boolean;
  initialTopic?: PublicInfoTopic;
  onClose: () => void;
  onOpenReportConcern?: () => void;
  onOpenEmergency?: () => void;
  onStartTalk?: () => void;
}

export const PublicInfoModal: React.FC<PublicInfoModalProps> = ({
  isOpen,
  initialTopic = 'PRIVACY_BY_DESIGN',
  onClose,
  onOpenReportConcern,
  onOpenEmergency,
  onStartTalk
}) => {
  const [activeTopic, setActiveTopic] = useState<PublicInfoTopic>(initialTopic);

  useEffect(() => {
    if (initialTopic) {
      setActiveTopic(initialTopic);
    }
  }, [initialTopic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl md:rounded-3xl shadow-xl border border-stone-200 my-auto overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#123B5D] text-white flex items-center justify-between border-b border-[#0D2A42]">
          <div className="flex items-center gap-3">
            <SafespaceLogo size="sm" variant="white" showWordmark={false} />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">Safespace Information Center</h2>
              <p className="text-xs text-white/80">Privacy, safety boundaries, and responsible human support guidelines</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Content with Sidebar Navigation */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-stone-50">
          
          {/* Topic Navigation Sidebar */}
          <div className="w-full md:w-64 bg-white border-r border-stone-200 p-3 space-y-1 overflow-y-auto text-xs shrink-0 max-h-48 md:max-h-none">
            
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">About & How it Works</div>
            
            <button
              onClick={() => setActiveTopic('HOW_IT_WORKS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'HOW_IT_WORKS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>How it Works & FAQs</span>
            </button>

            <button
              onClick={() => setActiveTopic('ABOUT')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'ABOUT'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>About Safespace</span>
            </button>

            <div className="px-3 py-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Privacy & Protection</div>
            
            <button
              onClick={() => setActiveTopic('PRIVACY_BY_DESIGN')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'PRIVACY_BY_DESIGN'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Privacy & Protection</span>
            </button>

            <button
              onClick={() => setActiveTopic('PRIVACY_POLICY')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'PRIVACY_POLICY'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => setActiveTopic('COOKIE_POLICY')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'COOKIE_POLICY'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Cookie className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Cookie Policy</span>
            </button>

            <div className="px-3 py-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Safety & Community</div>

            <button
              onClick={() => setActiveTopic('SAFETY')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'SAFETY'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Safety Guidelines</span>
            </button>

            <button
              onClick={() => setActiveTopic('SAFEGUARDING')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'SAFEGUARDING'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Emergency Contacts</span>
            </button>

            <button
              onClick={() => setActiveTopic('COMMUNITY_STANDARDS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'COMMUNITY_STANDARDS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Community Code of Conduct</span>
            </button>

            <button
              onClick={() => setActiveTopic('REPORT_CONCERN')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'REPORT_CONCERN'
                  ? 'bg-rose-100 text-rose-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Report a Concern</span>
            </button>

            <div className="px-3 py-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-stone-400">Listeners & Company</div>

            <button
              onClick={() => setActiveTopic('PROVIDER_STANDARDS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'PROVIDER_STANDARDS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>Listener Standards</span>
            </button>

            <button
              onClick={() => setActiveTopic('EARNINGS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'EARNINGS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Listener Earnings & Pay</span>
            </button>

            <button
              onClick={() => setActiveTopic('TERMS_OF_SERVICE')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'TERMS_OF_SERVICE'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Terms of Use</span>
            </button>

            <button
              onClick={() => setActiveTopic('CONTACT')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'CONTACT'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Contact Us</span>
            </button>

            <button
              onClick={() => setActiveTopic('CAREERS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'CAREERS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Careers</span>
            </button>

            <button
              onClick={() => setActiveTopic('PARTNERSHIPS')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'PARTNERSHIPS'
                  ? 'bg-emerald-100 text-emerald-950 font-bold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Handshake className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Partnerships</span>
            </button>

            <div className="px-3 py-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-amber-800">Design System</div>

            <button
              onClick={() => setActiveTopic('DESIGN_INTELLIGENCE')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'DESIGN_INTELLIGENCE'
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-200'
                  : 'text-amber-900/80 hover:bg-amber-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Design Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTopic('COLOUR_SYSTEM')}
              className={`w-full text-left px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTopic === 'COLOUR_SYSTEM'
                  ? 'bg-amber-100 text-amber-950 font-bold border border-amber-200'
                  : 'text-amber-900/80 hover:bg-amber-50'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Colour System</span>
            </button>

          </div>

          {/* Active Topic Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
            
            {/* HOW IT WORKS */}
            {(activeTopic === 'HOW_IT_WORKS' || activeTopic === 'CODE_OF_CONDUCT') && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <h3 className="font-serif font-bold text-emerald-950 text-base flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-700" />
                    How Safespace Works
                  </h3>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    Safespace connects you with empathetic, trained everyday listeners who offer a calm, non-judgmental ear whenever you need someone to talk to.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-stone-700">
                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Choose How You Want to Talk</h4>
                      <p className="mt-0.5 leading-relaxed text-stone-600">Select what topic you'd like to discuss (stress, relationship, workplace, general chat) and your preferred language.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Get Matched with a Listener</h4>
                      <p className="mt-0.5 leading-relaxed text-stone-600">Our system matches you with a verified, friendly peer listener who is online and ready to listen.</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Private Voice Call</h4>
                      <p className="mt-0.5 leading-relaxed text-stone-600">Speak freely over a secure voice call. Your real phone number and identity remain completely hidden.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <h4 className="font-bold text-stone-900 text-sm">Frequently Asked Questions</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-stone-200">
                      <p className="font-bold text-stone-900">Is my phone number private?</p>
                      <p className="text-stone-600 mt-1">Yes! Neither you nor the listener ever see each other's phone numbers or personal contact details.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-stone-200">
                      <p className="font-bold text-stone-900">Are conversations recorded?</p>
                      <p className="text-stone-600 mt-1">No. Safespace does not record audio calls. Your privacy is paramount.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-stone-200">
                      <p className="font-bold text-stone-900">Is this clinical therapy?</p>
                      <p className="text-stone-600 mt-1">No. Safespace provides empathetic peer listening and companionship, not medical or clinical therapy. If you need urgent crisis help, tap Emergency Contacts.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY BY DESIGN */}
            {activeTopic === 'PRIVACY_BY_DESIGN' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                    <Lock className="w-5 h-5 text-emerald-700" />
                    <h3>Your Privacy Protection Promise</h3>
                  </div>
                  <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                    Safespace is built to protect your identity and emotional privacy at all times.
                  </p>
                </div>

                <div className="space-y-4">
                  <section className="space-y-1.5">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      1. Simple, Minimal Account Info
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed pl-6">
                      We only ask for a simple display name and phone number or email so you can log in safely.
                    </p>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 text-stone-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      2. What We DO NOT Do
                    </h4>
                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1.5 pl-4">
                      <p className="font-bold text-emerald-900">🔒 Our Safety Safeguards:</p>
                      <p>• <strong>NO Audio Recording:</strong> We do NOT record or save your calls.</p>
                      <p>• <strong>NO Contact Sharing:</strong> Listeners never receive your real phone number or email address.</p>
                      <p>• <strong>NO Selling Your Data:</strong> Your personal information is never sold to advertisers.</p>
                    </div>
                  </section>

                  <section className="space-y-1.5">
                    <h4 className="font-bold text-stone-900 text-sm">3. Safe & Encrypted Calls</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      All call connections pass through secure, encrypted data channels.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {/* PRIVACY POLICY */}
            {activeTopic === 'PRIVACY_POLICY' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Privacy Policy</h3>
                <p className="text-xs text-stone-500">Updated August 2026</p>
                <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
                  <p>
                    Safespace is committed to protecting your privacy. We process personal details fairly and only keep what is necessary for connecting you with listeners and confirming your package purchases.
                  </p>
                  <h4 className="font-bold text-stone-900 text-sm pt-2">How We Handle Your Information</h4>
                  <p>
                    Information like payment status is securely handled via Paystack. Your name and phone number are kept private and never shared with listeners or external companies.
                  </p>
                  <h4 className="font-bold text-stone-900 text-sm pt-2">Contact Us About Privacy</h4>
                  <p>
                    If you have questions about your account data or wish to request data deletion, contact our support team at <code className="bg-stone-100 px-1.5 py-0.5 rounded text-emerald-900">support@safespace.ng</code>.
                  </p>
                </div>
              </div>
            )}

            {/* COOKIE POLICY */}
            {activeTopic === 'COOKIE_POLICY' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Cookie & Storage Information</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Safespace uses minimal functional storage on your device simply to keep you logged in and save your notification preferences. We do not use tracking cookies for advertising.
                </p>
              </div>
            )}

            {/* SAFETY */}
            {activeTopic === 'SAFETY' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Safety & Trust</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Your safety and emotional comfort are our highest priority. Every listener is verified before joining Safespace and agrees to strictly follow our gentle listening guidelines.
                </p>
                {onOpenEmergency && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenEmergency();
                    }}
                    className="mt-2 px-4 py-2.5 rounded-xl bg-emerald-900 text-white font-medium text-xs flex items-center gap-2 hover:bg-emerald-950"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-300" /> View Crisis Helplines & Emergency Numbers
                  </button>
                )}
              </div>
            )}

            {/* SAFEGUARDING */}
            {activeTopic === 'SAFEGUARDING' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Emergency & Crisis Helplines</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Safespace provides friendly peer listening. If you or someone you know is in immediate physical danger or needs medical attention, please reach out to these emergency services immediately:
                </p>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                  <p className="font-bold text-amber-900">Important Crisis Lines in Nigeria:</p>
                  <p>• National Emergency Line: <strong>112</strong></p>
                  <p>• MANI Mental Health Helpline: <strong>0809 111 6264</strong></p>
                  <p>• Lagos State Crisis Line: <strong>08000 333 333</strong></p>
                </div>
              </div>
            )}

            {/* COMMUNITY STANDARDS */}
            {activeTopic === 'COMMUNITY_STANDARDS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Community Guidelines</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  To keep Safespace peaceful and helpful for everyone, all users and listeners agree to:
                </p>
                <ul className="list-disc pl-5 text-xs text-stone-700 space-y-1.5">
                  <li>Treat each other with kindness, respect, and empathy.</li>
                  <li>Avoid foul, abusive, or harmful language.</li>
                  <li>Keep all call discussions confidential.</li>
                  <li>Never request or offer money or personal contact numbers.</li>
                </ul>
              </div>
            )}

            {/* REPORT CONCERN */}
            {activeTopic === 'REPORT_CONCERN' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-rose-950">Report a Concern</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  If you ever feel uncomfortable or experience disrespectful behavior during a conversation, please report it right away. Our team reviews all reports promptly.
                </p>
                {onOpenReportConcern && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReportConcern();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-700 text-white font-medium text-xs hover:bg-rose-800 flex items-center gap-2 shadow-xs"
                  >
                    <AlertTriangle className="w-4 h-4" /> Open Report Form
                  </button>
                )}
              </div>
            )}

            {/* TERMS OF SERVICE */}
            {activeTopic === 'TERMS_OF_SERVICE' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Terms of Use</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  By using Safespace, you agree that our platform offers friendly peer conversation and companion listening. Safespace is not a substitute for medical treatment or psychiatric care.
                </p>
              </div>
            )}

            {/* PROVIDER STANDARDS */}
            {activeTopic === 'PROVIDER_STANDARDS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Listener Standards</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Listeners on Safespace undergo identity checks and basic training in gentle, patient listening. They are here to offer care and conversation without judgment.
                </p>
              </div>
            )}

            {/* EARNINGS */}
            {activeTopic === 'EARNINGS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Listener Earnings & Payouts</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Listeners earn 40% of session package fees for every conversation they complete. Earnings accumulate in your listener wallet and can be requested directly to your Nigerian bank account once you reach ₦5,000.
                </p>
              </div>
            )}

            {/* ABOUT */}
            {activeTopic === 'ABOUT' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">About Safespace</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Safespace was created to give everyday people across Nigeria and Africa a warm, private place to express themselves, feel heard, and find emotional relief through human connection.
                </p>
              </div>
            )}

            {/* CONTACT */}
            {activeTopic === 'CONTACT' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Contact Us</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  We are here to help! If you need support with your account or have feedback for our team:
                </p>
                <div className="p-4 bg-white rounded-xl border border-stone-200 text-xs space-y-2">
                  <p>📧 Email: <strong className="text-stone-900">help@safespace.ng</strong></p>
                  <p>📍 Location: <span className="text-stone-700">Lagos, Nigeria</span></p>
                  <p>🕒 Response Time: <span className="text-stone-700">Within 24 hours</span></p>
                </div>
              </div>
            )}

            {/* CAREERS */}
            {activeTopic === 'CAREERS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Careers at Safespace</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Interested in joining our team or becoming an accredited peer listener? Switch to the "Become a Listener" tab to apply as a peer listener or send your resume to <strong className="text-stone-900">careers@safespace.ng</strong>.
                </p>
              </div>
            )}

            {/* PARTNERSHIPS */}
            {activeTopic === 'PARTNERSHIPS' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Community Partnerships</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Safespace collaborates with wellness organizations, universities, and mental health advocacy groups across Nigeria. To partner with us, email <strong className="text-stone-900">partnerships@safespace.ng</strong>.
                </p>
              </div>
            )}

            {/* DESIGN INTELLIGENCE */}
            {activeTopic === 'DESIGN_INTELLIGENCE' && (
              <DesignIntelligenceViewer />
            )}

            {/* COLOUR SYSTEM */}
            {activeTopic === 'COLOUR_SYSTEM' && (
              <ColourSystemViewer />
            )}

          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-stone-500 text-[11px]">
            Safespace • Confidential Human Emotional Support
          </div>
          <div className="flex items-center gap-2">
            {onStartTalk && (
              <button
                onClick={() => {
                  onClose();
                  onStartTalk();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-900 text-amber-50 font-bold hover:bg-emerald-950 flex items-center gap-1.5 shadow-xs"
              >
                Talk to Someone <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

