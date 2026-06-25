
// Product Categories
export const CATEGORIES = [
  'Grains',
  'Vegetables',
  'Fruits',
  'Livestock',
  'Fish',
  'Processed',
] as const;

// Units for products
export const UNITS = [
  'kg',
  'bag',
  'bunch',
  'crate',
  'piece',
] as const;

// User roles
export const ROLES = ['farmer', 'buyer', 'admin'] as const;

// Order statuses
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'ready',
  'shipped',
  'delivered',
  'cancelled',
] as const;

// Payment statuses
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;

// Payment methods
export const PAYMENT_METHODS = ['orange_money', 'afrimoney', 'bank_transfer', 'cash_on_delivery'] as const;

// Escrow statuses
export const ESCROW_STATUSES = ['held', 'released', 'refunded'] as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = ['free', 'plus', 'premium'] as const;

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: { maxListings: 3, commission: 0.05 },
  plus: { maxListings: 10, commission: 0.04 },
  premium: { maxListings: Infinity, commission: 0.03 },
} as const;
