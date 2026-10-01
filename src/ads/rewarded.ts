// FILE: src/ads/rewarded.ts
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import {Platform} from 'react-native';
import {ADMOB} from './adConfig';

const UNIT_ID =
  __DEV__
    ? TestIds.REWARDED
    : Platform.OS === 'android'
      ? ADMOB.android.rewarded
      : ADMOB.ios.rewarded;

const LOAD_TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 1500;

let rewarded: RewardedAd | null = null;
let loaded = false;
let loading = false;
let loadPromise: Promise<boolean> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

const delay = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

function clearRetryTimer() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function resetAd(ad?: RewardedAd | null) {
  if (ad && rewarded !== ad) return;

  rewarded = null;
  loaded = false;
  loading = false;
  loadPromise = null;
}

function scheduleRetry() {
  clearRetryTimer();

  retryTimer = setTimeout(() => {
    retryTimer = null;

    if (!rewarded && !loading && !loaded) {
      console.log('[rewarded] retry preload');
      void createAd();
    }
  }, RETRY_DELAY_MS);
}

function createAd(): Promise<boolean> {
  if (loaded && rewarded) {
    return Promise.resolve(true);
  }

  if (loading && loadPromise) {
    return loadPromise;
  }

  clearRetryTimer();

  const ad = RewardedAd.createForAdRequest(UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  rewarded = ad;
  loaded = false;
  loading = true;

  console.log(
    `[rewarded] create ${JSON.stringify({
      platform: Platform.OS,
      dev: __DEV__,
      unitId: UNIT_ID,
    })}`,
  );

  loadPromise = new Promise<boolean>(resolve => {
    let settled = false;
    let offLoaded: (() => void) | null = null;
    let offError: (() => void) | null = null;

    const cleanup = () => {
      offLoaded?.();
      offError?.();
      offLoaded = null;
      offError = null;
    };

    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(ok);
    };

    offLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        if (rewarded !== ad) {
          finish(false);
          return;
        }

        loaded = true;
        loading = false;

        console.log(
          `[rewarded] loaded ${JSON.stringify({
            platform: Platform.OS,
            unitId: UNIT_ID,
          })}`,
        );

        finish(true);
      },
    );

    offError = ad.addAdEventListener(
      AdEventType.ERROR,
      error => {
        console.log(
          `[rewarded] load error ${JSON.stringify({
            platform: Platform.OS,
            unitId: UNIT_ID,
            code: (error as any)?.code ?? '',
            message:
              (error as any)?.message ??
              String(error ?? ''),
          })}`,
        );

        if (rewarded === ad) {
          resetAd(ad);
        }

        finish(false);
        scheduleRetry();
      },
    );

    try {
      ad.load();
      console.log('[rewarded] loading...');
    } catch (error: any) {
      console.log(
        `[rewarded] load threw ${JSON.stringify({
          platform: Platform.OS,
          unitId: UNIT_ID,
          code: error?.code ?? '',
          message:
            error?.message ??
            String(error ?? ''),
        })}`,
      );

      resetAd(ad);
      finish(false);
      scheduleRetry();
    }
  });

  return loadPromise;
}

export function preloadRewarded() {
  if (loaded || loading) return;
  void createAd();
}

async function waitForLoad(
  timeoutMs: number,
): Promise<boolean> {
  if (loaded && rewarded) {
    return true;
  }

  if (!loading || !loadPromise) {
    void createAd();
  }

  const current = loadPromise;
  if (!current) return false;

  return Promise.race<boolean>([
    current,
    new Promise<boolean>(resolve =>
      setTimeout(() => resolve(false), timeoutMs),
    ),
  ]);
}

export async function ensureRewardedLoaded(
  timeoutMs = LOAD_TIMEOUT_MS,
): Promise<boolean> {
  if (loaded && rewarded) {
    return true;
  }

  const first = await waitForLoad(timeoutMs);

  if (first && loaded && rewarded) {
    return true;
  }

  if (loading) {
    console.log(
      `[rewarded] still loading after ${timeoutMs}ms`,
    );
    return false;
  }

  await delay(700);

  if (loaded && rewarded) {
    return true;
  }

  if (!loading) {
    void createAd();
  }

  const second = await waitForLoad(timeoutMs);

  return !!(
    second &&
    loaded &&
    rewarded
  );
}

export type RewardedResult =
  | 'earned'
  | 'closed'
  | 'not_ready'
  | 'error';

export async function showRewarded():
Promise<RewardedResult> {
  const ready = await ensureRewardedLoaded();

  if (!ready || !rewarded || !loaded) {
    console.log(
      `[rewarded] not ready ${JSON.stringify({
        platform: Platform.OS,
        loaded,
        loading,
        hasAd: !!rewarded,
        unitId: UNIT_ID,
      })}`,
    );
    return 'not_ready';
  }

  const ad = rewarded;

  return new Promise<RewardedResult>(resolve => {
    let earned = false;
    let settled = false;

    let offEarn: (() => void) | null = null;
    let offClose: (() => void) | null = null;
    let offError: (() => void) | null = null;

    const cleanup = () => {
      offEarn?.();
      offClose?.();
      offError?.();
      offEarn = null;
      offClose = null;
      offError = null;
    };

    const finish = (result: RewardedResult) => {
      if (settled) return;
      settled = true;
      cleanup();

      resetAd(ad);

      setTimeout(() => {
        preloadRewarded();
      }, 500);

      resolve(result);
    };

    offEarn = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        earned = true;
        console.log(
          `[rewarded] earned reward ${JSON.stringify({
            type: (reward as any)?.type ?? '',
            amount: (reward as any)?.amount ?? '',
          })}`,
        );
      },
    );

    offClose = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log(
          `[rewarded] closed ${JSON.stringify({earned})}`,
        );
        finish(earned ? 'earned' : 'closed');
      },
    );

    offError = ad.addAdEventListener(
      AdEventType.ERROR,
      error => {
        console.log(
          `[rewarded] show event error ${JSON.stringify({
            code: (error as any)?.code ?? '',
            message:
              (error as any)?.message ??
              String(error ?? ''),
          })}`,
        );
        finish('error');
      },
    );

    ad.show()
      .then(() => {
        console.log('[rewarded] show called');
      })
      .catch((error: any) => {
        console.log(
          `[rewarded] show failed ${JSON.stringify({
            code: error?.code ?? '',
            message:
              error?.message ??
              String(error ?? ''),
          })}`,
        );
        finish('error');
      });
  });
}
