// FILE: src/iap/iapConfig.ts

// Premium thường
export const PREMIUM_LIFETIME_PRODUCT_ID =
  'pulsefit_premium_lifetime';

export const PREMIUM_MONTHLY_SUB_ID =
  'pulsefit_premium_monthly';

// Premium Plus
export const PREMIUM_PLUS_MONTHLY_SUB_ID =
  'pulsefit_premium_plus_monthly';

export const PREMIUM_PLUS_LIFETIME_PRODUCT_ID =
  'pulsefit_premiumplus_lifetime';

// Danh sách sản phẩm mua 1 lần
export const PREMIUM_PRODUCT_IDS = [
  PREMIUM_LIFETIME_PRODUCT_ID,
  PREMIUM_PLUS_LIFETIME_PRODUCT_ID,
];

// Danh sách subscription theo tháng
export const PREMIUM_SUB_IDS = [
  PREMIUM_MONTHLY_SUB_ID,
  PREMIUM_PLUS_MONTHLY_SUB_ID,
];

export const PREMIUM_STATE_KEY = 'iap:isPremium';