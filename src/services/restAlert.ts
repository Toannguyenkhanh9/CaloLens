// FILE: src/services/restAlert.ts
import { Vibration } from 'react-native';
import SoundPlayer from 'react-native-sound-player';

export const playRestFinishedAlert = () => {
  try {
    Vibration.vibrate([0, 500, 180, 500]);

    SoundPlayer.setVolume(1);
    SoundPlayer.playSoundFile('rest_done', 'mp3');
  } catch (e) {
    console.log('[rest-alert] sound error', e);

    Vibration.vibrate([0, 500, 180, 500]);
  }
};