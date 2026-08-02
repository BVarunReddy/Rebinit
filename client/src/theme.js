// Shared design tokens — the monochrome + single-accent direction.
// Import these into every page as they get reskinned, rather than
// hardcoding hex values per-file, so the whole app stays consistent.

export const COLORS = {
  bg: '#0B0D0C',        // page background — near-black, not pure black
  surface: '#17191A',   // cards, panels
  surfaceAlt: '#232625', // nested surfaces (icon badges, chips)
  border: '#26292A',    // only for things that truly need a hairline (inputs, dividers)

  text: '#F2F3F1',       // primary text
  textMuted: '#8B928C',  // secondary/meta text
  textFaint: '#5C615D',  // placeholders, disabled

  accent: '#5A4FCF',     // the one bold color in this UI — CTAs, points, active states
  accentBg: '#5A4FCF22', // accent at low opacity, for icon badge backgrounds

  danger: '#E0655B',     // errors, hazardous warnings
  dangerBg: '#E0655B18',
  success: '#4CAF7D',    // confirmations only — sparingly, not as a second brand color
  successBg: '#4CAF7D18',
};

// Category identity colors — deliberately muted/desaturated so they read as
// small identity markers (dots, chip borders) rather than competing blocks
// of color against the single accent.
export const CATEGORY_COLORS = {
  paper: '#5B9BD5',
  plastic: '#E8C547',
  organic: '#6FBF73',
  glass: '#4FC3B0',
  ewaste: '#A78BE0',
  metal: '#9CA3AA',
  textile: '#E08AA6',
  trash: '#6B7076',
  unknown: '#6B7076',
};

export const FONTS = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'IBM Plex Mono', monospace",
};

// Drop this <style> block once per page (or once globally if you add a
// root layout) to load the fonts referenced above.
export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');`;