// FILE: src/ads/adGate.ts
import {
  ensureTrialStarted,
  isTrialActive,
} from './trial';

import {
  showRewarded,
  RewardedResult,
} from './rewarded';

export async function gateWorkout({
  isPremium,
  startTrialOnFirstUse = true,
}: {
  isPremium?: boolean;
  startTrialOnFirstUse?: boolean;
}): Promise<RewardedResult | 'pass'> {
  /**
   * Premium luôn được bỏ qua quảng cáo.
   */
  if (isPremium) {
    return 'pass';
  }

  /**
   * Khi startTrialOnFirstUse = true:
   * - bắt đầu trial nếu chưa có;
   * - nếu trial còn hiệu lực thì bỏ qua quảng cáo;
   * - nếu trial hết hạn thì hiển thị rewarded.
   *
   * Khi startTrialOnFirstUse = false:
   * - không tạo trial;
   * - không kiểm tra trial cũ;
   * - tài khoản Free luôn phải xem rewarded.
   */
  if (startTrialOnFirstUse) {
    await ensureTrialStarted();

    const active = await isTrialActive();

    if (active) {
      console.log('[adGate] trial active -> pass');
      return 'pass';
    }
  }

  console.log('[adGate] showing rewarded');

  return await showRewarded();
}

/**
 * Banner mua Premium phải luôn hiện với tài khoản Free,
 * không phụ thuộc trial.
 */
export async function canShowBanner(
  isPremium?: boolean,
): Promise<boolean> {
  return !isPremium;
}