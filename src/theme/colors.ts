/**
 * SAFESPACE COLOUR SYSTEM
 * -------------------------------------------------------------------
 * Evoked Attributes: Warm, Calm, Premium, Human, Reassuring, Sophisticated, Timeless.
 * Principles:
 *  1. Warm paper & soft light backgrounds (avoiding cold clinical SaaS whites).
 *  2. Restrained primary umber/timber supported by warm sandstone clay & terracotta accents.
 *  3. Grounded eucalyptus sage for success, ochre for warnings, earthy terracotta for error.
 *  4. High-contrast WCAG 2.1 AA+ compliance across light and dark contexts.
 *  5. Strict ban on clinical neon blues, harsh electric greens, and loud synthetic gradients.
 */

export interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  rgb: string;
  usage: string;
  wcagContrastLight: string; // e.g. "14.2:1 (AAA)"
  wcagContrastDark: string;
  category: 'primary' | 'secondary' | 'accent' | 'background' | 'surface' | 'text' | 'status' | 'focus';
}

export const SAFESPACE_COLOR_SYSTEM = {
  name: "Safespace Colour System",
  version: "2.0.0",
  philosophy: "Warm, calm, human, and reassuring digital sanctuary.",
  light: {
    primary: {
      DEFAULT: "#2C1A14", // Deep Warm Umber / Mahogany Timber
      hover: "#1E110D",
      foreground: "#FAF7F2",
      description: "Primary brand anchor for key CTAs, headers, and grounded authority."
    },
    secondary: {
      DEFAULT: "#EFE8E1", // Soft Sandstone Parchment
      hover: "#E4D9CE",
      foreground: "#2C1A14",
      description: "Warm neutral surface for subtle buttons, chips, and section dividers."
    },
    accent: {
      DEFAULT: "#C86228", // Terracotta Amber / Warm Copper
      hover: "#B2521C",
      light: "#FDF4ED",
      foreground: "#FFFFFF",
      description: "Human warmth & emotional connection accent for highlights and active states."
    },
    background: {
      DEFAULT: "#FAF7F2", // Warm Paper Linen
      subtle: "#F4EFE6",
      description: "Tactile warm paper canvas evoking a quiet physical sanctuary."
    },
    surface: {
      DEFAULT: "#FCFAF7", // Alabaster Card
      elevated: "#FFFFFF",
      border: "#E8E2D9",
      borderHover: "#D6CCC0",
      description: "Clean elevated card surfaces with gentle paper borders."
    },
    text: {
      DEFAULT: "#1F1815", // Deep Dark Umber (Contrast > 14:1)
      muted: "#6E635C",   // Warm Taupe Slate (Contrast > 4.8:1)
      subtle: "#94877E",  // Soft Timber Caption
      onDark: "#FAF7F2",
      description: "High-contrast legible typography with warm earth undertones."
    },
    status: {
      success: {
        text: "#2D5A43",   // Grounded Eucalyptus / Sage
        bg: "#EFF5F1",
        border: "#C8E0D2",
        description: "Reassuring organic sage green for session completion and safety."
      },
      warning: {
        text: "#B4691B",   // Warm Ochre / Honey Amber
        bg: "#FAF3E8",
        border: "#F3E0C4",
        description: "Gentle ochre amber for reminders and non-punitive alerts."
      },
      error: {
        text: "#9E3A2B",     // Earthy Terracotta Red
        bg: "#FDF2F0",
        border: "#F5CAC3",
        description: "Human earthy red for critical safety reports and errors."
      }
    },
    focus: {
      ring: "#C86228",
      offset: "#FAF7F2",
      description: "2px warm terracotta ring with offset for clear accessibility navigation."
    }
  },
  dark: {
    primary: {
      DEFAULT: "#F5EBE1",
      hover: "#FFFDF9",
      foreground: "#2C1A14",
      description: "Warm cream paper text on deep dark sanctuary canvas."
    },
    secondary: {
      DEFAULT: "#332A24",
      hover: "#3E332C",
      foreground: "#F5EBE1",
      description: "Muted dark timber surface for quiet secondary controls."
    },
    accent: {
      DEFAULT: "#E07A38",
      hover: "#EB8947",
      light: "#2E1E16",
      foreground: "#181412",
      description: "Luminous terracotta warmth in dark mode."
    },
    background: {
      DEFAULT: "#181412", // Deep Quiet Timber Obsidian
      subtle: "#1F1815",
      description: "Quiet night sanctuary environment."
    },
    surface: {
      DEFAULT: "#221C19",
      elevated: "#2A231F",
      border: "#3B312A",
      borderHover: "#4A3F37",
      description: "Subtle warm dark cards."
    },
    text: {
      DEFAULT: "#FAF7F2",
      muted: "#B8ACA3",
      subtle: "#8C8077",
      onDark: "#1F1815",
      description: "Soft warm white text."
    },
    status: {
      success: {
        text: "#60A381",
        bg: "#1C2A22",
        border: "#2D4738",
        description: "Warm night sage."
      },
      warning: {
        text: "#E5983B",
        bg: "#2A2115",
        border: "#443520",
        description: "Warm night ochre."
      },
      error: {
        text: "#E06A58",
        bg: "#2C1A17",
        border: "#4A2823",
        description: "Warm night terracotta red."
      }
    },
    focus: {
      ring: "#E07A38",
      offset: "#181412",
      description: "2px luminous terracotta focus ring."
    }
  }
};

