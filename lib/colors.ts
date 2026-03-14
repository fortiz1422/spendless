/**
 * Design token values for JavaScript/JSX contexts.
 * Use these wherever Tailwind classes can't reach: SVG fill/stroke attributes,
 * inline style color props, computed JS values.
 *
 * These MIRROR the @theme tokens in app/globals.css.
 * When changing the palette → update BOTH files.
 */

export const colors = {
  // Accents
  primary:     '#2178A8',
  success:     '#1A7A42',
  warning:     '#B84A12',
  danger:      '#A61E1E',
  dangerSoft:  'rgba(166,30,30,0.09)',
  dangerLight: 'rgba(166,30,30,0.09)', // alias for backward compat
  want:        '#B84A12',
  // Backgrounds
  bgPrimary:   '#F0F4F8',
  // Data
  data:        '#1B7E9E',
  dataSoft:    'rgba(27,126,158,0.10)',
  // Soft variants
  primarySoft: 'rgba(33,120,168,0.09)',
  successSoft: 'rgba(26,122,66,0.10)',
  warningSoft: 'rgba(184,74,18,0.10)',
  // Used in Compromisos card color dots
  purple:      '#7D4EC0',
} as const

/**
 * Pre-computed alpha variants of `primary` (#2178A8) for SVG fills.
 */
export const primaryAlpha = {
  12: 'rgba(33,120,168,0.12)',
  65: 'rgba(33,120,168,0.65)',
} as const

/**
 * Pre-computed alpha variants of `ocean` (#1B7E9E) for SVG stroke/fill.
 */
export const oceanAlpha = {
  10: 'rgba(27,126,158,0.10)',
} as const
