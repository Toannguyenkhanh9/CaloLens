// FILE: src/iap/iapConfig.ts

// Premium thường
export const PREMIUM_LIFETIME_PRODUCT_ID =
  'calolens_premium_lifetime';

// Giữ nguyên ID hiện tại. Product ID phải khớp 100% với Play Console/App Store.
export const PREMIUM_MONTHLY_SUB_ID =
  'calolens_premium_monthy';

// Premium Plus (legacy / chưa dùng trong CaloLens hiện tại)
export const PREMIUM_PLUS_MONTHLY_SUB_ID =
  'pulsefit_premium_plus_monthly';

export const PREMIUM_PLUS_LIFETIME_PRODUCT_ID =
  'pulsefit_premiumplus_lifetime';

// Chỉ tải các SKU thực sự dùng cho CaloLens Premium.
// Không đưa SKU PulseFit vào request catalog của CaloLens vì một SKU không tồn tại
// có thể làm việc tải catalog thất bại trên một số phiên bản billing/IAP.
export const PREMIUM_PRODUCT_IDS = [
  PREMIUM_LIFETIME_PRODUCT_ID,
];

export const PREMIUM_SUB_IDS = [
  PREMIUM_MONTHLY_SUB_ID,
];

export const PREMIUM_STATE_KEY = 'iap:isPremium';
