// src/ads/initAds.ts
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

export async function initAds() {
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForUnderAgeOfConsent: false,
    tagForChildDirectedTreatment: false,
    // để dễ debug trên thiết bị hiện tại:
    testDeviceIdentifiers: ['EMULATOR'],
  });
  await mobileAds().initialize();
}
