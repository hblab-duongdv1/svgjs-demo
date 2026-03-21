/**
 * Design-aligned defaults for SVG content (see `docs/demo/DESIGN.md` for app chrome tokens).
 * Use these inside `src/components/canvas/*` instead of hardcoding hex in every module file.
 */
export const SVG_STYLE_TOKENS = {
  primary: '#2b3896',
  onSurface: '#1a1b22',
  surfaceContainerHighest: '#e3e1ea',
  outlineVariant: 'rgba(26, 27, 34, 0.38)',
} as const;

/** Font stack for SVG `<text>` — Inter is loaded in `index.html`. */
export const SVG_FONT_FAMILY = 'Inter, ui-sans-serif, system-ui, sans-serif';

export const SVG_FONT_SIZES = {
  label: 12,
  body: 14,
  title: 18,
} as const;

/** Labels for fixed SVG.js `.ease()` tokens in the easing gallery (reference rows). */
export const EASING_LABELS = [
  'linear (-)',
  'ease in-out (<>)',
  'ease in (<)',
  'ease out (>)',
] as const;
