// FILE: src/store/beginnerMode.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BEGINNER_MODE_KEY = 'app:beginnerMode';

export async function getBeginnerMode(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(BEGINNER_MODE_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export async function setBeginnerMode(enabled: boolean) {
  await AsyncStorage.setItem(BEGINNER_MODE_KEY, enabled ? '1' : '0');
}

export async function toggleBeginnerMode(): Promise<boolean> {
  const current = await getBeginnerMode();
  const next = !current;
  await setBeginnerMode(next);
  return next;
}