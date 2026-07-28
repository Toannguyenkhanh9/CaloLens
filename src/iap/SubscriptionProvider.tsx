// FILE: src/iap/SubscriptionProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

import {
  PREMIUM_LIFETIME_PRODUCT_ID,
  PREMIUM_MONTHLY_SUB_ID,
  PREMIUM_PRODUCT_IDS,
  PREMIUM_SUB_IDS,
  PREMIUM_STATE_KEY,
  PREMIUM_PLUS_LIFETIME_PRODUCT_ID,
  PREMIUM_PLUS_MONTHLY_SUB_ID,
} from './iapConfig';

import {
  markPremiumActive,
  markPremiumPlusActive,
  OFFLINE_VIDEO_ACCESS_KEY,
  PREMIUM_PLAN_KEY,
} from '../services/premiumAccess';

import {
  FORCE_PREMIUM_IN_DEBUG,
  PREMIUM_ENABLED,
} from '../config/features';

type IapItem = {
  productId: string;
  title?: string;
  description?: string;
  price?: string;
  localizedPrice?: string;
  subscriptionOfferDetails?: Array<{
    offerToken?: string;
    pricingPhases?: {
      pricingPhaseList?: Array<{
        formattedPrice?: string;
      }>;
    };
  }>;
};

type CtxType = {
  isPremium: boolean;
  loading: boolean;
  purchasing: boolean;
  products: IapItem[];
  subscriptions: IapItem[];
  buyLifetime: (sku?: string) => Promise<void>;
  buyMonthlySubscription: (
    sku?: string,
    offerToken?: string,
  ) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
};

const SubscriptionContext = createContext<CtxType>({
  isPremium: false,
  loading: true,
  purchasing: false,
  products: [],
  subscriptions: [],
  buyLifetime: async () => {},
  buyMonthlySubscription: async () => {},
  restorePurchases: async () => false,
});

async function loadProducts(): Promise<IapItem[]> {
  try {
    const items = await (RNIap as any).getProducts({
      skus: PREMIUM_PRODUCT_IDS,
    });

    return Array.isArray(items) ? items : [];
  } catch (e) {
    console.log('[iap] getProducts error', e);
    return [];
  }
}

async function loadSubscriptions(): Promise<IapItem[]> {
  try {
    const items = await (RNIap as any).getSubscriptions({
      skus: PREMIUM_SUB_IDS,
    });

    return Array.isArray(items) ? items : [];
  } catch (e) {
    console.log('[iap] getSubscriptions error', e);
    return [];
  }
}

async function requestLifetimePurchase(sku: string) {
  if (Platform.OS === 'android') {
    return await (RNIap as any).requestPurchase({
      skus: [sku],
    });
  }

  return await (RNIap as any).requestPurchase({
    sku,
  });
}

async function requestMonthlySubscription(
  sku: string,
  offerToken?: string,
) {
  if (Platform.OS === 'android') {
    const payload: any = {sku};

    if (offerToken) {
      payload.subscriptionOffers = [
        {
          sku,
          offerToken,
        },
      ];
    }

    return await (RNIap as any).requestSubscription(payload);
  }

  return await (RNIap as any).requestSubscription({sku});
}

async function finishPurchaseSafe(purchase: any) {
  try {
    await (RNIap as any).finishTransaction({
      purchase,
      isConsumable: false,
    });
  } catch (e) {
    console.log('[iap] finishTransaction error', e);
  }
}

function isPremiumPurchase(productId?: string) {
  return (
    productId === PREMIUM_LIFETIME_PRODUCT_ID ||
    productId === PREMIUM_MONTHLY_SUB_ID
  );
}

function isPremiumPlusPurchase(productId?: string) {
  return (
    productId === PREMIUM_PLUS_LIFETIME_PRODUCT_ID ||
    productId === PREMIUM_PLUS_MONTHLY_SUB_ID
  );
}

async function applyPurchaseAccess(productId?: string) {
  if (isPremiumPlusPurchase(productId)) {
    await AsyncStorage.setItem(PREMIUM_STATE_KEY, '1');
    await markPremiumPlusActive();

    return {
      isPremium: true,
      isPlus: true,
    };
  }

  if (isPremiumPurchase(productId)) {
    await AsyncStorage.setItem(PREMIUM_STATE_KEY, '1');
    await markPremiumActive();

    return {
      isPremium: true,
      isPlus: false,
    };
  }

  return {
    isPremium: false,
    isPlus: false,
  };
}

async function clearPremiumAccess() {
  await AsyncStorage.removeItem(PREMIUM_STATE_KEY);
  await AsyncStorage.removeItem(OFFLINE_VIDEO_ACCESS_KEY);
  await AsyncStorage.setItem(PREMIUM_PLAN_KEY, 'none');
}

