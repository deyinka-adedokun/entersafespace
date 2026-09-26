import React, { useEffect, useState } from 'react';
import { User, ProviderProfile, UserRole } from '../types';
import { Shield, Heart, PhoneCall, LogOut, Edit2, Check, UserCheck, AlertTriangle, KeyRound, Sparkles } from 'lucide-react';
import { Card } from './ui/Card';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/ToastContext';
import { Avatar } from './ui/Avatar';

interface ProfileViewProps {
  currentUser?: User | null;
  preferredProvider?: ProviderProfile | null;
  onOpenEmergency: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  preferredProvider,
  onOpenEmergency
}) => {
  const { user, isAuthenticated, logout, updateProfile, openAuthModal, refreshSession } = useAuth();
  const { showToast: addToast } = useToast();

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Account details can arrive after this screen opens (or change after a
  // save), so keep the form in step unless the person is mid-edit.
  useEffect(() => {
    if (isEditing) return;
    setDisplayName(activeUser.displayName || '');
    setPhone(activeUser.phone || '');
    setPreferredLanguage(activeUser.preferredLanguage || 'English');
  }, [activeUser.displayName, activeUser.phone, activeUser.preferredLanguage, isEditing]);

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('Photos must be 2 MB or smaller.', 'error');
      return;
    }
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('avatar', file);
      const res = await fetch('/api/v1/profile/avatar', { method: 'POST', body });
      const json = await res.json();
      if (json.success) {
        await refreshSession();
        addToast('Profile photo updated.', 'success');
      } else {
        addToast(json.error?.message || 'The photo could not be uploaded.', 'error');
      }
    } catch (err) {
      addToast('Network error uploading your photo. Please try again.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

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
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <Avatar name={activeUser.displayName} url={activeUser.avatarUrl} className="w-14 h-14 text-2xl" />
              {isAuthenticated && (
                <label className={`text-[11px] font-semibold text-[#123B5D] hover:underline ${uploadingPhoto ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                  {uploadingPhoto ? 'Uploading…' : activeUser.avatarUrl ? 'Change photo' : 'Add photo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handlePhotoSelected} disabled={uploadingPhoto} />
                </label>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-[#17212B]">{activeUser.displayName || 'Seeker Account'}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeUser.status === 'ACTIVE' ? 'bg-[#123B5D]/10 text-[#123B5D]' :
                  activeUser.status === 'UNVERIFIED' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {activeUser.status}
                </span>
              </div>
              <p className="text-xs text-[#59636B] mt-0.5">{activeUser.email}</p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#123B5D] bg-[#F3F1EC] px-2.5 py-0.5 rounded-full border border-[#123B5D]/10">
                <Shield className="w-3 h-3 text-[#123B5D]" />
                <span>Private Display Alias</span>
              </div>
              <p className="text-[10px] text-[#59636B] mt-1">Your photo is only visible to you. Listeners never see it.</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-[#59636B] hover:text-[#123B5D] hover:bg-[#F3F1EC] rounded-xl transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profile Editing Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="pt-3 border-t border-[#F3F1EC] space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#59636B] mb-1">Display Alias / Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
              <p className="text-[10px] text-[#59636B] mt-1">This alias is shown during listening sessions to preserve your privacy.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59636B] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59636B] mb-1">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#E3E2DE] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B5D]"
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
                className="flex-1 py-2 bg-[#123B5D] hover:bg-[#123B5D] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#59636B] text-xs font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-[#F3F1EC] grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[#FAF9F6]/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-[#59636B] font-bold">Role</div>
              <div className="text-xs font-bold text-[#17212B] mt-0.5 truncate">{activeUser.role}</div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6]/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-[#59636B] font-bold">Language</div>
              <div className="text-xs font-bold text-[#17212B] mt-0.5">{activeUser.preferredLanguage || 'English'}</div>
            </div>
            <div className="p-2.5 bg-[#FAF9F6]/80 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-[#59636B] font-bold">Trial Status</div>
              <div className="text-xs font-bold text-[#123B5D] mt-0.5">
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
              className="text-xs font-semibold text-[#123B5D] hover:text-[#123B5D] flex items-center gap-1.5 p-2 rounded-xl hover:bg-[#F3F1EC] transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="text-[11px] text-[#59636B] font-mono">
            User ID: {activeUser.id}
          </div>
        </div>
      </Card>

      {/* Preferred Listener Card */}
      {preferredProvider && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#17212B]">
              <Heart className="w-4 h-4 text-[#123B5D] fill-[#123B5D]/10" />
              <span>Saved Preferred Listener</span>
            </div>
            <span className="text-[10px] font-bold text-[#123B5D] bg-[#F3F1EC] px-2 py-0.5 rounded-full border border-[#123B5D]/10">Saved</span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={preferredProvider.avatarUrl}
              alt={preferredProvider.displayName}
              className="w-12 h-12 rounded-full object-cover border border-[#123B5D]/10"
            />
            <div>
              <div className="font-display font-bold text-sm text-[#17212B]">{preferredProvider.displayName}</div>
              <p className="text-xs text-[#59636B] line-clamp-1">{preferredProvider.bio}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy & Safeguarding Settings */}
      <Card padding="md" className="space-y-3">
        <h3 className="font-display text-base font-bold text-[#17212B]">Privacy & Confidentiality</h3>
        <p className="text-xs text-[#59636B] leading-relaxed">
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

    </div>
  );
};