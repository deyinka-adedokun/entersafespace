export type UserRole = 
  | 'SUPPORT_SEEKER' 
  | 'PROVIDER' 
  | 'ADMIN' 
  | 'SAFETY_REVIEWER' 
  | 'CONTENT_EDITOR' 
  | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'UNVERIFIED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  freeTrialUsed: boolean;
  savedPaymentMethod?: {
    cardBrand: string;
    last4: string;
    bankName: string;
  };
  preferredLanguage?: string;
  preferredProviderId?: string;
  createdAt: string;
}

export interface SessionPackage {
  id: string;
  name: string;
  durationSeconds: number;
  durationMinutes: number;
  priceNGN: number;
  description: string;
  isFreeTrial?: boolean;
  providerSharePercent: number; // 40
}

export type VerificationStatus = 'APPLICANT' | 'UNDER_REVIEW' | 'VERIFIED' | 'PROBATION' | 'REJECTED' | 'SUSPENDED';
export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';
export type MaxSessionDuration = 15 | 30 | 60 | 90;

export type ProviderApplicationStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'TRAINING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROBATION'
  | 'RESTRICTED'
  | 'SUSPENDED'
  | 'REMOVED'
  | 'REINSTATEMENT_REVIEW';

export interface ProviderApplication {
  id: string;
  userId: string;
  // Step 1: About You
  legalName: string;
  displayName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  location: string;
  preferredLanguages: string[];
  
  // Step 2: Experience & Qualifications
  bioIntroduction: string;
  listeningExperience: string;
  hasSupportExperience: boolean;
  supportExperienceDetails?: string;
  educationBackground?: string;
  certifications?: string;
  
  // Step 3: Listening & Availability
  languagesSpoken: string[];
  maxDurationCapability: MaxSessionDuration;
  weeklyAvailabilityWindows: string[];
  
  // Step 4: Identity & Eligibility Declarations
  isOver18: boolean;
  identityDocumentType?: string;
  identityVerificationStatus: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'ADDITIONAL_INFO_REQUIRED' | 'UNSUCCESSFUL';
  backgroundScreeningStatus: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
  
  // Step 5: Safeguarding, Assessment & Training
  assessmentStatus: 'REQUIRED' | 'SCHEDULED' | 'COMPLETED' | 'UNDER_REVIEW' | 'UNSUCCESSFUL';
  safeguardingTrainingStatus: 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETED';
  platformTrainingStatus: 'REQUIRED' | 'IN_PROGRESS' | 'COMPLETED';
  codeOfConductAccepted: boolean;
  codeOfConductAcceptedAt?: string;
  
  // Lifecycle Status & Timestamps
  status: ProviderApplicationStatus;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  actionRequired?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  languages: string[];
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  verified: boolean;
  verificationStatus: VerificationStatus;
  availabilityStatus: AvailabilityStatus;
  maxSessionMinutes: MaxSessionDuration;
  rating: number;
  ratingCount: number;
  sessionsCompleted: number;
  qualityScore: number;
  listeningAreas: string[];
  currentSessionId?: string;
  preferredSessionTypes?: string[];
  progressionLevel?: 'PEER_LISTENER' | 'EXPERIENCED_LISTENER' | 'SENIOR_LISTENER';
  trainingCompleted?: boolean;
  trainingModules?: { id: string; title: string; completed: boolean; score?: number }[];
}

