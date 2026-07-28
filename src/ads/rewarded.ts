// src/ads/rewarded.ts
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import { ADMOB } from './adConfig';

const UNIT_ID =
  __DEV__
    ? TestIds.REWARDED
    : Platform.OS === 'android'
      ? ADMOB.android.rewarded
      : ADMOB.ios.rewarded;

let rewarded: RewardedAd | null = null;
let loaded = false;
let loading = false;
let loadPromise: Promise<boolean> | null = null;

function createAd() {
  rewarded = RewardedAd.createForAdRequest(UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  loaded = false;
  loading = true;

  loadPromise = new Promise((resolve) => {
    const offLoaded = rewarded!.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        loaded = true;
        loading = false;
        console.log('[rewarded] loaded');
        offLoaded();
        offError();
        resolve(true);
      }
    );

    const offError = rewarded!.addAdEventListener(
      AdEventType.ERROR,
      (e) => {
        loaded = false;
        loading = false;
        console.log('[rewarded] load error', e);
        offLoaded();
        offError();
        resolve(false);
      }
    );
  });

  rewarded.load();
  console.log('[rewarded] loading...');
}

export function preloadRewarded() {
  if (!rewarded && !loading) {
    createAd();
  }
}

export async function ensureRewardedLoaded(timeoutMs = 4000): Promise<boolean> {
  if (loaded && rewarded) return true;

  if (!rewarded && !loading) {
    createAd();
  }

  if (!loadPromise) return false;

  const result = await Promise.race<boolean>([
    loadPromise,
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);

  return result;
}

export type RewardedResult = 'earned' | 'closed' | 'not_ready' | 'error';

export async function showRewarded(): Promise<RewardedResult> {
  const ready = await ensureRewardedLoaded();
  if (!ready || !rewarded || !loaded) {
    console.log('[rewarded] not ready');
    return 'not_ready';
  }

  return new Promise<RewardedResult>((resolve) => {
    let earned = false;

    const offEarn = rewarded!.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        earned = true;
        console.log('[rewarded] earned reward');
      }
    );

    const offClose = rewarded!.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('[rewarded] closed');
        offEarn();
        offClose();

        // reset ad cũ và preload ad mới
        rewarded = null;
        loaded = false;
        loading = false;
        loadPromise = null;
        preloadRewarded();

        resolve(earned ? 'earned' : 'closed');
      }
    );

    rewarded!
      .show()
      .then(() => {
        console.log('[rewarded] show called');
      })
      .catch((e) => {
        console.log('[rewarded] show failed', e);
        offEarn();
        offClose();

        rewarded = null;
        loaded = false;
        loading = false;
        loadPromise = null;
        preloadRewarded();

        resolve('error');
      });
  });
}