// FILE: src/ads/adConfig.ts
import {Platform} from 'react-native';
import {TestIds} from 'react-native-google-mobile-ads';

export const ADMOB = {
  android: {
    appId: 'ca-app-pub-6025850831913874~7423872013',
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-6025850831913874/3819774122',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-6025850831913874/6254365777',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-6025850831913874/8465490947',
  },
  ios: {
    appId: 'ca-app-pub-7270703936050310~8095891052',
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-7270703936050310/6389795823',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-7270703936050310/1142067521',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7270703936050310/6753486854',
  },
};

export const BANNER_UNIT =
  Platform.OS === 'android'
    ? ADMOB.android.banner
    : ADMOB.ios.banner;
