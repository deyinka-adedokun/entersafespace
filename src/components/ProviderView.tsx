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
import { Avatar } from './ui/Avatar';
import { useSessionAudio } from '../lib/useSessionAudio';
import type { Session } from '../types';

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
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

  // Incoming Session Request State
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);

  // Live conversation: the session the seeker started with this listener.
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [joinedCall, setJoinedCall] = useState<boolean>(false);
  const [endingCall, setEndingCall] = useState<boolean>(false);
  const [lastMatchedRequest, setLastMatchedRequest] = useState<IncomingRequest | null>(null);
  const audio = useSessionAudio(activeSession?.id ?? null, joinedCall && !!activeSession);
  const isCallActive = joinedCall && !!activeSession;
  const isMuted = audio.muted;
  const setIsMuted = (next: boolean) => { void audio.setMuted(next); };
  const isSpeakerOn = audio.speakerOn;
  const setIsSpeakerOn = (next: boolean) => audio.setSpeakerOn(next);
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
        if (json.data.requests.length > 0) setLastMatchedRequest(json.data.requests[0]);
      }
    } catch (err) {
      console.error('Failed to poll incoming requests', err);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  // Poll for requests matched to this listener and for a conversation the
  // seeker has started. (Once matched, the listener is BUSY, so this can't
  // depend on being AVAILABLE.)
  // The poller is set up once, so it reads the latest values through refs.
  const activeSessionRef = React.useRef<Session | null>(null);
  activeSessionRef.current = activeSession;
  const joinedCallRef = React.useRef(false);
  joinedCallRef.current = joinedCall;
  const lastMatchedRef = React.useRef<IncomingRequest | null>(null);
  lastMatchedRef.current = lastMatchedRequest;
  const pollLiveState = async () => {
    fetchIncomingRequests();
    try {
      const res = await fetch('/api/v1/providers/active-session');
      const json = await res.json();
      if (!json.success) return;
      const next: Session | null = json.data?.session || null;
      const previous = activeSessionRef.current;
      if (next) {
        setActiveSession(next);
        setRemainingSeconds(json.data.remainingSeconds ?? 0);
      } else if (previous) {
        // The conversation ended (time ran out, or the seeker ended it).
        finishCall(previous);
      }
    } catch (err) {
      console.error('Failed to poll active session', err);
    }
  };

  useEffect(() => {
    pollLiveState();
    const interval = setInterval(pollLiveState, 4000);
    return () => clearInterval(interval);
  }, []);

  // Smooth one-second countdown between polls; the server stays authoritative.
  useEffect(() => {
    if (!isCallActive) return;
    const timer = setInterval(() => setRemainingSeconds(prev => Math.max(0, prev - 1)), 1000);
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

  const handleAvatarSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage('Photos must be 2 MB or smaller.');
      return;
    }
    setUploadingAvatar(true);
    setAvatarMessage(null);
    try {
      const body = new FormData();
      body.append('avatar', file);
      const res = await fetch('/api/v1/providers/avatar', { method: 'POST', body });
      const json = await res.json();
      if (json.success) {
        setAvatarMessage('Photo updated.');
        fetchProviderData();
      } else {
        setAvatarMessage(json.error?.message || 'The photo could not be uploaded.');
      }
    } catch (err) {
      setAvatarMessage('Network error uploading your photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
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

  // Leave the call and show a summary, whoever ended the conversation.
  const finishCall = (ended: Session) => {
    const wasJoined = joinedCallRef.current;
    const matched = lastMatchedRef.current;
    setActiveSession(null);
    setJoinedCall(false);
    setRemainingSeconds(0);
    if (wasJoined || ended.consumedSeconds > 0) {
      setSessionCompletedSummary({
        durationMins: Math.max(1, Math.ceil((ended.consumedSeconds || 0) / 60)),
        earningNGN: ended.isFreeTrial ? 0 : (matched?.packageId === ended.packageId ? matched.providerShareNGN : 0)
      });
    }
    fetchProviderData();
  };

  const handleEndCall = async () => {
    if (!activeSession) return;
    if (!confirm('Are you sure you want to end this conversation?')) return;
    setEndingCall(true);
    try {
      const res = await fetch(`/api/v1/sessions/${activeSession.id}/end`, { method: 'POST' });
      const json = await res.json();
      finishCall(json.data?.session || activeSession);
    } catch (err) {
      alert('Could not end the conversation. Please try again.');
    } finally {
      setEndingCall(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#59636B] font-sans">
        <div className="w-8 h-8 border-2 border-[#123B5D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-[#59636B]">Loading Listener Dashboard & Ledger...</p>
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
      {/* The seeker has started: the listener joins with a tap (browsers need one to allow audio). */}
      {activeSession && !joinedCall && (
        <div className="bg-[#0D2A42] text-white rounded-2xl p-5 border border-[#123B5D] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold">{activeSession.seekerDisplayName || 'Your seeker'} has started the conversation</h3>
            <p className="text-xs text-white/75">{activeSession.packageName} · Join now so they aren't left waiting.</p>
          </div>
          <button
            onClick={() => setJoinedCall(true)}
            className="px-5 py-2.5 bg-white hover:bg-[#F3F1EC] text-[#123B5D] font-bold text-xs rounded-lg shadow-md cursor-pointer"
          >
            Join conversation
          </button>
        </div>
      )}

      {isCallActive && activeSession && (
        <div className="bg-[#17212B] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header & Privacy Protection Banner */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <span className="text-xs font-bold text-[#C5D6E4] uppercase tracking-wider">Active Listening Session</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Discrete Timer */}
              <div className="text-xs font-mono bg-white/10 text-white/75 px-3 py-1 rounded-full border border-white/15">
                {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')} left
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
          <div className="p-3 bg-white/10 rounded-xl border border-white/15 text-xs text-white/75 flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#C5D6E4] shrink-0" />
            <p>
              <strong className="text-white">Privacy Protected:</strong> Support Seeker phone number and email address are completely masked. You are paired via Safespace encrypted audio channel.
            </p>
          </div>

          {/* Seeker Information & Call Centerpiece */}
          <div className="text-center space-y-4 py-4">
            <div className="w-24 h-24 rounded-full bg-[#0D2A42] border-2 border-white/20 text-[#C5D6E4] flex items-center justify-center mx-auto text-3xl font-serif font-bold shadow-lg">
              {(activeSession.seekerDisplayName || 'S')[0].toUpperCase()}
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                {activeSession.seekerDisplayName || 'Seeker'}
              </h2>
              {lastMatchedRequest?.supportReason && (
                <p className="text-xs font-medium text-[#C5D6E4] mt-1">
                  Topic: "{lastMatchedRequest.supportReason}"
                </p>
              )}
              <p className="text-[11px] text-white/60 mt-0.5">
                {activeSession.packageName}
              </p>
              <p className="text-xs text-white/80 mt-2" role="status">
                {audio.status === 'CONNECTED' && 'Connected. You can hear each other.'}
                {(audio.status === 'CONNECTING' || audio.status === 'IDLE') && 'Connecting audio...'}
                {audio.status === 'WAITING' && 'Waiting for the seeker to connect...'}
                {audio.status === 'RECONNECTING' && 'Reconnecting...'}
                {['DISCONNECTED', 'ERROR', 'MIC_BLOCKED', 'NOT_CONFIGURED'].includes(audio.status) && (audio.error || 'The audio connection was interrupted.')}
              </p>
              {audio.needsAudioUnlock && (
                <button onClick={() => void audio.unlockAudio()} className="mt-2 px-4 py-2 rounded-lg bg-white text-[#123B5D] text-xs font-bold cursor-pointer">
                  Tap to hear the seeker
                </button>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isMuted ? 'bg-amber-600 text-white' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-[10px] font-bold mt-1">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={handleEndCall}
              disabled={endingCall}
              className="w-18 h-18 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <PhoneOff className="w-8 h-8" />
              <span className="text-[10px] font-bold mt-1">End Call</span>
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${
                !isSpeakerOn ? 'bg-white/10 text-[#59636B]/80' : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              <span className="text-[10px] font-bold mt-1">{isSpeakerOn ? 'Sound on' : 'Sound off'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Live Incoming Session Requests Widget */}
      {!activeSession && incomingRequests.length > 0 && (
        <div className="bg-[#0D2A42] text-white rounded-2xl p-5 border border-[#123B5D] shadow-xl space-y-3 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#C5D6E4] animate-bounce" />
              <h3 className="font-serif text-base font-bold text-white">Incoming Support Request</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-[#123B5D] px-2 py-0.5 rounded-full text-white/80">
              Matches Your Capacity
            </span>
          </div>

          {incomingRequests.map(req => (
            <div key={req.id} className="bg-[#123B5D]/80 p-4 rounded-xl border border-[#123B5D]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white/80">{req.anonymousSeekerTag}</span>
                  <span className="text-[11px] text-[#59636B]/80">({req.packageName})</span>
                </div>
                <p className="text-xs italic text-white/75">"{req.supportReason}"</p>
                <div className="text-[10px] text-[#C5D6E4] font-semibold flex items-center gap-3">
                  <span>Your 40% Share: <strong>₦{req.providerShareNGN.toLocaleString()}</strong></span>
                  {req.languagePreference && <span>Language: {req.languagePreference}</span>}
                </div>
              </div>

              {/* Service-led matching: the seeker starts the call, then you join. */}
              <p className="text-xs text-white/80 sm:max-w-[12rem]">
                Matched with you. You'll be able to join as soon as they press Start.
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Header & Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3E2DE]/90 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={provider.displayName} url={provider.avatarUrl} className="w-16 h-16 text-2xl" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-[#17212B]">{provider.displayName}</h1>
                
                {/* Verification Status Badge (Backend Controlled Only) */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  provider.verificationStatus === 'VERIFIED'
                    ? 'bg-[#EAF0F5] text-[#123B5D]'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#123B5D]" />
                  {provider.verificationStatus === 'VERIFIED' ? 'Verified Listener' : provider.verificationStatus}
                </span>

                {/* Progression Level Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3F1EC] text-[#17212B] text-xs font-medium border border-[#E3E2DE]">
                  <Award className="w-3.5 h-3.5 text-[#123B5D]" />
                  {progressionTitle}
                </span>
              </div>

              <p className="text-xs text-[#59636B]">
                Completed Sessions: <strong>{provider.sessionsCompleted}</strong> | Satisfaction: <strong>{provider.qualityScore}%</strong> | Rating: <strong>{provider.rating} ★</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-[#E3E2DE] hover:bg-[#FAF9F6] text-[#17212B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#59636B]" />
              <span>Edit Profile</span>
            </button>

            {/* Availability Switch */}
            <div className="bg-[#FAF9F6] p-1.5 rounded-xl border border-[#E3E2DE] flex items-center gap-1">
              {['AVAILABLE', 'AWAY', 'OFFLINE'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateAvailability(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    availability === status
                      ? status === 'AVAILABLE' 
                        ? 'bg-[#123B5D] text-white shadow-2xs' 
                        : 'bg-white/10 text-white'
                      : 'text-[#59636B] hover:bg-[#E3E2DE]/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Non-Clinical Disclaimer & Verification Trust Safeguard */}
        <div className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E3E2DE]/80 text-xs text-[#59636B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#123B5D] shrink-0" />
            <span><strong>Peer Support Listener — Non-Clinical:</strong> Peer support presence without medical/clinical diagnostic claims.</span>
          </div>
          <div className="text-[10px] text-[#59636B]/80 italic">
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
        <div className="bg-white rounded-2xl p-6 border border-[#E3E2DE] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#123B5D]" />
              <h3 className="font-serif text-base font-bold text-[#17212B]">Verification Status</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#59636B]/80 bg-[#F3F1EC] px-2 py-0.5 rounded">
              Backend Controlled
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#EAF0F5]/60 rounded-xl border border-[#C5D6E4] text-[#123B5D] font-medium">
              <span>National ID / Passport Verification</span>
              <CheckCircle2 className="w-4 h-4 text-[#123B5D]" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#EAF0F5]/60 rounded-xl border border-[#C5D6E4] text-[#123B5D] font-medium">
              <span>Background Safeguarding Screen</span>
              <CheckCircle2 className="w-4 h-4 text-[#123B5D]" />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#EAF0F5]/60 rounded-xl border border-[#C5D6E4] text-[#123B5D] font-medium">
              <span>Code of Ethics & Non-Clinical Agreement</span>
              <CheckCircle2 className="w-4 h-4 text-[#123B5D]" />
            </div>
          </div>
        </div>

        {/* Training Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E3E2DE] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#123B5D]" />
              <h3 className="font-serif text-base font-bold text-[#17212B]">Listener Training Status</h3>
            </div>
            <span className="text-[10px] font-bold text-[#123B5D] bg-[#EAF0F5] px-2 py-0.5 rounded-full">
              100% Certified
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {provider.trainingModules?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-2 bg-[#FAF9F6] rounded-lg text-[#17212B]">
                <span className="truncate pr-2">{m.title}</span>
                <span className="font-bold text-[#123B5D] text-[11px] shrink-0">Passed ({m.score}%)</span>
              </div>
            )) || (
              <p className="text-[#59636B]/80 italic">Training modules completed.</p>
            )}
          </div>
        </div>

      </div>

      {/* Matching Constraint: Maximum Consecutive Listening Duration */}
      <div className="bg-white rounded-2xl p-6 border border-[#E3E2DE]/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-[#17212B]">
              Maximum Consecutive Listening Capacity
            </h3>
            <p className="text-xs text-[#59636B]">
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
                  ? 'bg-[#EAF0F5] border-[#123B5D] text-[#123B5D] ring-1 ring-[#123B5D]'
                  : 'bg-[#FAF9F6] hover:bg-[#F3F1EC] border-[#E3E2DE] text-[#17212B]'
              }`}
            >
              {mins} mins
            </button>
          ))}
        </div>
      </div>

      {/* Provider Earnings Overview (40% Server Calculated) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DE] shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-[#59636B]/80">Total Earnings (40% Share)</div>
          <div className="font-serif text-2xl font-bold text-[#123B5D]">₦{totalEarnedNGN.toLocaleString()}</div>
          <div className="text-[10px] text-[#59636B]/80">Calculated on completed paid sessions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DE] shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-[#59636B]/80">Available Balance</div>
          <div className="font-serif text-2xl font-bold text-[#17212B]">₦{availableBalanceNGN.toLocaleString()}</div>
          <div className="text-[10px] text-[#123B5D] font-semibold">Weekly payout ready (Saturday 6pm)</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E3E2DE] shadow-2xs space-y-1">
          <div className="text-xs font-semibold text-[#59636B]/80">Pending Fraud/Dispute Window</div>
          <div className="font-serif text-2xl font-bold text-amber-700">₦{pendingBalanceNGN.toLocaleString()}</div>
          <div className="text-[10px] text-[#59636B]/80">Clears to available after 24h</div>
        </div>

      </div>

      {/* Session Earnings Ledger Table */}
      <div className="bg-white rounded-2xl p-6 border border-[#E3E2DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#17212B]">Session Earnings Ledger</h3>
            <p className="text-xs text-[#59636B]">Fixed 40% Revenue Share per completed paid session</p>
          </div>
          <span className="text-xs font-bold text-[#123B5D] bg-[#EAF0F5] px-2.5 py-1 rounded-lg">
            40% Provider Share
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E3E2DE] text-[#59636B]/80 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3">Session Package</th>
                <th className="py-2.5 px-3">Gross Value</th>
                <th className="py-2.5 px-3">Your Share (40%)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E2DE] text-[#17212B]">
              {earnings.map((e) => (
                <tr key={e.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-3 px-3 font-semibold text-[#17212B]">{e.packageName}</td>
                  <td className="py-3 px-3">₦{e.grossSessionValueNGN.toLocaleString()}</td>
                  <td className="py-3 px-3 font-bold text-[#123B5D]">₦{e.providerAmountNGN.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'AVAILABLE' ? 'bg-[#EAF0F5] text-[#123B5D]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#59636B]/80">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Payout Schedule & Bank Account Information */}
      <div className="bg-white rounded-2xl p-6 border border-[#E3E2DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#123B5D]" />
            <h3 className="font-serif text-base font-bold text-[#17212B]">Weekly Payout Schedule</h3>
          </div>
          <span className="text-xs font-semibold text-[#59636B]">Bank: Guaranty Trust Bank •••• 8910</span>
        </div>

        <p className="text-xs text-[#59636B] leading-relaxed">
          <strong>Automatic Transfer:</strong> Accumulated available earnings are disbursed weekly every Saturday evening directly to your registered bank account.
        </p>

        {payouts.length > 0 && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E3E2DE] text-[#59636B]/80 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2 px-2">Payout ID</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">Scheduled</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E2DE] text-[#17212B]">
                {payouts.map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-2 font-mono text-[11px]">{p.id}</td>
                    <td className="py-2.5 px-2 font-bold text-[#17212B]">₦{p.amountNGN.toLocaleString()}</td>
                    <td className="py-2.5 px-2 text-[#59636B]">{new Date(p.scheduledFor).toLocaleDateString()}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-0.5 rounded bg-[#EAF0F5] text-[#123B5D] font-bold text-[10px]">
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
        <div className="fixed inset-0 z-50 bg-[#17212B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E3E2DE] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#17212B]">Listener Profile & Declarations</h3>
                <p className="text-xs text-[#59636B]">Configure your listening capacity, languages & preferences</p>
              </div>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 rounded-full text-[#59636B]/80 hover:text-[#17212B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Photo */}
              <div>
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <Avatar name={editDisplayName || provider?.displayName} url={provider?.avatarUrl} className="w-16 h-16 text-2xl" />
                  <div className="space-y-1.5">
                    <label className={`inline-flex items-center px-3.5 py-2 rounded-lg border border-[#E3E2DE] text-xs font-semibold text-[#123B5D] bg-white hover:bg-[#F3F1EC] transition-colors ${uploadingAvatar ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                      {uploadingAvatar ? 'Uploading…' : provider?.avatarUrl ? 'Change photo' : 'Upload photo'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleAvatarSelected} disabled={uploadingAvatar} />
                    </label>
                    <p className="text-[11px] text-[#59636B]">JPG, PNG or WebP, up to 2 MB. Seekers see this photo when they're matched with you.</p>
                    {avatarMessage && <p className="text-[11px] font-medium text-[#123B5D]">{avatarMessage}</p>}
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D4D2CC] text-xs font-medium focus:ring-2 focus:ring-[#123B5D] outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Bio / Introduction</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D4D2CC] text-xs font-medium focus:ring-2 focus:ring-[#123B5D] outline-none"
                />
              </div>

              {/* Gender Declaration */}
              <div>
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['female', 'male', 'non-binary', 'prefer-not-to-say'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setEditGender(g)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center capitalize transition-all ${
                        editGender === g ? 'bg-[#EAF0F5] border-[#123B5D] text-[#123B5D] font-bold' : 'bg-[#FAF9F6] border-[#E3E2DE] text-[#17212B]'
                      }`}
                    >
                      {g.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Languages Spoken</label>
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
                          selected ? 'bg-[#123B5D] text-white font-semibold' : 'bg-[#F3F1EC] text-[#17212B] hover:bg-[#E3E2DE]'
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
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Listening Areas / Expertise</label>
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
                          selected ? 'bg-[#EAF0F5] border-[#123B5D] text-[#123B5D] font-semibold' : 'bg-[#FAF9F6] border-[#E3E2DE] text-[#17212B]'
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
                <label className="text-xs font-bold text-[#17212B] uppercase tracking-wider block mb-1">Preferred Session Types</label>
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
                          selected ? 'bg-[#123B5D] text-white font-semibold' : 'bg-[#F3F1EC] text-[#17212B] hover:bg-[#E3E2DE]'
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

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E3E2DE]">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#17212B] rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={savingProfile}
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Session Completed Summary Modal */}
      {sessionCompletedSummary && (
        <div className="fixed inset-0 z-50 bg-[#17212B]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-[#E3E2DE] animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#EAF0F5] text-[#123B5D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#17212B]">Conversation Complete</h3>
              <p className="text-xs text-[#59636B]">Thank you for offering your empathetic listening ear.</p>
            </div>

            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E3E2DE] space-y-2">
              <div className="flex justify-between text-xs text-[#59636B]">
                <span>Duration logged:</span>
                <strong className="text-[#17212B]">{sessionCompletedSummary.durationMins} minutes</strong>
              </div>
              <div className="flex justify-between text-xs text-[#59636B]">
                <span>Your 40% Share added:</span>
                <strong className="text-[#123B5D] font-bold">₦{sessionCompletedSummary.earningNGN.toLocaleString()}</strong>
              </div>
            </div>

            <button
              onClick={() => setSessionCompletedSummary(null)}
              className="w-full py-3 bg-[#123B5D] hover:bg-[#0D2A42] text-white rounded-xl text-xs font-bold transition-all shadow-md"
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
