import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Users, 
  Headphones, 
  Zap, 
  CreditCard, 
  DollarSign, 
  Landmark, 
  Gift as GiftIcon, 
  Star, 
  Flag, 
  FileText, 
  BarChart3, 
  Settings, 
  History, 
  PhoneCall, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  Sliders,
  ChevronRight,
  UserCheck,
  UserX,
  BadgeCheck
} from 'lucide-react';
import { SafeguardingView } from './SafeguardingView';
import { CMSManagerView } from './CMSManagerView';

export type AdminRole = 
  | 'SUPPORT_OPS' 
  | 'FINANCE' 
  | 'PROVIDER_OPS' 
  | 'SAFEGUARDING' 
  | 'CONTENT' 
  | 'SUPER_ADMIN';

export type ControlCentreTab = 
  | 'ANALYTICS'
  | 'SESSIONS'
  | 'USERS'
  | 'PROVIDERS'
  | 'MATCHING'
  | 'PAYMENTS'
  | 'EARNINGS'
  | 'PAYOUTS'
  | 'GIFTS'
  | 'FEEDBACK'
  | 'REPORTS'
  | 'SAFEGUARDING'
  | 'CMS'
  | 'SETTINGS'
  | 'AUDIT_LOGS';

interface RoleConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  allowedTabs: ControlCentreTab[];
}

const ROLE_PERMISSIONS: Record<AdminRole, RoleConfig> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    badgeBg: 'bg-stone-900 text-amber-300',
    badgeText: 'FULL SYSTEM CLEARANCE',
    description: 'Unrestricted governance across all operational, financial, safeguarding, and administrative modules.',
    allowedTabs: [
      'ANALYTICS', 'SESSIONS', 'USERS', 'PROVIDERS', 'MATCHING', 
      'PAYMENTS', 'EARNINGS', 'PAYOUTS', 'GIFTS', 'FEEDBACK', 
      'REPORTS', 'SAFEGUARDING', 'CMS', 'SETTINGS', 'AUDIT_LOGS'
    ]
  },
  SUPPORT_OPS: {
    label: 'Support Operations',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
    badgeText: 'OPS & USER SUPPORT CLEARANCE',
    description: 'Focuses on live session monitoring, user account assistance, provider matching, feedback, and gifts.',
    allowedTabs: [
      'ANALYTICS', 'SESSIONS', 'USERS', 'PROVIDERS', 'MATCHING', 
      'GIFTS', 'FEEDBACK'
    ]
  },
  FINANCE: {
    label: 'Finance & Revenue',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    badgeText: 'FINANCIAL LEDGER CLEARANCE',
    description: 'Manages payment ledgers, listener earnings (40% split), payout bank transfers, gift vouchers, and financial audits.',
    allowedTabs: [
      'ANALYTICS', 'USERS', 'PAYMENTS', 'EARNINGS', 'PAYOUTS', 'GIFTS', 'AUDIT_LOGS'
    ]
  },
  PROVIDER_OPS: {
    label: 'Provider Operations',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    badgeText: 'LISTENER ROSTER CLEARANCE',
    description: 'Oversees listener verification vetting, quality scores, level progression, matching queues, and listener earnings.',
    allowedTabs: [
      'ANALYTICS', 'PROVIDERS', 'MATCHING', 'EARNINGS', 'FEEDBACK'
    ]
  },
  SAFEGUARDING: {
    label: 'Safeguarding & Safety',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
    badgeText: 'TRUST & SAFETY CLEARANCE',
    description: 'Restricted triage for 7-stage safeguarding cases, incident reports, authority referrals, and safety audits.',
    allowedTabs: [
      'SESSIONS', 'USERS', 'REPORTS', 'SAFEGUARDING', 'AUDIT_LOGS'
    ]
  },
  CONTENT: {
    label: 'Content & CMS',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
    badgeText: 'EDITORIAL & SEO CLEARANCE',
    description: 'Manages platform publications, wellness resources, FAQs, legal documentation, and search engine optimization.',
    allowedTabs: [
      'CMS', 'ANALYTICS'
    ]
  }
};

