import React, { useState } from 'react';
import { User, ProviderProfile, UserRole } from '../types';
import { Shield, Heart, PhoneCall, LogOut, Edit2, Check, UserCheck, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastContext';

interface ProfileViewProps {
  currentUser?: User | null;
  preferredProvider?: ProviderProfile | null;
  onRoleSwitch: (role: UserRole) => void;
  onOpenEmergency: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  preferredProvider,
  onRoleSwitch,
  onOpenEmergency
}) => {
  const { user, isAuthenticated, logout, updateProfile, openAuthModal, switchRole } = useAuth();
  const { addToast } = useToast();

  const activeUser: User = user || currentUser || {
    id: 'guest',
    email: 'guest@safespace.ng',
    displayName: 'Guest User',
    role: 'SUPPORT_SEEKER',
    status: 'ACTIVE',
    freeTrialUsed: false,
    createdAt: new Date().toISOString()
  };

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(activeUser.displayName || '');
  const [phone, setPhone] = useState(activeUser.phone || '');
  const [preferredLanguage, setPreferredLanguage] = useState(activeUser.preferredLanguage || 'English');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateProfile({ displayName, phone, preferredLanguage });
    setIsSaving(false);
    if (res.success) {
      addToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } else {
      addToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    addToast('Logged out of Safespace', 'info');
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Account Card */}
      <Card padding="lg" className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-900 text-amber-50 flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
              {activeUser.displayName ? activeUser.displayName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold text-stone-900">{activeUser.displayName || 'Seeker Account'}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeUser.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                  activeUser.status === 'UNVERIFIED' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {activeUser.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{activeUser.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <Shield className="w-3 h-3 text-emerald-700" />
                <span>Private Display Alias</span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-stone-500 hover:text-emerald-800 hover:bg-stone-100 rounded-xl transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Editing Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-stone-100 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Display Alias / Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-stone-400 mt-1">This alias is shown during listening sessions to preserve your privacy.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="English">English</option>
                <option value="Yoruba">Yoruba</option>
                <option value="Igbo">Igbo</option>
                <option value="Hausa">Hausa</option>
                <option value="Nigerian Pidgin">Nigerian Pidgin</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-stone-50/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Role</div>
              <div className="text-xs font-bold text-stone-800 mt-0.5 truncate">{activeUser.role}</div>
            </div>
            <div className="p-2.5 bg-stone-50/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Language</div>
              <div className="text-xs font-bold text-stone-800 mt-0.5">{activeUser.preferredLanguage || 'English'}</div>
            </div>
            <div className="p-2.5 bg-stone-50/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Trial Status</div>
              <div className="text-xs font-bold text-emerald-800 mt-0.5">
                {activeUser.freeTrialUsed ? 'Used' : 'Available'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 p-2 rounded-xl hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('LOGIN')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 p-2 rounded-xl hover:bg-emerald-50 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="text-[11px] text-stone-400 font-mono">
            User ID: {activeUser.id}
          </div>
        </div>
      </Card>

      {/* Preferred Listener Card */}
      {preferredProvider && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Heart className="w-4 h-4 text-emerald-800 fill-emerald-100" />
              <span>Saved Preferred Listener</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Saved</span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={preferredProvider.avatarUrl}
              alt={preferredProvider.displayName}
              className="w-12 h-12 rounded-full object-cover border border-emerald-100"
            />
            <div>
              <div className="font-serif font-bold text-sm text-stone-900">{preferredProvider.displayName}</div>
              <p className="text-xs text-stone-500 line-clamp-1">{preferredProvider.bio}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy & Safeguarding Settings */}
      <Card padding="md" className="space-y-3">
        <h3 className="font-serif text-base font-bold text-stone-900">Privacy & Confidentiality</h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Safespace never records or stores audio streams. Your real name and contact details are strictly isolated from listening sessions.
        </p>

        <div className="space-y-2 pt-2">
          <button
            onClick={onOpenEmergency}
            className="w-full p-3 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-700" />
              <span>Safety & Emergency Crisis Helplines</span>
            </span>
            <span className="text-[11px] font-bold">Open</span>
          </button>
        </div>
      </Card>

      {/* Account Persona Switcher */}
      <Card padding="md" className="space-y-3 bg-stone-50/90 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Switch Demo Account Persona</h3>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Isolated Accounts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(
            [
              'SUPPORT_SEEKER',
              'PROVIDER',
              'ADMIN',
              'SAFETY_REVIEWER',
              'CONTENT_EDITOR',
              'SUPER_ADMIN'
            ] as UserRole[]
          ).map(r => (
            <button
              key={r}
              onClick={() => {
                switchRole(r);
                onRoleSwitch(r);
                addToast(`Switched account to ${
                  r === 'SUPPORT_SEEKER' ? 'Emma (Seeker)' :
                  r === 'PROVIDER' ? 'Sarah (Listener)' :
                  r === 'ADMIN' ? 'Safespace Ops (Admin)' :
                  r === 'SAFETY_REVIEWER' ? 'Safeguard Reviewer' :
                  r === 'CONTENT_EDITOR' ? 'Content Manager' :
                  'Super Admin'
                }`, 'info');
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                activeUser.role === r
                  ? 'bg-emerald-900 text-amber-50 border-emerald-900 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {r === 'SUPPORT_SEEKER' ? '🙋 Emma (Seeker)' :
               r === 'PROVIDER' ? '👂 Sarah (Listener)' :
               r === 'ADMIN' ? '🛡️ Ops Admin' :
               r === 'SAFETY_REVIEWER' ? '🚨 Safety Review' :
               r === 'CONTENT_EDITOR' ? '📝 CMS Editor' :
               '👑 Super Admin'}
            </button>
          ))}
        </div>
      </Card>

    </div>
  );
};
