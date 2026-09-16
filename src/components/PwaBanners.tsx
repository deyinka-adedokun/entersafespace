import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download, RefreshCw, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { SafespaceLogo } from './ui/SafespaceLogo';

export const PwaBanners: React.FC = () => {
  const {
    isOnline,
    wasOffline,
    dismissNetworkToast,
    isInstallable,
    isInstalled,
    promptInstall,
    hasSwUpdate,
    applySwUpdate
  } = useNotifications();

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('safespace_pwa_install_dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('safespace_pwa_install_dismissed', 'true');
  };

  return (
    <>
      {/* Top Banner Container: Strictly for critical network & update alerts */}
      <div className="fixed top-2 left-0 right-0 z-50 pointer-events-none space-y-2 p-2 max-w-lg mx-auto">
        
        {/* 1. Offline Banner */}
        {!isOnline && (
          <div className="pointer-events-auto bg-[#17212B] text-[#F3F1EC] border border-[#59636B] rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold">Offline Mode</span>
                <span className="hidden sm:inline text-[#E3E2DE] ml-1.5">— Real-time calls require internet connection.</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#17212B] text-[#FAF9F6] uppercase">
              Offline
            </span>
          </div>
        )}

        {/* 2. Network Restored Recovery Toast */}
        {isOnline && wasOffline && (
          <div className="pointer-events-auto bg-[#0D2A42] text-[#123B5D]/10 border border-[#123B5D] rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-[#123B5D] shrink-0" />
              <div>
                <span className="font-bold">Connection Restored</span>
                <span className="text-[#123B5D]/20 ml-1.5">You are back online.</span>
              </div>
            </div>
            <button
              onClick={dismissNetworkToast}
              className="p-1 rounded-lg hover:bg-[#123B5D] text-[#123B5D]/30 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Service Worker App Update Banner */}
        {hasSwUpdate && (
          <div className="pointer-events-auto bg-[#17212B] text-[#F3F1EC] border border-[#123B5D] rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-[#123B5D] shrink-0 animate-spin" />
              <div>
                <span className="font-bold text-[#FAF9F6]">App Update Ready</span>
                <span className="hidden sm:inline text-[#E3E2DE] ml-1.5">— A new version is available.</span>
              </div>
            </div>
            <button
              onClick={applySwUpdate}
              className="px-3 py-1.5 rounded-xl bg-[#123B5D] hover:bg-[#123B5D] text-white font-bold transition shadow-xs text-xs"
            >
              Update Now
            </button>
          </div>
        )}

      </div>

      {/* 4. PWA Installation Card — Non-intrusive Bottom Right Corner */}
      {isInstallable && !isInstalled && !isDismissed && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto max-w-xs w-full bg-[#FAF9F6] text-[#17212B] border border-[#E3E2DE] rounded-xl p-4 shadow-xl space-y-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <SafespaceLogo size="sm" showWordmark={false} />
              <div>
                <h4 className="font-bold text-xs text-[#17212B]">Add Safespace to Home Screen</h4>
                <p className="text-[11px] text-[#59636B] leading-tight">Instant access for private support</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[#59636B] hover:text-[#17212B] hover:bg-[#F3F1EC] transition-colors"
              title="Dismiss prompt"
              aria-label="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={promptInstall}
              className="flex-1 py-2 px-3 rounded-lg bg-[#123B5D] hover:bg-[#0D2A42] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Home Screen</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-2 rounded-lg text-[#59636B] hover:text-[#17212B] text-xs font-medium"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
};