export interface SupportRequest {
  id: string;
  seekerId: string;
  packageId: string;
  supportReason: string;
  languagePreference?: string;
  genderPreference?: 'male' | 'female' | 'no-preference';
  experiencePreference?: string;
  status: 'REQUESTED' | 'MATCHING' | 'MATCHED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

export type SessionState = 
  | 'REQUESTED' 
  | 'MATCHING' 
  | 'MATCHED' 
  | 'CONNECTING' 
  | 'ACTIVE' 
  | 'ENDING' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'INTERRUPTED' 
  | 'EXPIRED' 
  | 'ESCALATED';

export interface Session {
  id: string;
  seekerId: string;
  seekerDisplayName: string;
  providerId: string;
  providerDisplayName: string;
  providerAvatarUrl?: string;
  packageId: string;
  packageName: string;
  allocatedSeconds: number;
  consumedSeconds: number;
  status: SessionState;
  startedAt?: string;
  endedAt?: string;
  creditId: string;
  isExtension?: boolean;
  isFreeTrial?: boolean;
  audioConnected?: boolean;
}

export interface SessionExtension {
  id: string;
  sessionId: string;
  seekerId: string;
  packageId: string;
  packageName: string;
  durationSeconds: number;
  durationMinutes: number;
  amountNGN: number;
  providerShareNGN: number;
  paymentId: string;
  status: 'INITIATED' | 'REQUIRES_3DS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

export interface ProviderEarning {
  id: string;
  providerId: string;
  sessionId: string;
  packageName: string;
  grossSessionValueNGN: number;
  providerSharePercent: number; // 40
  providerAmountNGN: number;
  status: 'PENDING' | 'AVAILABLE' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REVERSED';
  createdAt: string;
}

export interface ProviderPayout {
  id: string;
  providerId: string;
  amountNGN: number;
  status: 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED';
  scheduledFor: string;
  processedAt?: string;
  bankName: string;
  accountNumberMasked: string;
}

export type GiftStatus = 'CREATED' | 'PAID' | 'DELIVERED' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
export type GiftDeliveryChannel = 'EMAIL' | 'PHONE' | 'SECURE_LINK';

export interface Gift {
  id: string;
  packageId: string;
  packageName: string;
  durationMinutes: number;
  priceNGN: number;
  purchaserId: string;
  purchaserName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientMessage?: string;
  deliveryChannel: GiftDeliveryChannel;
  giftCode: string;
  status: GiftStatus;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
  claimedAt?: string;
  expiresAt: string;
  claimedBySeekerId?: string;
  claimedBySeekerName?: string;
}

export interface Feedback {
  id: string;
  sessionId: string;
  seekerId: string;
  providerId: string;
  rating: number; // 1-5
  feltHeard: boolean;
  providerAgain: boolean;
  findSomeoneElse: boolean;
  professionalSupport: boolean;
  returnReason?: string;
  comment?: string;
  createdAt: string;
}

export type SafetyRiskCategory = 
  | 'CHILD_ABUSE'
  | 'SEXUAL_ASSAULT'
  | 'DOMESTIC_VIOLENCE'
  | 'TRAFFICKING'
  | 'IMMEDIATE_DANGER'
  | 'SELF_HARM'
  | 'SUICIDE_RISK'
  | 'THREAT_OF_VIOLENCE'
  | 'EXPLOITATION'
  | 'OTHER';

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterRole: UserRole;
  reportedUserId?: string;
  sessionId?: string;
  category: SafetyRiskCategory;
  details: string;
  blockUser?: boolean;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
  assignedReviewerId?: string;
  actionTaken?: string;
  createdAt: string;
}

export type SafeguardingStage = 
  | 'CONCERN'
  | 'REVIEW'
  | 'CLASSIFICATION'
  | 'HUMAN_DECISION'
  | 'APPROPRIATE_ACTION'
  | 'REFERRAL_ESCALATION'
  | 'DOCUMENTATION'
  | 'RESOLVED';

export interface SafeguardingCase {
  id: string;
  incidentReportId: string;
  reporterId: string;
  reporterRole: UserRole;
  reportedUserId?: string;
  sessionId?: string;
  riskCategory: SafetyRiskCategory;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  stage: SafeguardingStage;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  aiRiskScore?: number; // 0.0 - 1.0 advisory hint only
  aiSummaryHint?: string;
  humanDecision?: string;
  humanDecisionBy?: string;
  humanDecisionAt?: string;
  actionTaken?: 'NONE' | 'USER_WARNED' | 'USER_BLOCKED' | 'ACCOUNT_SUSPENDED' | 'ESCALATED_TO_AUTHORITY';
  referredAuthorityId?: string;
  referredAuthorityName?: string;
  escalatedAt?: string;
  documentationNotes: string[];
  status: 'OPEN' | 'IN_REVIEW' | 'ACTIONED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
}

export interface SpecialistOrganisation {
  id: string;
  name: string;
  category: SafetyRiskCategory | 'GENERAL_EMERGENCY';
  contactPhone: string;
  contactEmail?: string;
  website?: string;
  protocolNotes: string;
  active: boolean;
}

export interface UserBlock {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  reason?: string;
  createdAt: string;
}

export interface SafeguardingAuditEntry {
  id: string;
  caseId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type CMSContentType = 
  | 'HOMEPAGE'
  | 'FAQ'
  | 'ARTICLE'
  | 'RESOURCE'
  | 'SAFETY_RESOURCE'
  | 'PROVIDER_TRAINING'
  | 'LEGAL_PAGE'
  | 'ANNOUNCEMENT';

export type CMSWorkflowStatus = 
  | 'DRAFT' 
  | 'REVIEW' 
  | 'APPROVED' 
  | 'PUBLISHED' 
  | 'ARCHIVED';

export interface CMSContent {
  id: string;
  slug: string;
  title: string;
  type: CMSContentType;
  content: string;
  summary: string;
  status: CMSWorkflowStatus;
  authorId?: string;
  authorName?: string;
  reviewerId?: string;
  reviewerName?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;

  // SEO & Discoverability Fields
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  structured_data?: string; // JSON-LD payload
  robots_directive?: string; // e.g. "index, follow"
}

// Prompt 16 Notification & PWA Types
export type SafespaceNotificationType = 
  | 'MATCH_FOUND'
  | 'SESSION_REMINDER'
  | 'SESSION_ENDING'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'GIFT_RECEIVED'
  | 'PROVIDER_REQUEST'
  | 'PROVIDER_SESSION'
  | 'PAYOUT'
  | 'SAFETY_ALERT';

export interface SafespaceNotificationItem {
  id: string;
  type: SafespaceNotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  enabledCategories: Record<SafespaceNotificationType, boolean>;
  pushNotificationsEnabled: boolean;
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  frequencyCapping: 'UNLIMITED' | 'STANDARD' | 'STRICT'; // STANDARD = max 10/day, STRICT = max 5/day
}

