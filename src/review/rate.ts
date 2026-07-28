// FILE: src/review/rate.ts
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';

const KEY_TAP_COUNT = 'review:tapCount';
const KEY_COMPLETED_COUNT = 'review:completedCount';
const KEY_LAST_PROMPT = 'review:lastPrompt';
const KEY_NEVER = 'review:never';

const TAP_THRESHOLD = 5;
const COMPLETED_THRESHOLD = 3;
const COOL_DOWN_DAYS = 60;
const ONE_DAY = 24 * 60 * 60 * 1000;

// Đổi đúng package/bundle id của app
export const APP_PACKAGE = 'com.nexus.FulseFit';

// iOS App Store ID, ví dụ: id1234567890
export const APP_STORE_ID = 'id0000000000';

type TranslateFn = (
  key: string,
  defaultValue?: string,
  options?: any,
) => string;

const canPromptNow = async () => {
  const never = await AsyncStorage.getItem(KEY_NEVER);

  if (never === '1') {
    return false;
  }

  const now = Date.now();
  const last = Number(
    (await AsyncStorage.getItem(KEY_LAST_PROMPT)) || 0,
  );

  if (last && now - last < COOL_DOWN_DAYS * ONE_DAY) {
    return false;
  }

  return true;
};

const requestReview = async () => {
  const now = Date.now();

  try {
    if (InAppReview.isAvailable()) {
      await InAppReview.RequestInAppReview();
    } else {
      await openStoreListing();
    }
  } catch {
    await openStoreListing();
  } finally {
    await AsyncStorage.multiSet([
      [KEY_LAST_PROMPT, String(now)],
      [KEY_TAP_COUNT, '0'],
      [KEY_COMPLETED_COUNT, '0'],
    ]);
  }
};

/**
 * Hàm cũ: gọi khi người dùng bấm mở bài tập.
 * Sau 5 lần bấm mới hỏi đánh giá.
 */
export async function trackWorkoutTapAndMaybeAsk() {
  const ok = await canPromptNow();

  if (!ok) {
    return;
  }

  const count =
    Number((await AsyncStorage.getItem(KEY_TAP_COUNT)) || 0) + 1;

  await AsyncStorage.setItem(KEY_TAP_COUNT, String(count));

  if (count < TAP_THRESHOLD) {
    return;
  }

  await requestReview();
}

/**
 * Hàm mới: gọi sau khi người dùng hoàn thành bài tập.
 * Sau 3 buổi hoàn thành mới hỏi đánh giá.
 *
 * Có nhận t để tương thích với WorkoutVideoScreen.tsx,
 * nhưng hiện tại chưa cần dùng vì InAppReview là popup native.
 */
export async function trackWorkoutCompletedAndMaybeAsk(
  _t?: TranslateFn,
) {
  const ok = await canPromptNow();

  if (!ok) {
    return;
  }

  const count =
    Number((await AsyncStorage.getItem(KEY_COMPLETED_COUNT)) || 0) +
    1;

  await AsyncStorage.setItem(KEY_COMPLETED_COUNT, String(count));

  if (count < COMPLETED_THRESHOLD) {
    return;
  }

  await requestReview();
}

export async function openStoreListing() {
  if (Platform.OS === 'android') {
    const market = `market://details?id=${APP_PACKAGE}`;
    const web = `https://play.google.com/store/apps/details?id=${APP_PACKAGE}`;

    try {
      await Linking.openURL(market);
    } catch {
      await Linking.openURL(web);
    }

    return;
  }

  const url = `itms-apps://itunes.apple.com/app/${APP_STORE_ID}?action=write-review`;
  const web = `https://apps.apple.com/app/${APP_STORE_ID}`;

  try {
    await Linking.openURL(url);
  } catch {
    await Linking.openURL(web);
  }
}

export async function neverAskForReview() {
  await AsyncStorage.setItem(KEY_NEVER, '1');
}

export async function resetReviewPromptForDebug() {
  await AsyncStorage.multiRemove([
    KEY_TAP_COUNT,
    KEY_COMPLETED_COUNT,
    KEY_LAST_PROMPT,
    KEY_NEVER,
  ]);
}