/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initAds } from './src/ads/initAds';
initAds(); // 🔸 gọi càng sớm càng tốt
AppRegistry.registerComponent(appName, () => App);
