import express from 'express';
import { registerExampleRoutes } from './src/server/routes_rewritten_examples.js';
import { registerRealAuthRoutes } from './src/server/realAuthRoutes.js';
import { registerProviderApplicationSubmit } from './src/server/providerApplicationSubmit.js';
import { registerSessionRoutes, loadSessionAdminData } from './src/server/sessionRoutes.js';
import { registerSafetyRoutes, loadSafetyAdminData } from './src/server/safetyRoutes.js';
import { registerProfileRoutes } from './src/server/profileRoutes.js';
import { registerPushRoutes } from './src/server/pushRoutes.js';
import { applySecurity } from './src/server/security.js';
import { attachAuth, requireAuth, requireAdmin } from './src/server/authMiddleware.js';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { 
  CANONICAL_PACKAGES, 
  INITIAL_PROVIDERS, 
  DEMO_USERS, 
  MOCK_CMS_ARTICLES 
} from './src/data/mockData.js';
import { 
  User, 
  ProviderProfile, 
  Session, 
  SessionExtension,
  SupportRequest, 
  ProviderEarning, 
  Gift, 
  GiftDeliveryChannel,
  Feedback, 
  SafetyReport, 
  AuditLog, 
  UserRole,
  ProviderPayout,
  SafeguardingCase,
  SafeguardingStage,
  SpecialistOrganisation,
  UserBlock,
  SafeguardingAuditEntry,
  SafetyRiskCategory,
  CMSContent,
  CMSContentType,
  CMSWorkflowStatus,
  ProviderApplication,
  ProviderApplicationStatus
} from './src/types.js';


