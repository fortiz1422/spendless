/**
 * Typed design tokens for TypeScript contexts (SVG fills, inline styles, computed values).
 * These MIRROR the @theme tokens in app/globals.css and lib/colors.ts.
 * When changing the palette → update ALL THREE files.
 */

export const tokens = {
  bg: {
    primary:   '#F0F4F8',
    secondary: '#E6ECF2',
    tertiary:  '#DCE3EA',
    elevated:  '#F0F4F8',
  },
  text: {
    primary:   '#0D1829',
    secondary: '#4A6070',
    tertiary:  '#90A4B0',
    disabled:  '#B8C9D4',
    label:     '#90A4B0',
    dim:       '#90A4B0',
    muted:     '#B8C9D4',
  },
  border: {
    subtle:  'rgba(15,30,60,0.06)',
    strong:  'rgba(15,30,60,0.10)',
    ocean:   'rgba(255,255,255,0.70)',
    card:    'rgba(255,255,255,0.70)',
  },
  accent: {
    primary:     '#2178A8',
    success:     '#1A7A42',
    warning:     '#B84A12',
    danger:      '#A61E1E',
    dangerSoft:  'rgba(166,30,30,0.09)',
    want:        '#B84A12',
    necessity:   '#1A7A42',
  },
  data: {
    base: '#1B7E9E',
    soft: 'rgba(27,126,158,0.10)',
  },
  soft: {
    primary: 'rgba(33,120,168,0.09)',
    success: 'rgba(26,122,66,0.10)',
    warning: 'rgba(184,74,18,0.10)',
    danger:  'rgba(166,30,30,0.09)',
  },
  glass: {
    surface:  'rgba(255,255,255,0.38)',
    border:   'rgba(255,255,255,0.70)',
    nav:      'rgba(255,255,255,0.38)',
    backdrop: 'rgba(0,0,0,0.40)',
  },
} as const
