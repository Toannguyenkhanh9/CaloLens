// FILE: src/screens/PremiumScreen.tsx
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
  markPremiumActive,
  markPremiumPlusActive,
  type PremiumPlan,
} from '../services/premiumAccess';

export const PremiumScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    isPremium,
    loading,
    purchasing,
    products,
    subscriptions,
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
    reloadPlan();
  }, [reloadPlan]);

  useEffect(() => {
    if (isPremium) {
      markPremiumActive().then(reloadPlan).catch(() => {});
    }
  }, [isPremium, reloadPlan]);

  const findProduct = useCallback(
    (productId: string) => {
      return products.find((p: any) => p.productId === productId) || null;
    },
    [products],
  );

  const findSubscription = useCallback(
    (productId: string) => {
      return subscriptions.find((s: any) => s.productId === productId) || null;
    },
    [subscriptions],
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

  const getSubPrice = useCallback((sub: any) => {
    if (!sub) return '$--';

    if (sub.localizedPrice) return sub.localizedPrice;
    if (sub.price) return sub.price;

    const androidPhase =
      sub.subscriptionOfferDetails?.[0]?.pricingPhases
        ?.pricingPhaseList?.[0]?.formattedPrice;

    return androidPhase || '$--';
  }, []);

  const getProductPrice = useCallback((product: any) => {
    if (!product) return '$--';

    return product.localizedPrice || product.price || '$--';
  }, []);

  const getAndroidOfferToken = useCallback((sub: any) => {
    if (Platform.OS !== 'android') return undefined;

    return sub?.subscriptionOfferDetails?.[0]?.offerToken;
  }, []);

  const onBuyPremiumMonthly = async () => {
    try {
      if (!premiumMonthlySub?.productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.subUnavailable',
            'Monthly subscription not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      await buyMonthlySubscription(
        premiumMonthlySub.productId,
        getAndroidOfferToken(premiumMonthlySub),
      );

      await markPremiumActive();
      await reloadPlan();

      Alert.alert(
        t('premium.restoreTitle', 'Premium'),
        t('premium.restoreSuccess', 'Premium restored successfully.'),
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
      if (!premiumLifetimeProduct?.productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.productUnavailable',
            'Premium product not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      await buyLifetime(premiumLifetimeProduct.productId);

      await markPremiumActive();
      await reloadPlan();

      Alert.alert(
        t('premium.restoreTitle', 'Premium'),
        t('premium.restoreSuccess', 'Premium restored successfully.'),
      );
    } catch (e: any) {
      Alert.alert(
        t('premium.errorTitle', 'Purchase failed'),
        e?.message || t('premium.errorText', 'Unable to complete purchase.'),
      );
    }
  };

  const onBuyPlusMonthly = async () => {
    try {
      if (!plusMonthlySub?.productId) {
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
        plusMonthlySub.productId,
        getAndroidOfferToken(plusMonthlySub),
      );

      await markPremiumPlusActive();
      await reloadPlan();

      Alert.alert(
        t('premium.restoreTitle', 'Premium Plus'),
        t(
          'premium.plusSuccess',
          'Premium Plus is active. Offline video download unlocked.',
        ),
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
      if (!plusLifetimeProduct?.productId) {
        Alert.alert(
          t('premium.errorTitle', 'Purchase failed'),
          t(
            'premium.plusProductUnavailable',
            'Premium Plus product not found. Please check Play Console / App Store setup.',
          ),
        );
        return;
      }

      await buyLifetime(plusLifetimeProduct.productId);

      await markPremiumPlusActive();
      await reloadPlan();

      Alert.alert(
        t('premium.restoreTitle', 'Premium Plus'),
        t(
          'premium.plusSuccess',
          'Premium Plus is active. Offline video download unlocked.',
        ),
      );
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

      if (ok) {
        /**
         * Lưu ý:
         * Phần restore chính xác Premium hay Premium Plus nên xử lý trong SubscriptionProvider.
         * Ở đây chỉ reload lại key đã được Provider lưu.
         */
        await reloadPlan();
      }

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
        backgroundColor="#F5F8F2"
      />

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
            More AI scans, no ads and advanced nutrition tools.
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
              <ActivityIndicator color="#10230F" />
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

      <View style={[styles.planCard, styles.plusCard]}>
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
              <ActivityIndicator color="#10230F" />
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
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F2',
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
    borderColor: 'rgba(99, 201, 52, 0.26)',
    padding: 15,
    marginBottom: 14,
    shadowColor: '#879487',
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
    backgroundColor: 'rgba(99, 201, 52, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.30)',
    marginRight: 12,
  },
  heroIconText: {
    color: '#63C934',
    fontSize: 23,
    fontWeight: '900',
  },
  heroKicker: {
    color: '#18A39B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  title: {
    color: '#17211A',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 3,
  },
  heroSubtitle: {
    color: '#6D786F',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  text: {
    color: '#455047',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  activeBox: {
    backgroundColor: 'rgba(99, 201, 52, 0.10)',
    borderColor: 'rgba(99, 201, 52, 0.30)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  activeText: {
    color: '#4F9E2A',
    fontWeight: '900',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#DDE8D9',
    padding: 15,
    marginTop: 10,
    shadowColor: '#879487',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  plusCard: {
    backgroundColor: '#F7FBEF',
    borderColor: 'rgba(99, 201, 52, 0.30)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    color: '#17211A',
    fontSize: 21,
    fontWeight: '900',
  },
  plusName: {
    color: '#4F9E2A',
    fontSize: 22,
    fontWeight: '900',
  },
  planDesc: {
    color: '#6D786F',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  benefitList: {
    backgroundColor: '#F7FAF5',
    borderRadius: 15,
    padding: 12,
    marginTop: 3,
    marginBottom: 9,
  },
  currentPill: {
    backgroundColor: 'rgba(43, 130, 217, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(43, 130, 217, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  currentPillText: {
    color: '#2B82D9',
    fontSize: 11,
    fontWeight: '900',
  },
  plusPill: {
    backgroundColor: 'rgba(99, 201, 52, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.34)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  plusPillText: {
    color: '#4F9E2A',
    fontSize: 11,
    fontWeight: '900',
  },
  priceRow: {
    marginTop: 12,
  },
  priceValue: {
    color: '#17211A',
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 9,
  },
  button: {
    backgroundColor: '#63C934',
    paddingVertical: 13,
    borderRadius: 999,
  },
  buttonSecondary: {
    backgroundColor: '#F0F5ED',
    borderWidth: 1,
    borderColor: '#DDE8D9',
    paddingVertical: 13,
    borderRadius: 999,
  },
  plusButton: {
    backgroundColor: '#63C934',
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
    color: '#10230F',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  buttonSecondaryText: {
    color: '#17211A',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 15,
  },
  plusButtonText: {
    color: '#10230F',
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
    borderColor: '#C9D6C6',
    backgroundColor: '#FFFFFF',
  },
  restoreText: {
    color: '#455047',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 14,
  },
});

export default PremiumScreen;