async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Identity document uploads: stored outside of /public so files are never
  // publicly served by URL guessing. Served only via an authenticated route.
  const uploadsDir = path.join(process.cwd(), 'private-uploads', 'identity-documents');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `id-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      }
    }),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (allowed.includes(file.mimetype)) cb(null, true);
      else cb(new Error('Only JPG, PNG, WEBP, or PDF files are allowed.'));
    }
  });
    app.use(express.json());
  applySecurity(app);
  registerExampleRoutes(app);
  registerRealAuthRoutes(app);
  registerProviderApplicationSubmit(app);
  registerSessionRoutes(app);
  registerSafetyRoutes(app);
  registerProfileRoutes(app);
  registerPushRoutes(app);
  
  // Memory Database Store for local prototype state
  let users: User[] = [...DEMO_USERS];
  let activeUserId: string | null = 'user-seeker-1';
  let cmsContents: CMSContent[] = [...MOCK_CMS_ARTICLES];

  // In-memory hash simulation / credential verification mapping
  let userPasswords: Record<string, string> = {
    'user-seeker-1': 'Password123!',
    'user-prov-1': 'Password123!',
    'user-admin-1': 'Password123!',
    'user-safety-1': 'Password123!',
    'user-editor-1': 'Password123!',
    'user-super-1': 'Password123!'
  };
  let userOtps: Record<string, { code: string; expiresAt: number }> = {};
  let providers: ProviderProfile[] = [...INITIAL_PROVIDERS];
  let providerApplications: ProviderApplication[] = [
    {
      id: 'app-demo-1',
      userId: 'user-seeker-1',
      legalName: 'Emmanuel Adeyemi',
      displayName: 'Emmanuel',
      dateOfBirth: '1995-04-12',
      email: 'emma@safespace.ng',
      phone: '+234 801 234 5678',
      location: 'Lagos, Nigeria',
      preferredLanguages: ['English', 'Yoruba', 'Nigerian Pidgin'],
      bioIntroduction: 'A calm, empathetic listener passionate about giving others space to express what is on their mind without judgment.',
      listeningExperience: 'Over 4 years of informal peer mentorship and community support volunteering.',
      hasSupportExperience: true,
      supportExperienceDetails: 'Volunteered with local university mental health peer support circle.',
      educationBackground: 'B.Sc. Psychology (University of Lagos)',
      certifications: 'Active Listening & Non-Violent Communication Workshop (2023)',
      languagesSpoken: ['English', 'Yoruba', 'Nigerian Pidgin'],
      maxDurationCapability: 60,
      weeklyAvailabilityWindows: ['Weekday Evenings (6pm - 10pm)', 'Weekend Afternoons (12pm - 6pm)'],
      isOver18: true,
      identityDocumentType: 'National Identification Number (NIN)',
      identityVerificationStatus: 'PENDING',
      backgroundScreeningStatus: 'PENDING',
      assessmentStatus: 'REQUIRED',
      safeguardingTrainingStatus: 'REQUIRED',
      platformTrainingStatus: 'REQUIRED',
      codeOfConductAccepted: true,
      codeOfConductAcceptedAt: new Date().toISOString(),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  let payouts: ProviderPayout[] = [
    {
      id: 'payout-prev-1',
      providerId: 'prov-sarah',
      amountNGN: 14200,
      status: 'PAID',
      scheduledFor: '2026-08-08T18:00:00.000Z',
      processedAt: '2026-08-08T18:05:00.000Z',
      bankName: 'Guaranty Trust Bank',
      accountNumberMasked: '•••• 8910'
    }
  ];
  let gifts: Gift[] = [
    {
      id: 'gift-demo-1',
      packageId: 'package-open',
      packageName: 'Open Conversation',
      durationMinutes: 30,
      priceNGN: 3000,
      purchaserId: 'user-seeker-1',
      purchaserName: 'Emma',
      recipientPhone: '+1 555 999 8888',
      recipientEmail: 'friend@example.com',
      recipientMessage: "You don't have to carry everything alone. I'm here for you.",
      deliveryChannel: 'EMAIL',
      giftCode: 'SAFE-GIFT-8821',
      status: 'DELIVERED',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      paidAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      deliveredAt: new Date(Date.now() - 3600000 * 11).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    }
  ];
  let feedbacks: Feedback[] = [];
  let auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      actorId: 'user-admin-1',
      actorName: 'Safespace Operations',
      action: 'SYSTEM_BOOT',
      resource: 'SYSTEM',
      resourceId: 'sys-0',
      timestamp: new Date().toISOString()
    }
  ];
  let systemSettings = {
    platformFeePercent: 60,
    providerSharePercent: 40,
    freeTrialEnabled: true,
    freeTrialSeconds: 180,
    maintenanceMode: false,
    minPayoutThresholdNGN: 5000,
    packages: [...CANONICAL_PACKAGES]
  };

  // Helper: Active user
  const getCurrentUser = (): User | null => {
    if (!activeUserId) return null;
    return users.find(u => u.id === activeUserId) || null;
  };

  // Helper: Create audit log
  const logAudit = (action: string, resource: string, resourceId: string, metadata?: Record<string, unknown>) => {
    const u = getCurrentUser();
    auditLogs.unshift({
      id: `audit-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      actorId: u ? u.id : 'system',
      actorName: u ? u.displayName : 'Anonymous System',
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      metadata
    });
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health
  app.get('/api/v1/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', app: 'Safespace', timestamp: new Date().toISOString() } });
  });

  // Gift a Conversation - Full Flow & States
  app.post('/api/v1/gifts', (req, res) => {
    const user = getCurrentUser();
    const { packageId, recipientPhone, recipientEmail, recipientMessage, deliveryChannel, simulatePaymentFailure } = req.body;

    const pkg = CANONICAL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PACKAGE', message: 'Gift package is invalid.' } });
    }

    const channel: GiftDeliveryChannel = deliveryChannel === 'PHONE' ? 'PHONE' : deliveryChannel === 'SECURE_LINK' ? 'SECURE_LINK' : 'EMAIL';

    // Simulated Payment Failure test option
    if (simulatePaymentFailure) {
      logAudit('GIFT_PAYMENT_FAILED', 'GIFT', `gift-fail-${Date.now()}`, { purchaserId: user.id, packageId: pkg.id });
      return res.status(400).json({
        success: false,
        error: { code: 'PAYMENT_FAILED', message: 'Payment authorization for gift failed. No gift was created.' }
      });
    }

    const giftId = `gift-${Date.now()}`;
    const giftCode = `SAFE-GIFT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const gift: Gift = {
      id: giftId,
      packageId: pkg.id,
      packageName: pkg.name,
      durationMinutes: pkg.durationMinutes,
      priceNGN: pkg.priceNGN,
      purchaserId: user.id,
      purchaserName: user.displayName,
      recipientPhone,
      recipientEmail,
      recipientMessage: recipientMessage || "You don't have to carry everything alone. I'm here for you.",
      deliveryChannel: channel,
      giftCode: giftCode,
      status: 'DELIVERED', // CREATED -> PAID -> DELIVERED
      createdAt: now,
      paidAt: now,
      deliveredAt: now,
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
    };

    gifts.unshift(gift);

    logAudit('PAYMENT_SUCCESS', 'PAYMENT', `pay-gift-${Date.now()}`, { amountNGN: pkg.priceNGN, giftId: gift.id });
    logAudit('GIFT_CREATED_AND_DELIVERED', 'GIFT', gift.id, { giftCode: gift.giftCode, deliveryChannel: channel });

    res.json({ success: true, data: { gift } });
  });

  // Get gifts list (Purchaser / Admin view)
  app.get('/api/v1/gifts', (_req, res) => {
    res.json({ success: true, data: { gifts } });
  });

  // Public Recipient Safe Gift Lookup (Excludes purchaser financial information)
  app.get('/api/v1/gifts/lookup/:code', (req, res) => {
    const code = String(req.params.code).toUpperCase().trim();
    const gift = gifts.find(g => g.giftCode.toUpperCase() === code);

    if (!gift) {
      return res.status(404).json({ success: false, error: { code: 'GIFT_NOT_FOUND', message: 'Gift voucher code not found.' } });
    }

    // Explicitly return ONLY recipient-safe public data. Omit any purchaser financial details!
    res.json({
      success: true,
      data: {
        giftCode: gift.giftCode,
        packageName: gift.packageName,
        durationMinutes: gift.durationMinutes,
        purchaserName: gift.purchaserName,
        recipientMessage: gift.recipientMessage,
        status: gift.status,
        expiresAt: gift.expiresAt
      }
    });
  });

  // Redeem / Claim Gift (Strict Single-Redemption)
  app.post('/api/v1/gifts/claim', (req, res) => {
    const user = getCurrentUser();
    const { giftCode } = req.body;
    const code = String(giftCode || '').toUpperCase().trim();

    const gift = gifts.find(g => g.giftCode.toUpperCase() === code);

    if (!gift) {
      return res.status(400).json({ success: false, error: { code: 'GIFT_NOT_FOUND', message: 'Gift voucher code is invalid.' } });
    }

    if (gift.status === 'CLAIMED') {
      return res.status(400).json({
        success: false,
        error: { code: 'GIFT_ALREADY_CLAIMED', message: 'This gift voucher has already been redeemed and can only be used once.' }
      });
    }

    if (gift.status === 'EXPIRED') {
      return res.status(400).json({
        success: false,
        error: { code: 'GIFT_EXPIRED', message: 'This gift voucher has expired.' }
      });
    }

    if (gift.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { code: 'GIFT_CANCELLED', message: 'This gift voucher was cancelled.' }
      });
    }

    // Perform claim
    gift.status = 'CLAIMED';
    gift.claimedAt = new Date().toISOString();
    gift.claimedBySeekerId = user.id;
    gift.claimedBySeekerName = user.displayName;

    logAudit('GIFT_CLAIMED', 'GIFT', gift.id, { claimedBy: user.id, giftCode: gift.giftCode });

    res.json({
      success: true,
      data: {
        gift: {
          giftCode: gift.giftCode,
          packageName: gift.packageName,
          durationMinutes: gift.durationMinutes,
          purchaserName: gift.purchaserName,
          recipientMessage: gift.recipientMessage,
          status: gift.status,
          claimedAt: gift.claimedAt
        }
      }
    });
  });

  // =========================================================================
  // PROVIDER APPLICATION & ONBOARDING LIFECYCLE API
  // =========================================================================
  
  // Get current user's provider application status
  app.get('/api/v1/providers/application/status', requireAuth, (req, res) => {
    const user = req.user!;

    const application = providerApplications.find(a => a.userId === user.id) || null;
    const isApprovedProvider = user.role === 'PROVIDER' || user.role === 'SUPER_ADMIN';
    const providerProfile = providers.find(p => p.userId === user.id) || null;

    res.json({
      success: true,
      data: {
        application,
        isApprovedProvider,
        providerProfile,
        lifecycleStatus: isApprovedProvider ? (providerProfile?.verificationStatus === 'PROBATION' ? 'PROBATION' : 'APPROVED') : (application?.status || 'DRAFT')
      }
    });
  });

  // Save / Update application progress
  app.post('/api/v1/providers/application/save', requireAuth, (req, res) => {
    const user = req.user!;

    const payload = req.body;
    let application = providerApplications.find(a => a.userId === user.id);

    if (!application) {
      application = {
        id: `app-${Date.now()}`,
        userId: user.id,
        legalName: payload.legalName || user.displayName,
        displayName: payload.displayName || user.displayName,
        dateOfBirth: payload.dateOfBirth || '',
        email: payload.email || user.email,
        phone: payload.phone || user.phone || '',
        location: payload.location || 'Nigeria',
        preferredLanguages: payload.preferredLanguages || ['English'],
        bioIntroduction: payload.bioIntroduction || '',
        listeningExperience: payload.listeningExperience || '',
        hasSupportExperience: Boolean(payload.hasSupportExperience),
        supportExperienceDetails: payload.supportExperienceDetails || '',
        educationBackground: payload.educationBackground || '',
        certifications: payload.certifications || '',
        languagesSpoken: payload.languagesSpoken || ['English'],
        maxDurationCapability: payload.maxDurationCapability || 30,
        weeklyAvailabilityWindows: payload.weeklyAvailabilityWindows || ['Weekday Evenings (6pm - 10pm)'],
        isOver18: Boolean(payload.isOver18),
        identityDocumentType: payload.identityDocumentType || 'National Identification Number (NIN)',
        identityVerificationStatus: payload.identityVerificationStatus || 'PENDING',
        backgroundScreeningStatus: payload.backgroundScreeningStatus || 'PENDING',
        assessmentStatus: payload.assessmentStatus || 'REQUIRED',
        safeguardingTrainingStatus: payload.safeguardingTrainingStatus || 'REQUIRED',
        platformTrainingStatus: payload.platformTrainingStatus || 'REQUIRED',
        codeOfConductAccepted: Boolean(payload.codeOfConductAccepted),
        codeOfConductAcceptedAt: payload.codeOfConductAccepted ? new Date().toISOString() : undefined,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      providerApplications.unshift(application);
    } else {
      // Merge updates
      Object.assign(application, payload, {
        updatedAt: new Date().toISOString()
      });
    }

    logAudit('PROVIDER_APPLICATION_SAVED', 'PROVIDER_APPLICATION', application.id, { status: application.status });

    res.json({ success: true, data: { application } });
  });

  // Submit completed application
  app.post('/api/v1/providers/application/upload-id', requireAuth, (req, res) => {
    const user = req.user!;

    upload.single('identityDocument')(req, res, (err: unknown) => {
      if (err) {
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        return res.status(400).json({ success: false, error: { code: 'UPLOAD_FAILED', message } });
      }
      const file = (req as express.Request & { file?: Express.Multer.File }).file;
      if (!file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file was received.' } });
      }

      let application = providerApplications.find(a => a.userId === user.id);
      if (!application) {
        application = {
          id: `app-${Date.now()}`,
          userId: user.id,
          legalName: user.displayName,
          displayName: user.displayName,
          dateOfBirth: '',
          email: user.email,
          phone: user.phone || '',
          location: 'Nigeria',
          preferredLanguages: ['English'],
          bioIntroduction: '',
          listeningExperience: '',
          hasSupportExperience: false,
          languagesSpoken: ['English'],
          maxDurationCapability: 30,
          weeklyAvailabilityWindows: [],
          isOver18: true,
          identityVerificationStatus: 'PENDING',
          backgroundScreeningStatus: 'PENDING',
          assessmentStatus: 'REQUIRED',
          safeguardingTrainingStatus: 'REQUIRED',
          platformTrainingStatus: 'REQUIRED',
          codeOfConductAccepted: false,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        providerApplications.unshift(application);
      }

      application.identityDocumentFileName = file.filename;
      application.identityDocumentUploadedAt = new Date().toISOString();
      application.updatedAt = new Date().toISOString();

      logAudit('PROVIDER_ID_DOCUMENT_UPLOADED', 'PROVIDER_APPLICATION', application.id, { originalName: file.originalname });

      res.json({
        success: true,
        message: 'Identity document uploaded.',
        data: { fileName: file.filename }
      });
    });
  });

  app.post('/api/v1/providers/application/submit', requireAuth, (req, res) => {
    const user = req.user!;

    let application = providerApplications.find(a => a.userId === user.id);
    const payload = req.body;

    if (!application) {
      application = {
        id: `app-${Date.now()}`,
        userId: user.id,
        legalName: payload.legalName || user.displayName,
        displayName: payload.displayName || user.displayName,
        dateOfBirth: payload.dateOfBirth || '',
        email: payload.email || user.email,
        phone: payload.phone || user.phone || '',
        location: payload.location || 'Nigeria',
        preferredLanguages: payload.preferredLanguages || ['English'],
        bioIntroduction: payload.bioIntroduction || '',
        listeningExperience: payload.listeningExperience || '',
        hasSupportExperience: Boolean(payload.hasSupportExperience),
        supportExperienceDetails: payload.supportExperienceDetails || '',
        educationBackground: payload.educationBackground || '',
        certifications: payload.certifications || '',
        languagesSpoken: payload.languagesSpoken || ['English'],
        maxDurationCapability: payload.maxDurationCapability || 30,
        weeklyAvailabilityWindows: payload.weeklyAvailabilityWindows || ['Weekday Evenings (6pm - 10pm)'],
        isOver18: Boolean(payload.isOver18),
        identityDocumentType: payload.identityDocumentType || 'National Identification Number (NIN)',
        identityVerificationStatus: 'IN_REVIEW',
        backgroundScreeningStatus: 'PENDING',
        assessmentStatus: 'REQUIRED',
        safeguardingTrainingStatus: 'REQUIRED',
        platformTrainingStatus: 'REQUIRED',
        codeOfConductAccepted: true,
        codeOfConductAcceptedAt: new Date().toISOString(),
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      providerApplications.unshift(application);
    } else {
      if (payload) {
        Object.assign(application, payload);
      }
      application.status = 'SUBMITTED';
      application.submittedAt = new Date().toISOString();
      application.identityVerificationStatus = 'IN_REVIEW';
      application.updatedAt = new Date().toISOString();
    }

    logAudit('PROVIDER_APPLICATION_SUBMITTED', 'PROVIDER_APPLICATION', application.id, { submittedBy: user.id });

    res.json({
      success: true,
      message: "Application submitted. Thank you. We'll review your application and guide you through the next steps.",
      data: { application }
    });
  });

  // Stage Advancement Simulator / Reviewer Workflow (Backend-Authoritative)
  app.post('/api/v1/providers/application/advance-stage', requireAuth, (req, res) => {
    const user = req.user!;
    
    // RBAC Security Boundary: Ordinary seekers/applicants cannot advance their own application stages.
    const isAuthorizedReviewer = ['SUPER_ADMIN', 'SAFETY_REVIEWER', 'PROVIDER_OPS'].includes(user.role);
    
    if (!isAuthorizedReviewer) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Provider stage progression is strictly backend-authoritative and requires authorized reviewer or administrator clearance.'
        }
      });
    }

    const { applicationId, nextStatus, action } = req.body;
    let application = applicationId 
      ? providerApplications.find(a => a.id === applicationId)
      : providerApplications.find(a => a.userId === user.id);

    if (!application) {
      // Fallback: If target application not found, find the latest pending application
      application = providerApplications[0];
    }

    if (!application) {
      return res.status(404).json({ success: false, error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found.' } });
    }

    const previousStatus = application.status;

    if (action === 'VERIFY_IDENTITY') {
      application.identityVerificationStatus = 'VERIFIED';
      application.backgroundScreeningStatus = 'IN_PROGRESS';
      application.status = 'SCREENING';
    } else if (action === 'PASS_SCREENING') {
      application.backgroundScreeningStatus = 'PASSED';
      application.assessmentStatus = 'SCHEDULED';
      application.status = 'INTERVIEW';
    } else if (action === 'COMPLETE_ASSESSMENT') {
      application.assessmentStatus = 'COMPLETED';
      application.safeguardingTrainingStatus = 'IN_PROGRESS';
      application.platformTrainingStatus = 'REQUIRED';
      application.status = 'TRAINING';
    } else if (action === 'COMPLETE_TRAINING') {
      application.safeguardingTrainingStatus = 'COMPLETED';
      application.platformTrainingStatus = 'COMPLETED';
      application.status = 'PENDING_APPROVAL';
    } else if (action === 'APPROVE_PROVIDER' || nextStatus === 'APPROVED' || nextStatus === 'PROBATION') {
      application.status = nextStatus || 'APPROVED';
      application.identityVerificationStatus = 'VERIFIED';
      application.backgroundScreeningStatus = 'PASSED';
      application.assessmentStatus = 'COMPLETED';
      application.safeguardingTrainingStatus = 'COMPLETED';
      application.platformTrainingStatus = 'COMPLETED';

      // Find the applicant user and upgrade them
      const applicantUser = users.find(u => u.id === application.userId) || user;
      applicantUser.role = 'PROVIDER';

      let existingProfile = providers.find(p => p.userId === applicantUser.id);
      if (!existingProfile) {
        existingProfile = {
          id: `prov-${applicantUser.id.slice(-6)}`,
          userId: applicantUser.id,
          displayName: application.displayName || applicantUser.displayName,
          bio: application.bioIntroduction || 'Compassionate Safespace verified listener.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          languages: application.languagesSpoken || ['English'],
          gender: 'female',
          verified: true,
          verificationStatus: nextStatus === 'PROBATION' ? 'PROBATION' : 'VERIFIED',
          availabilityStatus: 'AVAILABLE',
          maxSessionMinutes: application.maxDurationCapability || 60,
          rating: 5.0,
          ratingCount: 0,
          sessionsCompleted: 0,
          qualityScore: 100,
          listeningAreas: ['Everyday Overwhelm', 'Work Stress', 'Loneliness & Quiet Moments'],
          preferredSessionTypes: ['Voice Call'],
          progressionLevel: 'PEER_LISTENER',
          trainingCompleted: true
        };
        providers.unshift(existingProfile);
      } else {
        existingProfile.verified = true;
        existingProfile.verificationStatus = nextStatus === 'PROBATION' ? 'PROBATION' : 'VERIFIED';
      }
    } else if (nextStatus) {
      application.status = nextStatus as ProviderApplicationStatus;
    }

    application.updatedAt = new Date().toISOString();
    logAudit('PROVIDER_APPLICATION_STAGE_UPDATED', 'PROVIDER_APPLICATION', application.id, { 
      reviewerId: user.id,
      fromStatus: previousStatus,
      newStatus: application.status,
      action
    });

    res.json({ success: true, data: { application, user } });
  });

  // Admin Control Centre Comprehensive Data API
  // Admin only: this returns every user's sessions, requests and earnings.
  app.get('/api/v1/admin/dashboard', requireAuth, requireAdmin, async (_req, res) => {
    let sessionData: Awaited<ReturnType<typeof loadSessionAdminData>>;
    try {
      sessionData = await loadSessionAdminData();
    } catch (err) {
      console.error('[Safespace] admin dashboard load failed:', err);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Could not load dashboard data.' } });
    }
    const { sessions, supportRequests, providerEarnings, providers } = sessionData;
    let safetyData: Awaited<ReturnType<typeof loadSafetyAdminData>>;
    try {
      safetyData = await loadSafetyAdminData();
    } catch (err) {
      console.error('[Safespace] admin dashboard safety load failed:', err);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Could not load dashboard data.' } });
    }
    const { safetyReports, safeguardingCases } = safetyData;
    // Persisted events plus the ones still logged in memory by areas not yet moved to the database.
    const combinedAuditLogs = [...safetyData.auditLogs, ...auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);
    const totalRevenue = providerEarnings.reduce((sum, e) => sum + e.grossSessionValueNGN, 0);
    const totalProviderPayouts = providerEarnings.reduce((sum, e) => sum + e.providerAmountNGN, 0);

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: users.length,
          totalProviders: providers.length,
          totalApplications: providerApplications.length,
          pendingApplications: providerApplications.filter(a => ['SUBMITTED', 'SCREENING', 'INTERVIEW', 'TRAINING', 'PENDING_APPROVAL'].includes(a.status)).length,
          activeSessions: sessions.filter(s => s.status === 'ACTIVE').length,
          completedSessions: sessions.filter(s => s.status === 'COMPLETED').length,
          totalRevenueNGN: totalRevenue,
          totalPayoutsNGN: totalProviderPayouts,
          platformMarginNGN: totalRevenue - totalProviderPayouts,
          pendingSafetyReports: safetyReports.filter(r => r.status === 'PENDING').length
        },
        sessions,
        users,
        providers,
        providerApplications,
        supportRequests,
        providerEarnings,
        payouts,
        gifts,
        feedbacks,
        safetyReports,
        safeguardingCases,
        cmsContents,
        settings: systemSettings,
        auditLogs: combinedAuditLogs
      }
    });
  });

  // Action: Toggle User Account Status (ACTIVE / SUSPENDED) with Audit Log
  app.post('/api/v1/admin/users/:id/status', requireAuth, requireAdmin, (req, res) => {
    const user = getCurrentUser();
    const { status, reason } = req.body;
    const targetUser = users.find(u => u.id === req.params.id);

    if (!targetUser) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account not found' } });
    }

    const previousStatus = targetUser.status;
    targetUser.status = status;

    logAudit('USER_STATUS_UPDATED', 'USER', targetUser.id, {
      displayName: targetUser.displayName,
      email: targetUser.email,
      fromStatus: previousStatus,
      toStatus: status,
      reason: reason || 'Administrative status change'
    });

    res.json({
      success: true,
      message: `User ${targetUser.displayName} status updated to ${status}.`,
      data: { user: targetUser }
    });
  });

  // Action: Verify / Approve / Reject Listener Profile with Audit Log
  app.post('/api/v1/admin/providers/:id/verify', (req, res) => {
    const { verificationStatus } = req.body;
    const provider = providers.find(p => p.id === req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, error: { code: 'PROVIDER_NOT_FOUND', message: 'Listener profile not found' } });
    }

    const previousVerification = provider.verificationStatus;
    provider.verificationStatus = verificationStatus;
    provider.verified = (verificationStatus === 'VERIFIED');

    logAudit('PROVIDER_VERIFICATION_UPDATED', 'PROVIDER_PROFILE', provider.id, {
      displayName: provider.displayName,
      from: previousVerification,
      to: verificationStatus,
      verified: provider.verified
    });

    res.json({
      success: true,
      message: `Listener ${provider.displayName} verification state set to ${verificationStatus}.`,
      data: { provider }
    });
  });

  // Action: Approve / Process Bank Payout with Audit Log
  app.post('/api/v1/admin/payouts/:id/process', requireAuth, requireAdmin, (req, res) => {
    const payout = payouts.find(p => p.id === req.params.id);
    if (!payout) {
      return res.status(404).json({ success: false, error: { code: 'PAYOUT_NOT_FOUND', message: 'Payout record not found' } });
    }

    payout.status = 'PAID';
    payout.processedAt = new Date().toISOString();

    logAudit('PAYOUT_PROCESSED', 'PROVIDER_PAYOUT', payout.id, {
      providerId: payout.providerId,
      amountNGN: payout.amountNGN,
      bankName: payout.bankName,
      accountNumberMasked: payout.accountNumberMasked
    });

    res.json({
      success: true,
      message: `Payout of ₦${payout.amountNGN.toLocaleString()} processed successfully to ${payout.bankName}.`,
      data: { payout }
    });
  });

  // Action: Generate Admin Promo Gift Voucher with Audit Log
  app.post('/api/v1/admin/gifts/generate', requireAuth, requireAdmin, (req, res) => {
    const user = getCurrentUser();
    const { packageId, recipientEmail, recipientMessage } = req.body;
    const pkg = CANONICAL_PACKAGES.find(p => p.id === packageId) || CANONICAL_PACKAGES[1];

    const giftCode = `ADMIN-SAFE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGift: Gift = {
      id: `gift-${Date.now()}`,
      packageId: pkg.id,
      packageName: pkg.name,
      durationMinutes: pkg.durationMinutes,
      priceNGN: pkg.priceNGN,
      purchaserId: user?.id || 'admin-sys',
      purchaserName: user?.displayName || 'Safespace Operations',
      recipientEmail: recipientEmail || 'granted-user@safespace.ng',
      recipientMessage: recipientMessage || 'Complimentary Safespace conversation credit granted by operations.',
      deliveryChannel: 'EMAIL',
      giftCode,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 60).toISOString()
    };

    gifts.unshift(newGift);
    logAudit('ADMIN_GIFT_VOUCHER_GENERATED', 'GIFT_VOUCHER', newGift.id, {
      giftCode: newGift.giftCode,
      packageName: newGift.packageName,
      recipientEmail: newGift.recipientEmail
    });

    res.json({
      success: true,
      message: `Promotional gift code ${giftCode} generated and issued.`,
      data: { gift: newGift }
    });
  });

  // Action: Update System Settings & Pricing Configs with Audit Log
  app.put('/api/v1/admin/settings', (req, res) => {
    const { platformFeePercent, providerSharePercent, freeTrialEnabled, maintenanceMode, minPayoutThresholdNGN } = req.body;

    if (platformFeePercent !== undefined) systemSettings.platformFeePercent = Number(platformFeePercent);
    if (providerSharePercent !== undefined) systemSettings.providerSharePercent = Number(providerSharePercent);
    if (freeTrialEnabled !== undefined) systemSettings.freeTrialEnabled = Boolean(freeTrialEnabled);
    if (maintenanceMode !== undefined) systemSettings.maintenanceMode = Boolean(maintenanceMode);
    if (minPayoutThresholdNGN !== undefined) systemSettings.minPayoutThresholdNGN = Number(minPayoutThresholdNGN);

    logAudit('SYSTEM_SETTINGS_UPDATED', 'SETTINGS', 'sys-config', {
      updatedSettings: systemSettings
    });

    res.json({
      success: true,
      message: 'Safespace System Settings updated successfully.',
      data: { settings: systemSettings }
    });
  });

  // Get Admin Audit Logs
  app.get('/api/v1/admin/audit-logs', (_req, res) => {
    res.json({
      success: true,
      data: { auditLogs }
    });
  });

  // ==========================================
  // CMS & CONTENT MANAGEMENT SYSTEM ENDPOINTS
  // ==========================================

  // List all CMS contents (support filtering by type or workflow status)
  app.get('/api/v1/cms/contents', (req, res) => {
    const { type, status } = req.query;
    let filtered = [...cmsContents];

    if (type) {
      filtered = filtered.filter(item => item.type === String(type).toUpperCase());
    }
    if (status) {
      filtered = filtered.filter(item => item.status === String(status).toUpperCase());
    }

    res.json({
      success: true,
      data: {
        contents: filtered,
        count: filtered.length
      }
    });
  });

  // Get single CMS content item by ID or Slug
  app.get('/api/v1/cms/contents/:idOrSlug', (req, res) => {
    const target = req.params.idOrSlug;
    const item = cmsContents.find(c => c.id === target || c.slug === target);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CMS content item not found.' } });
    }
    res.json({ success: true, data: { content: item } });
  });

  // Create new CMS content item
  app.post('/api/v1/cms/contents', (req, res) => {
    const user = getCurrentUser();
    if (!user || !['CONTENT_EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Content editing privileges required.' } });
    }

    const { 
      title, 
      slug, 
      type, 
      summary, 
      content, 
      seo_title, 
      meta_description, 
      canonical_url, 
      og_title, 
      og_description, 
      og_image, 
      structured_data, 
      robots_directive 
    } = req.body;

    if (!title || !type || !content) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Title, type, and content are required.' } });
    }

    const generatedSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + `-${Date.now().toString().slice(-4)}`;

    const newItem: CMSContent = {
      id: `cms-${Date.now()}`,
      slug: generatedSlug,
      title: String(title).trim(),
      type: type as CMSContentType,
      summary: summary ? String(summary).trim() : '',
      content: String(content).trim(),
      status: 'DRAFT',
      authorId: user.id,
      authorName: user.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo_title: seo_title || `${title} | Safespace`,
      meta_description: meta_description || summary || '',
      canonical_url: canonical_url || `https://safespace.ng/${generatedSlug}`,
      og_title: og_title || title,
      og_description: og_description || summary || '',
      og_image: og_image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
      structured_data: structured_data || '',
      robots_directive: robots_directive || 'index, follow'
    };

    cmsContents.unshift(newItem);
    logAudit('CMS_CONTENT_CREATED', 'CMSContent', newItem.id, { title: newItem.title, type: newItem.type });

    res.json({
      success: true,
      message: 'CMS item created in DRAFT workflow state.',
      data: { content: newItem }
    });
  });

  // Update existing CMS content item
  app.put('/api/v1/cms/contents/:id', (req, res) => {
    const user = getCurrentUser();
    if (!user || !['CONTENT_EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Content editing privileges required.' } });
    }

    const index = cmsContents.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CMS item not found.' } });
    }

    const existing = cmsContents[index];
    const updated: CMSContent = {
      ...existing,
      ...req.body,
      id: existing.id, // Preserve ID
      updatedAt: new Date().toISOString()
    };

    cmsContents[index] = updated;
    logAudit('CMS_CONTENT_UPDATED', 'CMSContent', updated.id, { title: updated.title, status: updated.status });

    res.json({
      success: true,
      message: 'CMS item updated successfully.',
      data: { content: updated }
    });
  });

  // CMS Workflow transition (DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> ARCHIVED)
  app.post('/api/v1/cms/contents/:id/workflow', (req, res) => {
    const user = getCurrentUser();
    if (!user || !['CONTENT_EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Workflow review privileges required.' } });
    }

    const { targetStatus } = req.body;
    const validStatuses: CMSWorkflowStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];
    
    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_WORKFLOW_STATE', message: 'Invalid target workflow state.' } });
    }

    const item = cmsContents.find(c => c.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CMS item not found.' } });
    }

    const oldStatus = item.status;
    item.status = targetStatus;
    item.updatedAt = new Date().toISOString();

    if (targetStatus === 'APPROVED') {
      item.reviewerId = user.id;
      item.reviewerName = user.displayName;
      item.approvedAt = new Date().toISOString();
    } else if (targetStatus === 'PUBLISHED') {
      item.publishedAt = item.publishedAt || new Date().toISOString();
    }

    logAudit('CMS_WORKFLOW_TRANSITION', 'CMSContent', item.id, { from: oldStatus, to: targetStatus });

    res.json({
      success: true,
      message: `Workflow state transitioned from ${oldStatus} to ${targetStatus}.`,
      data: { content: item }
    });
  });

  // Archive or Delete CMS content
  app.delete('/api/v1/cms/contents/:id', (req, res) => {
    const user = getCurrentUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin privileges required to delete CMS items.' } });
    }

    const index = cmsContents.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CMS item not found.' } });
    }

    cmsContents[index].status = 'ARCHIVED';
    cmsContents[index].updatedAt = new Date().toISOString();

    logAudit('CMS_CONTENT_ARCHIVED', 'CMSContent', req.params.id);

    res.json({ success: true, message: 'CMS item archived.' });
  });

  // Legacy Articles API compatibility
  app.get('/api/v1/cms/articles', (_req, res) => {
    res.json({ success: true, data: { articles: cmsContents.filter(c => c.status === 'PUBLISHED') } });
  });

  app.get('/api/v1/cms/articles/:slug', (req, res) => {
    const article = cmsContents.find(a => a.slug === req.params.slug);
    if (!article) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Article not found.' } });
    res.json({ success: true, data: { article } });
  });

  // ==========================================
  // LLM & MACHINE DISCOVERABILITY ENDPOINTS
  // ==========================================

  // /llms.txt Machine-readable public info endpoint
  app.get('/llms.txt', (_req, res) => {
    res.type('text/plain').send(`# SAFESPACE
Tagline: On-demand Human Emotional Listening & Companionship Marketplace
Category: Human Emotional Support Platform
Primary Market: Nigeria & Africa
Canonical Website: https://safespace.ng

## What Safespace Is
Safespace is a Progressive Web Application (PWA) facilitating on-demand, one-to-one human emotional listening and companionship. Support Seekers connect privately with verified peer Listeners without clinical barriers or judgment.

## What Safespace Does NOT Provide
Safespace does NOT provide medical diagnosis, psychotherapy, psychiatric treatment, emergency medical care, or clinical crisis intervention. Safespace is a non-clinical human listening marketplace.

## Session Packages & Transparent Pricing
- Try Safespace: 3 minutes free (1 trial per new user account)
- Quick Talk: 15 minutes (₦1,000)
- Open Conversation: 30 minutes (₦3,000)
- Deep Conversation: 60 minutes (₦5,000)
- Stay With Me: 90 minutes (₦10,000)

## Privacy & Safeguarding Policy
- No Automatic Audio Recording: Audio conversations are streamed directly and never recorded or harvested for AI training.
- Masked Identity: Contact numbers and personal identifiers are shielded from listeners.
- Human-in-the-Loop Safeguarding: Immediate physical danger or exploitation triggers human review with specialist partner escalation.

## CMS Workflow Governance
Safespace Content Management System enforces strict workflow governance: DRAFT -> REVIEW -> APPROVED -> PUBLISHED -> ARCHIVED.

## Structured Data Schemas Supported
- Organization (Safespace platform entity)
- WebSite (Main site discovery)
- WebPage (Canonical page metadata)
- Service (Non-clinical emotional listening services)
- FAQPage (Platform and safety questions & answers)
- BreadcrumbList (Hierarchical page routing)
- Article (Wellness and active listening articles)

## Public Canonical Routes
- /safespace
- /how-it-works
- /emotional-support
- /listening-support
- /pricing
- /safety
- /privacy
- /about
- /for-listeners
- /gift-a-conversation
- /professional-support
- /resources
`);
  });

  // /robots.txt Search Engine Crawling Directive
  app.get('/robots.txt', (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    res.type('text/plain').send(`User-agent: *
Allow: /
Allow: /safespace
Allow: /how-it-works
Allow: /emotional-support
Allow: /listening-support
Allow: /pricing
Allow: /safety
Allow: /privacy
Allow: /about
Allow: /for-listeners
Allow: /gift-a-conversation
Allow: /professional-support
Allow: /resources
Disallow: /api/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // /sitemap.xml Dynamic Sitemap Generator
  app.get('/sitemap.xml', (_req, res) => {
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const canonicalRoutes = [
      { path: '/safespace', priority: '1.0', changefreq: 'daily' },
      { path: '/how-it-works', priority: '0.9', changefreq: 'weekly' },
      { path: '/emotional-support', priority: '0.9', changefreq: 'weekly' },
      { path: '/listening-support', priority: '0.8', changefreq: 'weekly' },
      { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
      { path: '/safety', priority: '0.9', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.8', changefreq: 'monthly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/for-listeners', priority: '0.8', changefreq: 'weekly' },
      { path: '/gift-a-conversation', priority: '0.8', changefreq: 'weekly' },
      { path: '/professional-support', priority: '0.8', changefreq: 'weekly' },
      { path: '/resources', priority: '0.8', changefreq: 'weekly' }
    ];

    const publishedCmsItems = cmsContents.filter(c => c.status === 'PUBLISHED');
    const cmsUrlsXml = publishedCmsItems.map(item => `
  <url>
    <loc>${baseUrl}/resources/${item.slug}</loc>
    <lastmod>${new Date(item.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

    const routesXml = canonicalRoutes.map(r => `
  <url>
    <loc>${baseUrl}${r.path}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('');

    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routesXml}${cmsUrlsXml}
</urlset>`);
  });


  // Vite Middleware in Development / Static Files in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Safespace] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
