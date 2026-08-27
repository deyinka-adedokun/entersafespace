/**
 * SAFESPACE DESIGN INTELLIGENCE PRINCIPLES
 * -------------------------------------------------------------------
 * Permanent interface & interaction constraints derived from world-class benchmarks.
 * Borrowed with purpose, executed for human emotional sanctuary.
 */

export interface DesignPrinciple {
  id: number;
  title: string;
  source: string;
  coreRule: string;
  expandedRule: string;
  safespaceManifestation: string;
  testQuestion?: string;
}

export const SAFESPACE_DESIGN_INTELLIGENCE: DesignPrinciple[] = [
  {
    id: 1,
    title: "Restraint",
    source: "Aman",
    coreRule: "Premium does not mean adding more.",
    expandedRule: "Premium emerges through whitespace, typography, proportion, materiality, subtle motion, restrained colour, and deliberate interaction.",
    safespaceManifestation: "Never overcrowd a screen simply because there is available layout space. Let elements breathe with tactile paper margins."
  },
  {
    id: 2,
    title: "Human Action First",
    source: "Airbnb",
    coreRule: "Design around the user's primary human intention.",
    expandedRule: "The user's primary intention is: 'I want someone to talk to.'",
    safespaceManifestation: "Make human connection obvious and immediate. Never force users to navigate through product architecture or menus before reaching human support."
  },
  {
    id: 3,
    title: "Complexity Should Disappear",
    source: "Uber",
    coreRule: "Expose the outcome, not the machinery.",
    expandedRule: "Backend algorithms, availability rules, provider qualifications, and credit accounting must be hidden.",
    safespaceManifestation: "Say 'Finding someone who can be here with you...' instead of 'Running matching algorithm across available provider pools...'"
  },
  {
    id: 4,
    title: "Progressive Disclosure",
    source: "Apple",
    coreRule: "Never expose every available option simultaneously.",
    expandedRule: "Present the minimum information required to make the current decision.",
    safespaceManifestation: "Details appear only when needed. Modal sheets and flows step quietly without cognitive overload."
  },
  {
    id: 5,
    title: "Immediate Familiarity",
    source: "WhatsApp",
    coreRule: "Zero learning curve for the active conversation experience.",
    expandedRule: "A user should immediately understand who they are talking to, connection status, time remaining, and how to access help or exit.",
    safespaceManifestation: "Familiar messaging patterns with clear status indicators and reassurance cues."
  },
  {
    id: 6,
    title: "Emotion Before Decoration",
    source: "Editorial Photography",
    coreRule: "Photography must communicate authentic narrative.",
    expandedRule: "Never insert an image simply to make a section look attractive. Each photograph must reinforce emotional safety.",
    safespaceManifestation: "Human-centric authentic portraiture and warm environments that evoke calm and presence."
  },
  {
    id: 7,
    title: "Humanity Before Technology",
    source: "Safespace Unique Benchmark",
    coreRule: "Powered by technology, but never looking like technology.",
    expandedRule: "The user's perception must be: 'Someone is here', not 'This is an impressive software platform'.",
    safespaceManifestation: "Technology recedes into the background so genuine human empathy takes center stage."
  },
  {
    id: 8,
    title: "Africa Without Stereotype",
    source: "Cultural Benchmark",
    coreRule: "African identity emerges naturally through everyday life.",
    expandedRule: "Nigeria-first and Africa-facing identity shown through people, environments, light, architecture, language, and cultural context.",
    safespaceManifestation: "Authentic contemporary representation without visual clichés or generic caricatures."
  },
  {
    id: 9,
    title: "Design for the Widest Human Range",
    source: "Inclusive Architecture",
    coreRule: "Accessible from a preteen to a digitally inexperienced elder.",
    expandedRule: "Achieved without childish aesthetics through clarity, hierarchy, generous touch targets, simple language, and predictable navigation.",
    safespaceManifestation: "Minimum 44px+ touch targets, clear typography, and plain human wording."
  },
  {
    id: 10,
    title: "The Final Human Test",
    source: "Safespace Core Integrity",
    coreRule: "Every screen must pass the single fundamental question.",
    expandedRule: "Does this help the user feel closer to another human being, or is it merely showing them software?",
    safespaceManifestation: "If an element does not materially improve comprehension, trust, safety, connection or action, remove it.",
    testQuestion: "Does this help the user feel closer to another human being, or is it merely showing them software?"
  }
];
