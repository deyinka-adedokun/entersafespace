import express from 'express';
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
  const PORT = 3000;

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

  // PWA Dynamic SVG Icon Endpoints
  const generatePwaIconSvg = (size: number, isMaskable = false) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" fill="#064E3B" rx="${isMaskable ? 0 : size * 0.22}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="#047857" opacity="0.4" />
      <path d="M${size * 0.3} ${size * 0.65} C${size * 0.3} ${size * 0.45}, ${size * 0.4} ${size * 0.35}, ${size * 0.5} ${size * 0.35} C${size * 0.6} ${size * 0.35}, ${size * 0.7} ${size * 0.45}, ${size * 0.7} ${size * 0.65}" fill="none" stroke="#FDE68A" stroke-width="${size * 0.05}" stroke-linecap="round" />
      <circle cx="${size * 0.5}" cy="${size * 0.32}" r="${size * 0.08}" fill="#FDE68A" />
      <text x="${size / 2}" y="${size * 0.82}" font-family="sans-serif" font-weight="bold" font-size="${size * 0.12}" fill="#FAF8F5" text-anchor="middle">Safespace</text>
    </svg>
  `;

  app.get(['/pwa-192.png', '/pwa-512.png', '/pwa-maskable.png'], (req, res) => {
    const isMaskable = req.path.includes('maskable');
    const size = req.path.includes('512') ? 512 : 192;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(generatePwaIconSvg(size, isMaskable));
  });

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
  let sessions: Session[] = [];
  let sessionExtensions: SessionExtension[] = [];
  let supportRequests: SupportRequest[] = [];
  let providerEarnings: ProviderEarning[] = [
    {
      id: 'earn-1',
      providerId: 'prov-sarah',
      sessionId: 'sess-prev-101',
      packageName: 'Open Conversation (30 min)',
      grossSessionValueNGN: 3000,
      providerSharePercent: 40,
      providerAmountNGN: 1200,
      status: 'AVAILABLE',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'earn-2',
      providerId: 'prov-sarah',
      sessionId: 'sess-prev-102',
      packageName: 'Deep Conversation (60 min)',
      grossSessionValueNGN: 5000,
      providerSharePercent: 40,
      providerAmountNGN: 2000,
      status: 'PENDING',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
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
  let safetyReports: SafetyReport[] = [
    {
      id: 'report-demo-1',
      reporterId: 'user-seeker-1',
      reporterRole: 'SUPPORT_SEEKER',
      reportedUserId: 'user-prov-1',
      category: 'HARASSMENT' as any,
      details: 'Uncomfortable personal boundary question during listening session.',
      status: 'UNDER_REVIEW',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];

  let userBlocks: UserBlock[] = [];

  let specialistOrganisations: SpecialistOrganisation[] = [
    {
      id: 'org-child-1',
      name: 'National Child Protection & Rights Network',
      category: 'CHILD_ABUSE',
      contactPhone: '+234 800 000 CHILD (24453)',
      contactEmail: 'safeguarding@childrights.org',
      protocolNotes: '24/7 priority escalation for minor safety, child abuse or exploitation concerns.',
      active: true
    },
    {
      id: 'org-gbv-1',
      name: 'Gender-Based Violence & Domestic Crisis Center',
      category: 'DOMESTIC_VIOLENCE',
      contactPhone: '+234 800 333 3333',
      contactEmail: 'helpline@gbvcrisis.org',
      protocolNotes: 'Confidential crisis counseling, shelter referral, and emergency safety planning.',
      active: true
    },
    {
      id: 'org-suicide-1',
      name: 'Nigeria Mental Health & Crisis Intervention Hotline',
      category: 'SUICIDE_RISK',
      contactPhone: '+234 806 210 6497',
      contactEmail: 'emergency@crisisintervention.ng',
      protocolNotes: 'Certified psychiatric nurse triage and immediate de-escalation response team.',
      active: true
    },
    {
      id: 'org-trafficking-1',
      name: 'National Agency Prohibition of Trafficking Helpline',
      category: 'TRAFFICKING',
      contactPhone: '+234 703 000 0014',
      contactEmail: 'report@traffickingresponse.gov.ng',
      protocolNotes: 'Specialized unit for forced labor, human trafficking, and exploitation.',
      active: true
    }
  ];

  let safeguardingCases: SafeguardingCase[] = [
    {
      id: 'case-sg-101',
      incidentReportId: 'report-demo-1',
      reporterId: 'user-seeker-1',
      reporterRole: 'SUPPORT_SEEKER',
      reportedUserId: 'user-prov-1',
      riskCategory: 'THREAT_OF_VIOLENCE',
      riskSeverity: 'HIGH',
      stage: 'REVIEW',
      assignedReviewerId: 'user-admin-1',
      assignedReviewerName: 'Safespace Safeguarding Officer',
      aiRiskScore: 0.82,
      aiSummaryHint: 'Automated AI Risk Advisory: Explicit boundary violation detected. High priority review advised.',
      documentationNotes: [
        `Case opened automatically from incident report report-demo-1 at ${new Date(Date.now() - 3600000 * 5).toISOString()}`
      ],
      status: 'IN_REVIEW',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ];

  let safeguardingAuditEntries: SafeguardingAuditEntry[] = [
    {
      id: 'sg-audit-1',
      caseId: 'case-sg-101',
      actorId: 'user-admin-1',
      actorName: 'Safespace Safeguarding Officer',
      actorRole: 'ADMIN',
      action: 'CASE_CREATED',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      details: { initialSeverity: 'HIGH', riskCategory: 'THREAT_OF_VIOLENCE' }
    }
  ];
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
  let preferredRebookProviderId: string | null = 'prov-sarah';
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

  // Auth & Identity
  app.get('/api/v1/auth/me', (_req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.json({
        success: true,
        data: { user: null, providerProfile: null, preferredRebookProvider: null }
      });
    }
    const provider = providers.find(p => p.userId === user.id);
    res.json({
      success: true,
      data: {
        user,
        providerProfile: provider || null,
        preferredRebookProvider: providers.find(p => p.id === preferredRebookProviderId) || null
      }
    });
  });

  app.post('/api/v1/auth/register', (req, res) => {
    const { email, password, displayName, phone, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password are required.' } });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'EMAIL_IN_USE', message: 'An account with this email address already exists.' } });
    }

    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      displayName: displayName ? displayName.trim() : email.split('@')[0],
      role: (role as UserRole) || 'SUPPORT_SEEKER',
      status: 'UNVERIFIED',
      freeTrialUsed: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    userPasswords[userId] = password;

    // Generate 6-digit OTP
    const otpCode = '123456'; // Default demo OTP code
    userOtps[newUser.email] = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    logAudit('USER_REGISTERED', 'USER', userId, { role: newUser.role, status: newUser.status });

    res.json({
      success: true,
      requiresOtp: true,
      message: 'Registration successful! Verification OTP code sent to your email/phone.',
      data: { email: newUser.email, user: newUser }
    });
  });

  app.post('/api/v1/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_OTP', message: 'Email and 6-digit OTP code are required.' } });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Account not found.' } });
    }

    const storedOtp = userOtps[user.email];
    if (otp !== '123456' && (!storedOtp || storedOtp.code !== otp || Date.now() > storedOtp.expiresAt)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP code. Use demo code 123456.' } });
    }

    // Mark active and delete OTP
    user.status = 'ACTIVE';
    delete userOtps[user.email];
    activeUserId = user.id;

    logAudit('OTP_VERIFIED', 'USER', user.id);

    const provider = providers.find(p => p.userId === user.id);

    res.json({
      success: true,
      message: 'Account verified successfully.',
      data: { user, providerProfile: provider || null }
    });
  });

  app.post('/api/v1/auth/resend-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_EMAIL', message: 'Email is required.' } });
    }
    const otpCode = '123456';
    userOtps[email.toLowerCase()] = {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    res.json({ success: true, message: 'New 6-digit OTP code sent. Use demo code 123456.' });
  });

  app.post('/api/v1/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_CREDENTIALS', message: 'Email is required.' } });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    // Password verification (if provided)
    const expectedPassword = userPasswords[user.id] || 'Password123!';
    if (password && password !== expectedPassword && password !== 'Password123!') {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account is suspended. Please contact safety support.' } });
    }

    if (user.status === 'UNVERIFIED') {
      userOtps[user.email] = { code: '123456', expiresAt: Date.now() + 10 * 60 * 1000 };
      return res.json({
        success: true,
        requiresOtp: true,
        message: 'Account requires email/phone OTP verification.',
        data: { email: user.email }
      });
    }

    activeUserId = user.id;
    logAudit('USER_LOGIN', 'USER', user.id);

    const provider = providers.find(p => p.userId === user.id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user, providerProfile: provider || null }
    });
  });

  app.post('/api/v1/auth/logout', (_req, res) => {
    if (activeUserId) {
      logAudit('USER_LOGOUT', 'USER', activeUserId);
    }
    activeUserId = null;
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.put('/api/v1/auth/profile', (req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }

    const { displayName, phone, preferredLanguage, preferredProviderId } = req.body;
    if (displayName) user.displayName = displayName.trim();
    if (phone) user.phone = phone.trim();
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (preferredProviderId !== undefined) preferredRebookProviderId = preferredProviderId;

    logAudit('PROFILE_UPDATED', 'USER', user.id);

    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  });

  app.post('/api/v1/auth/switch-role', (req, res) => {
    const { role } = req.body as { role: UserRole };

    // Select the dedicated account for this role rather than mutating a single user
    let targetUser = users.find(u => u.role === role);

    if (!targetUser) {
      if (['ADMIN', 'SAFETY_REVIEWER', 'CONTENT_EDITOR', 'SUPER_ADMIN'].includes(role)) {
        targetUser = users.find(u => u.id === 'user-admin-1') || users.find(u => u.role === 'ADMIN');
      } else if (role === 'PROVIDER') {
        targetUser = users.find(u => u.id === 'user-prov-1') || users.find(u => u.role === 'PROVIDER');
      } else {
        targetUser = users.find(u => u.id === 'user-seeker-1') || users.find(u => u.role === 'SUPPORT_SEEKER');
      }
    }

    if (targetUser) {
      activeUserId = targetUser.id;
    }

    const user = getCurrentUser();
    const providerProfile = user ? providers.find(p => p.userId === user.id) || null : null;

    if (user) {
      logAudit('ACCOUNT_SWITCHED', 'USER', user.id, { switchedToRole: role, displayName: user.displayName });
    }

    res.json({
      success: true,
      message: `Switched account to ${user?.displayName} (${user?.role})`,
      data: { user, providerProfile }
    });
  });

  // Session Packages (Configuration Driven)
  app.get('/api/v1/packages', (_req, res) => {
    const user = getCurrentUser();
    res.json({
      success: true,
      data: {
        packages: CANONICAL_PACKAGES,
        userFreeTrialEligible: !user.freeTrialUsed
      }
    });
  });

  // Support Requests & Provider Matching Engine
  app.post('/api/v1/support/request', (req, res) => {
    const user = getCurrentUser();
    const { packageId, supportReason, languagePreference, genderPreference, experiencePreference } = req.body;

    const pkg = CANONICAL_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_PACKAGE', message: 'Selected conversation package is invalid.' } });
    }

    if (pkg.isFreeTrial && user.freeTrialUsed) {
      return res.status(400).json({ success: false, error: { code: 'TRIAL_ALREADY_USED', message: 'You have already used your 3-minute free trial.' } });
    }

    const request: SupportRequest = {
      id: `req-${Date.now()}`,
      seekerId: user.id,
      packageId: pkg.id,
      supportReason: supportReason || 'I just need someone to listen',
      languagePreference,
      genderPreference,
      experiencePreference,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString()
    };

    supportRequests.unshift(request);

    // Matching Engine logic with HARD CONSTRAINTS:
    // 1. Provider verified
    // 2. Provider active & available
    // 3. Provider maxSessionMinutes >= requested duration minutes
    // 4. No safety suspension
    const isUserBlocked = (userIdA: string, userIdB: string) => {
      return userBlocks.some(b => 
        (b.blockerUserId === userIdA && b.blockedUserId === userIdB) ||
        (b.blockerUserId === userIdB && b.blockedUserId === userIdA)
      );
    };

    const eligibleProviders = providers.filter(p => 
      p.verified &&
      p.verificationStatus === 'VERIFIED' &&
      p.availabilityStatus === 'AVAILABLE' &&
      p.maxSessionMinutes >= pkg.durationMinutes &&
      !isUserBlocked(user.id, p.userId)
    );

    if (eligibleProviders.length === 0) {
      // Return matching status with fallback options
      return res.json({
        success: true,
        data: {
          requestId: request.id,
          matched: false,
          message: "We're expanding our search to find the right person for you.",
          candidateCount: 0,
          request
        }
      });
    }

    // Soft Ranking Scoring:
    const scoredCandidates = eligibleProviders.map(p => {
      let score = p.rating * 20; // 0-100 base
      if (languagePreference && p.languages.includes(languagePreference)) score += 15;
      if (genderPreference && genderPreference !== 'no-preference' && p.gender === genderPreference) score += 15;
      if (p.id === preferredRebookProviderId) score += 30; // Previous relationship bonus
      return { provider: p, score };
    }).sort((a, b) => b.score - a.score);

    const bestMatch = scoredCandidates[0].provider;

    // Atomic Provider Reservation
    bestMatch.availabilityStatus = 'BUSY';
    request.status = 'MATCHED';

    res.json({
      success: true,
      data: {
        requestId: request.id,
        matched: true,
        provider: bestMatch,
        request
      }
    });
  });

  // Sessions - Create Active Session
  app.post('/api/v1/sessions/create', (req, res) => {
    const user = getCurrentUser();
    const { packageId, providerId, paymentMethod } = req.body;

    const pkg = CANONICAL_PACKAGES.find(p => p.id === packageId);
    const provider = providers.find(p => p.id === providerId);

    if (!pkg || !provider) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_SESSION_PARAMS', message: 'Package or Provider not found.' } });
    }

    if (pkg.isFreeTrial) {
      user.freeTrialUsed = true;
    }

    const session: Session = {
      id: `sess-${Date.now()}`,
      seekerId: user.id,
      seekerDisplayName: user.displayName,
      providerId: provider.id,
      providerDisplayName: provider.displayName,
      providerAvatarUrl: provider.avatarUrl,
      packageId: pkg.id,
      packageName: pkg.name,
      allocatedSeconds: pkg.durationSeconds,
      consumedSeconds: 0,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      creditId: `cred-${Date.now()}`,
      isFreeTrial: pkg.isFreeTrial,
      audioConnected: true
    };

    sessions.unshift(session);
    logAudit('SESSION_START', 'SESSION', session.id, { package: pkg.name, provider: provider.displayName });

    res.json({
      success: true,
      data: {
        session,
        remainingSeconds: session.allocatedSeconds
      }
    });
  });

  // Session State & Authoritative Timer Heartbeat
  app.get('/api/v1/sessions/:id', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session does not exist.' } });
    }
    const remainingSeconds = Math.max(0, session.allocatedSeconds - session.consumedSeconds);
    res.json({
      success: true,
      data: {
        session,
        remainingSeconds,
        isLowCredit: remainingSeconds <= 300 && remainingSeconds > 0
      }
    });
  });

  app.post('/api/v1/sessions/:id/heartbeat', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session does not exist.' } });
    }

    if (session.status === 'ACTIVE') {
      session.consumedSeconds += 5; // 5-second tick
      if (session.consumedSeconds >= session.allocatedSeconds) {
        session.status = 'COMPLETED';
        session.endedAt = new Date().toISOString();
        
        // Record Provider Earning (40% of package value)
        const pkg = CANONICAL_PACKAGES.find(p => p.id === session.packageId);
        if (pkg && pkg.priceNGN > 0) {
          const providerAmount = pkg.priceNGN * (pkg.providerSharePercent / 100);
          providerEarnings.unshift({
            id: `earn-${Date.now()}`,
            providerId: session.providerId,
            sessionId: session.id,
            packageName: pkg.name,
            grossSessionValueNGN: pkg.priceNGN,
            providerSharePercent: pkg.providerSharePercent,
            providerAmountNGN: providerAmount,
            status: 'AVAILABLE',
            createdAt: new Date().toISOString()
          });

          // Free provider back to available
          const p = providers.find(pr => pr.id === session.providerId);
          if (p) {
            p.availabilityStatus = 'AVAILABLE';
            p.sessionsCompleted += 1;
          }
        }
      }
    }

    const remainingSeconds = Math.max(0, session.allocatedSeconds - session.consumedSeconds);
    res.json({
      success: true,
      data: {
        session,
        remainingSeconds,
        isLowCredit: remainingSeconds <= 300 && remainingSeconds > 0
      }
    });
  });

  // End Session Manually
  app.post('/api/v1/sessions/:id/end', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session does not exist.' } });
    }

    session.status = 'COMPLETED';
    session.endedAt = new Date().toISOString();

    // Release provider
    const p = providers.find(pr => pr.id === session.providerId);
    if (p) {
      p.availabilityStatus = 'AVAILABLE';
      p.sessionsCompleted += 1;
    }

    // Record earnings if paid package
    const pkg = CANONICAL_PACKAGES.find(p => p.id === session.packageId);
    if (pkg && pkg.priceNGN > 0) {
      const providerAmount = pkg.priceNGN * (pkg.providerSharePercent / 100);
      providerEarnings.unshift({
        id: `earn-${Date.now()}`,
        providerId: session.providerId,
        sessionId: session.id,
        packageName: pkg.name,
        grossSessionValueNGN: pkg.priceNGN,
        providerSharePercent: pkg.providerSharePercent,
        providerAmountNGN: providerAmount,
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      });
    }

    logAudit('SESSION_END', 'SESSION', session.id, { durationConsumed: session.consumedSeconds });

    res.json({ success: true, data: { session } });
  });

  // Session Extension ("Continue Talking")
  app.post('/api/v1/sessions/:id/extend', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    const { packageId, paymentMethod, simulate3DS, simulateFailure, authOtp, clientRequestId } = req.body;

    // 1. Session Exists Check
    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Session does not exist.' }
      });
    }

    // 2. Check if session has already ended (Test: extension after session has ended)
    if (session.status === 'COMPLETED' || session.status === 'CANCELLED' || session.status === 'EXPIRED' || session.status === 'ENDING') {
      return res.status(400).json({
        success: false,
        error: { code: 'SESSION_ALREADY_ENDED', message: 'Session has already ended and cannot be extended.' }
      });
    }

    // 3. Package Validation
    const pkg = CANONICAL_PACKAGES.find(p => p.id === packageId);
    if (!pkg || pkg.priceNGN <= 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PACKAGE', message: 'Valid paid extension package is required.' }
      });
    }

    // 4. Duplicate Request Prevention
    const recentDuplicate = sessionExtensions.find(
      e => e.sessionId === session.id &&
           e.status === 'COMPLETED' &&
           (Date.now() - new Date(e.createdAt).getTime()) < 5000
    );
    if (recentDuplicate && clientRequestId && recentDuplicate.id.includes(clientRequestId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_EXTENSION_REQUEST', message: 'A duplicate extension request was detected and blocked.' }
      });
    }

    // 5. Gateway Bank Authentication Flow (3DS / OTP verification)
    if (simulate3DS && (!authOtp || authOtp.trim() !== '123456')) {
      const extId = `ext-3ds-${Date.now()}`;
      const extensionRecord: SessionExtension = {
        id: extId,
        sessionId: session.id,
        seekerId: session.seekerId,
        packageId: pkg.id,
        packageName: pkg.name,
        durationSeconds: pkg.durationSeconds,
        durationMinutes: pkg.durationMinutes,
        amountNGN: pkg.priceNGN,
        providerShareNGN: pkg.priceNGN * (pkg.providerSharePercent / 100),
        paymentId: `pay-3ds-${Date.now()}`,
        status: 'REQUIRES_3DS',
        createdAt: new Date().toISOString()
      };
      sessionExtensions.unshift(extensionRecord);

      logAudit('PAYMENT_3DS_REQUIRED', 'SESSION_EXTENSION', extId, { amountNGN: pkg.priceNGN });

      return res.status(202).json({
        success: false,
        requires3DS: true,
        extensionId: extId,
        message: 'Bank 3D-Secure authentication required. Please verify OTP (123456).'
      });
    }

    // 6. Payment Failure Simulation
    if (simulateFailure) {
      const extId = `ext-failed-${Date.now()}`;
      const extensionRecord: SessionExtension = {
        id: extId,
        sessionId: session.id,
        seekerId: session.seekerId,
        packageId: pkg.id,
        packageName: pkg.name,
        durationSeconds: pkg.durationSeconds,
        durationMinutes: pkg.durationMinutes,
        amountNGN: pkg.priceNGN,
        providerShareNGN: pkg.priceNGN * (pkg.providerSharePercent / 100),
        paymentId: `pay-failed-${Date.now()}`,
        status: 'FAILED',
        createdAt: new Date().toISOString()
      };
      sessionExtensions.unshift(extensionRecord);

      logAudit('PAYMENT_FAILED', 'SESSION_EXTENSION', extId, { reason: 'BANK_DECLINED', amountNGN: pkg.priceNGN });

      return res.status(400).json({
        success: false,
        error: { code: 'PAYMENT_FAILED', message: 'Payment authorization failed. Your session was not extended.' }
      });
    }

    // 7. Successful Payment Verification & Extension Entitlement Creation
    const paymentId = `pay-ext-${Date.now()}`;
    const providerShareNGN = pkg.priceNGN * (pkg.providerSharePercent / 100);

    const extensionRecord: SessionExtension = {
      id: `ext-${clientRequestId || Date.now()}`,
      sessionId: session.id,
      seekerId: session.seekerId,
      packageId: pkg.id,
      packageName: pkg.name,
      durationSeconds: pkg.durationSeconds,
      durationMinutes: pkg.durationMinutes,
      amountNGN: pkg.priceNGN,
      providerShareNGN: providerShareNGN,
      paymentId: paymentId,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };

    sessionExtensions.unshift(extensionRecord);

    // 8. Attach entitlement & extend authoritative session duration
    session.allocatedSeconds += pkg.durationSeconds;
    session.isExtension = true;

    // 9. Financial Audit Trail
    logAudit('PAYMENT_SUCCESS', 'PAYMENT', paymentId, { amountNGN: pkg.priceNGN, sessionId: session.id, packageId: pkg.id, paymentMethod: paymentMethod || 'CARD' });
    logAudit('SESSION_EXTENSION_CREATED', 'SESSION_EXTENSION', extensionRecord.id, {
      sessionId: session.id,
      extensionMinutes: pkg.durationMinutes,
      totalAllocatedSeconds: session.allocatedSeconds
    });

    res.json({
      success: true,
      data: {
        session,
        extension: extensionRecord,
        remainingSeconds: session.allocatedSeconds - session.consumedSeconds
      }
    });
  });

  // Get extensions for session
  app.get('/api/v1/sessions/:id/extensions', (req, res) => {
    const list = sessionExtensions.filter(e => e.sessionId === req.params.id);
    res.json({ success: true, data: { extensions: list } });
  });

  // Get all session extensions (Financial audit trail)
  app.get('/api/v1/session-extensions', (req, res) => {
    res.json({ success: true, data: { extensions: sessionExtensions } });
  });

  // Post-Session Feedback & Rebooking
  app.post('/api/v1/sessions/:id/feedback', (req, res) => {
    const session = sessions.find(s => s.id === req.params.id);
    const { rating, feltHeard, providerAgain, findSomeoneElse, professionalSupport, returnReason, comment } = req.body;

    const feedback: Feedback = {
      id: `fb-${Date.now()}`,
      sessionId: req.params.id,
      seekerId: session?.seekerId || getCurrentUser().id,
      providerId: session?.providerId || 'prov-sarah',
      rating: Number(rating) || 5,
      feltHeard: Boolean(feltHeard),
      providerAgain: Boolean(providerAgain),
      findSomeoneElse: Boolean(findSomeoneElse),
      professionalSupport: Boolean(professionalSupport),
      returnReason,
      comment,
      createdAt: new Date().toISOString()
    };

    feedbacks.unshift(feedback);

    if (providerAgain && session) {
      preferredRebookProviderId = session.providerId;
    }

    res.json({ success: true, data: { feedback, preferredRebookProviderId } });
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
  app.get('/api/v1/providers/application/status', (_req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }

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
  app.post('/api/v1/providers/application/save', (req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }

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
  app.post('/api/v1/providers/application/upload-id', (req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }

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

  app.post('/api/v1/providers/application/submit', (req, res) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in.' } });
    }

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
  app.post('/api/v1/providers/application/advance-stage', (req, res) => {
    const user = getCurrentUser();
    
    // RBAC Security Boundary: Ordinary seekers/applicants cannot advance their own application stages.
    const isAuthorizedReviewer = user && ['SUPER_ADMIN', 'SAFETY_REVIEWER', 'PROVIDER_OPS'].includes(user.role);
    
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

  // Provider Portal API
  app.get('/api/v1/providers/me', (_req, res) => {
    const user = getCurrentUser();
    let provider = providers.find(p => p.userId === user.id) || providers[0];
    const earnings = providerEarnings.filter(e => e.providerId === provider.id);
    const totalEarned = earnings.reduce((sum, e) => sum + e.providerAmountNGN, 0);
    const availableBalance = earnings.filter(e => e.status === 'AVAILABLE').reduce((sum, e) => sum + e.providerAmountNGN, 0);
    const pendingBalance = earnings.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.providerAmountNGN, 0);

    res.json({
      success: true,
      data: {
        provider,
        earnings,
        totalEarnedNGN: totalEarned,
        availableBalanceNGN: availableBalance,
        pendingBalanceNGN: pendingBalance,
        payouts: payouts.filter(p => p.providerId === provider.id)
      }
    });
  });

  app.post('/api/v1/providers/profile', (req, res) => {
    const user = getCurrentUser();
    let provider = providers.find(p => p.userId === user.id) || providers[0];
    const { displayName, bio, languages, gender, listeningAreas, preferredSessionTypes, maxSessionMinutes } = req.body;

    if (displayName) provider.displayName = String(displayName).trim();
    if (bio) provider.bio = String(bio).trim();
    if (Array.isArray(languages)) provider.languages = languages;
    if (gender) provider.gender = gender;
    if (Array.isArray(listeningAreas)) provider.listeningAreas = listeningAreas;
    if (Array.isArray(preferredSessionTypes)) provider.preferredSessionTypes = preferredSessionTypes;
    if (maxSessionMinutes && [15, 30, 60, 90].includes(Number(maxSessionMinutes))) {
      provider.maxSessionMinutes = Number(maxSessionMinutes) as any;
    }

    // STRICT PRIVACY & TRUST GUARANTEE: Verification status is backend/admin controlled ONLY.
    // Self-declaration is ignored and blocked.

    res.json({ success: true, data: { provider } });
  });

  app.get('/api/v1/providers/incoming-requests', (_req, res) => {
    const user = getCurrentUser();
    let provider = providers.find(p => p.userId === user.id) || providers[0];

    if (provider.availabilityStatus !== 'AVAILABLE') {
      return res.json({ success: true, data: { requests: [] } });
    }

    // Return active requests where seeker contact details are STRICTLY MASKED
    const pendingRequests = supportRequests
      .filter(r => r.status === 'REQUESTED' || r.status === 'MATCHING')
      .map(r => {
        const pkg = CANONICAL_PACKAGES.find(p => p.id === r.packageId);
        return {
          id: r.id,
          anonymousSeekerTag: `Seeker #${r.seekerId.slice(-4)}`,
          supportReason: r.supportReason,
          packageId: r.packageId,
          packageName: pkg?.name || 'Support Session',
          durationMinutes: pkg?.durationMinutes || 30,
          grossPriceNGN: pkg?.priceNGN || 3000,
          providerShareNGN: (pkg?.priceNGN || 3000) * 0.4,
          languagePreference: r.languagePreference,
          genderPreference: r.genderPreference,
          createdAt: r.createdAt
        };
      });

    res.json({ success: true, data: { requests: pendingRequests } });
  });

  app.post('/api/v1/providers/availability', (req, res) => {
    const user = getCurrentUser();
    const { status } = req.body;
    let provider = providers.find(p => p.userId === user.id) || providers[0];
    provider.availabilityStatus = status;

    res.json({ success: true, data: { provider } });
  });

  app.post('/api/v1/providers/max-duration', (req, res) => {
    const user = getCurrentUser();
    const { maxMinutes } = req.body;
    let provider = providers.find(p => p.userId === user.id) || providers[0];
    provider.maxSessionMinutes = maxMinutes;

    res.json({ success: true, data: { provider } });
  });

  // Trust & Safety & Safeguarding Architecture Helpers
  const isSafeguardingAuthorized = (user: User | null) => {
    if (!user) return false;
    return ['SAFETY_REVIEWER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  };

  const logSafeguardingAudit = (caseId: string, action: string, details?: Record<string, unknown>) => {
    const user = getCurrentUser();
    const entry: SafeguardingAuditEntry = {
      id: `sg-audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      caseId,
      actorId: user ? user.id : 'system',
      actorName: user ? user.displayName : 'System Engine',
      actorRole: user ? user.role : 'ADMIN',
      action,
      timestamp: new Date().toISOString(),
      details
    };
    safeguardingAuditEntries.unshift(entry);
    logAudit(`SAFEGUARDING_${action}`, 'SAFEGUARDING_CASE', caseId, details);
    return entry;
  };

  // 1. Submit Safety Incident Report & Auto-Generate Safeguarding Case
  const handleCreateReport = (req: express.Request, res: express.Response) => {
    const user = getCurrentUser();
    const { reportedUserId, sessionId, category, details, note, blockUser: shouldBlock } = req.body;

    const reportCategory: SafetyRiskCategory = (category || 'OTHER') as SafetyRiskCategory;
    const reportNote = details || note || 'No details provided';

    const report: SafetyReport = {
      id: `report-${Date.now()}`,
      reporterId: user ? user.id : 'anonymous',
      reporterRole: user ? user.role : 'SUPPORT_SEEKER',
      reportedUserId,
      sessionId,
      category: reportCategory,
      details: reportNote,
      blockUser: Boolean(shouldBlock),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    safetyReports.unshift(report);

    // Auto-Block if requested
    if (shouldBlock && user && reportedUserId) {
      const existingBlock = userBlocks.find(b => b.blockerUserId === user.id && b.blockedUserId === reportedUserId);
      if (!existingBlock) {
        userBlocks.push({
          id: `block-${Date.now()}`,
          blockerUserId: user.id,
          blockedUserId: reportedUserId,
          reason: `Auto-blocked via incident report ${report.id}`,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Determine Risk Severity
    let riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (['CHILD_ABUSE', 'IMMEDIATE_DANGER', 'SUICIDE_RISK', 'SELF_HARM'].includes(reportCategory)) {
      riskSeverity = 'CRITICAL';
    } else if (['SEXUAL_ASSAULT', 'DOMESTIC_VIOLENCE', 'TRAFFICKING', 'THREAT_OF_VIOLENCE', 'EXPLOITATION'].includes(reportCategory)) {
      riskSeverity = 'HIGH';
    }

    // Create Safeguarding Review Case (Starts in CONCERN stage)
    const sgCase: SafeguardingCase = {
      id: `case-sg-${Date.now().toString().slice(-6)}`,
      incidentReportId: report.id,
      reporterId: user ? user.id : 'anonymous',
      reporterRole: user ? user.role : 'SUPPORT_SEEKER',
      reportedUserId,
      sessionId,
      riskCategory: reportCategory,
      riskSeverity,
      stage: 'CONCERN',
      aiRiskScore: riskSeverity === 'CRITICAL' ? 0.96 : riskSeverity === 'HIGH' ? 0.85 : 0.45,
      aiSummaryHint: `Automated Advisory Risk Flag: Category [${reportCategory}], Severity [${riskSeverity}]. Requires human review and triage. AI decision strictly forbidden.`,
      documentationNotes: [
        `Incident report ${report.id} registered at ${new Date().toISOString()}. Category: ${reportCategory}. Initial note: ${reportNote}`
      ],
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    safeguardingCases.unshift(sgCase);
    logSafeguardingAudit(sgCase.id, 'CASE_AUTOMATICALLY_CREATED', {
      reportId: report.id,
      category: reportCategory,
      severity: riskSeverity
    });

    res.json({
      success: true,
      message: 'Safety incident report received. Safeguarding review case created.',
      data: { report, case: sgCase, userBlocked: Boolean(shouldBlock) }
    });
  };

  app.post('/api/v1/safety/report', handleCreateReport);
  app.post('/api/v1/safety/reports', handleCreateReport);

  app.get('/api/v1/safety/reports', (_req, res) => {
    res.json({ success: true, data: { reports: safetyReports } });
  });

  // 2. Direct User Blocking Endpoints
  app.post('/api/v1/safety/block', (req, res) => {
    const user = getCurrentUser();
    if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });

    const { targetUserId, reason } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_BLOCK_TARGET', message: 'Target user ID required' } });
    }

    const existingBlock = userBlocks.find(b => b.blockerUserId === user.id && b.blockedUserId === targetUserId);
    if (existingBlock) {
      return res.json({ success: true, message: 'User is already blocked.', data: { block: existingBlock } });
    }

    const newBlock: UserBlock = {
      id: `block-${Date.now()}`,
      blockerUserId: user.id,
      blockedUserId: targetUserId,
      reason: reason ? String(reason).trim() : 'User initiated block',
      createdAt: new Date().toISOString()
    };

    userBlocks.push(newBlock);
    logAudit('USER_BLOCKED', 'USER', targetUserId, { blockerId: user.id });

    res.json({
      success: true,
      message: 'User blocked successfully. Matching engine will exclude them permanently.',
      data: { block: newBlock }
    });
  });

  app.get('/api/v1/safety/blocks', (_req, res) => {
    const user = getCurrentUser();
    if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });

    const myBlocks = userBlocks.filter(b => b.blockerUserId === user.id);
    res.json({ success: true, data: { blocks: myBlocks } });
  });

  app.delete('/api/v1/safety/blocks/:id', (req, res) => {
    const user = getCurrentUser();
    if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });

    const blockIndex = userBlocks.findIndex(b => b.id === req.params.id && b.blockerUserId === user.id);
    if (blockIndex === -1) {
      return res.status(404).json({ success: false, error: { code: 'BLOCK_NOT_FOUND', message: 'Block record not found' } });
    }

    const [removed] = userBlocks.splice(blockIndex, 1);
    logAudit('USER_UNBLOCKED', 'USER', removed.blockedUserId);

    res.json({ success: true, message: 'User unblocked successfully.', data: { unblocked: removed } });
  });

  // 3. Safety Resources Directory
  app.get('/api/v1/safety/resources', (_req, res) => {
    res.json({
      success: true,
      data: {
        emergencyContacts: [
          { name: 'Nigeria Emergency Services', phone: '112 / 199', type: 'EMERGENCY' },
          { name: 'National Suicide Prevention Helpline', phone: '+234 806 210 6497', type: 'CRISIS' },
          { name: 'Gender-Based Violence Helpline', phone: '+234 800 333 3333', type: 'DOMESTIC_VIOLENCE' }
        ],
        specialistOrganisations: specialistOrganisations.filter(o => o.active)
      }
    });
  });

  // 4. Safeguarding Cases List (Strict RBAC Protection & Audit Trail)
  app.get('/api/v1/safeguarding/cases', (_req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Safeguarding records require SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    logSafeguardingAudit('all', 'CASES_LIST_ACCESSED', { totalCasesCount: safeguardingCases.length });

    res.json({
      success: true,
      data: {
        cases: safeguardingCases,
        stats: {
          total: safeguardingCases.length,
          open: safeguardingCases.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW').length,
          critical: safeguardingCases.filter(c => c.riskSeverity === 'CRITICAL').length,
          actioned: safeguardingCases.filter(c => c.status === 'ACTIONED' || c.status === 'RESOLVED').length
        }
      }
    });
  });

  // 5. Single Safeguarding Case Details + Audit History (Strict RBAC)
  app.get('/api/v1/safeguarding/cases/:id', (req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Safeguarding records require SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    const sgCase = safeguardingCases.find(c => c.id === req.params.id);
    if (!sgCase) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Safeguarding case not found' } });
    }

    // AUDIT LOG MANDATE: Record every access to individual safeguarding cases
    logSafeguardingAudit(sgCase.id, 'CASE_RECORD_VIEWED', {
      caseSeverity: sgCase.riskSeverity,
      caseStage: sgCase.stage
    });

    const caseAudits = safeguardingAuditEntries.filter(a => a.caseId === sgCase.id);

    res.json({
      success: true,
      data: {
        case: sgCase,
        auditHistory: caseAudits,
        report: safetyReports.find(r => r.id === sgCase.incidentReportId) || null
      }
    });
  });

  // 6. Safeguarding Workflow Transition (Human Review Mandatory — AI Decision Prohibited)
  app.post('/api/v1/safeguarding/cases/:id/transition', (req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Safeguarding actions require SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    const sgCase = safeguardingCases.find(c => c.id === req.params.id);
    if (!sgCase) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Safeguarding case not found' } });
    }

    const { stage, humanDecision, actionTaken, notes, reviewerName } = req.body as {
      stage: SafeguardingStage;
      humanDecision?: string;
      actionTaken?: 'NONE' | 'USER_WARNED' | 'USER_BLOCKED' | 'ACCOUNT_SUSPENDED' | 'ESCALATED_TO_AUTHORITY';
      notes?: string;
      reviewerName?: string;
    };

    // STRICT MANDATE: AI must NEVER make the final safeguarding decision.
    // Transitioning to decision/action/resolution requires human decision text and human actor name!
    if (['HUMAN_DECISION', 'APPROPRIATE_ACTION', 'DOCUMENTATION', 'RESOLVED'].includes(stage) && !humanDecision && !sgCase.humanDecision) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HUMAN_DECISION_REQUIRED',
          message: 'Safeguarding Mandate Violation: AI is strictly prohibited from making final safeguarding decisions. A human reviewer decision rationale is required.'
        }
      });
    }

    const previousStage = sgCase.stage;
    sgCase.stage = stage;
    sgCase.updatedAt = new Date().toISOString();

    if (reviewerName || user) {
      sgCase.assignedReviewerId = user.id;
      sgCase.assignedReviewerName = reviewerName || user.displayName;
    }

    if (humanDecision) {
      sgCase.humanDecision = humanDecision.trim();
      sgCase.humanDecisionBy = user.displayName;
      sgCase.humanDecisionAt = new Date().toISOString();
    }

    if (actionTaken) {
      sgCase.actionTaken = actionTaken;
      if (actionTaken === 'USER_BLOCKED' && sgCase.reportedUserId && sgCase.reporterId) {
        userBlocks.push({
          id: `block-${Date.now()}`,
          blockerUserId: sgCase.reporterId,
          blockedUserId: sgCase.reportedUserId,
          reason: `Safeguarding Case ${sgCase.id} Action: USER_BLOCKED`,
          createdAt: new Date().toISOString()
        });
      }
    }

    if (notes) {
      sgCase.documentationNotes.push(
        `[${new Date().toISOString()}] Stage -> ${stage} by ${user.displayName}: ${notes.trim()}`
      );
    }

    if (stage === 'RESOLVED') {
      sgCase.status = 'RESOLVED';
    } else if (stage === 'APPROPRIATE_ACTION' || stage === 'REFERRAL_ESCALATION') {
      sgCase.status = 'ACTIONED';
    } else {
      sgCase.status = 'IN_REVIEW';
    }

    logSafeguardingAudit(sgCase.id, 'WORKFLOW_STAGE_TRANSITIONED', {
      fromStage: previousStage,
      toStage: stage,
      humanDecision: sgCase.humanDecision,
      actionTaken: sgCase.actionTaken,
      reviewer: user.displayName
    });

    res.json({
      success: true,
      message: `Safeguarding case stage advanced from ${previousStage} to ${stage}.`,
      data: { case: sgCase }
    });
  });

  // 7. Escalate to Specialist Authority
  app.post('/api/v1/safeguarding/cases/:id/escalate', (req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Safeguarding escalation requires SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    const sgCase = safeguardingCases.find(c => c.id === req.params.id);
    if (!sgCase) {
      return res.status(404).json({ success: false, error: { code: 'CASE_NOT_FOUND', message: 'Safeguarding case not found' } });
    }

    const { authorityId, referralNotes } = req.body;
    const org = specialistOrganisations.find(o => o.id === authorityId);

    if (!org) {
      return res.status(400).json({ success: false, error: { code: 'AUTHORITY_NOT_FOUND', message: 'Specialist organisation or authority not found in directory.' } });
    }

    sgCase.stage = 'REFERRAL_ESCALATION';
    sgCase.referredAuthorityId = org.id;
    sgCase.referredAuthorityName = org.name;
    sgCase.escalatedAt = new Date().toISOString();
    sgCase.updatedAt = new Date().toISOString();
    sgCase.status = 'ACTIONED';

    sgCase.documentationNotes.push(
      `[${new Date().toISOString()}] Case escalated to authority [${org.name}] by ${user.displayName}. Referral Notes: ${referralNotes || 'Standard priority escalation'}`
    );

    logSafeguardingAudit(sgCase.id, 'CASE_ESCALATED_TO_AUTHORITY', {
      authorityId: org.id,
      authorityName: org.name,
      contactPhone: org.contactPhone,
      escalatedBy: user.displayName
    });

    res.json({
      success: true,
      message: `Safeguarding case successfully referred to ${org.name}.`,
      data: { case: sgCase, authority: org }
    });
  });

  // 8. Configurable Authorities & Specialist Organisations Management
  app.get('/api/v1/safeguarding/authorities', (_req, res) => {
    res.json({ success: true, data: { authorities: specialistOrganisations } });
  });

  app.post('/api/v1/safeguarding/authorities', (req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Authority configuration requires SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    const { name, category, contactPhone, contactEmail, website, protocolNotes } = req.body;
    if (!name || !contactPhone) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_AUTHORITY', message: 'Name and contact phone are required.' } });
    }

    const newOrg: SpecialistOrganisation = {
      id: `org-${Date.now()}`,
      name: String(name).trim(),
      category: (category || 'OTHER') as any,
      contactPhone: String(contactPhone).trim(),
      contactEmail: contactEmail ? String(contactEmail).trim() : undefined,
      website: website ? String(website).trim() : undefined,
      protocolNotes: protocolNotes ? String(protocolNotes).trim() : 'Configured specialist referral organisation',
      active: true
    };

    specialistOrganisations.push(newOrg);
    logAudit('SPECIALIST_AUTHORITY_CONFIGURED', 'SAFETY_AUTHORITY', newOrg.id, { name: newOrg.name });

    res.json({
      success: true,
      message: 'Specialist organisation / authority successfully configured.',
      data: { authority: newOrg }
    });
  });

  // 9. Safeguarding Audit Log Trail
  app.get('/api/v1/safeguarding/audit-logs', (_req, res) => {
    const user = getCurrentUser();
    if (!isSafeguardingAuthorized(user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Restricted Access: Safeguarding audit logs require SAFETY_REVIEWER or ADMIN role.' }
      });
    }

    res.json({ success: true, data: { auditLogs: safeguardingAuditEntries } });
  });

  // Admin Control Centre Comprehensive Data API
  app.get('/api/v1/admin/dashboard', (_req, res) => {
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
        auditLogs: auditLogs.slice(0, 100)
      }
    });
  });

  // Action: Toggle User Account Status (ACTIVE / SUSPENDED) with Audit Log
  app.post('/api/v1/admin/users/:id/status', (req, res) => {
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
  app.post('/api/v1/admin/payouts/:id/process', (req, res) => {
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

  // Action: Assign Manual Listener Match with Audit Log
  app.post('/api/v1/admin/matching/assign', (req, res) => {
    const { requestId, providerId } = req.body;
    const request = supportRequests.find(r => r.id === requestId);
    const provider = providers.find(p => p.id === providerId);

    if (!request || !provider) {
      return res.status(404).json({ success: false, error: { code: 'INVALID_MATCH_TARGET', message: 'Request or Provider not found' } });
    }

    request.status = 'MATCHED';
    logAudit('MANUAL_MATCH_ASSIGNED', 'SUPPORT_REQUEST', request.id, {
      seekerId: request.seekerId,
      assignedProviderId: provider.id,
      assignedProviderName: provider.displayName
    });

    res.json({
      success: true,
      message: `Manual match assigned: Listener ${provider.displayName} connected to request ${request.id}.`,
      data: { request }
    });
  });

  // Action: Generate Admin Promo Gift Voucher with Audit Log
  app.post('/api/v1/admin/gifts/generate', (req, res) => {
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
