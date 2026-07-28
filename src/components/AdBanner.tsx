// src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { BANNER_UNIT } from '../ads/adConfig';
import { canShowBanner } from '../ads/adGate';
import { useSubscription } from '../iap/SubscriptionProvider';

const unitId = __DEV__ ? TestIds.BANNER : BANNER_UNIT;

export const AdBanner: React.FC = () => {
  const { isPremium } = (useSubscription?.() as { isPremium: boolean }) ?? {
    isPremium: false,
  };

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const ok = await canShowBanner(isPremium);
        if (mounted) setVisible(ok);
      } catch {
        if (mounted) setVisible(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isPremium]);

  if (!visible) return null;

  return (
    <View style={{ alignItems: 'center', minHeight: 60 }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => console.log('Banner loaded')}
        onAdFailedToLoad={(e) => {
          console.log('Banner failed', e);
          setVisible(false);
        }}
      />
    </View>
  );
};

export default AdBanner;