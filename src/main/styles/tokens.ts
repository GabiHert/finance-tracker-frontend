// Design System Tokens - TypeScript definitions for CSS variables
// These match the CSS custom properties defined in globals.css

export const colors = {
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
    DEFAULT: 'var(--color-primary)',
  },
  secondary: {
    50: 'var(--color-secondary-50)',
    100: 'var(--color-secondary-100)',
    500: 'var(--color-secondary-500)',
    600: 'var(--color-secondary-600)',
    DEFAULT: 'var(--color-secondary)',
  },
  success: {
    50: 'var(--color-success-50)',
    500: 'var(--color-success-500)',
    600: 'var(--color-success-600)',
    DEFAULT: 'var(--color-success)',
  },
  warning: {
    50: 'var(--color-warning-50)',
    500: 'var(--color-warning-500)',
    600: 'var(--color-warning-600)',
    DEFAULT: 'var(--color-warning)',
  },
  error: {
    50: 'var(--color-error-50)',
    500: 'var(--color-error-500)',
    600: 'var(--color-error-600)',
    DEFAULT: 'var(--color-error)',
  },
  info: {
    50: 'var(--color-info-50)',
    500: 'var(--color-info-500)',
    600: 'var(--color-info-600)',
    DEFAULT: 'var(--color-info)',
  },
  neutral: {
    50: 'var(--color-neutral-50)',
    100: 'var(--color-neutral-100)',
    200: 'var(--color-neutral-200)',
    300: 'var(--color-neutral-300)',
    400: 'var(--color-neutral-400)',
    500: 'var(--color-neutral-500)',
    600: 'var(--color-neutral-600)',
    700: 'var(--color-neutral-700)',
    800: 'var(--color-neutral-800)',
    900: 'var(--color-neutral-900)',
    950: 'var(--color-neutral-950)',
  },
  background: 'var(--color-background)',
  surface: 'var(--color-surface)',
  surfaceElevated: 'var(--color-surface-elevated)',
  textPrimary: 'var(--color-text-primary)',
  textSecondary: 'var(--color-text-secondary)',
  textMuted: 'var(--color-text-muted)',
  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',
} as const

export const typography = {
  fontFamily: {
    sans: 'var(--font-family-sans)',
    mono: 'var(--font-family-mono)',
  },
  fontSize: {
    xs: 'var(--font-size-xs)',
    sm: 'var(--font-size-sm)',
    base: 'var(--font-size-base)',
    lg: 'var(--font-size-lg)',
    xl: 'var(--font-size-xl)',
    '2xl': 'var(--font-size-2xl)',
    '3xl': 'var(--font-size-3xl)',
    '4xl': 'var(--font-size-4xl)',
  },
  lineHeight: {
    tight: 'var(--line-height-tight)',
    snug: 'var(--line-height-snug)',
    normal: 'var(--line-height-normal)',
    relaxed: 'var(--line-height-relaxed)',
  },
  fontWeight: {
    normal: 'var(--font-weight-normal)',
    medium: 'var(--font-weight-medium)',
    semibold: 'var(--font-weight-semibold)',
    bold: 'var(--font-weight-bold)',
  },
} as const

export const spacing = {
  0: 'var(--space-0)',
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
  12: 'var(--space-12)',
  16: 'var(--space-16)',
  20: 'var(--space-20)',
  24: 'var(--space-24)',
} as const

export const borderRadius = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  default: 'var(--radius-default)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  full: 'var(--radius-full)',
} as const

export const shadows = {
  sm: 'var(--shadow-sm)',
  default: 'var(--shadow-default)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
} as const

export const transitions = {
  fast: 'var(--transition-fast)',
  default: 'var(--transition-default)',
  slow: 'var(--transition-slow)',
} as const

export const zIndex = {
  dropdown: 'var(--z-dropdown)',
  sticky: 'var(--z-sticky)',
  fixed: 'var(--z-fixed)',
  modalBackdrop: 'var(--z-modal-backdrop)',
  modal: 'var(--z-modal)',
  popover: 'var(--z-popover)',
  tooltip: 'var(--z-tooltip)',
} as const

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
} as const

export type Tokens = typeof tokens
