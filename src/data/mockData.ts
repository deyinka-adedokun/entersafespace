import { SessionPackage, ProviderProfile, User, CMSContent } from '../types';

export const CANONICAL_PACKAGES: SessionPackage[] = [
  {
    id: 'package-try',
    name: 'Try Safespace',
    durationSeconds: 180,
    durationMinutes: 3,
    priceNGN: 0,
    description: 'First time trying Safespace? Start with a free 3-minute conversation.',
    isFreeTrial: true,
    providerSharePercent: 0
  },
  {
    id: 'package-quick',
    name: 'Quick Talk',
    durationSeconds: 900,
    durationMinutes: 15,
    priceNGN: 1000,
    description: 'For when you just need to get something off your chest.',
    providerSharePercent: 40
  },
  {
    id: 'package-open',
    name: 'Open Conversation',
    durationSeconds: 1800,
    durationMinutes: 30,
    priceNGN: 3000,
    description: "For a little more time to unpack what's on your mind.",
    providerSharePercent: 40
  },
  {
    id: 'package-deep',
    name: 'Deep Conversation',
    durationSeconds: 3600,
    durationMinutes: 60,
    priceNGN: 5000,
    description: 'For when you need space to really talk and process deeply.',
    providerSharePercent: 40
  },
  {
    id: 'package-stay',
    name: 'Stay With Me',
    durationSeconds: 5400,
    durationMinutes: 90,
    priceNGN: 10000,
    description: "For when you don't want to rush the conversation.",
    providerSharePercent: 40
  }
];

