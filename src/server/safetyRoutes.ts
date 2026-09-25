import type { Express, Request, Response } from 'express';
import { supabaseAdmin } from './supabaseClients.js';
import { requireAuth, requireSafetyReviewer, type AuthenticatedUser } from './authMiddleware.js';
import { UUID_RE, fail, handle, writeAudit } from './routeHelpers.js';

// ---------------------------------------------------------------------------
// Trust & safety: incident reports, user blocks, the R0-R3 safeguarding case
// workflow and the specialist-organisation directory -- persisted in Supabase
// and keyed to the authenticated caller.
//
// Access:
//   - Reports and blocks: any signed-in user, for themselves.
//   - Safeguarding cases, audit trail, authority directory: SAFETY_REVIEWER,
//     ADMIN or SUPER_ADMIN only (requireSafetyReviewer).
//   - Crisis resources: public, so they are reachable without an account.
//
// Human-in-the-loop mandate: the automated severity and advisory hint never
// decide anything. Moving a case to a decision/action/resolution stage
// requires a human reviewer's written decision.
// ---------------------------------------------------------------------------

type Row = Record<string, any>;

const CATEGORIES = [
  'CHILD_ABUSE', 'SEXUAL_ASSAULT', 'DOMESTIC_VIOLENCE', 'TRAFFICKING', 'IMMEDIATE_DANGER',
  'SELF_HARM', 'SUICIDE_RISK', 'THREAT_OF_VIOLENCE', 'EXPLOITATION', 'OTHER'
];
const CRITICAL_CATEGORIES = ['CHILD_ABUSE', 'IMMEDIATE_DANGER', 'SUICIDE_RISK', 'SELF_HARM'];
const HIGH_CATEGORIES = ['SEXUAL_ASSAULT', 'DOMESTIC_VIOLENCE', 'TRAFFICKING', 'THREAT_OF_VIOLENCE', 'EXPLOITATION'];
const STAGES = ['CONCERN', 'REVIEW', 'CLASSIFICATION', 'HUMAN_DECISION', 'APPROPRIATE_ACTION', 'REFERRAL_ESCALATION', 'DOCUMENTATION', 'RESOLVED'];
const DECISION_STAGES = ['HUMAN_DECISION', 'APPROPRIATE_ACTION', 'DOCUMENTATION', 'RESOLVED'];
const ACTIONS = ['NONE', 'USER_WARNED', 'USER_BLOCKED', 'ACCOUNT_SUSPENDED', 'ESCALATED_TO_AUTHORITY'];
const ORG_CATEGORIES = [...CATEGORIES, 'GENERAL_EMERGENCY'];

// Public crisis lines shown to anyone. Kept in code (not the database) so they
// are available even if the database is unreachable.
const EMERGENCY_CONTACTS = [
  { name: 'Nigeria Emergency Services', phone: '112 / 199', type: 'EMERGENCY' },
  { name: 'National Suicide Prevention Helpline', phone: '+234 806 210 6497', type: 'CRISIS' },
  { name: 'Gender-Based Violence Helpline', phone: '+234 800 333 3333', type: 'DOMESTIC_VIOLENCE' }
];

function clip(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
}

// --- Row mappers ---

function mapReport(r: Row) {
  return {
    id: r.id,
    reporterId: r.reporter_id,
    reporterRole: r.reporter_role,
    reportedUserId: r.reported_user_id || undefined,
    sessionId: r.session_id || undefined,
    category: r.category,
    details: r.details || '',
    blockUser: Boolean(r.block_user),
    status: r.status,
    assignedReviewerId: r.assigned_reviewer_id || undefined,
    actionTaken: r.action_taken || undefined,
    createdAt: r.created_at
  };
}

