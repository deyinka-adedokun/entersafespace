# Safespace Front-End Rebuild Directives — Brand & Experience Reset (v1.0)

## 0. Purpose & Status
- **Status**: Authoritative
- **Directive**: The previous visual direction, including the persistent green colour system and its associated visual language, is RETIRED and no longer approved.
- **Frontend Rebuild Strategy**: Rebuilt page-by-page. Implement the foundational design tokens, typography, logo, neutrals, responsive foundation, and reusable primitives, then STOP and await authoritative page specifications.

## 1. Safespace Product Identity & Brand Essence
- **Core Identity**: Safespace is an on-demand human emotional support service.
- **Personality**: **QUIETLY HUMAN** (warm, assured, discreet, intelligent, respectful, calm, competent, contemporary, emotionally safe, accessible, dignified).
- **Prohibitions**: Not a generic wellness app, therapy directory, Provider marketplace, social network, meditation app, clinical hospital interface, AI chatbot, luxury wellness club, or generic SaaS dashboard.
- **Central Experience**: "A person arrives. They communicate what they need. Safespace helps them reach an appropriate human. The human listens. The person is given space to be heard. The technology should make this experience easier, not become the experience."

## 2. Core Brand Principle: Human Warmth Expressed Through Restraint
Warmth comes primarily through:
- photography
- language
- typography
- whitespace
- composition
- subtle motion
- interaction quality
- human presence

## 3. Colour System
- **Dominant Brand Colour (Single Colour)**: Safespace Deep Blue: `#123B5D`
  - Used for: primary logo, primary CTA, important navigation elements, selected active states, key brand typography, major brand surfaces, important visual anchors.
  - Do NOT flood every surface with blue.
- **Neutral System (Functional Neutrals)**:
  - Primary background: `#FAF9F6`
  - Secondary warm-neutral background: `#F3F1EC`
  - Primary text: `#17212B`
  - Secondary text: `#59636B`
  - Subtle border: `#E3E2DE`
  - White: `#FFFFFF`
- **Functional Status Colours** (Semantic only, NOT brand colours):
  - Success, warning, error, critical safeguarding, system information.
- **Banned as Brand Colours**: Purple, orange, green, pink, turquoise, yellow, gradients.

## 4. Logo
- **Form**: The current Safespace logo mark is preserved (do not redesign, reinterpret, or add hearts/speech bubbles/people/medical symbols).
- **Colours**:
  - Primary: Safespace Deep Blue `#123B5D`
  - Reversed: White `#FFFFFF`
  - Monochrome: Black/near-black where technically required.
  - No orange/gold treatment, no gradients.

## 5. Typography
- **Primary UI Typeface**: `Manrope` (navigation, buttons, forms, body text, labels, session info, system messages, functional interfaces, dashboards, Provider interfaces).
- **Display / Editorial Typeface**: `Instrument Serif` (used sparingly: selected hero statements, emotional brand moments, major storytelling headings, carefully selected editorial emphasis).
- **Do NOT**: Introduce additional typefaces or use Instrument Serif for functional UI.

## 6. Shape & Layout Language
- **Philosophy**: EDITORIAL + FUNCTIONAL (not dashboard + decorative).
- **Retire**: "Everything is a rounded card" approach, excessive pills, floating-card overload, bubble interfaces.
- **Use**: Restrained geometry, subtle corner radii, generous whitespace, strong alignment, editorial composition, carefully bounded functional containers.

## 7. Photography & Motion
- **Photography**: Human presence, listening, contemplation, connection, dignity, authenticity, culturally relevant Nigerian/African representation without stereotypes.
- **Motion**: Communicates PRESENCE, not entertainment. Subtle fades, gentle transitions, restrained organic movement. Avoid bouncing, excessive parallax, flashy animations.

## 8. Protected Application Logic (Frontend Reset, NOT Product Reset)
Protect and preserve all approved backend and application functionality:
- Authentication & RBAC (Seeker, Provider, Admin, Safety Reviewer, Content Editor)
- Service-led matching engine (no provider browsing/marketplace)
- Audio-only live sessions (no video)
- Authoritative session timer & in-session extensions
- Credit lifecycle (unused credit extinguished on normal completion, preserved on system fault)
- 18+ eligibility self-declaration
- R0–R3 safeguarding, incident case management, and crisis helplines
- Flutterwave payment processing & double-entry ledger
- External Sage gateway (`https://becomingwithsage.vercel.app/` without internal chatbot embedding)
- PWA configuration & mobile-first responsiveness
