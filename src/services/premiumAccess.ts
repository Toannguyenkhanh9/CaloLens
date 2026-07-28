// FILE: src/services/premiumAccess.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const PREMIUM_CHANGED_EVENT = 'premiumChanged';

export const PREMIUM_KEY = 'app:isPremium';
export const REMOVE_ADS_KEY = 'app:adsRemoved';
export const OFFLINE_VIDEO_ACCESS_KEY = 'app:offlineVideoAccess';
export const PREMIUM_PLAN_KEY = 'app:premiumPlan';

export type PremiumPlan = 'none' | 'premium' | 'premium_plus';

export const markPremiumActive = async () => {
  await AsyncStorage.setItem(PREMIUM_KEY, 'true');
  await AsyncStorage.setItem(REMOVE_ADS_KEY, 'true');

  const hasPlus = await AsyncStorage.getItem(OFFLINE_VIDEO_ACCESS_KEY);

  if (hasPlus !== 'true') {
    await AsyncStorage.setItem(PREMIUM_PLAN_KEY, 'premium');
  }

  DeviceEventEmitter.emit(PREMIUM_CHANGED_EVENT);
};

export const markPremiumPlusActive = async () => {
  await AsyncStorage.setItem(PREMIUM_KEY, 'true');
  await AsyncStorage.setItem(REMOVE_ADS_KEY, 'true');
  await AsyncStorage.setItem(OFFLINE_VIDEO_ACCESS_KEY, 'true');
  await AsyncStorage.setItem(PREMIUM_PLAN_KEY, 'premium_plus');

  DeviceEventEmitter.emit(PREMIUM_CHANGED_EVENT);
};

export const hasPremiumAccess = async () => {
  const value = await AsyncStorage.getItem(PREMIUM_KEY);
  return value === 'true' || value === '1';
};

export const hasOfflineVideoAccess = async () => {
  const value = await AsyncStorage.getItem(OFFLINE_VIDEO_ACCESS_KEY);
  return value === 'true' || value === '1';
};

export const loadPremiumPlan = async (): Promise<PremiumPlan> => {
  const plus = await hasOfflineVideoAccess();

  if (plus) {
    return 'premium_plus';
  }

  const premium = await hasPremiumAccess();

  if (premium) {
    return 'premium';
  }

  return 'none';
};