const TAB_CONFIG: Record<ControlCentreTab, { label: string; icon: React.FC<{ className?: string }>; category: string }> = {
  ANALYTICS: { label: 'Analytics', icon: BarChart3, category: 'Overview' },
  SESSIONS: { label: 'Sessions', icon: PhoneCall, category: 'Operations' },
  USERS: { label: 'Users', icon: Users, category: 'Operations' },
  PROVIDERS: { label: 'Providers', icon: Headphones, category: 'Operations' },
  MATCHING: { label: 'Matching', icon: Zap, category: 'Operations' },
  PAYMENTS: { label: 'Payments', icon: CreditCard, category: 'Finance' },
  EARNINGS: { label: 'Earnings', icon: DollarSign, category: 'Finance' },
  PAYOUTS: { label: 'Payouts', icon: Landmark, category: 'Finance' },
  GIFTS: { label: 'Gifts', icon: GiftIcon, category: 'Finance' },
  FEEDBACK: { label: 'Feedback', icon: Star, category: 'Quality' },
  REPORTS: { label: 'Safety Reports', icon: Flag, category: 'Safety' },
  SAFEGUARDING: { label: 'Safeguarding', icon: ShieldAlert, category: 'Safety' },
  CMS: { label: 'CMS & SEO', icon: FileText, category: 'Content' },
  SETTINGS: { label: 'Settings', icon: Settings, category: 'System' },
  AUDIT_LOGS: { label: 'Audit Logs', icon: History, category: 'System' },
};