function mapCase(r: Row, names: Map<string, string>) {
  return {
    id: r.id,
    incidentReportId: r.incident_report_id,
    reporterId: r.reporter_id,
    reporterRole: r.reporter_role,
    reportedUserId: r.reported_user_id || undefined,
    sessionId: r.session_id || undefined,
    riskCategory: r.risk_category,
    riskSeverity: r.risk_severity,
    stage: r.stage,
    assignedReviewerId: r.assigned_reviewer_id || undefined,
    assignedReviewerName: r.assigned_reviewer_name || undefined,
    aiRiskScore: r.ai_risk_score === null ? undefined : Number(r.ai_risk_score),
    aiSummaryHint: r.ai_summary_hint || undefined,
    humanDecision: r.human_decision || undefined,
    humanDecisionBy: r.human_decision_by ? (names.get(r.human_decision_by) || 'Reviewer') : undefined,
    humanDecisionAt: r.human_decision_at || undefined,
    actionTaken: r.action_taken || undefined,
    referredAuthorityId: r.referred_authority_id || undefined,
    referredAuthorityName: r.referred_authority_name || undefined,
    escalatedAt: r.escalated_at || undefined,
    documentationNotes: r.documentation_notes || [],
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function mapAuditEntry(r: Row) {
  return {
    id: r.id,
    caseId: r.case_id,
    actorId: r.actor_id || 'system',
    actorName: r.actor_name || 'System',
    actorRole: r.actor_role || 'ADMIN',
    action: r.action,
    timestamp: r.timestamp,
    details: r.details || undefined
  };
}

function mapOrg(r: Row) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email || undefined,
    website: r.website || undefined,
    protocolNotes: r.protocol_notes || '',
    active: Boolean(r.active)
  };
}

function mapBlock(r: Row) {
  return {
    id: r.id,
    blockerUserId: r.blocker_user_id,
    blockedUserId: r.blocked_user_id,
    reason: r.reason || undefined,
    createdAt: r.created_at
  };
}

// --- Helpers ---

// Display names for the reviewers recorded on cases (the DB stores ids).
async function reviewerNames(rows: Row[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map(r => r.human_decision_by).filter(Boolean))];
  if (ids.length === 0) return new Map();
  const { data } = await supabaseAdmin.from('profiles').select('id, display_name').in('id', ids);
  return new Map((data || []).map(p => [p.id, p.display_name]));
}

async function logCaseAudit(caseId: string, actor: AuthenticatedUser | null, action: string, details?: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from('safeguarding_audit_entries').insert({
    case_id: caseId,
    actor_id: actor?.id ?? null,
    actor_name: actor?.displayName ?? 'System Engine',
    actor_role: actor?.role ?? 'SYSTEM',
    action,
    details: details ?? null
  });
  if (error) console.error('[Safespace] safeguarding audit write failed:', action, error);
  await writeAudit(actor, `SAFEGUARDING_${action}`, 'SAFEGUARDING_CASE', caseId, details);
}

// Creates the block if it doesn't exist yet (blocks are unique per pair).
async function ensureBlock(blockerId: string, blockedId: string, reason: string): Promise<Row> {
  const { data: existing } = await supabaseAdmin.from('user_blocks').select('*')
    .eq('blocker_user_id', blockerId).eq('blocked_user_id', blockedId).maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabaseAdmin.from('user_blocks')
    .insert({ blocker_user_id: blockerId, blocked_user_id: blockedId, reason: reason.slice(0, 500) })
    .select().single();
  if (error) throw error;
  return data;
}

async function loadCase(req: Request, res: Response): Promise<Row | null> {
  if (!UUID_RE.test(req.params.id)) {
    fail(res, 404, 'CASE_NOT_FOUND', 'Safeguarding case not found');
    return null;
  }
  const { data, error } = await supabaseAdmin.from('safeguarding_cases').select('*').eq('id', req.params.id).maybeSingle();
  if (error) throw error;
  if (!data) {
    fail(res, 404, 'CASE_NOT_FOUND', 'Safeguarding case not found');
    return null;
  }
  return data;
}

