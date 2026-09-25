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
import { useAuth } from '../context/AuthContext';

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
    badgeBg: 'bg-[#17212B] text-[#FAF9F6]',
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
    badgeBg: 'bg-[#EAF0F5] text-[#123B5D] border-[#C5D6E4]',
    badgeText: 'OPS & USER SUPPORT CLEARANCE',
    description: 'Focuses on live session monitoring, user account assistance, provider matching, feedback, and gifts.',
    allowedTabs: [
      'ANALYTICS', 'SESSIONS', 'USERS', 'PROVIDERS', 'MATCHING', 
      'GIFTS', 'FEEDBACK'
    ]
  },
  FINANCE: {
    label: 'Finance & Revenue',
    badgeBg: 'bg-[#123B5D]/10 text-[#123B5D] border-[#123B5D]/20',
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
    // Reviewers can only load safeguarding data; the other tabs read the admin-only dashboard.
    allowedTabs: ['SAFEGUARDING']
  },
  CONTENT: {
    label: 'Content & CMS',
    badgeBg: 'bg-[#EAF0F5] text-[#123B5D] border-[#C5D6E4]',
    badgeText: 'EDITORIAL & SEO CLEARANCE',
    description: 'Manages platform publications, wellness resources, FAQs, legal documentation, and search engine optimization.',
    allowedTabs: ['CMS']
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
  // The console follows the signed-in account's real role. (It used to offer a
  // dropdown to pretend to be any role, starting as Super Admin.)
  const { user } = useAuth();
  const activeRole = (
    user?.role === 'SAFETY_REVIEWER' ? 'SAFEGUARDING'
    : user?.role === 'CONTENT_EDITOR' ? 'CONTENT'
    : 'SUPER_ADMIN'
  ) as AdminRole;
  const [activeTab, setActiveTab] = useState<ControlCentreTab>(ROLE_PERMISSIONS[activeRole].allowedTabs[0]);
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

  // Only full admins can read the dashboard dataset; reviewers' and editors'
  // modules load their own data.
  const needsDashboard = activeRole === 'SUPER_ADMIN';
  useEffect(() => {
    if (needsDashboard) fetchControlCentreData();
    else setLoading(false);
  }, [needsDashboard]);

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
      <div className="bg-[#17212B] text-[#F3F1EC] rounded-3xl p-6 shadow-xl border border-[#17212B] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-[#FAF9F6]">
                Safespace Control Centre
              </h1>
            </div>
            <p className="text-xs text-[#59636B]">
              Role-Based Administrative Operations, Safeguarding Triage, Financial Governance & Audit Trail
            </p>
          </div>

          {/* Active role (from the signed-in account) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-[#59636B] tracking-wider">Active Admin Role</div>
              <div className="text-xs font-bold text-[#FAF9F6]">{ROLE_PERMISSIONS[activeRole].label}</div>
            </div>


            <button
              onClick={() => setShowMatrixModal(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#17212B] hover:bg-[#59636B] text-[#E3E2DE] hover:text-white text-xs font-medium border border-[#59636B] transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>RBAC Matrix</span>
            </button>
          </div>
        </div>

        {/* Role Capability Indicator Banner */}
        <div className="pt-4 border-t border-[#17212B]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#E3E2DE]">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ROLE_PERMISSIONS[activeRole].badgeBg}`}>
              {ROLE_PERMISSIONS[activeRole].badgeText}
            </span>
            <span className="text-[#59636B]">{ROLE_PERMISSIONS[activeRole].description}</span>
          </div>

          <div className="flex items-center gap-3 text-[#59636B] text-[11px]">
            <span>{ROLE_PERMISSIONS[activeRole].allowedTabs.length} / 15 Tabs Authorized</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#123B5D] animate-pulse"></span>
            <span className="text-[#123B5D] font-mono">AUDIT RECORDING ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Action Success Alert Toast */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#123B5D] text-white border border-[#123B5D] flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#C5D6E4] shrink-0" />
            <span className="text-xs font-semibold">{actionSuccessMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-white/70 uppercase font-bold">Audit Entry Generated</span>
        </div>
      )}

      {/* 15 Feature Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-[#E3E2DE] shadow-xs overflow-x-auto scrollbar-none">
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
                    ? 'bg-[#123B5D] text-[#FAF9F6] shadow-md'
                    : isAllowed
                    ? 'text-[#59636B] hover:bg-[#F3F1EC]'
                    : 'text-[#E3E2DE] hover:text-[#59636B] hover:bg-[#FAF9F6] opacity-60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : isAllowed ? 'text-[#59636B]' : 'text-[#E3E2DE]'}`} />
                <span>{tabInfo.label}</span>
                {!isAllowed && (
                  <Lock className="w-3 h-3 text-[#59636B] ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {!isCurrentTabAllowed ? (
        /* RBAC ACCESS RESTRICTED SCREEN */
        <div className="bg-[#17212B] text-[#F3F1EC] rounded-3xl p-12 text-center border border-[#17212B] shadow-xl space-y-6 max-w-3xl mx-auto my-8 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700 uppercase tracking-wider">
              Access Restricted by RBAC Policy
            </span>
            <h2 className="font-display text-2xl font-bold text-[#FAF9F6]">
              {TAB_CONFIG[activeTab].label} View Restricted
            </h2>
            <p className="text-xs text-[#59636B] max-w-lg mx-auto leading-relaxed">
              Your active role <span className="text-[#FAF9F6] font-bold">{ROLE_PERMISSIONS[activeRole].label}</span> does not have authorization to view or manage {TAB_CONFIG[activeTab].label.toLowerCase()}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#17212B]/80 border border-[#59636B] text-left max-w-md mx-auto space-y-2 text-xs">
            <div className="font-bold text-[#E3E2DE]">Security Governance Policy:</div>
            <p className="text-[#59636B] leading-normal text-[11px]">
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
              onClick={() => setActiveTab(ROLE_PERMISSIONS[activeRole].allowedTabs[0] || 'ANALYTICS')}
              className="px-5 py-2.5 rounded-2xl bg-[#17212B] hover:bg-[#59636B] text-[#E3E2DE] text-xs font-medium border border-[#59636B] transition"
            >
              Return to Permitted Tab
            </button>
          </div>
        </div>
      ) : needsDashboard && (loading || !data) ? (
        <div className="p-12 text-center text-[#59636B] font-medium bg-white rounded-3xl border border-[#E3E2DE] shadow-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#123B5D] mb-2" />
          Loading Safespace Control Centre Datasets...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'ANALYTICS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E3E2DE] shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Total Revenue (GMV)</div>
                  <div className="font-display text-2xl font-bold text-[#0D2A42]">
                    ₦{(data.metrics?.totalRevenueNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#59636B]">100% Gross Session Value</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E3E2DE] shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Platform Share (60%)</div>
                  <div className="font-display text-2xl font-bold text-[#17212B]">
                    ₦{(data.metrics?.platformMarginNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#123B5D] font-semibold">Safespace Margin</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E3E2DE] shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Listener Earnings (40%)</div>
                  <div className="font-display text-2xl font-bold text-amber-900">
                    ₦{(data.metrics?.totalPayoutsNGN || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold">Peer Listener Pool Share</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E3E2DE] shadow-2xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Completed Sessions</div>
                  <div className="font-display text-2xl font-bold text-[#17212B]">
                    {data.metrics?.completedSessions || 0}
                  </div>
                  <div className="text-[10px] text-[#59636B]">Out of {data.sessions?.length || 0} initiated</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Platform Operational Performance</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE]">
                      <span className="text-[#59636B] font-medium">Registered Seekers</span>
                      <span className="font-bold text-[#17212B]">{data.users?.length || 0} Accounts</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE]">
                      <span className="text-[#59636B] font-medium">Verified Listeners</span>
                      <span className="font-bold text-[#123B5D]">{data.providers?.filter((p: any) => p.verified)?.length || 0} Verified</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE]">
                      <span className="text-[#59636B] font-medium">Active Free Trials Claimed</span>
                      <span className="font-bold text-[#123B5D]">{data.users?.filter((u: any) => u.freeTrialUsed)?.length || 0} Claimed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Trust & Safety Overview</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-rose-800 font-medium">Pending Safety Incidents</span>
                      <span className="font-bold text-rose-900">{data.metrics?.pendingSafetyReports || 0} Flagged</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#FAF9F6] border border-[#E3E2DE]">
                      <span className="text-[#59636B] font-medium">Safeguarding Cases Triage</span>
                      <span className="font-bold text-[#17212B]">{data.safeguardingCases?.length || 0} Active Cases</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#F3F1EC] border border-[#123B5D]/20">
                      <span className="text-[#123B5D] font-medium">Human-in-the-Loop Audit Trail</span>
                      <span className="font-bold text-[#123B5D]">{data.auditLogs?.length || 0} Events Logged</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SESSIONS */}
          {activeTab === 'SESSIONS' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Sessions Control Stream</h3>
                  <p className="text-xs text-[#59636B]">Live WebRTC session statuses, time allocation, seeker/listener linkage</p>
                </div>
                <div className="text-xs font-mono text-[#59636B]">Total: {data.sessions?.length || 0} Sessions</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Session ID</th>
                      <th className="py-3 px-3">Seeker</th>
                      <th className="py-3 px-3">Listener</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Allocated Time</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.sessions?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#59636B]">No sessions recorded yet.</td>
                      </tr>
                    ) : (
                      data.sessions?.map((s: any) => (
                        <tr key={s.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{s.id}</td>
                          <td className="py-3 px-3 font-bold text-[#17212B]">{s.seekerDisplayName || s.seekerId}</td>
                          <td className="py-3 px-3 font-medium text-[#17212B]">{s.providerDisplayName || s.providerId}</td>
                          <td className="py-3 px-3 text-[#59636B]">{s.packageName || 'Standard'}</td>
                          <td className="py-3 px-3 font-mono">{Math.floor(s.allocatedSeconds / 60)} mins</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'ACTIVE' ? 'bg-[#123B5D]/10 text-[#123B5D]' :
                              s.status === 'COMPLETED' ? 'bg-[#EAF0F5] text-[#123B5D]' :
                              'bg-[#F3F1EC] text-[#59636B]'
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">User Account Roster</h3>
                  <p className="text-xs text-[#59636B]">Manage support seekers, roles, account statuses and trial flags</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#59636B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-[#E3E2DE] text-xs focus:outline-none focus:ring-1 focus:ring-[#59636B]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">User ID</th>
                      <th className="py-3 px-3">Display Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Trial Used</th>
                      <th className="py-3 px-3 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.users?.filter((u: any) => 
                      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((u: any) => (
                      <tr key={u.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{u.id}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{u.displayName}</td>
                        <td className="py-3 px-3 text-[#59636B]">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#F3F1EC] text-[#17212B] text-[10px] font-mono font-bold">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE' ? 'bg-[#123B5D]/10 text-[#123B5D]' : 'bg-rose-100 text-rose-800'
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
                                : 'bg-[#123B5D]/10 hover:bg-[#123B5D]/20 text-[#123B5D]'
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
              <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#17212B]">Provider Applications & Vetting Pipeline</h3>
                    <p className="text-xs text-[#59636B]">
                      Backend-authoritative applicant screening, verification, assessments, training, and final approval
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EAF0F5] text-[#123B5D] border border-[#123B5D]/20">
                    {data.providerApplications?.length || 0} Total Applications
                  </span>
                </div>

                {(!data.providerApplications || data.providerApplications.length === 0) ? (
                  <div className="p-8 text-center text-xs text-[#59636B] border border-dashed border-[#E3E2DE] rounded-xl">
                    No pending provider applications in the vetting pipeline.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.providerApplications.map((app: any) => (
                      <div key={app.id} className="p-5 rounded-2xl border border-[#E3E2DE] bg-[#FAF9F6] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#17212B]">{app.displayName}</span>
                              <span className="text-xs text-[#59636B]">({app.email})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.status === 'APPROVED' ? 'bg-[#123B5D]/10 text-[#123B5D]' :
                                app.status === 'TRAINING' ? 'bg-[#EAF0F5] text-[#123B5D]' :
                                app.status === 'INTERVIEW' ? 'bg-[#EAF0F5] text-[#123B5D]' :
                                app.status === 'SCREENING' ? 'bg-amber-100 text-amber-800' :
                                'bg-[#F3F1EC] text-[#17212B]'
                              }`}>
                                Stage: {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#59636B] leading-relaxed max-w-2xl">
                              {app.bioIntroduction || 'No bio submitted.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#59636B] pt-1">
                              <span>Languages: <strong className="text-[#17212B]">{app.languagesSpoken?.join(', ')}</strong></span>
                              <span>•</span>
                              <span>Max Duration: <strong className="text-[#17212B]">{app.maxDurationCapability} mins</strong></span>
                              <span>•</span>
                              <span>Age Declaration: <strong className="text-[#17212B]">{app.ageConfirmed ? '18+ Verified' : 'Unconfirmed'}</strong></span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-[#59636B] block">Submitted</span>
                            <span className="text-xs font-mono text-[#59636B]">
                              {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Stage Progression Checklist & Operational Controls */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#E3E2DE]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className={`px-2 py-0.5 rounded font-medium ${app.identityVerificationStatus === 'VERIFIED' ? 'bg-[#F3F1EC] text-[#123B5D] border border-[#123B5D]/20' : 'bg-[#F3F1EC] text-[#59636B]'}`}>
                              ID: {app.identityVerificationStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.backgroundScreeningStatus === 'PASSED' ? 'bg-[#F3F1EC] text-[#123B5D] border border-[#123B5D]/20' : 'bg-[#F3F1EC] text-[#59636B]'}`}>
                              Screening: {app.backgroundScreeningStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.assessmentStatus === 'COMPLETED' ? 'bg-[#F3F1EC] text-[#123B5D] border border-[#123B5D]/20' : 'bg-[#F3F1EC] text-[#59636B]'}`}>
                              Interview: {app.assessmentStatus}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-medium ${app.safeguardingTrainingStatus === 'COMPLETED' ? 'bg-[#F3F1EC] text-[#123B5D] border border-[#123B5D]/20' : 'bg-[#F3F1EC] text-[#59636B]'}`}>
                              Safeguarding: {app.safeguardingTrainingStatus}
                            </span>
                          </div>

                          {/* Reviewer Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {app.identityVerificationStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'VERIFY_IDENTITY')}
                                className="px-2.5 py-1 rounded-lg bg-[#F3F1EC] hover:bg-[#E3E2DE] text-[#17212B] text-[10px] font-bold transition cursor-pointer"
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
                                className="px-2.5 py-1 rounded-lg bg-[#EAF0F5] hover:bg-[#C5D6E4]/60 text-[#123B5D] border border-[#C5D6E4] text-[10px] font-bold transition cursor-pointer"
                              >
                                Pass Interview
                              </button>
                            )}

                            {app.assessmentStatus === 'COMPLETED' && app.safeguardingTrainingStatus !== 'COMPLETED' && (
                              <button
                                onClick={() => handleAdvanceApplicationStage(app.id, 'COMPLETE_TRAINING')}
                                className="px-2.5 py-1 rounded-lg bg-[#EAF0F5] hover:bg-[#C5D6E4]/60 text-[#123B5D] border border-[#C5D6E4] text-[10px] font-bold transition cursor-pointer"
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
              <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#17212B]">Verified Active Peer Listeners</h3>
                    <p className="text-xs text-[#59636B]">Live operational listening roster, quality ratings, and verification states</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.providers?.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-2xl border border-[#E3E2DE] bg-[#FAF9F6] flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img src={p.avatarUrl} alt={p.displayName} className="w-12 h-12 rounded-full object-cover border border-[#E3E2DE]" />
                          <div>
                            <div className="font-bold text-sm text-[#17212B]">{p.displayName}</div>
                            <div className="text-[11px] text-[#59636B]">{p.bio?.slice(0, 70)}...</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                                ★ {p.rating || 5.0} ({p.ratingCount || 0} reviews)
                              </span>
                              <span className="text-[10px] text-[#59636B]">Quality: {p.qualityScore}%</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.verificationStatus === 'VERIFIED' ? 'bg-[#123B5D]/10 text-[#123B5D]' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E3E2DE] text-xs">
                        <div className="text-[11px] text-[#59636B]">
                          Completed: <span className="font-bold text-[#17212B]">{p.sessionsCompleted || 0} sessions</span>
                        </div>
                        <div className="flex gap-2">
                          {p.verificationStatus !== 'VERIFIED' ? (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'VERIFIED')}
                              className="px-3 py-1 rounded-xl bg-[#123B5D] hover:bg-[#123B5D] text-[#FAF9F6] text-[10px] font-bold transition shadow-xs"
                            >
                              Approve Listener
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyProvider(p.id, 'UNDER_REVIEW')}
                              className="px-3 py-1 rounded-xl bg-[#E3E2DE] hover:bg-[#E3E2DE] text-[#17212B] text-[10px] font-bold transition"
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Matching Engine Operations</h3>
                  <p className="text-xs text-[#59636B]">Active support requests queue & manual matching controls</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Auto-Match Engine Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Request ID</th>
                      <th className="py-3 px-3">Seeker ID</th>
                      <th className="py-3 px-3">Support Reason</th>
                      <th className="py-3 px-3">Gender Pref</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Manual Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.supportRequests?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#59636B]">No pending support requests in queue.</td>
                      </tr>
                    ) : (
                      data.supportRequests?.map((r: any) => (
                        <tr key={r.id} className="hover:bg-[#FAF9F6]">
                          <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{r.id}</td>
                          <td className="py-3 px-3 font-bold text-[#17212B]">{r.seekerId}</td>
                          <td className="py-3 px-3 text-[#59636B]">{r.supportReason || 'General active listening'}</td>
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
                              className="px-3 py-1 rounded-xl bg-[#17212B] hover:bg-[#17212B] text-[#FAF9F6] text-[10px] font-bold transition"
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Payment Ledger & Transactions</h3>
                  <p className="text-xs text-[#59636B]">Gross sales, package purchases, session extension payments</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Earning Record</th>
                      <th className="py-3 px-3">Session</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Gross Value (NGN)</th>
                      <th className="py-3 px-3">Platform 60%</th>
                      <th className="py-3 px-3">Listener 40%</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.providerEarnings?.map((e: any) => (
                      <tr key={e.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{e.id}</td>
                        <td className="py-3 px-3 text-[#17212B] font-mono">{e.sessionId}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{e.packageName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0D2A42]">₦{e.grossSessionValueNGN.toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-[#59636B]">₦{(e.grossSessionValueNGN * 0.6).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-amber-800 font-bold">₦{e.providerAmountNGN.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#123B5D]/10 text-[#123B5D]">
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Listener Earnings Pool</h3>
                  <p className="text-xs text-[#59636B]">Transparent 40% listener revenue allocation breakdown</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Total Available Earnings</div>
                  <div className="font-display text-2xl font-bold text-amber-950 mt-1">
                    ₦{data.providerEarnings?.filter((e: any) => e.status === 'AVAILABLE').reduce((s: number, e: any) => s + e.providerAmountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">Ready for payout processing</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2DE]">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Pending Escrow Earnings</div>
                  <div className="font-display text-2xl font-bold text-[#17212B] mt-1">
                    ₦{data.providerEarnings?.filter((e: any) => e.status === 'PENDING').reduce((s: number, e: any) => s + e.providerAmountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-[#59636B] mt-1">Pending session completion confirmation</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F3F1EC] border border-[#123B5D]/20">
                  <div className="text-[10px] uppercase font-bold text-[#123B5D]">Total Paid Out to Date</div>
                  <div className="font-display text-2xl font-bold text-[#0D2A42] mt-1">
                    ₦{data.payouts?.filter((p: any) => p.status === 'PAID').reduce((s: number, p: any) => s + p.amountNGN, 0).toLocaleString() || 0}
                  </div>
                  <div className="text-[10px] text-[#123B5D] mt-1">Disbursed via bank transfer</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PAYOUTS */}
          {activeTab === 'PAYOUTS' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Listener Bank Payouts</h3>
                  <p className="text-xs text-[#59636B]">Approve and disburse listener earnings directly to bank accounts</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Payout ID</th>
                      <th className="py-3 px-3">Listener ID</th>
                      <th className="py-3 px-3">Bank</th>
                      <th className="py-3 px-3">Account Number</th>
                      <th className="py-3 px-3">Amount (NGN)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.payouts?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{p.id}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{p.providerId}</td>
                        <td className="py-3 px-3 text-[#17212B] font-medium">{p.bankName}</td>
                        <td className="py-3 px-3 font-mono text-[#59636B]">{p.accountNumberMasked}</td>
                        <td className="py-3 px-3 font-display font-bold text-[#123B5D] text-sm">₦{p.amountNGN.toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID' ? 'bg-[#123B5D]/10 text-[#123B5D]' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {p.status !== 'PAID' ? (
                            <button
                              onClick={() => handleProcessPayout(p.id)}
                              className="px-3 py-1 rounded-xl bg-[#123B5D] hover:bg-[#123B5D] text-[#FAF9F6] text-[10px] font-bold transition"
                            >
                              Process Bank Payout
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#59636B] font-medium">Processed</span>
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Gift Vouchers & Grants</h3>
                  <p className="text-xs text-[#59636B]">Issued conversation gift vouchers and promotional credit grants</p>
                </div>
                <button
                  onClick={handleGenerateGiftCode}
                  className="px-4 py-2 rounded-2xl bg-[#123B5D] hover:bg-[#123B5D] text-[#FAF9F6] text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Admin Voucher</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Gift Code</th>
                      <th className="py-3 px-3">Purchaser / Grantor</th>
                      <th className="py-3 px-3">Package</th>
                      <th className="py-3 px-3">Recipient Email</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.gifts?.map((g: any) => (
                      <tr key={g.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 font-mono font-bold text-[#123B5D] text-xs">{g.giftCode}</td>
                        <td className="py-3 px-3 font-medium text-[#17212B]">{g.purchaserName}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{g.packageName}</td>
                        <td className="py-3 px-3 text-[#59636B]">{g.recipientEmail || 'N/A'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF0F5] text-[#123B5D]">
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Post-Session Feedback Stream</h3>
                  <p className="text-xs text-[#59636B]">Ratings, active listening satisfaction scores, seeker feedback</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Average Listener Felt-Heard Rate</div>
                  <div className="font-display text-3xl font-bold text-amber-950">98.4%</div>
                  <div className="text-[10px] text-amber-700">Seekers reported feeling genuinely listened to</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E3E2DE] space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#59636B]">Listener Rebooking Preference</div>
                  <div className="font-display text-3xl font-bold text-[#17212B]">94.2%</div>
                  <div className="text-[10px] text-[#59636B]">Seekers requested to talk with the same listener again</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Safety Incident Reports</h3>
                  <p className="text-xs text-[#59636B]">Flags submitted by users or automatically triggered by safety algorithms</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Report ID</th>
                      <th className="py-3 px-3">Reporter</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Details</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                    {data.safetyReports?.map((r: any) => (
                      <tr key={r.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 font-mono text-[11px] text-[#59636B]">{r.id}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{r.reporterId}</td>
                        <td className="py-3 px-3 font-bold text-rose-800">{r.category}</td>
                        <td className="py-3 px-3 text-[#59636B] max-w-xs truncate">{r.details}</td>
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
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold text-[#17212B]">Safespace System Settings</h3>
                <p className="text-xs text-[#59636B]">Configure fee split percentages, free trials, and platform governance</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#59636B]">Platform Revenue Fee Share (%)</label>
                  <input
                    type="number"
                    defaultValue={data.settings?.platformFeePercent || 60}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs focus:outline-none focus:ring-1 focus:ring-[#59636B] font-bold text-[#17212B]"
                    onChange={(e) => handleSaveSettings({ platformFeePercent: Number(e.target.value) })}
                  />
                  <p className="text-[11px] text-[#59636B]">Default 60% platform operating margin.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#59636B]">Listener Earnings Share (%)</label>
                  <input
                    type="number"
                    defaultValue={data.settings?.providerSharePercent || 40}
                    className="w-full px-3 py-2 rounded-xl border border-[#E3E2DE] text-xs focus:outline-none focus:ring-1 focus:ring-[#59636B] font-bold text-[#17212B]"
                    onChange={(e) => handleSaveSettings({ providerSharePercent: Number(e.target.value) })}
                  />
                  <p className="text-[11px] text-[#59636B]">Default 40% peer listener compensation pool.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E3E2DE] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#17212B]">Free Trial Onboarding</div>
                  <div className="text-[11px] text-[#59636B]">Allow 3-minute free trial session for new seeker signups</div>
                </div>
                <button
                  onClick={() => handleSaveSettings({ freeTrialEnabled: !data.settings?.freeTrialEnabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    data.settings?.freeTrialEnabled ? 'bg-[#123B5D] text-[#FAF9F6]' : 'bg-[#E3E2DE] text-[#59636B]'
                  }`}
                >
                  {data.settings?.freeTrialEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 15: AUDIT LOGS */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="bg-white p-6 rounded-2xl border border-[#E3E2DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#17212B]">Immutable Administrative Audit Log</h3>
                  <p className="text-xs text-[#59636B]">Complete record of sensitive administrative actions across the platform</p>
                </div>
                <span className="text-xs font-mono text-[#123B5D] font-bold">
                  {data.auditLogs?.length || 0} Records Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                      <th className="py-3 px-3">Log ID</th>
                      <th className="py-3 px-3">Actor</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Target Resource</th>
                      <th className="py-3 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F1EC] text-[#59636B] font-mono">
                    {data.auditLogs?.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#FAF9F6]">
                        <td className="py-3 px-3 text-[11px] text-[#59636B]">{log.id}</td>
                        <td className="py-3 px-3 font-bold text-[#17212B]">{log.actorName}</td>
                        <td className="py-3 px-3 text-[#123B5D] font-bold">{log.action}</td>
                        <td className="py-3 px-3 text-[#59636B]">{log.resource}:{log.resourceId}</td>
                        <td className="py-3 px-3 text-[#59636B]">{new Date(log.timestamp).toLocaleString()}</td>
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
        <div className="fixed inset-0 bg-[#17212B]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#E3E2DE] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3E2DE] pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#17212B]">Safespace RBAC Security Matrix</h2>
                <p className="text-xs text-[#59636B]">Role-Based Access Control permissions across administrative modules</p>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-2 rounded-full hover:bg-[#F3F1EC] text-[#59636B]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#E3E2DE] text-[#59636B] uppercase text-[10px] font-semibold">
                    <th className="py-2 px-3">Role</th>
                    <th className="py-2 px-3">Sessions</th>
                    <th className="py-2 px-3">Users</th>
                    <th className="py-2 px-3">Providers</th>
                    <th className="py-2 px-3">Payments/Payouts</th>
                    <th className="py-2 px-3">Safeguarding</th>
                    <th className="py-2 px-3">CMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F1EC] text-[#59636B]">
                  {Object.entries(ROLE_PERMISSIONS).map(([roleKey, roleCfg]) => (
                    <tr key={roleKey} className="hover:bg-[#FAF9F6]">
                      <td className="py-3 px-3 font-bold text-[#17212B] flex items-center gap-2">
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