export const SubscriptionProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [realIsPremium, setRealIsPremium] = useState(false);
  const [loading, setLoading] = useState(
    PREMIUM_ENABLED && !FORCE_PREMIUM_IN_DEBUG,
  );
  const [purchasing, setPurchasing] = useState(false);
  const [products, setProducts] = useState<IapItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<IapItem[]>([]);

  /**
   * Debug: FORCE_PREMIUM_IN_DEBUG = true => luôn Premium.
   * Release 1.0: PREMIUM_ENABLED = false => luôn Free.
   * Bản cập nhật có IAP: PREMIUM_ENABLED = true => dùng giao dịch thật.
   */
  const isPremium = FORCE_PREMIUM_IN_DEBUG
    ? true
    : PREMIUM_ENABLED
      ? realIsPremium
      : false;

  useEffect(() => {
    /**
     * Bản 1.0 chưa bật Premium:
     * không kết nối StoreKit/Google Play Billing,
     * không tải sản phẩm và không restore giao dịch.
     */
    if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
      setRealIsPremium(false);
      setProducts([]);
      setSubscriptions([]);
      setPurchasing(false);
      setLoading(false);

      console.log('[iap] disabled for this build', {
        premiumEnabled: PREMIUM_ENABLED,
        forcePremiumInDebug: FORCE_PREMIUM_IN_DEBUG,
      });

      return;
    }

    let mounted = true;
    let purchaseUpdateSub: any;
    let purchaseErrorSub: any;
    let connectionInitialized = false;

    const init = async () => {
      try {
        const cached = await AsyncStorage.getItem(
          PREMIUM_STATE_KEY,
        );

        if (mounted && cached === '1') {
          setRealIsPremium(true);
        }

        await RNIap.initConnection();
        connectionInitialized = true;

        if (
          Platform.OS === 'android' &&
          typeof (RNIap as any)
            .flushFailedPurchasesCachedAsPendingAndroid ===
            'function'
        ) {
          try {
            await (RNIap as any)
              .flushFailedPurchasesCachedAsPendingAndroid();
          } catch (e) {
            console.log('[iap] flush pending error', e);
          }
        }

        const [loadedProducts, loadedSubs] =
          await Promise.all([
            loadProducts(),
            loadSubscriptions(),
          ]);

        console.log('[iap] loaded products =', loadedProducts);
        console.log('[iap] loaded subscriptions =', loadedSubs);

        if (mounted) {
          setProducts(loadedProducts);
          setSubscriptions(loadedSubs);
        }

        purchaseUpdateSub = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            try {
              console.log('[iap] purchase updated', purchase);

              const result = await applyPurchaseAccess(
                purchase?.productId,
              );

              if (result.isPremium && mounted) {
                setRealIsPremium(true);
              }

              await finishPurchaseSafe(purchase);
            } catch (e) {
              console.log(
                '[iap] purchaseUpdatedListener error',
                e,
              );
            } finally {
              if (mounted) {
                setPurchasing(false);
              }
            }
          },
        );

        purchaseErrorSub = RNIap.purchaseErrorListener(
          (error: any) => {
            console.log('[iap] purchase error listener', error);

            if (mounted) {
              setPurchasing(false);
            }
          },
        );

        await restoreOwnedPurchasesSilently(
          mounted,
          setRealIsPremium,
        );
      } catch (e) {
        console.log('[iap] init error', e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      purchaseUpdateSub?.remove?.();
      purchaseErrorSub?.remove?.();

      if (connectionInitialized) {
        RNIap.endConnection().catch(() => {});
      }
    };
  }, []);

  const buyLifetime = async (
    sku = PREMIUM_LIFETIME_PRODUCT_ID,
  ) => {
    if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
      console.log('[iap] buyLifetime ignored');
      return;
    }

    try {
      setPurchasing(true);
      await requestLifetimePurchase(sku);
    } catch (e) {
      setPurchasing(false);
      console.log('[iap] buyLifetime error', e);
      throw e;
    }
  };

  const buyMonthlySubscription = async (
    sku = PREMIUM_MONTHLY_SUB_ID,
    offerToken?: string,
  ) => {
    if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
      console.log('[iap] buyMonthlySubscription ignored');
      return;
    }

    try {
      setPurchasing(true);
      await requestMonthlySubscription(sku, offerToken);
    } catch (e) {
      setPurchasing(false);
      console.log('[iap] buyMonthlySubscription error', e);
      throw e;
    }
  };

  const restorePurchases = async (): Promise<boolean> => {
    if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
      console.log('[iap] restore ignored');
      return false;
    }

    return await restoreOwnedPurchasesSilently(
      true,
      setRealIsPremium,
      true,
    );
  };

  const value = useMemo<CtxType>(
    () => ({
      isPremium,
      loading,
      purchasing,
      products,
      subscriptions,
      buyLifetime,
      buyMonthlySubscription,
      restorePurchases,
    }),
    [
      isPremium,
      loading,
      purchasing,
      products,
      subscriptions,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

async function restoreOwnedPurchasesSilently(
  mounted: boolean,
  setIsPremium: (v: boolean) => void,
  _forceReturn = false,
): Promise<boolean> {
  if (!PREMIUM_ENABLED) {
    return false;
  }

  try {
    const purchases = await RNIap.getAvailablePurchases();

    console.log('[iap] restore purchases =', purchases);

    const plusPurchase = purchases.find((p: any) =>
      isPremiumPlusPurchase(p.productId),
    );

    if (plusPurchase) {
      await applyPurchaseAccess(plusPurchase.productId);

      if (mounted) {
        setIsPremium(true);
      }

      return true;
    }

    const premiumPurchase = purchases.find((p: any) =>
      isPremiumPurchase(p.productId),
    );

    if (premiumPurchase) {
      await applyPurchaseAccess(premiumPurchase.productId);

      if (mounted) {
        setIsPremium(true);
      }

      return true;
    }

    await clearPremiumAccess();

    if (mounted) {
      setIsPremium(false);
    }

    return false;
  } catch (e) {
    console.log('[iap] restore error', e);
    return false;
  }
}

export const useSubscription = () =>
  useContext(SubscriptionContext);