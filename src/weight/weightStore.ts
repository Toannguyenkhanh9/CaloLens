// FILE: src/weight/weightStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightEntry = { dateISO: string; kg: number };

const KEY_HISTORY = 'weight:history';
const KEY_EVERY_DAYS = 'weight:everyDays';
const KEY_LAST_PROMPT_AT = 'weight:lastPromptAt';
export const DEFAULT_EVERY_DAYS = 3;

const dayMs = 24 * 60 * 60 * 1000;
const todayISO = () => new Date().toISOString().slice(0, 10);

export async function getEveryDays(): Promise<number> {
  const s = await AsyncStorage.getItem(KEY_EVERY_DAYS);
  return s ? Math.max(1, parseInt(s, 10)) : DEFAULT_EVERY_DAYS;
}
export async function setEveryDays(n: number) {
  await AsyncStorage.setItem(KEY_EVERY_DAYS, String(n));
}

export async function loadHistory(): Promise<WeightEntry[]> {
  const s = await AsyncStorage.getItem(KEY_HISTORY);
  const arr: WeightEntry[] = s ? JSON.parse(s) : [];
  return arr.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}
export async function addWeight(kg: number) {
  const arr = await loadHistory();
  const d = todayISO();
  const idx = arr.findIndex(x => x.dateISO === d);
  if (idx >= 0) arr[idx].kg = kg;
  else arr.push({ dateISO: d, kg });
  await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(arr));
}

export async function lastEntry(): Promise<WeightEntry | undefined> {
  const arr = await loadHistory();
  return arr[arr.length - 1];
}

export async function shouldPromptNow(): Promise<boolean> {
  const every = await getEveryDays();
  const last = await lastEntry();
  const lastPromptAt = +(await AsyncStorage.getItem(KEY_LAST_PROMPT_AT) || '0');
  // tránh hiện lại liền tay trong 24h
  if (Date.now() - lastPromptAt < dayMs) return false;

  if (!last) return true;
  const diffDays = Math.floor((Date.now() - new Date(last.dateISO).getTime()) / dayMs);
  return diffDays >= every;
}
export async function markPromptShown() {
  await AsyncStorage.setItem(KEY_LAST_PROMPT_AT, String(Date.now()));
}
