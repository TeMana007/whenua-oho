/**
 * Kōrero Companion — Design tokens
 * Single source of truth shared by Tailwind configs and inline styles.
 */

export const colors = {
  primary:   '#04342C', // dark teal
  secondary: '#F5F0E8', // warm cream
  accent:    '#C8A951', // kowhai gold
  success:   '#2D7A4F', // pounamu green
  warning:   '#E07B39', // earth orange
  ink:       '#1A1A1A', // text dark
  // text-light = secondary (#F5F0E8)
} as const;

export const fontFamilies = {
  /** Playfair Display — headings (loaded per platform) */
  heading: 'PlayfairDisplay_700Bold',
  headingRegular: 'PlayfairDisplay_400Regular',
  /** DM Sans — body (loaded per platform) */
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 9999,
} as const;

/** Minimum tap target height (WCAG 2.5.5 AAA) */
export const MIN_BUTTON_HEIGHT = 56;
