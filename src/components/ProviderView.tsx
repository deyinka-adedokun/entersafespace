import React, { useEffect, useState } from 'react';
import { ProviderProfile, ProviderEarning, ProviderPayout, MaxSessionDuration } from '../types';
import { 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Award, 
  Edit3, 
  Lock, 
  X, 
  PhoneCall, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  PhoneOff, 
  Shield, 
  Star,
  Sparkles,
  User,
  HeartHandshake
} from 'lucide-react';
import { SafetyReportModal } from './SafetyReportModal';

interface IncomingRequest {
  id: string;
  anonymousSeekerTag: string;
  supportReason: string;
  packageId: string;
  packageName: string;
  durationMinutes: number;
  grossPriceNGN: number;
  providerShareNGN: number;
  languagePreference?: string;
  genderPreference?: string;
  createdAt: string;
}

export const ProviderView: React.FC = () => {
  const [data, setData] = useState<{
    provider: ProviderProfile;
    earnings: ProviderEarning[];
    totalEarnedNGN: number;
    availableBalanceNGN: number;
    pendingBalanceNGN: number;
    payouts: ProviderPayout[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [availability, setAvailability] = useState<string>('AVAILABLE');
  const [maxDuration, setMaxDuration] = useState<number>(60);

  // Profile Edit / Onboarding Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editGender, setEditGender] = useState<'female' | 'male' | 'non-binary' | 'prefer-not-to-say'>('female');
  const [editLanguages, setEditLanguages] = useState<string[]>([]);
  const [editListeningAreas, setEditListeningAreas] = useState<string[]>([]);
  const [editPreferredSessionTypes, setEditPreferredSessionTypes] = useState<string[]>([]);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Incoming Session Request State
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [activeCallRequest, setActiveCallRequest] = useState<IncomingRequest | null>(null);

  // Active Provider Call Shell State
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isSafetyReportOpen, setIsSafetyReportOpen] = useState<boolean>(false);
  const [sessionCompletedSummary, setSessionCompletedSummary] = useState<{
    durationMins: number;
    earningNGN: number;
  } | null>(null);

  const fetchProviderData = async () => {
    try {
      const res = await fetch('/api/v1/providers/me');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        const p = json.data.provider;
        setAvailability(p.availabilityStatus);
        setMaxDuration(p.maxSessionMinutes);

        // Pre-fill profile state
        setEditDisplayName(p.displayName || '');
        setEditBio(p.bio || '');
        setEditGender(p.gender || 'female');
        setEditLanguages(p.languages || []);
        setEditListeningAreas(p.listeningAreas || []);
        setEditPreferredSessionTypes(p.preferredSessionTypes || ['Voice Call']);
      }
    } catch (err) {
      console.error('Failed to load provider profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const res = await fetch('/api/v1/providers/incoming-requests');
      const json = await res.json();
      if (json.success && json.data?.requests) {
        setIncomingRequests(json.data.requests);
      }
    } catch (err) {
      console.error('Failed to poll incoming requests', err);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  // Poll incoming requests when availability is AVAILABLE
  useEffect(() => {
    if (availability !== 'AVAILABLE') {
      setIncomingRequests([]);
      return;
    }
    fetchIncomingRequests();
    const interval = setInterval(fetchIncomingRequests, 6000);
    return () => clearInterval(interval);
  }, [availability]);

  // Provider call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  const handleUpdateAvailability = async (newStatus: string) => {
    setAvailability(newStatus);
    try {
      await fetch('/api/v1/providers/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchProviderData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMaxDuration = async (minutes: number) => {
    setMaxDuration(minutes);
    try {
      await fetch('/api/v1/providers/max-duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxMinutes: minutes })
      });
      fetchProviderData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/v1/providers/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editDisplayName,
          bio: editBio,
          gender: editGender,
          languages: editLanguages,
          listeningAreas: editListeningAreas,
          preferredSessionTypes: editPreferredSessionTypes,
          maxSessionMinutes: maxDuration
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsEditProfileOpen(false);
        fetchProviderData();
      }
    } catch (err) {
      alert('Failed to update profile settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Accept incoming session request
  const handleAcceptRequest = (req: IncomingRequest) => {
    setActiveCallRequest(req);
    setIncomingRequests([]);
    setIsCallActive(true);
    setCallSeconds(0);
  };

  // Decline incoming session request
  const handleDeclineRequest = (reqId: string) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== reqId));
  };

  // End active call from provider shell
  const handleEndCall = () => {
    if (!confirm('Are you sure you want to end this conversation?')) return;
    const durationMins = Math.max(1, Math.ceil(callSeconds / 60));
    const earningNGN = activeCallRequest?.providerShareNGN || 1200;

    setIsCallActive(false);
    setSessionCompletedSummary({
      durationMins,
      earningNGN
    });
    setActiveCallRequest(null);
    setCallSeconds(0);
    fetchProviderData();
  };

  if (loading || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-stone-500 font-sans">
        <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-stone-600">Loading Listener Dashboard & Ledger...</p>
      </div>
    );
  }

  const { provider, earnings, totalEarnedNGN, availableBalanceNGN, pendingBalanceNGN, payouts } = data;

  const availableLanguages = ['English', 'Nigerian Pidgin', 'Yoruba', 'Igbo', 'Hausa', 'French'];
  const availableAreas = [
    'I just need someone to listen',
    'I am feeling lonely',
    'I am overwhelmed',
    'Relationship/family',
    'Work or school',
    'Grief/loss',
    'Something happened',
    'Life decisions'
  ];
  const availableSessionTypes = ['Voice Call', 'Quick Talk (15m)', 'Open Conversation (30m)', 'Deep Listening (60m)', 'Stay With Me (90m)'];

  // Progression calculation: Level 1 (0-25), Level 2 (26-100), Level 3 (101+)
  const progressionTitle = provider.sessionsCompleted >= 100 
    ? 'Senior Listener (Level 3)' 
    : provider.sessionsCompleted >= 25 
      ? 'Experienced Listener (Level 2)' 
      : 'Peer Listener (Level 1)';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Active Provider Call Shell Mode */}
      {isCallActive && activeCallRequest && (
        <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header & Privacy Protection Banner */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Listening Session</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Discrete Timer */}
              <div className="text-xs font-mono bg-stone-800 text-stone-300 px-3 py-1 rounded-full border border-stone-700">
                {Math.floor(callSeconds / 60).toString().padStart(2, '0')}:{(callSeconds % 60).toString().padStart(2, '0')}
              </div>

              <button
                onClick={() => setIsSafetyReportOpen(true)}
                className="text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Safeguarding Escalation</span>
              </button>
            </div>
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700 text-xs text-stone-300 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>
              <strong className="text-white">Privacy Protected:</strong> Support Seeker phone number and email address are completely masked. You are paired via Safespace encrypted audio channel.
            </p>
          </div>

          {/* Seeker Information & Call Centerpiece */}
          <div className="text-center space-y-4 py-4">
            <div className="w-24 h-24 rounded-full bg-emerald-950 border-2 border-emerald-500/40 text-emerald-300 flex items-center justify-center mx-auto text-3xl font-serif font-bold shadow-lg">
              {activeCallRequest.anonymousSeekerTag[0] || 'S'}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {activeCallRequest.anonymousSeekerTag}
              </h2>
              <p className="text-xs font-medium text-emerald-400 mt-1">
                Topic: "{activeCallRequest.supportReason}"
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {activeCallRequest.packageName} • Provider Share (40%): ₦{activeCallRequest.providerShareNGN.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isMuted ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-[10px] font-bold mt-1">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={handleEndCall}
              className="w-18 h-18 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-8 h-8" />
              <span className="text-[10px] font-bold mt-1">End Call</span>
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                !isSpeakerOn ? 'bg-stone-800 text-stone-400' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              <span className="text-[10px] font-bold mt-1">{isSpeakerOn ? 'Speaker' : 'Off'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Live Incoming Session Requests Widget */}
      {!isCallActive && availability === 'AVAILABLE' && incomingRequests.length > 0 && (
        <div className="bg-emerald-900 text-white rounded-2xl p-5 border border-emerald-800 shadow-xl space-y-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-300 animate-bounce" />
              <h3 className="font-serif text-base font-bold text-emerald-100">Incoming Support Request</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-800 px-2 py-0.5 rounded-full text-emerald-200">
              Matches Your Capacity
            </span>
          </div>

          {incomingRequests.map(req => (
            <div key={req.id} className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-200">{req.anonymousSeekerTag}</span>
                  <span className="text-[11px] text-stone-400">({req.packageName})</span>
                </div>
                <p className="text-xs italic text-stone-300">"{req.supportReason}"</p>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-3">
                  <span>Your 40% Share: <strong>₦{req.providerShareNGN.toLocaleString()}</strong></span>
                  {req.languagePreference && <span>Language: {req.languagePreference}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleAcceptRequest(req)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95"
                >
                  Accept Session
                </button>
                <button
                  onClick={() => handleDeclineRequest(req.id)}
                  className="px-3 py-2 bg-emerald-900 hover:bg-emerald-800 text-stone-300 text-xs font-semibold rounded-lg"
                >
                  Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Header & Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={provider.avatarUrl}
              alt={provider.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100 shadow-xs shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-stone-900">{provider.displayName}</h1>
                
                {/* Verification Status Badge (Backend Controlled Only) */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  provider.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  {provider.verificationStatus === 'VERIFIED' ? 'Verified Listener' : provider.verificationStatus}
                </span>

                {/* Progression Level Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
                  <Award className="w-3.5 h-3.5 text-emerald-800" />
                  {progressionTitle}
                </span>
              </div>

              <p className="text-xs text-stone-500">
                Completed Sessions: <strong>{provider.sessionsCompleted}</strong> | Satisfaction: <strong>{provider.qualityScore}%</strong> | Rating: <strong>{provider.rating} ★</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
              <span>Edit Profile</span>
            </button>

            {/* Availability Switch */}
            <div className="bg-stone-50 p-1.5 rounded-xl border border-stone-200 flex items-center gap-1">
              {['AVAILABLE', 'AWAY', 'OFFLINE'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateAvailability(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    availability === status
                      ? status === 'AVAILABLE' 
                        ? 'bg-emerald-800 text-white shadow-2xs' 
                        : 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Non-Clinical Disclaimer & Verification Trust Safeguard */}
        <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#123B5D] shrink-0" />
            <span><strong>Peer Support Listener — Non-Clinical:</strong> Peer support presence without medical/clinical diagnostic claims.</span>
          </div>
          <div className="text-[10px] text-stone-400 italic">
            Verification status is managed strictly by Safespace Safeguarding Admin.
          </div>
        </div>

        {/* Probationary Monitoring Status Banner */}
        {provider.verificationStatus === 'PROBATION' && (
          <div className="p-4 rounded-xl bg-[#FFF8E6] border border-[#F5E0A3] flex items-start gap-3 text-xs text-[#8A5800]">
            <Clock className="w-4 h-4 text-[#C27803] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block text-[#6B4400]">Probationary Monitoring Period</span>
              <span>
                Your provider profile is active under introductory monitoring. Sessions are randomly reviewed for safeguarding and platform quality compliance.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Verification & Training Status Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-800" />
              <h3 className="font-serif text-base font-bold text-stone-900">Verification Status</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              Backend Controlled
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950 font-medium">
              <span>National ID / Passport Verification</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950 font-medium">
              <span>Background Safeguarding Screen</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-950 font-medium">
              <span>Code of Ethics & Non-Clinical Agreement</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Training Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-800" />
              <h3 className="font-serif text-base font-bold text-stone-900">Listener Training Status</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              100% Certified
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {provider.trainingModules?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg text-stone-700">
                <span className="truncate pr-2">{m.title}</span>
                <span className="font-bold text-emerald-800 text-[11px] shrink-0">Passed ({m.score}%)</span>
              </div>
            )) || (
              <p className="text-stone-400 italic">Training modules completed.</p>
            )}
          </div>
        </div>

      </div>

      {/* Matching Constraint: Maximum Consecutive Listening Duration */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900">
              Maximum Consecutive Listening Capacity
            </h3>
            <p className="text-xs text-stone-500">
              Matching Engine enforces this as a hard constraint. You will not be matched to sessions exceeding this duration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 pt-1">
          {[15, 30, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => handleUpdateMaxDuration(mins)}
              className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                maxDuration === mins
                  ? 'bg-emerald-50 border-emerald-700 text-emerald-950 ring-1 ring-emerald-700'
                  : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
              }`}
            >
              {mins} mins
            </button>
          ))}
        </div>
      </div>

      {/* Provider Earnings Overview (40% Server Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-stone-400">Total Earnings (40% Share)</div>
          <div className="font-serif text-2xl font-bold text-emerald-950">₦{totalEarnedNGN.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400">Calculated on completed paid sessions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-stone-400">Available Balance</div>
          <div className="font-serif text-2xl font-bold text-stone-900">₦{availableBalanceNGN.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-800 font-semibold">Weekly payout ready (Saturday 6pm)</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-stone-400">Pending Fraud/Dispute Window</div>
          <div className="font-serif text-2xl font-bold text-amber-700">₦{pendingBalanceNGN.toLocaleString()}</div>
          <div className="text-[10px] text-stone-400">Clears to available after 24h</div>
        </div>

      </div>

      {/* Session Earnings Ledger Table */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">Session Earnings Ledger</h3>
            <p className="text-xs text-stone-500">Fixed 40% Revenue Share per completed paid session</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
            40% Provider Share
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3">Session Package</th>
                <th className="py-2.5 px-3">Gross Value</th>
                <th className="py-2.5 px-3">Your Share (40%)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {earnings.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50">
                  <td className="py-3 px-3 font-semibold text-stone-900">{e.packageName}</td>
                  <td className="py-3 px-3">₦{e.grossSessionValueNGN.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-emerald-900">₦{e.providerAmountNGN.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Payout Schedule & Bank Account Information */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif text-base font-bold text-stone-900">Weekly Payout Schedule</h3>
          </div>
          <span className="text-xs font-semibold text-stone-500">Bank: Guaranty Trust Bank •••• 8910</span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          <strong>Automatic Transfer:</strong> Accumulated available earnings are disbursed weekly every Saturday evening directly to your registered bank account.
        </p>

        {payouts.length > 0 && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2 px-2">Payout ID</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">Scheduled</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-2 font-mono text-[11px]">{p.id}</td>
                    <td className="py-2.5 px-2 font-bold text-stone-900">₦{p.amountNGN.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-stone-500">{new Date(p.scheduledFor).toLocaleDateString()}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile & Declarations Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">Listener Profile & Declarations</h3>
                <p className="text-xs text-stone-500">Configure your listening capacity, languages & preferences</p>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Bio / Introduction</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              {/* Gender Declaration */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['female', 'male', 'non-binary', 'prefer-not-to-say'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setEditGender(g)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center capitalize transition-all ${
                        editGender === g ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      {g.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map(lang => {
                    const selected = editLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        onClick={() => {
                          if (selected) setEditLanguages(editLanguages.filter(l => l !== lang));
                          else setEditLanguages([...editLanguages, lang]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected ? 'bg-emerald-800 text-white font-semibold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Listening Areas */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Listening Areas / Expertise</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAreas.map(area => {
                    const selected = editListeningAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => {
                          if (selected) setEditListeningAreas(editListeningAreas.filter(a => a !== area));
                          else setEditListeningAreas([...editListeningAreas, area]);
                        }}
                        className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                          selected ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-semibold' : 'bg-stone-50 border-stone-200 text-stone-700'
                        }`}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Session Types */}
              <div>
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-1">Preferred Session Types</label>
                <div className="flex flex-wrap gap-2">
                  {availableSessionTypes.map(st => {
                    const selected = editPreferredSessionTypes.includes(st);
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          if (selected) setEditPreferredSessionTypes(editPreferredSessionTypes.filter(s => s !== st));
                          else setEditPreferredSessionTypes([...editPreferredSessionTypes, st]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selected ? 'bg-emerald-800 text-white font-semibold' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>Verification Protection:</strong> Verification status is controlled by Safespace Safeguarding Admin and cannot be self-edited.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Session Completed Summary Modal */}
      {sessionCompletedSummary && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-stone-900">Conversation Complete</h3>
              <p className="text-xs text-stone-500">Thank you for offering your empathetic listening ear.</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Duration logged:</span>
                <strong className="text-stone-900">{sessionCompletedSummary.durationMins} minutes</strong>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Your 40% Share added:</span>
                <strong className="text-emerald-900 font-bold">₦{sessionCompletedSummary.earningNGN.toLocaleString()}</strong>
              </div>
            </div>

            <button
              onClick={() => setSessionCompletedSummary(null)}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Back to Listener Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Safety Report Escalation Modal */}
      <SafetyReportModal
        isOpen={isSafetyReportOpen}
        onClose={() => setIsSafetyReportOpen(false)}
      />

    </div>
  );
};

export default ProviderView;
