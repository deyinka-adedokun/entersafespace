/**
 * Safespace Design Tokens — Brand & Experience Reset (v1.0)
 * Status: Authoritative Foundation
 * Core Identity: Quietly Human
 */

export const SAFESPACE_TOKENS = {
  // Brand Colors (Single Dominant Brand Color)
  brand: {
    DEFAULT: '#123B5D', // Safespace Deep Blue
    hover: '#0D2A42',
    active: '#091E30',
    subtle: '#EAF0F5', // 5% tint for restrained focus/active anchors
    muted: '#3D6280',
  },

  // Neutral System (Functional Neutrals)
  neutrals: {
    background: '#FAF9F6', // Primary canvas background
    backgroundSecondary: '#F3F1EC', // Secondary warm-neutral background
    surface: '#FFFFFF', // Clean surface
    textPrimary: '#17212B', // High contrast primary text
    textSecondary: '#59636B', // Subdued secondary text
    textMuted: '#7E8890',
    border: '#E3E2DE', // Subtle restrained border
    borderStrong: '#C5C4BF',
    white: '#FFFFFF',
  },

  // Functional Semantic Status (NOT decorative brand colors)
  semantic: {
    success: {
      text: '#1E6B43',
      bg: '#EDF7F1',
      border: '#BFE3CE',
    },
    warning: {
      text: '#9C5B0B',
      bg: '#FDF7EB',
      border: '#F6DBA9',
    },
    error: {
      text: '#B3261E',
      bg: '#FDF2F2',
      border: '#F9C9C7',
    },
    safeguarding: {
      critical: '#8C1D18',
      criticalBg: '#FCEBEA',
      criticalBorder: '#F5B7B4',
    },
    info: {
      text: '#123B5D',
      bg: '#EAF0F5',
      border: '#C5D6E4',
    },
  },

  // Typography
  typography: {
    fonts: {
      ui: 'Manrope, system-ui, -apple-system, sans-serif',
      display: 'Instrument Serif, Georgia, serif',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing Scale (Mathematical 4px/8px grid)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // Radius Scale (Restrained geometry, no bubble cards)
  radius: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },

  // Shadow Scale (Subtle, non-distracting elevation)
  shadow: {
    none: 'none',
    subtle: '0 1px 2px 0 rgba(23, 33, 43, 0.04)',
    elevated: '0 4px 16px -2px rgba(23, 33, 43, 0.06), 0 2px 6px -1px rgba(23, 33, 43, 0.03)',
    modal: '0 20px 40px -8px rgba(23, 33, 43, 0.14), 0 8px 16px -4px rgba(23, 33, 43, 0.06)',
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '375px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // Motion (Presence, not entertainment)
  motion: {
    fadeDuration: 0.25,
    ease: [0.22, 1, 0.36, 1], // Natural ease-out
  },
} as const;

export type SafespaceTokens = typeof SAFESPACE_TOKENS;
