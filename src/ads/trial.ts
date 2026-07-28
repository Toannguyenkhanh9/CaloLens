import AsyncStorage from '@react-native-async-storage/async-storage';

const TRIAL_KEY = 'ads:trialStartAt';
const DAY = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = 7; // hoặc số ngày bạn muốn

export async function ensureTrialStarted() {
  const ts = await AsyncStorage.getItem(TRIAL_KEY);
  if (!ts) {
    await AsyncStorage.setItem(TRIAL_KEY, String(Date.now()));
  }
}

export async function hasTrialStarted(): Promise<boolean> {
  const ts = await AsyncStorage.getItem(TRIAL_KEY);
  return !!ts;
}

export async function isTrialActive(): Promise<boolean> {
  const ts = await AsyncStorage.getItem(TRIAL_KEY);
  if (!ts) return false;

  const start = parseInt(ts, 10);
  return Date.now() - start < TRIAL_DAYS * DAY;
}

/**
 * Nếu trial chưa bắt đầu -> bắt đầu trial ngay lần user mở chương trình đầu tiên
 * Trả về true nếu sau đó trial đang active
 */
export async function ensureTrialAccess(): Promise<boolean> {
  const started = await hasTrialStarted();

  if (!started) {
    await ensureTrialStarted();
    return true;
  }

  return await isTrialActive();
}