export const INITIAL_PROVIDERS: ProviderProfile[] = [
  {
    id: 'prov-sarah',
    userId: 'user-prov-1',
    displayName: 'Sarah',
    bio: 'Warm, patient listener passionate about emotional wellbeing, active listening, and young adult stress management.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'French'],
    gender: 'female',
    verified: true,
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    maxSessionMinutes: 60,
    rating: 4.9,
    ratingCount: 142,
    sessionsCompleted: 188,
    qualityScore: 98,
    listeningAreas: ['I just need someone to listen', 'Loneliness', 'Work or school', 'I am overwhelmed'],
    preferredSessionTypes: ['Voice Call', 'Open Conversation (30m)', 'Deep Listening (60m)'],
    progressionLevel: 'SENIOR_LISTENER',
    trainingCompleted: true,
    trainingModules: [
      { id: 'mod-1', title: 'Active Listening & Empathy Foundations', completed: true, score: 100 },
      { id: 'mod-2', title: 'Safeguarding, Privacy & Boundaries', completed: true, score: 100 },
      { id: 'mod-3', title: 'Non-Clinical Protocol & Emergency Escalation', completed: true, score: 98 },
      { id: 'mod-4', title: 'Cultural Sensitivity & Trauma-Informed Presence', completed: true, score: 100 }
    ]
  },
  {
    id: 'prov-david',
    userId: 'user-prov-2',
    displayName: 'David',
    bio: 'Empathetic peer listener and former university peer mentor. Focuses on life decisions, career pressure, and relationship worries.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'Spanish'],
    gender: 'male',
    verified: true,
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    maxSessionMinutes: 90,
    rating: 4.85,
    ratingCount: 98,
    sessionsCompleted: 124,
    qualityScore: 96,
    listeningAreas: ['Work or school', 'Life decisions', 'Relationship/family', 'Grief/loss'],
    preferredSessionTypes: ['Voice Call', 'Stay With Me (90m)'],
    progressionLevel: 'SENIOR_LISTENER',
    trainingCompleted: true,
    trainingModules: [
      { id: 'mod-1', title: 'Active Listening & Empathy Foundations', completed: true, score: 95 },
      { id: 'mod-2', title: 'Safeguarding, Privacy & Boundaries', completed: true, score: 100 },
      { id: 'mod-3', title: 'Non-Clinical Protocol & Emergency Escalation', completed: true, score: 96 }
    ]
  },
  {
    id: 'prov-grace',
    userId: 'user-prov-3',
    displayName: 'Grace',
    bio: 'Calm and non-judgmental presence. Experienced in offering supportive companionship for family dynamics and loneliness.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    languages: ['English', 'French'],
    gender: 'female',
    verified: true,
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AVAILABLE',
    maxSessionMinutes: 60,
    rating: 4.92,
    ratingCount: 86,
    sessionsCompleted: 110,
    qualityScore: 99,
    listeningAreas: ['I am overwhelmed', 'I am feeling lonely', 'Grief/loss', 'Something happened'],
    preferredSessionTypes: ['Voice Call', 'Open Conversation (30m)'],
    progressionLevel: 'SENIOR_LISTENER',
    trainingCompleted: true,
    trainingModules: [
      { id: 'mod-1', title: 'Active Listening & Empathy Foundations', completed: true, score: 100 },
      { id: 'mod-2', title: 'Safeguarding, Privacy & Boundaries', completed: true, score: 100 }
    ]
  },
  {
    id: 'prov-michael',
    userId: 'user-prov-4',
    displayName: 'Michael',
    bio: 'Reassuring listener with background in community wellness. Dedicated to providing a safe, confidential listening ear.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    languages: ['English'],
    gender: 'male',
    verified: true,
    verificationStatus: 'VERIFIED',
    availabilityStatus: 'AWAY',
    maxSessionMinutes: 30,
    rating: 4.8,
    ratingCount: 54,
    sessionsCompleted: 72,
    qualityScore: 94,
    listeningAreas: ['Relationship/family', 'I just need someone to listen', 'Work or school'],
    preferredSessionTypes: ['Voice Call', 'Quick Talk (15m)'],
    progressionLevel: 'EXPERIENCED_LISTENER',
    trainingCompleted: true,
    trainingModules: [
      { id: 'mod-1', title: 'Active Listening & Empathy Foundations', completed: true, score: 92 },
      { id: 'mod-2', title: 'Safeguarding, Privacy & Boundaries', completed: true, score: 95 }
    ]
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'user-seeker-1',
    email: 'seeker@safespace.org',
    phone: '+1 555 123 4567',
    displayName: 'Emma',
    role: 'SUPPORT_SEEKER',
    status: 'ACTIVE',
    freeTrialUsed: false,
    preferredLanguage: 'English',
    savedPaymentMethod: {
      cardBrand: 'Mastercard',
      last4: '4821',
      bankName: 'First Bank'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-prov-1',
    email: 'sarah.listener@safespace.org',
    phone: '+1 555 987 6543',
    displayName: 'Sarah',
    role: 'PROVIDER',
    status: 'ACTIVE',
    freeTrialUsed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-admin-1',
    email: 'admin@safespace.ng',
    phone: '+234 801 111 2222',
    displayName: 'Safespace Operations',
    role: 'ADMIN',
    status: 'ACTIVE',
    freeTrialUsed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-safety-1',
    email: 'safety@safespace.ng',
    phone: '+234 801 333 4444',
    displayName: 'Safeguard Reviewer',
    role: 'SAFETY_REVIEWER',
    status: 'ACTIVE',
    freeTrialUsed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-editor-1',
    email: 'editor@safespace.ng',
    phone: '+234 801 555 6666',
    displayName: 'Content Editor',
    role: 'CONTENT_EDITOR',
    status: 'ACTIVE',
    freeTrialUsed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-super-1',
    email: 'super@safespace.ng',
    phone: '+234 801 777 8888',
    displayName: 'Super Admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    freeTrialUsed: true,
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CMS_ARTICLES: CMSContent[] = [
  {
    id: 'cms-home-1',
    slug: 'safespace-homepage',
    title: 'Safespace | On-Demand Human Emotional Listening Marketplace',
    type: 'HOMEPAGE',
    summary: 'Connecting individuals in Nigeria and Africa with trained, empathetic peer listeners in a safe, confidential environment.',
    content: `# Safespace: Human Emotional Support Marketplace

Safespace provides immediate, on-demand human emotional listening and companionship. Connect one-to-one with verified listeners without judgment, medical labels, or mandatory appointments.

### Core Value Proposition
- **Instant Connection**: Start talking within minutes.
- **Privacy by Design**: Masked identities, no automatic audio recording.
- **Transparent Pricing**: Flat naira session packages starting with a free 3-minute trial.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Safespace | On-Demand Human Emotional Support & Listening',
    meta_description: 'Connect with verified, empathetic peer listeners in Nigeria privately on-demand. Transparent pricing, no automatic audio recording, and 24/7 availability.',
    canonical_url: 'https://safespace.ng/safespace',
    og_title: 'Safespace: On-Demand Human Emotional Listening',
    og_description: 'A safe, confidential space to share what is on your mind with empathetic verified listeners.',
    og_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Safespace",
      "url": "https://safespace.ng",
      "logo": "https://safespace.ng/icon.png",
      "description": "On-demand human emotional listening and companionship platform in Nigeria.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "NG",
        "addressRegion": "Lagos"
      }
    }, null, 2)
  },
  {
    id: 'cms-faq-1',
    slug: 'frequently-asked-questions',
    title: 'Frequently Asked Questions',
    type: 'FAQ',
    summary: 'Answers regarding session matching, listener vetting, payment security, and privacy policies.',
    content: `# Frequently Asked Questions

### Is Safespace a therapy service?
No. Safespace provides human emotional listening and peer companionship. It does not provide medical diagnosis, clinical psychotherapy, or psychiatric treatment.

### How are listeners verified?
Every Listener undergoes strict identity verification, background screening, and required training modules in active listening, empathy, safeguarding, and non-clinical boundary protocols.

### Are conversations recorded?
No. Safespace does NOT record session audio or sell user conversation data. Your privacy is protected by design.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Safespace FAQ | Frequently Asked Questions & Safety Policy',
    meta_description: 'Find answers about Safespace emotional support sessions, privacy guarantees, listener verification, and payment options in Nigeria.',
    canonical_url: 'https://safespace.ng/how-it-works',
    og_title: 'Safespace FAQ & How It Works',
    og_description: 'Learn how Safespace protects your privacy and connects you with empathetic listeners.',
    og_image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Safespace a therapy service?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Safespace provides human emotional listening and peer companionship. It does not provide medical diagnosis or clinical therapy."
          }
        },
        {
          "@type": "Question",
          "name": "Are conversations recorded?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Safespace does not record audio conversations or harvest personal chat data."
          }
        }
      ]
    }, null, 2)
  },
  {
    id: 'cms-article-1',
    slug: 'navigating-burnout-and-emotional-overwhelm',
    title: 'Navigating Burnout and Emotional Overwhelm in High-Pressure Workplaces',
    type: 'ARTICLE',
    summary: 'Practical approaches to recognizing burnout signals and finding safe outlets for emotional expression.',
    content: `# Navigating Burnout and Emotional Overwhelm

Modern work culture often demands hyper-productivity at the expense of emotional health. Feeling overwhelmed is a normal human response to prolonged stress.

### 1. Recognize the Physical and Emotional Cues
Chronic fatigue, irritability, insomnia, and feeling emotionally drained are early indicators that your reserves are depleted.

### 2. The Power of Externalizing Your Thoughts
Holding unexpressed worries in your head increases cognitive fatigue. Talking to an unbiased listener provides perspective and emotional relief without fear of judgment.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Navigating Burnout & Emotional Overwhelm | Safespace Guide',
    meta_description: 'Learn practical strategies for managing workplace stress and emotional overwhelm through active listening and self-care.',
    canonical_url: 'https://safespace.ng/emotional-support',
    og_title: 'Navigating Burnout and Emotional Overwhelm',
    og_description: 'Discover how active listening helps unpack workplace stress.',
    og_image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Navigating Burnout and Emotional Overwhelm",
      "description": "Practical approaches to recognizing burnout signals and finding safe outlets.",
      "author": {
        "@type": "Organization",
        "name": "Safespace Editorial Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Safespace"
      }
    }, null, 2)
  },
  {
    id: 'cms-resource-1',
    slug: 'emotional-wellness-handbook',
    title: 'Emotional Wellness & Grounding Exercises Handbook',
    type: 'RESOURCE',
    summary: 'A downloadable guide to 5-4-3-2-1 sensory grounding and diaphragmatic breathing during panic.',
    content: `# Grounding & Emotional Regulation Exercises

When anxiety spikes, sensory grounding redirects neural focus back to the present moment.

### The 5-4-3-2-1 Grounding Method
- **5 things you can see** around you.
- **4 things you can touch** physically.
- **3 things you can hear** in the room.
- **2 things you can smell**.
- **1 thing you can taste**.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Grounding Exercises & Emotional Wellness Guide | Safespace Resources',
    meta_description: 'Free grounding techniques, sensory regulation exercises, and stress relief tools.',
    canonical_url: 'https://safespace.ng/resources',
    og_title: 'Grounding Exercises & Emotional Wellness Guide',
    og_description: 'Step-by-step 5-4-3-2-1 grounding method for acute stress and anxiety.',
    og_image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Safespace Emotional Wellness Guide",
      "serviceType": "Self-help Emotional Wellness Resources",
      "provider": {
        "@type": "Organization",
        "name": "Safespace"
      }
    }, null, 2)
  },
  {
    id: 'cms-safety-1',
    slug: 'safeguarding-and-emergency-protocols',
    title: 'Safespace Safeguarding & Emergency Escalation Protocols',
    type: 'SAFETY_RESOURCE',
    summary: 'Clear guidelines on non-clinical boundary enforcement, emergency referral pathways, and crisis helplines.',
    content: `# Safeguarding & Emergency Protocols

Safespace operates a Human-in-the-Loop Safeguarding system. While our platform facilitates peer emotional support, safety concerns involving imminent danger trigger mandatory human review.

### Critical Escalation Helplines in Nigeria
- **National Emergency Response**: 112 / 199
- **Suicide Intervention Hotline**: +234 806 210 6497
- **Domestic Violence & GBV Helpline**: +234 800 333 3333
- **Child Protection Bureau**: +234 800 000 2445`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Safeguarding Protocols & Emergency Helplines | Safespace Safety',
    meta_description: 'Comprehensive directory of emergency helplines, crisis intervention contacts, and safeguarding protocols in Nigeria.',
    canonical_url: 'https://safespace.ng/safety',
    og_title: 'Safespace Safeguarding & Emergency Protocols',
    og_description: 'Emergency contacts and safeguarding response procedures.',
    og_image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Safeguarding and Emergency Protocols",
      "description": "Directory of official crisis response contacts and safeguarding procedures in Nigeria."
    }, null, 2)
  },
  {
    id: 'cms-training-1',
    slug: 'active-listening-foundations-module',
    title: 'Provider Training Module 1: Active Listening Foundations',
    type: 'PROVIDER_TRAINING',
    summary: 'Core curriculum for verified Listeners: empathy validation, reflective listening, and non-judgmental posture.',
    content: `# Active Listening & Empathy Foundations

### Module Objectives
1. Understand the distinction between sympathetic advice-giving and empathetic validation.
2. Practice open-ended questioning without interrogating the Support Seeker.
3. Master non-clinical boundary management when seekers express heavy emotional burdens.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Provider Training: Active Listening Foundations | Safespace',
    meta_description: 'Listener training module on active listening, empathy validation, and boundary enforcement.',
    canonical_url: 'https://safespace.ng/for-listeners',
    og_title: 'Safespace Provider Training Curriculum',
    og_description: 'Learn how Safespace trains peer listeners in non-judgmental active listening.',
    og_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'noindex, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Provider Training Curriculum"
    }, null, 2)
  },
  {
    id: 'cms-legal-1',
    slug: 'terms-of-service-and-privacy-policy',
    title: 'Terms of Service & Privacy Policy',
    type: 'LEGAL_PAGE',
    summary: 'Legal terms governing Safespace marketplace usage, session package purchases, non-clinical disclaimers, and data protection.',
    content: `# Safespace Terms of Service & Privacy Disclosures

### 1. Scope of Service
Safespace is an on-demand marketplace connecting users with peer listeners for emotional support. Safespace is NOT a provider of medical services, healthcare, or psychotherapy.

### 2. Billing & Refund Policy
Packages are billed in Nigerian Naira (NGN). Free trial conversations last 3 minutes once per new user account. Paid session credits expire at session closure or completion.

### 3. Data Protection (NDPR / GDPR Alignment)
All user data is processed in accordance with the Nigeria Data Protection Act (NDPA). We enforce data minimisation, identity masking, and SSL encryption.`,
    status: 'PUBLISHED',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'Terms of Service & Privacy Policy | Safespace Legal',
    meta_description: 'Official Terms of Service, Privacy Disclosures, and Non-Clinical Disclaimers for Safespace users and listeners.',
    canonical_url: 'https://safespace.ng/privacy',
    og_title: 'Safespace Terms of Service & Privacy Policy',
    og_description: 'Legal terms, non-clinical disclaimers, and data protection policies.',
    og_image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service and Privacy Policy"
    }, null, 2)
  },
  {
    id: 'cms-announcement-1',
    slug: 'introducing-free-trial-and-gift-sessions',
    title: 'Platform Announcement: Free 3-Minute Trial & Gift Conversations',
    type: 'ANNOUNCEMENT',
    summary: 'Announcing 3-minute free trial sessions for new users and SMS/Email gift cards to send emotional support to friends.',
    content: `# Introducing Free Trial Sessions and Gift Conversations

We are excited to announce two key features designed to increase accessibility to emotional support:

1. **3-Minute Free Trial**: Every new user can instantly test a conversation with a verified Listener at zero cost.
2. **Gift a Conversation**: Send 15, 30, 60, or 90 minutes of listening support directly to a friend, family member, or colleague via SMS, Email, or Shareable Link.`,
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    seo_title: 'New Features: Free Trial & Gift Conversations | Safespace',
    meta_description: 'Try Safespace for free with a 3-minute trial or send a gift conversation credit to someone you care about.',
    canonical_url: 'https://safespace.ng/gift-a-conversation',
    og_title: 'Safespace Free Trial & Gift Conversations',
    og_description: 'Send emotional support sessions to loved ones or try a 3-minute session free.',
    og_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    robots_directive: 'index, follow',
    structured_data: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Introducing Free Trial & Gift Conversations",
      "description": "Announcing free trial sessions and gift credits on Safespace."
    }, null, 2)
  }
];