export function registerSafetyRoutes(app: Express) {
  // -------------------------------------------------------------------------
  // INCIDENT REPORTS
  // -------------------------------------------------------------------------
  const createReport = handle('safety report', async (req, res) => {
    const user = req.user!;
    const { sessionId, category, details, note, reason, blockUser } = req.body;

    const reportCategory = CATEGORIES.includes(category) ? category : 'OTHER';
    const reportDetails = clip(details, 4000) || clip(note, 4000) || clip(reason, 4000) || 'No details provided';

    // A report may reference a session only if the reporter took part in it;
    // the other participant is then the reported person.
    let linkedSessionId: string | null = null;
    let reportedUserId: string | null = null;
    if (typeof sessionId === 'string' && UUID_RE.test(sessionId)) {
      const { data: session } = await supabaseAdmin.from('sessions')
        .select('id, seeker_id, provider_id').eq('id', sessionId).maybeSingle();
      if (session && (session.seeker_id === user.id || session.provider_id === user.id)) {
        linkedSessionId = session.id;
        reportedUserId = session.seeker_id === user.id ? session.provider_id : session.seeker_id;
      }
    }

    const { data: report, error: reportError } = await supabaseAdmin.from('safety_reports').insert({
      reporter_id: user.id,
      reporter_role: user.role,
      reported_user_id: reportedUserId,
      session_id: linkedSessionId,
      category: reportCategory,
      details: reportDetails,
      block_user: Boolean(blockUser),
      status: 'PENDING'
    }).select().single();
    if (reportError) throw reportError;

    let userBlocked = false;
    if (blockUser && reportedUserId) {
      await ensureBlock(user.id, reportedUserId, `Blocked via safety report ${report.id}`);
      userBlocked = true;
    }

    // Advisory triage only -- a human reviewer makes every decision.
    const riskSeverity = CRITICAL_CATEGORIES.includes(reportCategory) ? 'CRITICAL'
      : HIGH_CATEGORIES.includes(reportCategory) ? 'HIGH' : 'MEDIUM';

    const { data: sgCase, error: caseError } = await supabaseAdmin.from('safeguarding_cases').insert({
      incident_report_id: report.id,
      reporter_id: user.id,
      reporter_role: user.role,
      reported_user_id: reportedUserId,
      session_id: linkedSessionId,
      risk_category: reportCategory,
      risk_severity: riskSeverity,
      stage: 'CONCERN',
      ai_risk_score: riskSeverity === 'CRITICAL' ? 0.96 : riskSeverity === 'HIGH' ? 0.85 : 0.45,
      ai_summary_hint: `Automated advisory flag: category ${reportCategory}, severity ${riskSeverity}. Requires human review and triage; automated decisions are not permitted.`,
      documentation_notes: [`Incident report ${report.id} registered at ${report.created_at}. Category: ${reportCategory}. Initial note: ${reportDetails}`],
      status: 'OPEN'
    }).select().single();
    if (caseError) throw caseError;

    await logCaseAudit(sgCase.id, null, 'CASE_AUTOMATICALLY_CREATED', { reportId: report.id, category: reportCategory, severity: riskSeverity });

    // The reporter gets confirmation of their own report, not the internal case.
    res.json({
      success: true,
      message: 'Safety incident report received. A safeguarding reviewer will look at it.',
      data: { report: mapReport(report), userBlocked }
    });
  });

  app.post('/api/v1/safety/report', requireAuth, createReport);
  app.post('/api/v1/safety/reports', requireAuth, createReport);

  // Reviewers see every report; everyone else sees only their own.
  app.get('/api/v1/safety/reports', requireAuth, handle('safety reports list', async (req, res) => {
    const user = req.user!;
    const isReviewer = ['SAFETY_REVIEWER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
    let query = supabaseAdmin.from('safety_reports').select('*').order('created_at', { ascending: false }).limit(500);
    if (!isReviewer) query = query.eq('reporter_id', user.id);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: { reports: (data || []).map(mapReport) } });
  }));

  // -------------------------------------------------------------------------
  // BLOCKS (the matching engine excludes blocked pairs in both directions)
  // -------------------------------------------------------------------------
  app.post('/api/v1/safety/block', requireAuth, handle('block user', async (req, res) => {
    const user = req.user!;
    const { targetUserId, reason } = req.body;
    if (typeof targetUserId !== 'string' || !UUID_RE.test(targetUserId)) {
      return fail(res, 400, 'INVALID_BLOCK_TARGET', 'Target user ID required');
    }
    if (targetUserId === user.id) return fail(res, 400, 'INVALID_BLOCK_TARGET', 'You cannot block yourself.');
    const { data: target } = await supabaseAdmin.from('profiles').select('id').eq('id', targetUserId).maybeSingle();
    if (!target) return fail(res, 404, 'USER_NOT_FOUND', 'That account does not exist.');

    const block = await ensureBlock(user.id, targetUserId, clip(reason, 500) || 'User initiated block');
    await writeAudit(user, 'USER_BLOCKED', 'USER', targetUserId);
    res.json({
      success: true,
      message: 'User blocked successfully. Matching engine will exclude them permanently.',
      data: { block: mapBlock(block) }
    });
  }));

  app.get('/api/v1/safety/blocks', requireAuth, handle('list blocks', async (req, res) => {
    const { data, error } = await supabaseAdmin.from('user_blocks').select('*')
      .eq('blocker_user_id', req.user!.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: { blocks: (data || []).map(mapBlock) } });
  }));

  app.delete('/api/v1/safety/blocks/:id', requireAuth, handle('unblock', async (req, res) => {
    if (!UUID_RE.test(req.params.id)) return fail(res, 404, 'BLOCK_NOT_FOUND', 'Block record not found');
    const { data: removed, error } = await supabaseAdmin.from('user_blocks').delete()
      .eq('id', req.params.id).eq('blocker_user_id', req.user!.id).select().maybeSingle();
    if (error) throw error;
    if (!removed) return fail(res, 404, 'BLOCK_NOT_FOUND', 'Block record not found');
    await writeAudit(req.user!, 'USER_UNBLOCKED', 'USER', removed.blocked_user_id);
    res.json({ success: true, message: 'User unblocked successfully.', data: { unblocked: mapBlock(removed) } });
  }));

  // -------------------------------------------------------------------------
  // CRISIS RESOURCES (public)
  // -------------------------------------------------------------------------
  app.get('/api/v1/safety/resources', handle('safety resources', async (_req, res) => {
    const { data } = await supabaseAdmin.from('specialist_organisations').select('*').eq('active', true).order('name');
    res.json({ success: true, data: { emergencyContacts: EMERGENCY_CONTACTS, specialistOrganisations: (data || []).map(mapOrg) } });
  }));

  // -------------------------------------------------------------------------
  // SAFEGUARDING CASES (reviewers only; every access is audited)
  // -------------------------------------------------------------------------
  app.get('/api/v1/safeguarding/cases', requireAuth, requireSafetyReviewer, handle('safeguarding cases', async (req, res) => {
    const { data, error } = await supabaseAdmin.from('safeguarding_cases').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    const rows = data || [];
    await writeAudit(req.user!, 'SAFEGUARDING_CASES_LIST_ACCESSED', 'SAFEGUARDING_CASE', 'all', { totalCasesCount: rows.length });
    const names = await reviewerNames(rows);
    res.json({
      success: true,
      data: {
        cases: rows.map(r => mapCase(r, names)),
        stats: {
          total: rows.length,
          open: rows.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length,
          critical: rows.filter(c => c.risk_severity === 'CRITICAL').length,
          actioned: rows.filter(c => c.status === 'ACTIONED' || c.status === 'RESOLVED').length
        }
      }
    });
  }));

  app.get('/api/v1/safeguarding/cases/:id', requireAuth, requireSafetyReviewer, handle('safeguarding case', async (req, res) => {
    const sgCase = await loadCase(req, res);
    if (!sgCase) return;
    await logCaseAudit(sgCase.id, req.user!, 'CASE_RECORD_VIEWED', { caseSeverity: sgCase.risk_severity, caseStage: sgCase.stage });

    const [{ data: audits }, { data: report }] = await Promise.all([
      supabaseAdmin.from('safeguarding_audit_entries').select('*').eq('case_id', sgCase.id).order('timestamp', { ascending: false }),
      sgCase.incident_report_id
        ? supabaseAdmin.from('safety_reports').select('*').eq('id', sgCase.incident_report_id).maybeSingle()
        : Promise.resolve({ data: null })
    ]);
    const names = await reviewerNames([sgCase]);
    res.json({
      success: true,
      data: {
        case: mapCase(sgCase, names),
        auditHistory: (audits || []).map(mapAuditEntry),
        report: report ? mapReport(report) : null
      }
    });
  }));

  // Human review is mandatory: decision, action and resolution stages need a
  // written human decision on record.
  app.post('/api/v1/safeguarding/cases/:id/transition', requireAuth, requireSafetyReviewer, handle('safeguarding transition', async (req, res) => {
    const user = req.user!;
    const sgCase = await loadCase(req, res);
    if (!sgCase) return;

    const { stage, humanDecision, actionTaken, notes } = req.body;
    if (!STAGES.includes(stage)) return fail(res, 400, 'INVALID_STAGE', 'Unknown safeguarding stage.');
    if (actionTaken !== undefined && actionTaken !== null && !ACTIONS.includes(actionTaken)) {
      return fail(res, 400, 'INVALID_ACTION', 'Unknown safeguarding action.');
    }
    const decisionText = clip(humanDecision, 4000);
    if (DECISION_STAGES.includes(stage) && !decisionText && !sgCase.human_decision) {
      return fail(res, 400, 'HUMAN_DECISION_REQUIRED',
        'Safeguarding Mandate Violation: AI is strictly prohibited from making final safeguarding decisions. A human reviewer decision rationale is required.');
    }

    const now = new Date().toISOString();
    const updates: Row = {
      stage,
      updated_at: now,
      assigned_reviewer_id: user.id,
      assigned_reviewer_name: user.displayName,
      status: stage === 'RESOLVED' ? 'RESOLVED' : (stage === 'APPROPRIATE_ACTION' || stage === 'REFERRAL_ESCALATION') ? 'ACTIONED' : 'IN_REVIEW'
    };
    if (decisionText) {
      updates.human_decision = decisionText;
      updates.human_decision_by = user.id;
      updates.human_decision_at = now;
    }
    if (actionTaken) updates.action_taken = actionTaken;
    const noteText = clip(notes, 4000);
    if (noteText) {
      updates.documentation_notes = [...(sgCase.documentation_notes || []), `[${now}] Stage -> ${stage} by ${user.displayName}: ${noteText}`];
    }

    // Carry out the chosen action against the reported person.
    if (actionTaken === 'USER_BLOCKED' && sgCase.reported_user_id && sgCase.reporter_id) {
      await ensureBlock(sgCase.reporter_id, sgCase.reported_user_id, `Safeguarding case ${sgCase.id}: USER_BLOCKED`);
    }
    if (actionTaken === 'ACCOUNT_SUSPENDED' && sgCase.reported_user_id) {
      const { error: suspendError } = await supabaseAdmin.from('profiles').update({ status: 'SUSPENDED' }).eq('id', sgCase.reported_user_id);
      if (suspendError) throw suspendError;
      await writeAudit(user, 'ACCOUNT_SUSPENDED', 'USER', sgCase.reported_user_id, { safeguardingCaseId: sgCase.id });
    }

    const { data: updated, error } = await supabaseAdmin.from('safeguarding_cases').update(updates).eq('id', sgCase.id).select().single();
    if (error) throw error;

    if (sgCase.incident_report_id) {
      const reportStatus = stage === 'RESOLVED' ? 'RESOLVED' : stage === 'REFERRAL_ESCALATION' ? 'ESCALATED' : 'UNDER_REVIEW';
      await supabaseAdmin.from('safety_reports')
        .update({ status: reportStatus, assigned_reviewer_id: user.id, action_taken: updated.action_taken })
        .eq('id', sgCase.incident_report_id);
    }

    await logCaseAudit(sgCase.id, user, 'WORKFLOW_STAGE_TRANSITIONED', {
      fromStage: sgCase.stage,
      toStage: stage,
      humanDecision: updated.human_decision,
      actionTaken: updated.action_taken,
      reviewer: user.displayName
    });

    const names = await reviewerNames([updated]);
    res.json({
      success: true,
      message: `Safeguarding case stage advanced from ${sgCase.stage} to ${stage}.`,
      data: { case: mapCase(updated, names) }
    });
  }));

  app.post('/api/v1/safeguarding/cases/:id/escalate', requireAuth, requireSafetyReviewer, handle('safeguarding escalate', async (req, res) => {
    const user = req.user!;
    const sgCase = await loadCase(req, res);
    if (!sgCase) return;

    const { authorityId, referralNotes } = req.body;
    if (typeof authorityId !== 'string' || !UUID_RE.test(authorityId)) {
      return fail(res, 400, 'AUTHORITY_NOT_FOUND', 'Specialist organisation or authority not found in directory.');
    }
    const { data: org } = await supabaseAdmin.from('specialist_organisations').select('*').eq('id', authorityId).eq('active', true).maybeSingle();
    if (!org) return fail(res, 400, 'AUTHORITY_NOT_FOUND', 'Specialist organisation or authority not found in directory.');

    const now = new Date().toISOString();
    const note = `[${now}] Case escalated to authority [${org.name}] by ${user.displayName}. Referral notes: ${clip(referralNotes, 2000) || 'Standard priority escalation'}`;
    const { data: updated, error } = await supabaseAdmin.from('safeguarding_cases').update({
      stage: 'REFERRAL_ESCALATION',
      referred_authority_id: org.id,
      referred_authority_name: org.name,
      escalated_at: now,
      updated_at: now,
      status: 'ACTIONED',
      documentation_notes: [...(sgCase.documentation_notes || []), note]
    }).eq('id', sgCase.id).select().single();
    if (error) throw error;

    if (sgCase.incident_report_id) {
      await supabaseAdmin.from('safety_reports').update({ status: 'ESCALATED', assigned_reviewer_id: user.id }).eq('id', sgCase.incident_report_id);
    }
    await logCaseAudit(sgCase.id, user, 'CASE_ESCALATED_TO_AUTHORITY', {
      authorityId: org.id,
      authorityName: org.name,
      contactPhone: org.contact_phone,
      escalatedBy: user.displayName
    });

    const names = await reviewerNames([updated]);
    res.json({
      success: true,
      message: `Safeguarding case successfully referred to ${org.name}.`,
      data: { case: mapCase(updated, names), authority: mapOrg(org) }
    });
  }));

  // -------------------------------------------------------------------------
  // SPECIALIST ORGANISATION DIRECTORY (reviewers only)
  // -------------------------------------------------------------------------
  app.get('/api/v1/safeguarding/authorities', requireAuth, requireSafetyReviewer, handle('authorities list', async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('specialist_organisations').select('*').order('name');
    if (error) throw error;
    res.json({ success: true, data: { authorities: (data || []).map(mapOrg) } });
  }));

  app.post('/api/v1/safeguarding/authorities', requireAuth, requireSafetyReviewer, handle('authority create', async (req, res) => {
    const { name, category, contactPhone, contactEmail, website, protocolNotes } = req.body;
    const orgName = clip(name, 200);
    const phone = clip(contactPhone, 60);
    if (!orgName || !phone) {
      return fail(res, 400, 'INVALID_AUTHORITY', 'Name and contact phone are required.');
    }
    const { data: org, error } = await supabaseAdmin.from('specialist_organisations').insert({
      name: orgName,
      category: ORG_CATEGORIES.includes(category) ? category : 'OTHER',
      contact_phone: phone,
      contact_email: clip(contactEmail, 200),
      website: clip(website, 300),
      protocol_notes: clip(protocolNotes, 2000) || 'Configured specialist referral organisation',
      active: true
    }).select().single();
    if (error) throw error;
    await writeAudit(req.user!, 'SPECIALIST_AUTHORITY_CONFIGURED', 'SAFETY_AUTHORITY', org.id, { name: org.name });
    res.json({ success: true, message: 'Specialist organisation / authority successfully configured.', data: { authority: mapOrg(org) } });
  }));

  app.get('/api/v1/safeguarding/audit-logs', requireAuth, requireSafetyReviewer, handle('safeguarding audit', async (_req, res) => {
    const { data, error } = await supabaseAdmin.from('safeguarding_audit_entries').select('*').order('timestamp', { ascending: false }).limit(500);
    if (error) throw error;
    res.json({ success: true, data: { auditLogs: (data || []).map(mapAuditEntry) } });
  }));
}

/** Safety data for the admin Control Centre dashboard. */
export async function loadSafetyAdminData() {
  const [reports, cases, audit] = await Promise.all([
    supabaseAdmin.from('safety_reports').select('*').order('created_at', { ascending: false }).limit(200),
    supabaseAdmin.from('safeguarding_cases').select('*').order('created_at', { ascending: false }).limit(200),
    supabaseAdmin.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100)
  ]);
  for (const r of [reports, cases, audit]) if (r.error) throw r.error;
  const names = await reviewerNames(cases.data || []);
  return {
    safetyReports: (reports.data || []).map(mapReport),
    safeguardingCases: (cases.data || []).map(r => mapCase(r, names)),
    auditLogs: (audit.data || []).map(a => ({
      id: a.id,
      actorId: a.actor_id || 'system',
      actorName: a.actor_name || 'System',
      action: a.action,
      resource: a.resource,
      resourceId: a.resource_id,
      timestamp: a.timestamp,
      metadata: a.metadata || undefined
    }))
  };
}