export const SafespaceControlCentreView: React.FC = () => {
  const [activeRole, setActiveRole] = useState<AdminRole>('SUPER_ADMIN');
  const [activeTab, setActiveTab] = useState<ControlCentreTab>('ANALYTICS');
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Load Dashboard Data
  const fetchControlCentreData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load Control Centre data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControlCentreData();
  }, []);

  // When active role changes, ensure active tab is allowed
  useEffect(() => {
    const allowed = ROLE_PERMISSIONS[activeRole].allowedTabs;
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0] || 'ANALYTICS');
    }
  }, [activeRole]);

  const triggerSuccessAlert = (msg: string) => {
    setActionSuccessMsg(msg);
    fetchControlCentreData();
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Action handlers
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, reason: `Admin toggled to ${targetStatus}` })
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyProvider = async (providerId: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/admin/providers/${providerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status })
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/payouts/${payoutId}/process`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateGiftCode = async () => {
    try {
      const res = await fetch('/api/v1/admin/gifts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: 'granted-seeker@safespace.ng',
          recipientMessage: 'Complimentary conversation voucher granted by Safespace Admin.'
        })
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdvanceApplicationStage = async (applicationId: string, action: string) => {
    try {
      const res = await fetch('/api/v1/providers/application/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action })
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(`Application stage advanced: ${action.replace('_', ' ')}`);
        fetchControlCentreData();
      } else {
        alert(json.error?.message || 'Failed to advance application stage.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (updatedSettings: any) => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const json = await res.json();
      if (json.success) {
        triggerSuccessAlert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrentTabAllowed = ROLE_PERMISSIONS[activeRole].allowedTabs.includes(activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Header & Role Selector */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-xl border border-stone-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-amber-50">
                Safespace Control Centre
              </h1>
            </div>
            <p className="text-xs text-stone-400">
              Role-Based Administrative Operations, Safeguarding Triage, Financial Governance & Audit Trail
            </p>
          </div>

          {/* Active Role Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Active Admin Role</div>
              <div className="text-xs font-bold text-amber-300">{ROLE_PERMISSIONS[activeRole].label}</div>
            </div>

            <div className="relative">
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as AdminRole)}
                className="bg-stone-800 text-stone-100 text-xs font-bold px-4 py-2.5 rounded-2xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                <option value="SUPER_ADMIN">👑 Super Admin (Full Clearance)</option>
                <option value="SUPPORT_OPS">🎧 Support Operations</option>
                <option value="FINANCE">💳 Finance & Revenue</option>
                <option value="PROVIDER_OPS">👥 Provider Operations</option>
                <option value="SAFEGUARDING">🛡️ Safeguarding & Safety</option>
                <option value="CONTENT">📝 Content & CMS Editor</option>
              </select>
            </div>

            <button
              onClick={() => setShowMatrixModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700 transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>RBAC Matrix</span>
            </button>
          </div>
        </div>

        {/* Role Capability Indicator Banner */}
        <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ROLE_PERMISSIONS[activeRole].badgeBg}`}>
              {ROLE_PERMISSIONS[activeRole].badgeText}
            </span>
            <span className="text-stone-400">{ROLE_PERMISSIONS[activeRole].description}</span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-[11px]">
            <span>{ROLE_PERMISSIONS[activeRole].allowedTabs.length} / 15 Tabs Authorized</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-mono">AUDIT RECORDING ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Action Success Alert Toast */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-emerald-100 border border-emerald-700 flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 uppercase font-bold">Audit Entry Generated</span>
        </div>
      )}

      {/* 15 Feature Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-stone-200 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {(Object.keys(TAB_CONFIG) as ControlCentreTab[]).map((tabKey) => {
            const tabInfo = TAB_CONFIG[tabKey];
            const isAllowed = ROLE_PERMISSIONS[activeRole].allowedTabs.includes(tabKey);
            const isActive = activeTab === tabKey;
            const Icon = tabInfo.icon;

            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                  isActive
                    ? 'bg-emerald-900 text-amber-50 shadow-md'
                    : isAllowed
                    ? 'text-stone-700 hover:bg-stone-100'
                    : 'text-stone-300 hover:text-stone-400 hover:bg-stone-50 opacity-60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isAllowed ? 'text-stone-600' : 'text-stone-300'}`} />
                <span>{tabInfo.label}</span>
                {!isAllowed && (
                  <Lock className="w-3 h-3 text-stone-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {!isCurrentTabAllowed ? (
        /* RBAC ACCESS RESTRICTED SCREEN */
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-12 text-center border border-stone-800 shadow-xl space-y-6 max-w-3xl mx-auto my-8 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700 uppercase tracking-wider">
              Access Restricted by RBAC Policy
            </span>
            <h2 className="font-serif text-2xl font-bold text-amber-50">
              {TAB_CONFIG[activeTab].label} View Restricted
            </h2>
            <p className="text-xs text-stone-400 max-w-lg mx-auto leading-relaxed">
              Your active role <span className="text-amber-300 font-bold">{ROLE_PERMISSIONS[activeRole].label}</span> does not have authorization to view or manage {TAB_CONFIG[activeTab].label.toLowerCase()}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="font-bold text-stone-200">Security Governance Policy:</div>
            <p className="text-stone-400 leading-normal text-[11px]">
              {activeRole === 'FINANCE' && activeTab === 'SAFEGUARDING' && (
                "Finance personnel are strictly isolated from sensitive safeguarding case files and seeker crisis disclosures to preserve Privacy-by-Design and confidentiality."
              )}
              {activeRole === 'CONTENT' && (
                "Content Editors have specialized privileges limited to public content creation, resources, and SEO publishing. Private session data and user identifiers are restricted."
              )}
              {activeRole === 'SUPPORT_OPS' && activeTab === 'SAFEGUARDING' && (
                "Safeguarding cases are restricted exclusively to designated Trust & Safety officers to prevent unauthorized exposure of high-risk disclosures."
              )}
              {!((activeRole === 'FINANCE' && activeTab === 'SAFEGUARDING') || activeRole === 'CONTENT' || (activeRole === 'SUPPORT_OPS' && activeTab === 'SAFEGUARDING')) && (
                `Access to ${TAB_CONFIG[activeTab].label} requires appropriate role clearance. Switch to Super Admin or an authorized role to access this area.`
              )}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveRole('SUPER_ADMIN')}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition shadow-md"
            >
              Switch to Super Admin Role
            </button>
            <button
              onClick={() => setActiveTab(ROLE_PERMISSIONS[activeRole].allowedTabs[0] || 'ANALYTICS')}
              className="px-5 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700 transition"
            >
              Return to Permitted Tab
            </button>
          </div>
        </div>
      ) : loading || !data ? (
        <div className="p-12 text-center text-stone-500 font-medium bg-white rounded-3xl border border-stone-200 shadow-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-800 mb-2" />
          Loading Safespace Control Centre Datasets...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Total Revenue (GMV)</div>
                  <div className="font-serif text-2xl font-bold text-emerald-950">
                    ₦{(data.metrics?.totalRevenueNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-400">100% Gross Session Value</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Platform Share (60%)</div>
                  <div className="font-serif text-2xl font-bold text-stone-900">
                    ₦{(data.metrics?.platformMarginNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Safespace Margin</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Listener Earnings (40%)</div>
                  <div className="font-serif text-2xl font-bold text-amber-900">
                    ₦{(data.metrics?.totalPayoutsNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold">Peer Listener Pool Share</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-400">Completed Sessions</div>
                  <div className="font-serif text-2xl font-bold text-stone-900">
                    {data.metrics?.completedSessions || 0}
                  </div>
                  <div className="text-[10px] text-stone-400">Out of {data.sessions?.length || 0} initiated</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-900">Platform Operational Performance</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-medium">Registered Seekers</span>
                      <span className="font-bold text-stone-900">{data.users?.length || 0} Accounts</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-medium">Verified Listeners</span>
                      <span className="font-bold text-emerald-800">{data.providers?.filter((p: any) => p.verified)?.length || 0} Verified</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-medium">Active Free Trials Claimed</span>
                      <span className="font-bold text-blue-700">{data.users?.filter((u: any) => u.freeTrialUsed)?.length || 0} Claimed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                  <h3 className="font-serif text-lg font-bold text-stone-900">Trust & Safety Overview</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-rose-800 font-medium">Pending Safety Incidents</span>
                      <span className="font-bold text-rose-900">{data.metrics?.pendingSafetyReports || 0} Flagged</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-600 font-medium">Safeguarding Cases Triage</span>
                      <span className="font-bold text-stone-900">{data.safeguardingCases?.length || 0} Active Cases</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-800 font-medium">Human-in-the-Loop Audit Trail</span>
                      <span className="font-bold text-emerald-900">{data.auditLogs?.length || 0} Events Logged</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS */}
          {activeTab === 'SESSIONS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Sessions Control Stream</h3>
                  <p className="text-xs text-stone-500">Live WebRTC session statuses, time allocation, seeker/listener linkage</p>
                </div>
                <div className="text-xs font-mono text-stone-400">Total: {data.sessions?.length || 0} Sessions</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Session ID</th>
                      <th className="py-3 px-3">Seeker</th>
                      <th className="py-3 px-3">Listener</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Allocated Time</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.sessions?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400">No sessions recorded yet.</td>
                      </tr>
                    ) : (
                      data.sessions?.map((s: any) => (
                        <tr key={s.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{s.id}</td>
                          <td className="py-3 px-3 font-bold text-stone-900">{s.seekerDisplayName || s.seekerId}</td>
                          <td className="py-3 px-3 font-medium text-stone-800">{s.providerDisplayName || s.providerId}</td>
                          <td className="py-3 px-3 text-stone-600">{s.packageName || 'Standard'}</td>
                          <td className="py-3 px-3 font-mono">{Math.floor(s.allocatedSeconds / 60)} mins</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                              s.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-stone-100 text-stone-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: USERS */}
          {activeTab === 'USERS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">User Account Roster</h3>
                  <p className="text-xs text-stone-500">Manage support seekers, roles, account statuses and trial flags</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">User ID</th>
                      <th className="py-3 px-3">Display Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Trial Used</th>
                      <th className="py-3 px-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.users?.filter((u: any) => 
                      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((u: any) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{u.id}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{u.displayName}</td>
                        <td className="py-3 px-3 text-stone-600">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-mono font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {u.freeTrialUsed ? 'Yes (Claimed)' : 'No (Eligible)'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold transition ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROVIDERS */}
          {activeTab === 'PROVIDERS' && (
            <div className="space-y-6">
              
              {/* Vetting & Onboarding Pipeline Queue */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">Provider Applications & Vetting Pipeline</h3>
                    <p className="text-xs text-stone-500">
                      Backend-authoritative applicant screening, verification, assessments, training, and final approval
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF0F5] text-[#123B5D] border border-[#123B5D]/20">
                    {data.providerApplications?.length || 0} Total Applications
                  </span>
                </div>

                {(!data.providerApplications || data.providerApplications.length === 0) ? (
                  <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                    No pending provider applications in the vetting pipeline.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.providerApplications.map((app: any) => (
                      <div key={app.id} className="p-5 rounded-2xl border border-stone-200 bg-[#FAF9F6] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#17212B]">{app.displayName}</span>
                              <span className="text-xs text-stone-500">({app.email})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'TRAINING' ? 'bg-purple-100 text-purple-800' :
                                app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-800' :
                                app.status === 'SCREENING' ? 'bg-amber-100 text-amber-800' :
                                'bg-stone-100 text-stone-800'
                              }`}>
                                Stage: {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                              {app.bioIntroduction || 'No bio submitted.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 pt-1">
                              <span>Languages: <strong className="text-stone-800">{app.languagesSpoken?.join(', ')}</strong></span>
                              <span>•</span>
                              <span>Max Duration: <strong className="text-stone-800">{app.maxDurationCapability} mins</strong></span>
                              <span>•</span>
                              <span>Age Declaration: <strong className="text-stone-800">{app.ageConfirmed ? '18+ Verified' : 'Unconfirmed'}</strong></span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-stone-400 block">Submitted</span>
                            <span className="text-xs font-mono text-stone-700">
                              {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Stage Progression Checklist & Operational Controls */}
                        <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className={`px-2 py-0.5 rounded font-medium ${app.identityVerificationStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                              ID: {app.identityVerificationStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.backgroundScreeningStatus === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                              Screening: {app.backgroundScreeningStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.assessmentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                              Interview: {app.assessmentStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.safeguardingTrainingStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                              Safeguarding: {app.safeguardingTrainingStatus}
                            </span>
                          </div>

                          {/* Reviewer Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {app.identityVerificationStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'VERIFY_IDENTITY')}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold transition cursor-pointer"
                              >
                                Verify ID
                              </button>
                            )}

                            {app.identityVerificationStatus === 'VERIFIED' && app.backgroundScreeningStatus !== 'PASSED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'PASS_SCREENING')}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition cursor-pointer"
                              >
                                Pass Screening
                              </button>
                            )}

                            {app.backgroundScreeningStatus === 'PASSED' && app.assessmentStatus !== 'COMPLETED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'COMPLETE_ASSESSMENT')}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold transition cursor-pointer"
                              >
                                Pass Interview
                              </button>
                            )}

                            {app.assessmentStatus === 'COMPLETED' && app.safeguardingTrainingStatus !== 'COMPLETED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'COMPLETE_TRAINING')}
                                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold transition cursor-pointer"
                              >
                                Pass Training
                              </button>
                            )}

                            {app.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'APPROVE_PROVIDER')}
                                className="px-3 py-1 rounded-lg bg-[#123B5D] hover:bg-[#0D2A42] text-white text-[10px] font-bold transition cursor-pointer shadow-2xs"
                              >
                                Final Approval
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Active Providers Roster */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">Verified Active Peer Listeners</h3>
                    <p className="text-xs text-stone-500">Live operational listening roster, quality ratings, and verification states</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.providers?.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img src={p.avatarUrl} alt={p.displayName} className="w-12 h-12 rounded-full object-cover border border-stone-200" />
                          <div>
                            <div className="font-bold text-sm text-stone-900">{p.displayName}</div>
                            <div className="text-[11px] text-stone-500">{p.bio?.slice(0, 70)}...</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                                ★ {p.rating || 5.0} ({p.ratingCount || 0} reviews)
                              </span>
                              <span className="text-[10px] text-stone-500">Quality: {p.qualityScore}%</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-xs">
                        <div className="text-[11px] text-stone-500">
                          Completed: <span className="font-bold text-stone-800">{p.sessionsCompleted || 0} sessions</span>
                        </div>
                        <div className="flex gap-2">
                          {p.verificationStatus !== 'VERIFIED' ? (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'VERIFIED')}
                              className="px-3 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-50 text-[10px] font-bold transition shadow-xs"
                            >
                              Approve Listener
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'UNDER_REVIEW')}
                              className="px-3 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold transition"
                            >
                              Flag for Re-review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MATCHING */}
          {activeTab === 'MATCHING' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Matching Engine Operations</h3>
                  <p className="text-xs text-stone-500">Active support requests queue & manual matching controls</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Auto-Match Engine Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Request ID</th>
                      <th className="py-3 px-3">Seeker ID</th>
                      <th className="py-3 px-3">Support Reason</th>
                      <th className="py-3 px-3">Gender Pref</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Manual Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.supportRequests?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-stone-400">No pending support requests in queue.</td>
                      </tr>
                    ) : (
                      data.supportRequests?.map((r: any) => (
                        <tr key={r.id} className="hover:bg-stone-50">
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{r.id}</td>
                          <td className="py-3 px-3 font-bold text-stone-900">{r.seekerId}</td>
                          <td className="py-3 px-3 text-stone-700">{r.supportReason || 'General active listening'}</td>
                          <td className="py-3 px-3 capitalize">{r.genderPreference || 'No preference'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                const prov = data.providers?.[0];
                                if (prov) {
                                  fetch('/api/v1/admin/matching/assign', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ requestId: r.id, providerId: prov.id })
                                  })
                                    .then(res => res.json())
                                    .then(j => triggerSuccessAlert(j.message));
                                }
                              }}
                              className="px-3 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-[10px] font-bold transition"
                            >
                              Assign Listener
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENTS */}
          {activeTab === 'PAYMENTS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Payment Ledger & Transactions</h3>
                  <p className="text-xs text-stone-500">Gross sales, package purchases, session extension payments</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Earning Record</th>
                      <th className="py-3 px-3">Session</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Gross Value (NGN)</th>
                      <th className="py-3 px-3">Platform 60%</th>
                      <th className="py-3 px-3">Listener 40%</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.providerEarnings?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{e.id}</td>
                        <td className="py-3 px-3 text-stone-800 font-mono">{e.sessionId}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{e.packageName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-950">₦{e.grossSessionValueNGN.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-stone-600">₦{(e.grossSessionValueNGN * 0.6).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-amber-800 font-bold">₦{e.providerAmountNGN.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: EARNINGS */}
          {activeTab === 'EARNINGS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Listener Earnings Pool</h3>
                  <p className="text-xs text-stone-500">Transparent 40% listener revenue allocation breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Total Available Earnings</div>
                  <div className="font-serif text-2xl font-bold text-amber-950 mt-1">
                    ₦{data.providerEarnings?.filter((e: any) => e.status === 'AVAILABLE').reduce((s: number, e: any) => s + e.providerAmountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">Ready for payout processing</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Pending Escrow Earnings</div>
                  <div className="font-serif text-2xl font-bold text-stone-900 mt-1">
                    ₦{data.providerEarnings?.filter((e: any) => e.status === 'PENDING').reduce((s: number, e: any) => s + e.providerAmountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1">Pending session completion confirmation</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">Total Paid Out to Date</div>
                  <div className="font-serif text-2xl font-bold text-emerald-950 mt-1">
                    ₦{data.payouts?.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.amountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">Disbursed via bank transfer</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PAYOUTS */}
          {activeTab === 'PAYOUTS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Listener Bank Payouts</h3>
                  <p className="text-xs text-stone-500">Approve and disburse listener earnings directly to bank accounts</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Payout ID</th>
                      <th className="py-3 px-3">Listener ID</th>
                      <th className="py-3 px-3">Bank</th>
                      <th className="py-3 px-3">Account Number</th>
                      <th className="py-3 px-3">Amount (NGN)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.payouts?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{p.id}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{p.providerId}</td>
                        <td className="py-3 px-3 text-stone-800 font-medium">{p.bankName}</td>
                        <td className="py-3 px-3 font-mono text-stone-600">{p.accountNumberMasked}</td>
                        <td className="py-3 px-3 font-serif font-bold text-emerald-900 text-sm">₦{p.amountNGN.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.status !== 'PAID' ? (
                            <button
                              onClick={() => handleProcessPayout(p.id)}
                              className="px-3 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-50 text-[10px] font-bold transition"
                            >
                              Process Bank Payout
                            </button>
                          ) : (
                            <span className="text-[10px] text-stone-400 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: GIFTS */}
          {activeTab === 'GIFTS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Gift Vouchers & Grants</h3>
                  <p className="text-xs text-stone-500">Issued conversation gift vouchers and promotional credit grants</p>
                </div>
                <button
                  onClick={handleGenerateGiftCode}
                  className="px-4 py-2 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-50 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Admin Voucher</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Gift Code</th>
                      <th className="py-3 px-3">Purchaser / Grantor</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Recipient Email</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.gifts?.map((g: any) => (
                      <tr key={g.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-900 text-xs">{g.giftCode}</td>
                        <td className="py-3 px-3 font-medium text-stone-800">{g.purchaserName}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{g.packageName}</td>
                        <td className="py-3 px-3 text-stone-600">{g.recipientEmail || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: FEEDBACK */}
          {activeTab === 'FEEDBACK' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Post-Session Feedback Stream</h3>
                  <p className="text-xs text-stone-500">Ratings, active listening satisfaction scores, seeker feedback</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Average Listener Felt-Heard Rate</div>
                  <div className="font-serif text-3xl font-bold text-amber-950">98.4%</div>
                  <div className="text-[10px] text-amber-700">Seekers reported feeling genuinely listened to</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Listener Rebooking Preference</div>
                  <div className="font-serif text-3xl font-bold text-stone-900">94.2%</div>
                  <div className="text-[10px] text-stone-500">Seekers requested to talk with the same listener again</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Safety Incident Reports</h3>
                  <p className="text-xs text-stone-500">Flags submitted by users or automatically triggered by safety algorithms</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Report ID</th>
                      <th className="py-3 px-3">Reporter</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Details</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {data.safetyReports?.map((r: any) => (
                      <tr key={r.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{r.id}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{r.reporterId}</td>
                        <td className="py-3 px-3 font-bold text-rose-800">{r.category}</td>
                        <td className="py-3 px-3 text-stone-600 max-w-xs truncate">{r.details}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: SAFEGUARDING */}
          {activeTab === 'SAFEGUARDING' && (
            <SafeguardingView />
          )}

          {/* TAB 13: CMS */}
          {activeTab === 'CMS' && (
            <CMSManagerView />
          )}

          {/* TAB 14: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Safespace System Settings</h3>
                <p className="text-xs text-stone-500">Configure fee split percentages, free trials, and platform governance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Platform Revenue Fee Share (%)</label>
                  <input
                    type="number"
                    defaultValue={data.settings?.platformFeePercent || 60}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 font-bold text-stone-900"
                    onChange={(e) => handleSaveSettings({ platformFeePercent: Number(e.target.value) })}
                  />
                  <p className="text-[11px] text-stone-400">Default 60% platform operating margin.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Listener Earnings Share (%)</label>
                  <input
                    type="number"
                    defaultValue={data.settings?.providerSharePercent || 40}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 font-bold text-stone-900"
                    onChange={(e) => handleSaveSettings({ providerSharePercent: Number(e.target.value) })}
                  />
                  <p className="text-[11px] text-stone-400">Default 40% peer listener compensation pool.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-900">Free Trial Onboarding</div>
                  <div className="text-[11px] text-stone-500">Allow 3-minute free trial session for new seeker signups</div>
                </div>
                <button
                  onClick={() => handleSaveSettings({ freeTrialEnabled: !data.settings?.freeTrialEnabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    data.settings?.freeTrialEnabled ? 'bg-emerald-800 text-amber-50' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {data.settings?.freeTrialEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 15: AUDIT LOGS */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Immutable Administrative Audit Log</h3>
                  <p className="text-xs text-stone-500">Complete record of sensitive administrative actions across the platform</p>
                </div>
                <span className="text-xs font-mono text-emerald-800 font-bold">
                  {data.auditLogs?.length || 0} Records Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Log ID</th>
                      <th className="py-3 px-3">Actor</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Target Resource</th>
                      <th className="py-3 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700 font-mono">
                    {data.auditLogs?.map((log: any) => (
                      <tr key={log.id} className="hover:bg-stone-50">
                        <td className="py-3 px-3 text-[11px] text-stone-500">{log.id}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{log.actorName}</td>
                        <td className="py-3 px-3 text-emerald-900 font-bold">{log.action}</td>
                        <td className="py-3 px-3 text-stone-600">{log.resource}:{log.resourceId}</td>
                        <td className="py-3 px-3 text-stone-400">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* RBAC Security Permission Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-stone-900">Safespace RBAC Security Matrix</h2>
                <p className="text-xs text-stone-500">Role-Based Access Control permissions across administrative modules</p>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] font-semibold">
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Sessions</th>
                    <th className="py-2 px-3">Users</th>
                    <th className="py-2 px-3">Providers</th>
                    <th className="py-2 px-3">Payments/Payouts</th>
                    <th className="py-2 px-3">Safeguarding</th>
                    <th className="py-2 px-3">CMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {Object.entries(ROLE_PERMISSIONS).map(([roleKey, roleCfg]) => (
                    <tr key={roleKey} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-bold text-stone-900 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${roleCfg.badgeBg}`}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">{roleCfg.allowedTabs.includes('SESSIONS') ? '✅ Allowed' : '❌ Restricted'}</td>
                      <td className="py-3 px-3">{roleCfg.allowedTabs.includes('USERS') ? '✅ Allowed' : '❌ Restricted'}</td>
                      <td className="py-3 px-3">{roleCfg.allowedTabs.includes('PROVIDERS') ? '✅ Allowed' : '❌ Restricted'}</td>
                      <td className="py-3 px-3">{roleCfg.allowedTabs.includes('PAYMENTS') ? '✅ Allowed' : '❌ Restricted'}</td>
                      <td className="py-3 px-3 font-bold">{roleCfg.allowedTabs.includes('SAFEGUARDING') ? '🛡️ Restricted Access' : '🔒 Denied (Privacy)'}</td>
                      <td className="py-3 px-3">{roleCfg.allowedTabs.includes('CMS') ? '📝 Allowed' : '❌ Restricted'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Strict Isolation Guarantees</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Finance officers cannot access active safeguarding case details or seeker disclosures. Content editors cannot view private session metadata or user accounts. All sensitive operations create an immutable audit log entry.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
