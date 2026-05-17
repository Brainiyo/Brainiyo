// ─── Brainiyo Design System ───────────────────────────────────────────────────

export const COLORS = {
  // Brand
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  primaryMid: '#818CF8',

  // Accent
  secondary: '#0D9488',
  secondaryLight: '#F0FDFA',
  secondaryDark: '#0F766E',

  // Semantic
  success: '#16A34A',
  successLight: '#F0FDF4',
  successDark: '#15803D',

  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerDark: '#B91C1C',

  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningDark: '#B45309',

  info: '#0284C7',
  infoLight: '#F0F9FF',

  // Neutrals
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral500: '#6B7280',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',

  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Semantic aliases (for readability)
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
};

// ─── Typography Scale ──────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
  family: {
    heading: 'System', // swap to 'Nunito' once expo-font loads
    body: 'System',    // swap to 'Inter' once expo-font loads
  },
};

// ─── Spacing Scale (4px base) ─────────────────────────────────────────────────
export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ─── Sizes / Touch Targets ────────────────────────────────────────────────────
export const SIZES = {
  touchTarget: 48,    // Minimum accessible hit area
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 64,
  headerHeight: 56,
  tabBarHeight: 62,
  bottomSheetHandle: 4,
};

// ─── Legacy aliases (keeps old imports working) ───────────────────────────────
export const FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  semibold: { fontFamily: 'System', fontWeight: '600' },
  bold: { fontFamily: 'System', fontWeight: '700' },
  heavy: { fontFamily: 'System', fontWeight: '800' },
};

export const THEME = { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, SIZES, FONTS };

// ─── API URL ──────────────────────────────────────────────────────────────────
// Android emulator: 10.0.2.2 maps to host machine localhost
// Physical device:  replace with your machine's LAN IP e.g. 192.168.x.x
export const API_URL = 'http://10.0.2.2:5002/api';
