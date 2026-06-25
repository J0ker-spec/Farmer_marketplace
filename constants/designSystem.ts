// Design System for Farmer Marketplace - Sierra Leone Agricultural E-Commerce App
// Premium, accessible design optimized for low-end Android devices

export const colors = {
  // Primary Colors
  primary: '#2D6A4F',          // Deep forest green — main brand color
  primaryLight: '#52B788',     // Lighter green — hover/active states
  primaryDark: '#1B4332',      // Darkest green — emphasis
  primaryGlow: 'rgba(45, 106, 79, 0.15)', // Subtle green glow
  
  // Accent Colors
  accent: '#F4A261',           // Warm orange — CTAs, highlights
  accentWarm: '#E9C46A',       // Soft yellow — secondary accents
  
  // Neutral Colors
  background: '#F9F7F2',       // Warm off-white — main background
  backgroundElevated: '#FFFFFF', // Elevated surfaces
  surface: '#FFFFFF',          // Card backgrounds
  surfaceGlass: 'rgba(255, 255, 255, 0.9)', // Glass effect
  surfaceLight: '#F0F0F0',     // Light gray surfaces
  
  // Text Colors
  textPrimary: '#1A1A1A',      // Main text — high contrast
  textSecondary: '#6B7280',    // Captions, labels
  textMuted: '#9CA3AF',        // Disabled, placeholder text
  white: '#FFFFFF',
  
  // Semantic Colors
  success: '#16A34A',          // Confirmed, delivered, approved
  warning: '#D97706',          // Pending, attention needed
  error: '#DC2626',            // Errors, cancel, reject
  sold: '#EF4444',             // Sold out, unavailable
  
  // Special Colors
  escrowBlue: '#2563EB',       // Payment held indicator
  fresh: '#22C55E',            // Freshness: very fresh
  freshMid: '#EAB308',         // Freshness: ok
  freshOld: '#F97316',         // Freshness: check with farmer
  
  // Border & Shadow Colors
  border: '#E5E7EB',           // Standard borders
  borderSubtle: '#F3F4F6',     // Subtle dividers
  cardShadow: 'rgba(0, 0, 0, 0.08)', // Soft shadows
  
  // Gradient Colors
  gradientStart: '#F9F7F2',
  gradientMid: '#F0F7F4',
  gradientEnd: '#E8F5E9',
};

export const typography = {
  // Font family: System fonts for optimal performance
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  // Font sizes
  fontSize: {
    caption: 12,               // Helper text, timestamps
    label: 14,                 // Form labels, button text
    body: 16,                  // Body text, descriptions
    headingSmall: 20,          // Section headers
    headingMedium: 24,         // Page titles
    headingLarge: 28,          // Hero titles
  },
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export const spacing = {
  // Base unit: 4px
  xs: 4,                      // Tight spacing, icon padding
  sm: 8,                      // Small gaps, related items
  md: 12,                     // Default spacing, form groups
  lg: 16,                     // Section padding, card padding
  xl: 24,                     // Large gaps, screen margins
  xxl: 32,                    // Major sections
  xxxl: 48,                   // Hero spacing
};

export const borderRadius = {
  sm: 8,                      // Small elements, tags, chips
  md: 10,                     // Buttons, inputs
  lg: 12,                     // Cards, containers
  xl: 16,                     // Large cards, modals
};

export const buttonHeight = {
  small: 44,
  medium: 48,
  large: 52,
};

export const buttonPadding = {
  small: {
    horizontal: 16,
  },
  medium: {
    horizontal: 20,
  },
  large: {
    horizontal: 24,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const touchTarget = {
  minimum: 44,                // Minimum touch target size in pixels
  comfortable: 48,            // Comfortable touch target size
};

export const cardPadding = {
  none: 0,
  sm: 8,
  md: 16,
  lg: 24,
};

export const iconSizes = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
};

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  navbar: 1030,
  modal: 1040,
  toast: 1050,
};

// Accessibility constants
export const accessibility = {
  minimumTapTarget: 44,
  minimumFontSize: 14,
  contrastRatio: {
    normal: 4.5,              // WCAG AA for normal text
    large: 3.0,               // WCAG AA for large text
  },
};
