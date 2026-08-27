import React from 'react';
import { Home, MessageSquare, Gift as GiftIcon, User as UserIcon } from 'lucide-react';

export type TabType = 'HOME' | 'HOW_IT_WORKS' | 'FOR_PROVIDERS' | 'SAFETY' | 'SESSIONS' | 'GIFT' | 'PROFILE' | 'LISTENER' | 'ADMIN';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeSessionCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const seekerTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'HOME', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'SESSIONS', label: 'Sessions', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'GIFT', label: 'Gift', icon: <GiftIcon className="w-5 h-5" /> },
    { id: 'PROFILE', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#E3E2DE] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {seekerTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                isActive ? 'text-[#123B5D] font-bold' : 'text-[#59636B] hover:text-[#17212B]'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1 tracking-normal">{tab.label}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-[#123B5D] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
