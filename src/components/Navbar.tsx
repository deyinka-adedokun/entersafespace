import React, { useState } from 'react';
import { User, UserRole, Session } from '../types';
import { Shield, PhoneCall, LogIn, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SafespaceLogo } from './ui/SafespaceLogo';
import { TabType } from './BottomNav';

interface NavbarProps {
  currentUser?: User;
  onRoleSwitch?: (role: UserRole) => void;
  currentTab?: TabType;
  onTabChange?: (tab: TabType) => void;
  activeSession?: Session | null;
  onOpenActiveSession?: () => void;
  onOpenEmergency: () => void;
  onOpenNotifications?: () => void;
  onStartTalk?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleSwitch,
  currentTab = 'HOME',
  onTabChange,
  activeSession,
  onOpenActiveSession,
  onOpenEmergency,
  onStartTalk
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const activeUser = user || currentUser;

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E3E2DE] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: Authoritative Safespace Logo */}
        <div className="flex items-center gap-8">
          <button 
            onClick={() => onTabChange?.('HOME')}
            className="flex items-center text-left focus:outline-hidden cursor-pointer"
            aria-label="Safespace Home"
          >
            <SafespaceLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#59636B]">
            <button
              onClick={() => onTabChange?.('HOW_IT_WORKS')}
              className={`transition-colors cursor-pointer text-left ${
                currentTab === 'HOW_IT_WORKS'
                  ? 'text-[#123B5D] font-bold'
                  : 'hover:text-[#17212B]'
              }`}
            >
              How it works
            </button>

            <button
              onClick={() => onTabChange?.('FOR_PROVIDERS')}
              className={`transition-colors cursor-pointer text-left ${
                currentTab === 'FOR_PROVIDERS'
                  ? 'text-[#123B5D] font-bold'
                  : 'hover:text-[#17212B]'
              }`}
            >
              For Providers
            </button>

            <button
              onClick={() => onTabChange?.('SAFETY')}
              className={`transition-colors cursor-pointer text-left ${
                currentTab === 'SAFETY'
                  ? 'text-[#123B5D] font-bold'
                  : 'hover:text-[#17212B]'
              }`}
            >
              Safety
            </button>

            {/* Sage External Link */}
            <a
              href="https://becomingwithsage.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#123B5D] transition-colors inline-flex items-center gap-1"
            >
              <span>Sage</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </nav>
        </div>

        {/* Center Active Session Pill (ONLY shown if authenticated and session is ACTIVE) */}
        {isAuthenticated && activeSession && activeSession.status === 'ACTIVE' && (
          <button 
            onClick={onOpenActiveSession}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EAF0F5] border border-[#C5D6E4] text-[#123B5D] text-xs font-semibold hover:bg-[#D8E6F0] transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#123B5D] animate-pulse"></span>
            <span>Active Session</span>
            <PhoneCall className="w-3.5 h-3.5 ml-0.5 text-[#123B5D]" />
          </button>
        )}

        {/* Right Actions: Public Sign In & Find Support CTA */}
        <div className="hidden sm:flex items-center gap-4">
          
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#E3E2DE] bg-white text-[#17212B] text-xs font-semibold hover:bg-[#F3F1EC] transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#123B5D] text-white flex items-center justify-center text-[10px] font-bold">
                  {activeUser?.displayName ? activeUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="truncate max-w-[100px]">{activeUser?.displayName || 'Account'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E3E2DE] p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-[#E3E2DE] mb-1">
                    <p className="text-xs font-bold text-[#17212B] truncate">{activeUser?.displayName}</p>
                    <p className="text-[11px] text-[#59636B] truncate">{activeUser?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onTabChange?.('PROFILE');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-[#17212B] hover:bg-[#F3F1EC] flex items-center gap-2"
                  >
                    <span>Profile & Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange?.('SESSIONS');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-[#17212B] hover:bg-[#F3F1EC] flex items-center gap-2"
                  >
                    <span>My Sessions</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-[#B3261E] hover:bg-[#FDF2F2] flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('LOGIN')}
              className="text-xs sm:text-sm font-semibold text-[#17212B] hover:text-[#123B5D] transition-colors cursor-pointer px-2 py-1"
            >
              Sign in
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onStartTalk}
            className="px-5 py-2.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Find Support
          </button>
        </div>

        {/* Mobile Hamburger & Mobile CTA */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onStartTalk}
            className="px-3.5 py-1.5 bg-[#123B5D] hover:bg-[#0D2A42] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Find Support
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#17212B] hover:bg-[#F3F1EC] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#E3E2DE] bg-[#FAF9F6] px-4 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-left">
            <button
              onClick={() => handleNavClick(() => onTabChange?.('HOW_IT_WORKS'))}
              className={`text-sm font-semibold py-1.5 text-left ${
                currentTab === 'HOW_IT_WORKS' ? 'text-[#123B5D] font-bold' : 'text-[#17212B]'
              }`}
            >
              How it works
            </button>

            <button
              onClick={() => handleNavClick(() => onTabChange?.('FOR_PROVIDERS'))}
              className={`text-sm font-semibold py-1.5 text-left ${
                currentTab === 'FOR_PROVIDERS' ? 'text-[#123B5D] font-bold' : 'text-[#17212B]'
              }`}
            >
              For Providers
            </button>

            <button
              onClick={() => handleNavClick(() => onTabChange?.('SAFETY'))}
              className={`text-sm font-semibold py-1.5 text-left flex items-center justify-between ${
                currentTab === 'SAFETY' ? 'text-[#123B5D] font-bold' : 'text-[#17212B]'
              }`}
            >
              <span>Safety</span>
              <Shield className="w-4 h-4 opacity-70" />
            </button>

            <a
              href="https://becomingwithsage.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#123B5D] py-1.5 flex items-center justify-between"
            >
              <span>Sage</span>
              <ExternalLink className="w-4 h-4 opacity-60" />
            </a>

            <div className="pt-3 border-t border-[#E3E2DE] flex flex-col space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => handleNavClick(() => onTabChange?.('PROFILE'))}
                  className="w-full text-left py-2 text-sm font-semibold text-[#17212B]"
                >
                  Account ({activeUser?.displayName})
                </button>
              ) : (
                <button
                  onClick={() => handleNavClick(() => openAuthModal('LOGIN'))}
                  className="w-full text-left py-2 text-sm font-semibold text-[#123B5D]"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
