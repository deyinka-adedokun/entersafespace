import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  ArrowRight, 
  Phone, 
  Mail, 
  Plus, 
  History, 
  Building2, 
  HelpCircle,
  Eye,
  UserX
} from 'lucide-react';
import { 
  SafeguardingCase, 
  SafeguardingStage, 
  SpecialistOrganisation, 
  SafeguardingAuditEntry, 
  SafetyRiskCategory, 
  UserRole 
} from '../types';

interface SafeguardingViewProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
  currentUserName?: string;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SafeguardingView: React.FC<SafeguardingViewProps> = ({
  currentUserRole = 'ADMIN',
  currentUserId = 'user-admin-1',
  currentUserName = 'Safeguarding Officer',
  addToast
}) => {
  const [activeTab, setActiveTab] = useState<'CASES' | 'AUTHORITIES' | 'RESOURCES' | 'AUDIT'>('CASES');
  const [cases, setCases] = useState<SafeguardingCase[]>([]);
  const [authorities, setAuthorities] = useState<SpecialistOrganisation[]>([]);
  const [auditLogs, setAuditLogs] = useState<SafeguardingAuditEntry[]>([]);
  const [selectedCase, setSelectedCase] = useState<SafeguardingCase | null>(null);
  const [caseAuditHistory, setCaseAuditHistory] = useState<SafeguardingAuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rbacError, setRbacError] = useState<string | null>(null);

  // Stage transition form state
  const [transitionStage, setTransitionStage] = useState<SafeguardingStage>('REVIEW');
  const [humanDecisionText, setHumanDecisionText] = useState<string>('');
  const [actionTakenType, setActionTakenType] = useState<'NONE' | 'USER_WARNED' | 'USER_BLOCKED' | 'ACCOUNT_SUSPENDED' | 'ESCALATED_TO_AUTHORITY'>('NONE');
  const [documentationNote, setDocumentationNote] = useState<string>('');
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string>('');
  const [referralNotesText, setReferralNotesText] = useState<string>('');
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // New Authority Form state
  const [showAddAuthModal, setShowAddAuthModal] = useState<boolean>(false);
  const [newAuthName, setNewAuthName] = useState<string>('');
  const [newAuthCategory, setNewAuthCategory] = useState<SafetyRiskCategory>('OTHER');
  const [newAuthPhone, setNewAuthPhone] = useState<string>('');
  const [newAuthEmail, setNewAuthEmail] = useState<string>('');
  const [newAuthNotes, setNewAuthNotes] = useState<string>('');

  const isAuthorized = ['SAFETY_REVIEWER', 'ADMIN', 'SUPER_ADMIN'].includes(currentUserRole);

  const fetchCases = async () => {
    if (!isAuthorized) {
      setRbacError('Restricted Access: Safeguarding records require Safety Reviewer or Admin permissions.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [casesRes, authRes, auditRes] = await Promise.all([
        fetch('/api/v1/safeguarding/cases'),
        fetch('/api/v1/safeguarding/authorities'),
        fetch('/api/v1/safeguarding/audit-logs')
      ]);

      const casesJson = await casesRes.json();
      const authJson = await authRes.json();
      const auditJson = await auditRes.json();

      if (casesRes.status === 403) {
        setRbacError(casesJson.error?.message || 'Access Forbidden');
      } else if (casesJson.success && casesJson.data) {
        setCases(casesJson.data.cases || []);
        setRbacError(null);
      }

      if (authJson.success && authJson.data) {
        setAuthorities(authJson.data.authorities || []);
      }

      if (auditJson.success && auditJson.data) {
        setAuditLogs(auditJson.data.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch safeguarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [currentUserRole]);

  const handleOpenCaseDetail = async (c: SafeguardingCase) => {
    setSelectedCase(c);
    setTransitionStage(c.stage);
    setHumanDecisionText(c.humanDecision || '');
    setActionTakenType(c.actionTaken || 'NONE');
    setDocumentationNote('');

    try {
      const res = await fetch(`/api/v1/safeguarding/cases/${c.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCaseAuditHistory(json.data.auditHistory || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransitionStage = async () => {
    if (!selectedCase) return;

    if (['HUMAN_DECISION', 'APPROPRIATE_ACTION', 'DOCUMENTATION', 'RESOLVED'].includes(transitionStage) && !humanDecisionText.trim()) {
      addToast?.('AI decision is strictly forbidden. Human reviewer decision rationale is required.', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/safeguarding/cases/${selectedCase.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: transitionStage,
          humanDecision: humanDecisionText,
          actionTaken: actionTakenType,
          notes: documentationNote,
          reviewerName: currentUserName
        })
      });

      const json = await res.json();
      if (json.success && json.data?.case) {
        addToast?.(`Case stage updated to ${transitionStage}`, 'success');
        setSelectedCase(json.data.case);
        fetchCases();
      } else {
        addToast?.(json.error?.message || 'Failed to update case stage', 'error');
      }
    } catch (err) {
      addToast?.('Error submitting stage transition', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleEscalateCase = async () => {
    if (!selectedCase || !selectedAuthorityId) {
      addToast?.('Please select an authority to escalate to', 'error');
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/safeguarding/cases/${selectedCase.id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorityId: selectedAuthorityId,
          referralNotes: referralNotesText
        })
      });

      const json = await res.json();
      if (json.success && json.data?.case) {
        addToast?.(`Case referred to ${json.data.authority?.name}`, 'success');
        setSelectedCase(json.data.case);
        fetchCases();
      } else {
        addToast?.(json.error?.message || 'Failed to escalate case', 'error');
      }
    } catch (err) {
      addToast?.('Error escalating case', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/safeguarding/authorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAuthName,
          category: newAuthCategory,
          contactPhone: newAuthPhone,
          contactEmail: newAuthEmail,
          protocolNotes: newAuthNotes
        })
      });

      const json = await res.json();
      if (json.success) {
        addToast?.('Specialist organisation configured', 'success');
        setShowAddAuthModal(false);
        setNewAuthName('');
        setNewAuthPhone('');
        setNewAuthEmail('');
        setNewAuthNotes('');
        fetchCases();
      } else {
        addToast?.(json.error?.message || 'Failed to add authority', 'error');
      }
    } catch (err) {
      addToast?.('Error configuring authority', 'error');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Restricted Safeguarding Access</h2>
        <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
          Safeguarding case data and human review workflows are strictly restricted under RBAC rules.
          Please switch to a <strong>Safety Reviewer</strong> or <strong>Safespace Admin</strong> account to view this control center.
        </p>
      </div>
    );
  }

  const STAGES: { id: SafeguardingStage; label: string; desc: string }[] = [
    { id: 'CONCERN', label: '1. Concern', desc: 'Initial report or risk flag' },
    { id: 'REVIEW', label: '2. Review', desc: 'Assigned for human triage' },
    { id: 'CLASSIFICATION', label: '3. Classification', desc: 'Category & severity verified' },
    { id: 'HUMAN_DECISION', label: '4. Human Decision', desc: 'Rationale recorded by reviewer' },
    { id: 'APPROPRIATE_ACTION', label: '5. Action', desc: 'Block/warn/suspend enforced' },
    { id: 'REFERRAL_ESCALATION', label: '6. Referral', desc: 'Escalated to specialist org' },
    { id: 'DOCUMENTATION', label: '7. Documentation', desc: 'Notes & evidence archived' },
    { id: 'RESOLVED', label: '8. Resolution', desc: 'Formal closure & audit locked' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Safespace Trust & Safeguarding</h1>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
            Human-in-the-Loop Safeguarding Engine. AI flags concerns, but <strong>human reviewers strictly make all final decisions</strong>. Full RBAC authorization and immutable audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-800 p-2.5 rounded-2xl border border-stone-700 shrink-0">
          <Lock className="w-4 h-4 text-emerald-400" />
          <div className="text-[11px]">
            <div className="font-bold text-stone-200">Active Reviewer:</div>
            <div className="text-amber-200 font-mono">{currentUserName} ({currentUserRole})</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('CASES')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'CASES'
              ? 'bg-emerald-900 text-amber-50 shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>Safeguarding Cases ({cases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUTHORITIES')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'AUTHORITIES'
              ? 'bg-emerald-900 text-amber-50 shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>Configured Specialist Orgs ({authorities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'RESOURCES'
              ? 'bg-emerald-900 text-amber-50 shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span>Safety Directory & Resources</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === 'AUDIT'
              ? 'bg-emerald-900 text-amber-50 shadow-md'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <History className="w-4 h-4 text-amber-300" />
          <span>Safeguarding Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: SAFEGUARDING CASES */}
      {activeTab === 'CASES' && (
        <div className="space-y-6">
          
          {/* Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-400">Total Cases</div>
              <div className="font-serif text-2xl font-bold text-stone-900">{cases.length}</div>
              <div className="text-[10px] text-stone-500">All registered incidents</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-400">Critical / High Severity</div>
              <div className="font-serif text-2xl font-bold text-rose-700">
                {cases.filter(c => c.riskSeverity === 'CRITICAL' || c.riskSeverity === 'HIGH').length}
              </div>
              <div className="text-[10px] text-rose-600 font-semibold">Priority Triage Active</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-400">Open Human Reviews</div>
              <div className="font-serif text-2xl font-bold text-amber-700">
                {cases.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length}
              </div>
              <div className="text-[10px] text-amber-700 font-semibold">Pending Reviewer Decision</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-stone-400">Actioned & Resolved</div>
              <div className="font-serif text-2xl font-bold text-emerald-900">
                {cases.filter(c => c.status === 'ACTIONED' || c.status === 'RESOLVED').length}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold">Decided & Documented</div>
            </div>
          </div>

          {/* Cases Stream Table */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-stone-900">Active Safeguarding Review Cases</h3>
              <span className="text-xs text-stone-500 font-mono">RBAC Access Recorded</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-3">Case ID</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Assigned Reviewer</th>
                    <th className="py-3 px-3">Created At</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-stone-900">{c.id}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.riskSeverity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          c.riskSeverity === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {c.riskSeverity}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-stone-900">{c.riskCategory}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-950">
                          {c.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">{c.assignedReviewerName || 'Unassigned'}</td>
                      <td className="py-3.5 px-3 text-stone-400">{new Date(c.createdAt).toLocaleTimeString()}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleOpenCaseDetail(c)}
                          className="px-3 py-1.5 bg-emerald-900 text-amber-50 rounded-lg text-xs font-bold hover:bg-emerald-950 transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Case</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPECIALIST ORGANISATIONS & AUTHORITIES */}
      {activeTab === 'AUTHORITIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Configured Authorities & Specialist Organisations</h2>
              <p className="text-xs text-stone-500">
                Organisations can be configured dynamically as operational and legal protocols evolve without hardcoding assumptions into the core safety engine.
              </p>
            </div>

            <button
              onClick={() => setShowAddAuthModal(true)}
              className="px-4 py-2.5 bg-emerald-900 text-amber-50 rounded-xl font-bold text-xs hover:bg-emerald-950 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Specialist Org</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {authorities.map((org) => (
              <div key={org.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
                      Category: {org.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">{org.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE REFERRAL
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{org.protocolNotes}</p>

                <div className="pt-2 border-t border-stone-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-stone-800 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span>{org.contactPhone}</span>
                  </div>
                  {org.contactEmail && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>{org.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY RESOURCES & HELPLINES */}
      {activeTab === 'RESOURCES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Safety Directory & Emergency Resources</h2>
            <p className="text-xs text-stone-500">
              Immediate crisis contacts and specialist support pathways available across Nigeria and West Africa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="font-serif font-bold text-amber-950 text-base">Nigeria Suicide Prevention & Crisis Hotline</div>
              <p className="text-xs text-amber-900 leading-relaxed">
                24/7 immediate crisis intervention for individuals experiencing severe emotional distress or suicidal ideation.
              </p>
              <div className="pt-2 font-mono font-bold text-amber-950 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-800" />
                <span>+234 806 210 6497</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
              <div className="font-serif font-bold text-rose-950 text-base">Gender-Based Violence Crisis Response</div>
              <p className="text-xs text-rose-900 leading-relaxed">
                Confidential helpline and immediate shelter referral for victims of intimate partner violence or sexual assault.
              </p>
              <div className="pt-2 font-mono font-bold text-rose-950 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-800" />
                <span>+234 800 333 3333</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="font-serif font-bold text-emerald-950 text-base">National Emergency Response</div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Toll-free national police, ambulance, and fire dispatch service.
              </p>
              <div className="pt-2 font-mono font-bold text-emerald-950 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-800" />
                <span>112 / 199</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="font-serif font-bold text-stone-900 text-base">Safespace Peer Support Policy</div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Safespace listeners provide emotional listening and companionship. They are explicitly prohibited from giving medical diagnoses or clinical care.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900">Safeguarding Access & Action Audit Trail</h2>
              <p className="text-xs text-stone-500">
                Immutable system audit log recording every view, stage transition, decision, and escalation.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-100 px-3 py-1 rounded-full">
              SECURE LOGGED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Audit ID</th>
                  <th className="py-2.5 px-3">Case ID</th>
                  <th className="py-2.5 px-3">Actor Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 font-mono text-[11px]">
                    <td className="py-3 px-3 text-stone-400">{log.id}</td>
                    <td className="py-3 px-3 font-bold text-stone-900">{log.caseId}</td>
                    <td className="py-3 px-3 font-sans font-semibold text-stone-800">{log.actorName}</td>
                    <td className="py-3 px-3 font-sans text-stone-500">{log.actorRole}</td>
                    <td className="py-3 px-3 font-sans font-bold text-emerald-950">{log.action}</td>
                    <td className="py-3 px-3 text-stone-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HUMAN REVIEW CASE MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-6 text-left">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-stone-100 px-2.5 py-0.5 rounded-md text-stone-700">
                    {selectedCase.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedCase.riskSeverity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    selectedCase.riskSeverity === 'HIGH' ? 'bg-amber-100 text-amber-900' :
                    'bg-stone-100 text-stone-700'
                  }`}>
                    {selectedCase.riskSeverity} SEVERITY
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  Safeguarding Case: {selectedCase.riskCategory}
                </h3>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold text-stone-600"
              >
                Close
              </button>
            </div>

            {/* MANDATE BANNER: AI Decision Prohibition */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Human-in-the-Loop Safeguarding Mandate</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                AI automated scoring (Risk Score: {selectedCase.aiRiskScore}) is strictly an advisory indicator. <strong>AI is legally prohibited from making final safeguarding decisions</strong>. Every stage transition, action, and resolution requires explicit human reviewer decision input.
              </p>
            </div>

            {/* AI Summary Hint */}
            {selectedCase.aiSummaryHint && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1">
                <div className="font-bold text-stone-900 text-[11px] uppercase tracking-wider">AI Advisory Pre-Filter Note</div>
                <p className="italic text-stone-600">{selectedCase.aiSummaryHint}</p>
              </div>
            )}

            {/* 8-Stage Human Workflow Pipeline Visualizer */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Human Review Workflow Pipeline Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTransitionStage(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      transitionStage === st.id
                        ? 'bg-emerald-900 text-amber-50 border-emerald-900 shadow-sm font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs">{st.label}</div>
                    <div className={`text-[10px] mt-0.5 ${transitionStage === st.id ? 'text-amber-200/80' : 'text-stone-400'}`}>
                      {st.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Human Decision Form */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                  Human Reviewer Decision Rationale <span className="text-rose-600">* Required</span>
                </label>
                <textarea
                  value={humanDecisionText}
                  onChange={(e) => setHumanDecisionText(e.target.value)}
                  placeholder="Record your formal human decision rationale as reviewer..."
                  rows={3}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Enforced Safeguarding Action
                  </label>
                  <select
                    value={actionTakenType}
                    onChange={(e) => setActionTakenType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800"
                  >
                    <option value="NONE">No Direct Restrictive Action</option>
                    <option value="USER_WARNED">Issue Formal User Warning</option>
                    <option value="USER_BLOCKED">Enforce Permanent Pair Block</option>
                    <option value="ACCOUNT_SUSPENDED">Suspend Account & Access</option>
                    <option value="ESCALATED_TO_AUTHORITY">Escalate to Specialist Authority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Documentation Log Note
                  </label>
                  <input
                    type="text"
                    value={documentationNote}
                    onChange={(e) => setDocumentationNote(e.target.value)}
                    placeholder="Add audit documentation entry..."
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  />
                </div>
              </div>

              <button
                onClick={handleTransitionStage}
                disabled={submittingAction}
                className="w-full py-3 bg-emerald-900 hover:bg-emerald-950 text-amber-50 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {submittingAction ? 'Updating Workflow Stage...' : `Record Human Decision & Advance Stage to [${transitionStage}]`}
              </button>
            </div>

            {/* Referral / Escalation to Specialist Authority */}
            <div className="p-4 bg-stone-900 text-amber-50 rounded-2xl space-y-3">
              <div className="font-serif font-bold text-sm text-amber-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Referral & Authority Escalation Protocol</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                    Select Configured Specialist Authority
                  </label>
                  <select
                    value={selectedAuthorityId}
                    onChange={(e) => setSelectedAuthorityId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-amber-100 font-semibold"
                  >
                    <option value="">-- Choose Specialist Org --</option>
                    {authorities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                    Referral Notes / Case Summary
                  </label>
                  <input
                    type="text"
                    value={referralNotesText}
                    onChange={(e) => setReferralNotesText(e.target.value)}
                    placeholder="Provide referral summary for authority..."
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200"
                  />
                </div>
              </div>

              <button
                onClick={handleEscalateCase}
                disabled={submittingAction || !selectedAuthorityId}
                className="px-4 py-2 bg-amber-400 text-stone-900 rounded-xl font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Escalate Case to Authority
              </button>
            </div>

            {/* Documentation Notes Log */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Case Documentation History ({selectedCase.documentationNotes?.length || 0})
              </div>
              <div className="bg-stone-50 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1 font-mono text-[11px] text-stone-700">
                {selectedCase.documentationNotes?.map((note, idx) => (
                  <div key={idx} className="border-b border-stone-200/60 pb-1 last:border-0">
                    {note}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIGURE NEW AUTHORITY MODAL */}
      {showAddAuthModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 relative space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Configure Specialist Authority / Org
              </h3>
              <button
                onClick={() => setShowAddAuthModal(false)}
                className="text-xs text-stone-500 font-bold hover:text-stone-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddAuthority} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Organisation Name *</label>
                <input
                  type="text"
                  value={newAuthName}
                  onChange={(e) => setNewAuthName(e.target.value)}
                  placeholder="e.g. State Emergency Child Protection Bureau"
                  required
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Primary Risk Category</label>
                <select
                  value={newAuthCategory}
                  onChange={(e) => setNewAuthCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                >
                  <option value="CHILD_ABUSE">Child Abuse / Minor Harm</option>
                  <option value="DOMESTIC_VIOLENCE">Domestic Violence / GBV</option>
                  <option value="SUICIDE_RISK">Suicide Risk / Crisis Line</option>
                  <option value="TRAFFICKING">Human Trafficking</option>
                  <option value="SEXUAL_ASSAULT">Sexual Assault Response</option>
                  <option value="OTHER">General Emergency / Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={newAuthPhone}
                    onChange={(e) => setNewAuthPhone(e.target.value)}
                    placeholder="+234..."
                    required
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={newAuthEmail}
                    onChange={(e) => setNewAuthEmail(e.target.value)}
                    placeholder="referral@org.ng"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Protocol & Escalation Notes</label>
                <textarea
                  value={newAuthNotes}
                  onChange={(e) => setNewAuthNotes(e.target.value)}
                  placeholder="Operating protocols, referral guidelines..."
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-900 text-amber-50 rounded-xl font-bold hover:bg-emerald-950 transition-colors cursor-pointer"
              >
                Save Authority Configuration
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