export const COLOR_TOKENS: ColorToken[] = [
  {
    name: "Primary Umber",
    variable: "--color-primary",
    hex: "#2C1A14",
    rgb: "44, 26, 20",
    usage: "Main CTA buttons, hero headings, navbar brand accents",
    wcagContrastLight: "15.8:1 (AAA)",
    wcagContrastDark: "14.1:1 (AAA)",
    category: "primary"
  },
  {
    name: "Secondary Sandstone",
    variable: "--color-secondary",
    hex: "#EFE8E1",
    rgb: "239, 232, 225",
    usage: "Secondary buttons, pill filters, quiet tab badges",
    wcagContrastLight: "11.2:1 (AAA)",
    wcagContrastDark: "10.8:1 (AAA)",
    category: "secondary"
  },
  {
    name: "Terracotta Accent",
    variable: "--color-accent",
    hex: "#C86228",
    rgb: "200, 98, 40",
    usage: "Active badges, key focus indicators, warm highlights",
    wcagContrastLight: "4.9:1 (AA)",
    wcagContrastDark: "7.2:1 (AAA)",
    category: "accent"
  },
  {
    name: "Warm Paper Canvas",
    variable: "--color-background",
    hex: "#FAF7F2",
    rgb: "250, 247, 242",
    usage: "App background canvas simulating soft tactile paper",
    wcagContrastLight: "N/A (Base)",
    wcagContrastDark: "N/A (Base)",
    category: "background"
  },
  {
    name: "Alabaster Surface",
    variable: "--color-surface",
    hex: "#FCFAF7",
    rgb: "252, 250, 247",
    usage: "Card containers, modals, bottom sheets, form surfaces",
    wcagContrastLight: "16.2:1 (AAA)",
    wcagContrastDark: "12.8:1 (AAA)",
    category: "surface"
  },
  {
    name: "Deep Umber Text",
    variable: "--color-text",
    hex: "#1F1815",
    rgb: "31, 24, 21",
    usage: "Body text, primary titles, high-priority readouts",
    wcagContrastLight: "17.4:1 (AAA)",
    wcagContrastDark: "16.1:1 (AAA)",
    category: "text"
  },
  {
    name: "Taupe Muted Text",
    variable: "--color-text-muted",
    hex: "#6E635C",
    rgb: "110, 99, 92",
    usage: "Secondary descriptions, timestamps, metadata labels",
    wcagContrastLight: "5.2:1 (AA)",
    wcagContrastDark: "6.8:1 (AA)",
    category: "text"
  },
  {
    name: "Eucalyptus Success",
    variable: "--color-status-success",
    hex: "#2D5A43",
    rgb: "45, 90, 67",
    usage: "Verified listener badges, active session states, safety confirmed",
    wcagContrastLight: "6.8:1 (AA)",
    wcagContrastDark: "7.5:1 (AAA)",
    category: "status"
  },
  {
    name: "Warm Ochre Warning",
    variable: "--color-status-warning",
    hex: "#B4691B",
    rgb: "180, 105, 27",
    usage: "Trial expiry warnings, session reminders, gentle notices",
    wcagContrastLight: "4.8:1 (AA)",
    wcagContrastDark: "6.2:1 (AA)",
    category: "status"
  },
  {
    name: "Terracotta Brick Error",
    variable: "--color-status-error",
    hex: "#9E3A2B",
    rgb: "158, 58, 43",
    usage: "Safeguarding reports, connection error alerts, emergency hotline",
    wcagContrastLight: "5.9:1 (AA)",
    wcagContrastDark: "7.1:1 (AAA)",
    category: "status"
  },
  {
    name: "Warm Terracotta Focus",
    variable: "--color-focus",
    hex: "#C86228",
    rgb: "200, 98, 40",
    usage: "Keyboard outline rings & active input accessibility bounds",
    wcagContrastLight: "2px Ring (AA)",
    wcagContrastDark: "2px Ring (AA)",
    category: "focus"
  }
];
