// FILE: App.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import './src/i18n';

import {NavigationContainer} from '@react-navigation/native';
import {
  flushPendingNotification,
  navigationRef,
} from './src/navigation/navigationRef';
import {
  handleInitialNotification,
  registerForegroundNotificationPress,
} from './src/notifications/notificationPress';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mobileAds from 'react-native-google-mobile-ads';

import {SubscriptionProvider} from './src/iap/SubscriptionProvider';
import {AppNavigator} from './src/AppNavigator';
import OnboardingProfileScreen from './src/screens/OnboardingProfileScreen';
import {preloadRewarded} from './src/ads/rewarded';
import {ToastProvider} from './src/ui/Toast';
import {initNotifications} from './src/notifications/reminder';

const ONBOARD_DONE = 'gymforge:onboarding:done';

const BG = '#06111D';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';

export default function App() {
  const [ready, setReady] = useState(false);
  const [needsOnboard, setNeedsOnboard] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        try {
          await mobileAds().initialize();
          preloadRewarded();
        } catch (error) {
          console.log('[app] mobile ads init error', error);
        }

        try {
          await initNotifications();
        } catch (error) {
          console.log('[app] notifications init error', error);
        }

        const onboardDone = await AsyncStorage.getItem(ONBOARD_DONE);

        if (mounted) {
          setNeedsOnboard(onboardDone !== '1');
        }
      } catch (error) {
        console.log('[app] bootstrap error', error);

        if (mounted) {
          setNeedsOnboard(true);
        }
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe =
      registerForegroundNotificationPress();

    handleInitialNotification();

    return unsubscribe;
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARD_DONE, '1');
    } catch (error) {
      console.log('[app] save onboarding error', error);
    } finally {
      setNeedsOnboard(false);
    }
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={BG} />

        <View style={styles.loadingContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>CL</Text>
          </View>

          <Text style={styles.appName}>CaloLens</Text>

          <ActivityIndicator
            color={NEON}
            size="large"
            style={styles.spinner}
          />

          <Text style={styles.loadingText}>
            Preparing your training plan...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <ToastProvider>
        <SubscriptionProvider>
          <NavigationContainer
            ref={navigationRef}
            onReady={flushPendingNotification}
          >
            {needsOnboard ? (
              <OnboardingProfileScreen onDone={completeOnboarding} />
            ) : (
              <AppNavigator />
            )}
          </NavigationContainer>
        </SubscriptionProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: 'rgba(124, 255, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: NEON,
    fontSize: 30,
    fontWeight: '900',
  },
  appName: {
    color: TEXT,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
  },
  spinner: {
    marginTop: 24,
  },
  loadingText: {
    color: MUTED,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
