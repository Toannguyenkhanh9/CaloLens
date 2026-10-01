// FILE: src/screens/PremiumScreen.tsx
import FoodAccentCard from '../components/FoodAccentCard';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { useSubscription } from '../iap/SubscriptionProvider';
import {
  PREMIUM_LIFETIME_PRODUCT_ID,
  PREMIUM_MONTHLY_SUB_ID,
  PREMIUM_PLUS_LIFETIME_PRODUCT_ID,
  PREMIUM_PLUS_MONTHLY_SUB_ID,
} from '../iap/iapConfig';

import {
  loadPremiumPlan,
  type PremiumPlan,
} from '../services/premiumAccess';

export const PremiumScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
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
  } = useSubscription();

  const [activePlan, setActivePlan] = useState<PremiumPlan>('none');

  const reloadPlan = useCallback(async () => {
    const plan = await loadPremiumPlan();
    setActivePlan(plan);
  }, []);

  useEffect(() => {
    void reloadPlan();
  }, [reloadPlan]);

  // SubscriptionProvider is the source of truth for purchase entitlement.
  // Reload local UI state after the provider changes/finishes validation,
  // but never write Premium access from this screen.
  useEffect(() => {
    if (!loading) {
      void reloadPlan();
    }
  }, [isPremium, loading, reloadPlan]);

  const getItemId = useCallback((item: any) => {
    return (
      item?.productId ||
      item?.id ||
      item?.sku ||
      item?.productIdentifier ||
      item?.productIds?.[0] ||
      ''
    );
  }, []);

  const findProduct = useCallback(
    (productId: string) => {
      return (
        products.find(
          (product: any) => getItemId(product) === productId,
        ) || null
      );
    },
    [getItemId, products],
  );

  const findSubscription = useCallback(
    (productId: string) => {
      return (
        subscriptions.find(
          (subscription: any) =>
            getItemId(subscription) === productId,
        ) || null
      );
    },
    [getItemId, subscriptions],
  );

  const premiumLifetimeProduct = useMemo(() => {
    return findProduct(PREMIUM_LIFETIME_PRODUCT_ID);
  }, [findProduct]);

  const plusLifetimeProduct = useMemo(() => {
    return findProduct(PREMIUM_PLUS_LIFETIME_PRODUCT_ID);
  }, [findProduct]);

  const premiumMonthlySub = useMemo(() => {
    return findSubscription(PREMIUM_MONTHLY_SUB_ID);
  }, [findSubscription]);

  const plusMonthlySub = useMemo(() => {
    return findSubscription(PREMIUM_PLUS_MONTHLY_SUB_ID);
  }, [findSubscription]);

  const findFormattedPrice = useCallback(
    (value: any, depth = 0): string => {
      if (!value || depth > 6) return '';

      if (Array.isArray(value)) {
        for (const item of value) {
          const found = findFormattedPrice(item, depth + 1);
          if (found) return found;
        }
        return '';
      }

      if (typeof value !== 'object') return '';

      const preferredKeys = [
        'displayPrice',
        'localizedPrice',
        'formattedPrice',
        'formattedPriceAmount',
      ];

      for (const key of preferredKeys) {
        const candidate = value?.[key];
        if (
          typeof candidate === 'string' &&
          candidate.trim().length > 0
        ) {
          return candidate.trim();
        }
      }

      const nestedKeys = [
        'oneTimePurchaseOfferDetailsAndroid',
        'oneTimePurchaseOfferDetails',
        'purchaseOptions',
        'purchaseOption',
        'offers',
        'offerDetails',
        'pricingPhases',
        'pricingPhaseList',
      ];

      for (const key of nestedKeys) {
        const found = findFormattedPrice(
          value?.[key],
          depth + 1,
        );
        if (found) return found;
      }

      return '';
    },
    [],
  );

  const getAndroidSubscriptionOffer = useCallback(
    (subscription: any) => {
      return (
        subscription?.subscriptionOfferDetailsAndroid?.[0] ||
        subscription?.subscriptionOfferDetails?.[0] ||
        null
      );
    },
    [],
  );

  const getSubPrice = useCallback(
    (sub: any) => {
      if (!sub) return '$--';

      const recursivePrice = findFormattedPrice(sub);
      if (recursivePrice) return recursivePrice;

      if (typeof sub.price === 'string' && sub.price.trim()) {
        return sub.price;
      }

      return '$--';
    },
    [findFormattedPrice],
  );

  const getProductPrice = useCallback(
    (product: any) => {
      if (!product) return '$--';

      const recursivePrice = findFormattedPrice(product);
      if (recursivePrice) return recursivePrice;

      if (typeof product.price === 'string' && product.price.trim()) {
        return product.price;
      }

      if (typeof product.price === 'number') {
        return String(product.price);
      }

      return '$--';
    },
    [findFormattedPrice],
  );

  const getAndroidOfferToken = useCallback(
    (sub: any) => {
      if (Platform.OS !== 'android') return undefined;

      return getAndroidSubscriptionOffer(sub)?.offerToken;
    },
    [getAndroidSubscriptionOffer],
  );

  useEffect(() => {
    if (
      connected &&
      !loading &&
      !premiumLifetimeProduct
    ) {
      console.log('[premium] lifetime product missing', {
        expected: PREMIUM_LIFETIME_PRODUCT_ID,
        products: products.map(getItemId),
        subscriptions: subscriptions.map(getItemId),
        iapError,
      });
    }
  }, [
    connected,
    getItemId,
    iapError,
    loading,
    premiumLifetimeProduct,
    products,
    subscriptions,
  ]);

  const onBuyPremiumMonthly = async () => {
    try {
      const productId = getItemId(premiumMonthlySub);

      if (!productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.subUnavailable',
            'Monthly subscription not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      // Do not activate Premium here. A cancelled billing sheet can return
      // control to JS without a successful purchase. SubscriptionProvider's
      // onPurchaseSuccess callback is the only place that grants access.
      await buyMonthlySubscription(
        productId,
        getAndroidOfferToken(premiumMonthlySub),
      );
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const onBuyPremiumLifetime = async () => {
    try {
      const productId = getItemId(premiumLifetimeProduct);

      if (!productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.productUnavailable',
            'Premium product not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      // Lifetime access is granted only by SubscriptionProvider after
      // Google Play / App Store reports a successful purchase.
      await buyLifetime(productId);
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const onBuyPlusMonthly = async () => {
    try {
      const productId = getItemId(plusMonthlySub);

      if (!productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.plusSubUnavailable',
            'Premium Plus subscription not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      await buyMonthlySubscription(
        productId,
        getAndroidOfferToken(plusMonthlySub),
      );
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const onBuyPlusLifetime = async () => {
    try {
      const productId = getItemId(plusLifetimeProduct);

      if (!productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.plusProductUnavailable',
            'Premium Plus product not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      await buyLifetime(productId);
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const onRestore = async () => {
    try {
      const ok = await restorePurchases();

      await reloadPlan();

      Alert.alert(
        t('premium.restoreTitle', 'Restore purchases'),
        ok
          ? t('premium.restoreSuccess', 'Premium restored successfully.')
          : t('premium.restoreEmpty', 'No Premium purchase found.'),
      );
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const isPremiumOnlyActive = activePlan === 'premium';
  const isPlusActive = activePlan === 'premium_plus';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF8F2"
      />

      <HeroFoodCornerAccent />

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>✦</Text>
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.heroKicker}>
            CALOLENS MEMBERSHIP
          </Text>
          <Text style={styles.title}>
        {t('premium.title', 'Upgrade Premium')}
          </Text>

          <Text style={styles.heroSubtitle}>
            No rewarded ads and advanced nutrition tools.
          </Text>
        </View>
      </View>

      {activePlan !== 'none' ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeText}>
            {isPlusActive
              ? t('premium.plusActive', 'Premium Plus is active')
              : t('premium.active', 'Premium is active')}
          </Text>
        </View>
      ) : null}

      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>
              {t('premium.premiumTitle', 'Premium')}
            </Text>

            <Text style={styles.planDesc}>
              {t(
                'premium.premiumDesc',
                'Best for removing ads and unlocking the main experience.',
              )}
            </Text>
          </View>

          {isPremiumOnlyActive ? (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>
                {t('premium.currentPlan', 'Current')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.benefitList}>
          <Text style={styles.text}>
            • {t('premium.removeAds', 'Remove ads')}
          </Text>

          <Text style={styles.text}>
            • {t('premium.allPrograms', 'Unlock the full experience')}
          </Text>

          <Text style={styles.text}>
            • {t(
              'premium.advancedMealPlan',
              'Advanced meal plans and nutrition tools',
            )}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>
            {loading
              ? t('premium.loading', 'Loading...')
              : getSubPrice(premiumMonthlySub)}
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || purchasing || isPremiumOnlyActive || isPlusActive) &&
                styles.buttonDisabled,
            ]}
            onPress={onBuyPremiumMonthly}
            disabled={
              loading || purchasing || isPremiumOnlyActive || isPlusActive
            }
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {t('premium.subscribeMonthly', 'Subscribe monthly')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>
            {loading
              ? t('premium.loading', 'Loading...')
              : getProductPrice(premiumLifetimeProduct)}
          </Text>

          {!loading && !premiumLifetimeProduct ? (
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => void reloadProducts()}
              style={styles.retryPriceButton}
            >
              <Text style={styles.retryPriceText}>
                {t('premium.retryPrices', 'Reload store price')}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.buttonSecondary,
              (loading || purchasing || isPremiumOnlyActive || isPlusActive) &&
                styles.buttonDisabled,
            ]}
            onPress={onBuyPremiumLifetime}
            disabled={
              loading || purchasing || isPremiumOnlyActive || isPlusActive
            }
            activeOpacity={0.85}
          >
            <Text style={styles.buttonSecondaryText}>
              {t('premium.buyLifetime', 'Buy lifetime')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <View style={[styles.planCard, styles.plusCard]}>
        <View style={styles.planHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.plusName}>
              {t('premium.plusTitle', 'Premium Plus')}
            </Text>

            <Text style={styles.planDesc}>
              {t(
                'premium.plusDesc',
                'Includes Premium and unlocks offline workout video downloads.',
              )}
            </Text>
          </View>

          {isPlusActive ? (
            <View style={styles.plusPill}>
              <Text style={styles.plusPillText}>
                {t('premium.currentPlan', 'Current')}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.benefitList}>
          <Text style={styles.text}>
            • {t('premium.everythingInPremium', 'Everything in Premium')}
          </Text>

          <Text style={styles.text}>
            • {t(
              'premium.downloadOfflineVideos',
              'Download workout videos and watch offline',
            )}
          </Text>

          <Text style={styles.text}>
            • {t(
              'premium.offlineRepeatBenefit',
              'Download once and use it for repeated workout days',
            )}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>
            {loading
              ? t('premium.loading', 'Loading...')
              : getSubPrice(plusMonthlySub)}
          </Text>

          <TouchableOpacity
            style={[
              styles.plusButton,
              (loading || purchasing || isPlusActive) && styles.buttonDisabled,
            ]}
            onPress={onBuyPlusMonthly}
            disabled={loading || purchasing || isPlusActive}
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.plusButtonText}>
                {t('premium.subscribePlusMonthly', 'Subscribe Plus')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceValue}>
            {loading
              ? t('premium.loading', 'Loading...')
              : getProductPrice(plusLifetimeProduct)}
          </Text>

          <TouchableOpacity
            style={[
              styles.plusButtonSecondary,
              (loading || purchasing || isPlusActive) && styles.buttonDisabled,
            ]}
            onPress={onBuyPlusLifetime}
            disabled={loading || purchasing || isPlusActive}
            activeOpacity={0.85}
          >
            <Text style={styles.plusButtonSecondaryText}>
              {t('premium.buyPlusLifetime', 'Buy Plus lifetime')}
            </Text>
          </TouchableOpacity>
        </View>
      </View> */}

      <TouchableOpacity
        style={[
          styles.restoreButton,
          (loading || purchasing) && styles.buttonDisabled,
        ]}
        onPress={onRestore}
        disabled={loading || purchasing}
        activeOpacity={0.85}
      >
        <Text style={styles.restoreText}>
          {t('premium.restore', 'Restore purchases')}
        </Text>
      </TouchableOpacity>

      <FoodAccentCard variant="hero" height={170} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 170,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 33, 0.26)',
    padding: 15,
    marginBottom: 14,
    shadowColor: '#C28A66',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 106, 33, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 33, 0.30)',
    marginRight: 12,
  },
  heroIconText: {
    color: '#FF6A21',
    fontSize: 23,
    fontWeight: '900',
  },
  heroKicker: {
    color: '#F29132',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  title: {
    color: '#21170F',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 3,
  },
  heroSubtitle: {
    color: '#78695F',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  text: {
    color: '#5F544D',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  activeBox: {
    backgroundColor: 'rgba(255, 106, 33, 0.10)',
    borderColor: 'rgba(255, 106, 33, 0.30)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  activeText: {
    color: '#E85A18',
    fontWeight: '900',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1D9C8',
    padding: 15,
    marginTop: 10,
    shadowColor: '#C28A66',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  plusCard: {
    backgroundColor: '#FFF6EC',
    borderColor: 'rgba(255, 106, 33, 0.30)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    color: '#21170F',
    fontSize: 21,
    fontWeight: '900',
  },
  plusName: {
    color: '#E85A18',
    fontSize: 22,
    fontWeight: '900',
  },
  planDesc: {
    color: '#78695F',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  benefitList: {
    backgroundColor: '#FFFBF7',
    borderRadius: 15,
    padding: 12,
    marginTop: 3,
    marginBottom: 9,
  },
  currentPill: {
    backgroundColor: 'rgba(255, 147, 80, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 147, 80, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentPillText: {
    color: '#FF9350',
    fontSize: 11,
    fontWeight: '900',
  },
  plusPill: {
    backgroundColor: 'rgba(255, 106, 33, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 33, 0.34)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  plusPillText: {
    color: '#E85A18',
    fontSize: 11,
    fontWeight: '900',
  },
  priceRow: {
    marginTop: 12,
  },
  priceValue: {
    color: '#21170F',
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 9,
  },
  retryPriceButton: {
    alignSelf: 'flex-start',
    marginBottom: 9,
    paddingVertical: 2,
  },
  retryPriceText: {
    color: '#F29132',
    fontSize: 11,
    fontWeight: '900',
  },
  button: {
    backgroundColor: '#FF6A21',
    paddingVertical: 13,
    borderRadius: 999,
  },
  buttonSecondary: {
    backgroundColor: '#FFF2E8',
    borderWidth: 1,
    borderColor: '#F1D9C8',
    paddingVertical: 13,
    borderRadius: 999,
  },
  plusButton: {
    backgroundColor: '#FF6A21',
    paddingVertical: 13,
    borderRadius: 999,
  },
  plusButtonSecondary: {
    backgroundColor: '#FFF0B8',
    borderWidth: 1,
    borderColor: '#F0DBA2',
    paddingVertical: 13,
    borderRadius: 999,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  buttonSecondaryText: {
    color: '#21170F',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  plusButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  plusButtonSecondaryText: {
    color: '#6E5500',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  restoreButton: {
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E8CFBC',
    backgroundColor: '#FFFFFF',
  },
  restoreText: {
    color: '#5F544D',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default PremiumScreen;
