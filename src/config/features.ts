// FILE: src/config/features.ts

/**
 * Bản 1.0 gửi App Store chưa có Premium/IAP.
 * Khi chuẩn bị bản cập nhật có Premium, đổi thành true.
 */
export const PREMIUM_ENABLED = true;
//premium  export const PREMIUM_ENABLED = true;
/**
 * Chỉ giả lập Premium trong bản debug để test chức năng.
 * __DEV__ tự động là false trong bản release/App Store.
 */
export const FORCE_PREMIUM_IN_DEBUG = false;
//premium  export const FORCE_PREMIUM_IN_DEBUG = __DEV__ && false;;