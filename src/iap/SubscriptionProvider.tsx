// FILE: src/iap/SubscriptionProvider.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIAP} from 'react-native-iap';

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

export type IapItem = {
  id?: string;
  sku?: string;
  productId?: string;
  productIds?: string[];
  productIdentifier?: string;
  title?: string;
  description?: string;
  price?: string | number;
  localizedPrice?: string;
  displayPrice?: string;
  oneTimePurchaseOfferDetails?: {
    formattedPrice?: string;
  };
  oneTimePurchaseOfferDetailsAndroid?: {
    formattedPrice?: string;
  };
  subscriptionOfferDetails?: Array<{
    offerToken?: string;
    pricingPhases?: {
      pricingPhaseList?: Array<{
        formattedPrice?: string;
      }>;
    };
  }>;
  subscriptionOfferDetailsAndroid?: Array<{
    offerToken?: string;
    pricingPhases?: {
      pricingPhaseList?: Array<{
        formattedPrice?: string;
      }>;
    };
  }>;
};

type SubscriptionContextValue = {
  isPremium: boolean;
  connected: boolean;
  loading: boolean;
  purchasing: boolean;
  iapError: string | null;
  products: IapItem[];
  subscriptions: IapItem[];
  reloadProducts: () => Promise<void>;
  buyLifetime: (sku?: string) => Promise<void>;
  buyMonthlySubscription: (
    sku?: string,
    offerToken?: string,
  ) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
};

const SubscriptionContext =
  createContext<SubscriptionContextValue>({
    isPremium: false,
    connected: false,
    loading: true,
    purchasing: false,
    iapError: null,
    products: [],
    subscriptions: [],
    reloadProducts: async () => {},
    buyLifetime: async () => {},
    buyMonthlySubscription: async () => {},
    restorePurchases: async () => false,
  });

const normalizeItems = (
  value: unknown,
): IapItem[] => {
  if (Array.isArray(value)) {
    return value as IapItem[];
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const payload =
      value as {
        products?: unknown;
        subscriptions?: unknown;
        items?: unknown;
        data?: unknown;
      };

    const nested = [
      payload.products,
      payload.subscriptions,
      payload.items,
      payload.data,
    ];

    for (
      const candidate of nested
    ) {
      if (
        Array.isArray(
          candidate,
        )
      ) {
        return candidate as IapItem[];
      }
    }
  }

  return [];
};

export const getIapProductId = (
  item?: IapItem | null,
) =>
  item?.productId ||
  item?.id ||
  item?.sku ||
  item?.productIdentifier ||
  item?.productIds?.[0] ||
  '';

const isPremiumPurchase = (productId?: string) =>
  productId === PREMIUM_LIFETIME_PRODUCT_ID ||
  productId === PREMIUM_MONTHLY_SUB_ID;

const isPremiumPlusPurchase = (productId?: string) =>
  productId === PREMIUM_PLUS_LIFETIME_PRODUCT_ID ||
  productId === PREMIUM_PLUS_MONTHLY_SUB_ID;

