import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Check, 
  Trash2, 
  X, 
  Volume2, 
  VolumeX, 
  Moon, 
  ShieldCheck, 
  Play, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  PhoneCall,
  Clock,
  CreditCard,
  Gift as GiftIcon,
  Headphones,
  Landmark,
  ShieldAlert
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { SafespaceNotificationType } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<SafespaceNotificationType, { label: string; icon: React.FC<{ className?: string }>; color: string }> = {
  MATCH_FOUND: { label: 'Match Found', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  SESSION_REMINDER: { label: 'Session Reminder', icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  SESSION_ENDING: { label: 'Session Ending', icon: PhoneCall, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  PAYMENT_SUCCESS: { label: 'Payment Success', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  PAYMENT_FAILED: { label: 'Payment Failed', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  GIFT_RECEIVED: { label: 'Gift Voucher', icon: GiftIcon, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  PROVIDER_REQUEST: { label: 'Provider Request', icon: Headphones, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  PROVIDER_SESSION: { label: 'Provider Session', icon: PhoneCall, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  PAYOUT: { label: 'Bank Payout', icon: Landmark, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  SAFETY_ALERT: { label: 'Safety Alert', icon: ShieldAlert, color: 'text-rose-700 bg-rose-50 border-rose-200' }
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    preferences,
    updatePreferences,
    triggerNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestPushPermission,
    pushPermissionState
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'NOTIFICATIONS' | 'PREFERENCES' | 'TEST_EVENTS'>('NOTIFICATIONS');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredNotifications = filterUnreadOnly 
    ? notifications.filter(n => !n.read) 
    : notifications;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-stone-900 text-amber-50 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold">Notifications & Preferences</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">PWA Web Push, Rate-Limited Anti-Spam & Event Center</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-stone-50 border-b border-stone-200 text-xs font-bold">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`px-3.5 py-2 rounded-xl transition ${
                activeTab === 'NOTIFICATIONS' 
                  ? 'bg-emerald-900 text-amber-50 shadow-xs' 
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'PREFERENCES' 
                  ? 'bg-emerald-900 text-amber-50 shadow-xs' 
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => setActiveTab('TEST_EVENTS')}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'TEST_EVENTS' 
                  ? 'bg-emerald-900 text-amber-50 shadow-xs' 
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test 10 Triggers</span>
            </button>
          </div>

          {activeTab === 'NOTIFICATIONS' && (
            <div className="flex items-center gap-2 text-[11px]">
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-2.5 py-1 rounded-lg border text-stone-700 transition ${
                  filterUnreadOnly ? 'bg-amber-100 border-amber-300 font-bold' : 'border-stone-200 bg-white'
                }`}
              >
                {filterUnreadOnly ? 'Unread Only' : 'Show All'}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-emerald-800 hover:underline font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {/* TAB 1: NOTIFICATION LIST */}
          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="p-12 text-center text-stone-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-stone-300" />
                  <p className="text-xs font-semibold">No notifications recorded yet.</p>
                  <p className="text-[11px] text-stone-400">Use "Test 10 Triggers" tab to evaluate all notification events.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const cfg = TYPE_CONFIG[item.type];
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                        item.read 
                          ? 'bg-stone-50/60 border-stone-200' 
                          : 'bg-amber-50/40 border-amber-200 shadow-xs'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-stone-900 truncate">{item.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono shrink-0">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{item.body}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold uppercase tracking-wider">
                            {cfg.label}
                          </span>
                          {!item.read && (
                            <span className="text-amber-700 font-bold">Unread</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {notifications.length > 0 && (
                <div className="pt-2 text-right">
                  <button
                    onClick={clearAll}
                    className="text-rose-700 hover:text-rose-900 text-xs font-bold flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Notification History</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PREFERENCES */}
          {activeTab === 'PREFERENCES' && (
            <div className="space-y-6 text-xs">
              
              {/* Push Permission & Master Toggles */}
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-sm text-amber-50">Browser Web Push Notifications</div>
                    <div className="text-[11px] text-stone-400">Receive background alerts even when Safespace tab is closed</div>
                  </div>

                  {pushPermissionState === 'granted' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-900 text-emerald-300 font-bold text-[10px] border border-emerald-700">
                      Permission Granted
                    </span>
                  ) : (
                    <button
                      onClick={requestPushPermission}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition shadow-xs text-xs"
                    >
                      Enable Web Push
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800 border border-stone-700 cursor-pointer">
                    <span className="font-semibold text-stone-200">Sound Chime Alerts</span>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-800 border border-stone-700 cursor-pointer">
                    <span className="font-semibold text-stone-200">Quiet Hours Mode</span>
                    <input
                      type="checkbox"
                      checked={preferences.quietHoursEnabled}
                      onChange={(e) => updatePreferences({ quietHoursEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>

                {preferences.quietHoursEnabled && (
                  <div className="p-3 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-stone-300 font-semibold">Quiet Hours Window:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={preferences.quietHoursStart}
                        onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                        className="bg-stone-900 text-stone-100 text-xs p-1.5 rounded-lg border border-stone-700"
                      />
                      <span className="text-stone-400">to</span>
                      <input
                        type="time"
                        value={preferences.quietHoursEnd}
                        onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                        className="bg-stone-900 text-stone-100 text-xs p-1.5 rounded-lg border border-stone-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Anti-Spam Frequency Capping */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 text-sm">Anti-Spam & Low-End Device Protection</div>
                <p className="text-[11px] text-stone-500">Prevent notification flood and conserve device battery & memory on low-end Android devices.</p>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <span className="font-semibold text-stone-700">Daily Notification Cap:</span>
                  <select
                    value={preferences.frequencyCapping}
                    onChange={(e) => updatePreferences({ frequencyCapping: e.target.value as any })}
                    className="p-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none"
                  >
                    <option value="STANDARD">Standard Protection (Max 15 / day)</option>
                    <option value="STRICT">Strict Saver Mode (Max 5 / day)</option>
                    <option value="UNLIMITED">Unlimited (No Capping)</option>
                  </select>
                </div>
              </div>

              {/* Category Toggles for all 10 Event Types */}
              <div className="space-y-3">
                <div className="font-bold text-stone-900 text-sm">Category Notification Preferences</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(TYPE_CONFIG) as SafespaceNotificationType[]).map((cat) => {
                    const cfg = TYPE_CONFIG[cat];
                    const Icon = cfg.icon;
                    const isEnabled = preferences.enabledCategories[cat];

                    return (
                      <label
                        key={cat}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                          isEnabled ? 'bg-stone-50/80 border-stone-300' : 'bg-stone-100/50 border-stone-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl border ${cfg.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-stone-800 text-xs">{cfg.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => updatePreferences({
                            enabledCategories: { ...preferences.enabledCategories, [cat]: e.target.checked }
                          })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: TEST 10 EVENT TRIGGERS */}
          {activeTab === 'TEST_EVENTS' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold text-sm">Notification Event Testing Playground</div>
                <p className="text-[11px] text-amber-800 leading-normal">
                  Tap any button below to immediately trigger one of the 10 core Safespace notification events. Evaluates active preferences, sound chimes, and browser push permissions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(TYPE_CONFIG) as SafespaceNotificationType[]).map((typeKey) => {
                  const cfg = TYPE_CONFIG[typeKey];
                  const Icon = cfg.icon;

                  return (
                    <button
                      key={typeKey}
                      onClick={() => triggerNotification(typeKey)}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 transition text-left flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-xs">{cfg.label}</div>
                          <div className="text-[10px] text-stone-400 font-mono">Trigger Event</div>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-emerald-800 text-amber-50 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition shadow-xs">
                        Fire Test
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