async function applyPurchaseAccess(productId?: string) {
  if (isPremiumPlusPurchase(productId)) {
    await AsyncStorage.setItem(PREMIUM_STATE_KEY, '1');
    await markPremiumPlusActive();
    return true;
  }

  if (isPremiumPurchase(productId)) {
    await AsyncStorage.setItem(PREMIUM_STATE_KEY, '1');
    await markPremiumActive();
    return true;
  }

  return false;
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
  const [subscriptions, setSubscriptions] =
    useState<IapItem[]>([]);
  const [iapError, setIapError] =
    useState<string | null>(null);

  const mountedRef = useRef(true);
  const loadingCatalogRef = useRef(false);
  const catalogRef = useRef<IapItem[]>([]);
  const catalogFinishTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
  const availablePurchasesRef = useRef<IapItem[]>([]);
  const finishTransactionRef = useRef<any>(null);

  const iap =
    useIAP({
    onPurchaseSuccess: async purchase => {
      try {
        console.log('[iap15] purchase success', purchase);

        const productId = getIapProductId(purchase as any);
        const activated = await applyPurchaseAccess(productId);

        if (activated && mountedRef.current) {
          setRealIsPremium(true);
        }

        if (typeof finishTransactionRef.current === 'function') {
          await finishTransactionRef.current({
            purchase,
            isConsumable: false,
          });
        }
      } catch (error) {
        console.log('[iap15] purchase handler error', error);

        if (mountedRef.current) {
          setIapError(
            error instanceof Error
              ? error.message
              : String(error),
          );
        }
      } finally {
        if (mountedRef.current) {
          setPurchasing(false);
        }
      }
    },

    onPurchaseError: error => {
      console.log('[iap15] purchase error', error);

      if (mountedRef.current) {
        setPurchasing(false);
        setIapError(error?.message || String(error));
      }
    },
  });

  const connected =
    Boolean(
      (iap as any)
        .connected,
    );

  const hookProducts =
    (iap as any)
      .products;

  const hookSubscriptions =
    (iap as any)
      .subscriptions;

  const availablePurchases =
    (iap as any)
      .availablePurchases;

  const fetchProducts =
    (iap as any)
      .fetchProducts;

  const requestPurchase =
    (iap as any)
      .requestPurchase;

  const finishTransaction =
    (iap as any)
      .finishTransaction;

  const getAvailablePurchases =
    (iap as any)
      .getAvailablePurchases;

  useEffect(() => {
    finishTransactionRef.current = finishTransaction;
  }, [finishTransaction]);

  const mergeCatalog =
    useCallback(
      (
        incoming:
          IapItem[],
      ) => {
        if (!incoming.length) {
          return;
        }

        const merged =
          new Map<
            string,
            IapItem
          >();

        catalogRef.current
          .forEach(item => {
            const productId =
              getIapProductId(
                item,
              );

            if (productId) {
              merged.set(
                productId,
                item,
              );
            }
          });

        incoming.forEach(item => {
          const productId =
            getIapProductId(
              item,
            );

          if (productId) {
            merged.set(
              productId,
              item,
            );
          }
        });

        const catalog =
          Array.from(
            merged.values(),
          );

        catalogRef.current =
          catalog;

        const productIds =
          new Set<string>(
            PREMIUM_PRODUCT_IDS,
          );

        const subscriptionIds =
          new Set<string>(
            PREMIUM_SUB_IDS,
          );

        const nextProducts =
          catalog.filter(item =>
            productIds.has(
              getIapProductId(
                item,
              ),
            ),
          );

        const nextSubscriptions =
          catalog.filter(item =>
            subscriptionIds.has(
              getIapProductId(
                item,
              ),
            ),
          );

        console.log(
          '[iap15] merged catalog',
          catalog,
        );

        console.log(
          '[iap15] one-time products',
          nextProducts,
        );

        console.log(
          '[iap15] subscriptions',
          nextSubscriptions,
        );

        if (
          mountedRef.current
        ) {
          setProducts(
            nextProducts,
          );

          setSubscriptions(
            nextSubscriptions,
          );

          if (
            nextProducts.length ||
            nextSubscriptions.length
          ) {
            setIapError(
              null,
            );
          }
        }
      },
      [],
    );

  useEffect(() => {
    const current =
      normalizeItems(
        hookProducts,
      );

    console.log(
      '[iap15] hook products update',
      current,
    );

    mergeCatalog(
      current,
    );
  }, [
    hookProducts,
    mergeCatalog,
  ]);

  useEffect(() => {
    const current =
      normalizeItems(
        hookSubscriptions,
      );

    console.log(
      '[iap15] hook subscriptions update',
      current,
    );

    mergeCatalog(
      current,
    );
  }, [
    hookSubscriptions,
    mergeCatalog,
  ]);

  useEffect(() => {
    availablePurchasesRef.current =
      normalizeItems(availablePurchases);
  }, [availablePurchases]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (
        catalogFinishTimerRef
          .current
      ) {
        clearTimeout(
          catalogFinishTimerRef
            .current,
        );

        catalogFinishTimerRef
          .current = null;
      }
    };
  }, []);

  const isPremium = FORCE_PREMIUM_IN_DEBUG
    ? true
    : PREMIUM_ENABLED
      ? realIsPremium
      : false;

  const applyRestoredPurchases = useCallback(
    async (purchases: IapItem[]) => {
      console.log(
        '[iap15] available purchases',
        purchases,
      );

      const plusPurchase =
        purchases.find(purchase =>
          isPremiumPlusPurchase(
            getIapProductId(purchase),
          ),
        );

      if (plusPurchase) {
        await applyPurchaseAccess(
          getIapProductId(plusPurchase),
        );

        if (mountedRef.current) {
          setRealIsPremium(true);
        }

        return true;
      }

      const premiumPurchase =
        purchases.find(purchase =>
          isPremiumPurchase(
            getIapProductId(purchase),
          ),
        );

      if (premiumPurchase) {
        await applyPurchaseAccess(
          getIapProductId(premiumPurchase),
        );

        if (mountedRef.current) {
          setRealIsPremium(true);
        }

        return true;
      }

      await clearPremiumAccess();

      if (mountedRef.current) {
        setRealIsPremium(false);
      }

      return false;
    },
    [],
  );

  const restorePurchases =
    useCallback(
      async () => {
        if (
          !PREMIUM_ENABLED ||
          FORCE_PREMIUM_IN_DEBUG
        ) {
          return false;
        }

        try {
          const getPurchases =
            getAvailablePurchases as unknown as
              () => Promise<unknown>;

          const result =
            await getPurchases();

          const returnedPurchases =
            normalizeItems(
              result,
            );

          const purchases =
            returnedPurchases.length
              ? returnedPurchases
              : availablePurchasesRef
                  .current;

          return await applyRestoredPurchases(
            purchases,
          );
        } catch (error) {
          console.log(
            '[iap15] restore error',
            error,
          );

          if (
            mountedRef.current
          ) {
            setIapError(
              error instanceof Error
                ? error.message
                : String(error),
            );
          }

          return false;
        }
      },
      [
        applyRestoredPurchases,
        getAvailablePurchases,
      ],
    );



  const reloadProducts =
    useCallback(
      async () => {
        if (
          !PREMIUM_ENABLED ||
          FORCE_PREMIUM_IN_DEBUG
        ) {
          catalogRef.current = [];
          setProducts([]);
          setSubscriptions([]);
          setLoading(false);
          return;
        }

        if (
          !connected ||
          loadingCatalogRef.current ||
          typeof fetchProducts !== 'function'
        ) {
          return;
        }

        loadingCatalogRef.current = true;
        catalogRef.current = [];
        setProducts([]);
        setSubscriptions([]);
        setLoading(true);
        setIapError(null);

        const wait = (milliseconds: number) =>
          new Promise<void>(resolve => {
            setTimeout(resolve, milliseconds);
          });

        const mergeCurrentHookState = () => {
          mergeCatalog(normalizeItems(hookProducts));
          mergeCatalog(normalizeItems(hookSubscriptions));
        };

        const fetchCatalog = fetchProducts as (
          request: {
            skus: string[];
            type: 'in-app' | 'subs';
          },
        ) => Promise<unknown>;

        const errors: string[] = [];

        const fetchGroup = async (
          skus: string[],
          type: 'in-app' | 'subs',
          label: string,
        ) => {
          if (!skus.length) return;

          try {
            console.log(`[iap15] loading ${label}`, skus);

            const result = await fetchCatalog({
              skus,
              type,
            });

            mergeCatalog(normalizeItems(result));
            await wait(400);
            mergeCurrentHookState();
          } catch (batchError) {
            const batchMessage =
              batchError instanceof Error
                ? batchError.message
                : String(batchError);

            console.log(
              `[iap15] ${label} batch fetch failed`,
              batchError,
            );

            errors.push(`${label}: ${batchMessage}`);

            // Một SKU sai/không tồn tại không được phép chặn các SKU còn lại.
            for (const sku of skus) {
              try {
                console.log(
                  `[iap15] retry ${label} sku`,
                  sku,
                );

                const singleResult = await fetchCatalog({
                  skus: [sku],
                  type,
                });

                mergeCatalog(normalizeItems(singleResult));
                await wait(300);
                mergeCurrentHookState();
              } catch (singleError) {
                console.log(
                  `[iap15] ${label} sku failed`,
                  sku,
                  singleError,
                );
              }
            }
          }
        };

        try {
          console.log(
            '[iap15] expected subscription ids',
            PREMIUM_SUB_IDS,
          );
          console.log(
            '[iap15] expected product ids',
            PREMIUM_PRODUCT_IDS,
          );

          // Tải độc lập: subscription lỗi không được chặn lifetime product.
          await fetchGroup(
            PREMIUM_SUB_IDS,
            'subs',
            'subscriptions',
          );

          await fetchGroup(
            PREMIUM_PRODUCT_IDS,
            'in-app',
            'one-time products',
          );

          await wait(550);
          mergeCurrentHookState();

          const receivedIds = catalogRef.current
            .map(item => getIapProductId(item))
            .filter(Boolean);

          console.log(
            '[iap15] final catalog ids',
            receivedIds,
          );
          console.log(
            '[iap15] final catalog',
            catalogRef.current,
          );

          if (
            !receivedIds.includes(
              PREMIUM_LIFETIME_PRODUCT_ID,
            )
          ) {
            console.warn(
              '[iap15] lifetime product not returned by store',
              {
                expected: PREMIUM_LIFETIME_PRODUCT_ID,
                received: receivedIds,
              },
            );
          }

          if (
            mountedRef.current &&
            receivedIds.length === 0 &&
            errors.length
          ) {
            setIapError(errors.join(' | '));
          }
        } finally {
          loadingCatalogRef.current = false;

          if (mountedRef.current) {
            setLoading(false);
          }

          void restorePurchases();
        }
      },
      [
        connected,
        fetchProducts,
        hookProducts,
        hookSubscriptions,
        mergeCatalog,
        restorePurchases,
      ],
    );


  useEffect(() => {
    if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
      setLoading(false);
      return;
    }

    AsyncStorage.getItem(PREMIUM_STATE_KEY)
      .then(value => {
        if (value === '1' && mountedRef.current) {
          setRealIsPremium(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (
      connected &&
      PREMIUM_ENABLED &&
      !FORCE_PREMIUM_IN_DEBUG
    ) {
      void reloadProducts();
    }
  }, [connected, reloadProducts]);

  useEffect(() => {
    if (
      !PREMIUM_ENABLED ||
      FORCE_PREMIUM_IN_DEBUG
    ) {
      return;
    }

    const current =
      normalizeItems(
        availablePurchases,
      );

    availablePurchasesRef
      .current =
      current;

    if (
      current.length
    ) {
      void applyRestoredPurchases(
        current,
      );
    }
  }, [
    applyRestoredPurchases,
    availablePurchases,
  ]);

  const buyLifetime = useCallback(
    async (sku = PREMIUM_LIFETIME_PRODUCT_ID) => {
      if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
        return;
      }

      if (!connected) {
        throw new Error('Store connection is not ready.');
      }

      try {
        setPurchasing(true);
        setIapError(null);

        await requestPurchase({
          request: {
            apple: {sku},
            google: {skus: [sku]},
          },
          type: 'in-app',
        });
      } catch (error) {
        setPurchasing(false);
        throw error;
      }
    },
    [connected, requestPurchase],
  );

  const buyMonthlySubscription = useCallback(
    async (
      sku = PREMIUM_MONTHLY_SUB_ID,
      offerToken?: string,
    ) => {
      if (!PREMIUM_ENABLED || FORCE_PREMIUM_IN_DEBUG) {
        return;
      }

      if (!connected) {
        throw new Error('Store connection is not ready.');
      }

      try {
        setPurchasing(true);
        setIapError(null);

        await requestPurchase({
          request: {
            apple: {sku},
            google: {
              skus: [sku],
              ...(offerToken
                ? {
                    subscriptionOffers: [
                      {
                        sku,
                        offerToken,
                      },
                    ],
                  }
                : {}),
            },
          },
          type: 'subs',
        });
      } catch (error) {
        setPurchasing(false);
        throw error;
      }
    },
    [connected, requestPurchase],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      isPremium,
      connected: Boolean(connected),
      loading,
      purchasing,
      iapError,
      products,
      subscriptions,
      reloadProducts,
      buyLifetime,
      buyMonthlySubscription,
      restorePurchases,
    }),
    [
      isPremium,
      connected,
      loading,
      purchasing,
      iapError,
      products,
      subscriptions,
      reloadProducts,
      buyLifetime,
      buyMonthlySubscription,
      restorePurchases,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () =>
  useContext(SubscriptionContext);
