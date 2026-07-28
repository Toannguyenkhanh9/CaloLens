// FILE: src/nutrition/nutritionTargets.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const NUTRITION_TARGET_KEY = 'nutrition:dailyTargets';

export type NutritionTargetOverrides = {
  calories?: number;
  waterLiters?: number;
};

const cleanTargets = (
  input: NutritionTargetOverrides | null,
): NutritionTargetOverrides => {
  const next: NutritionTargetOverrides = {};

  if (
    typeof input?.calories === 'number' &&
    Number.isFinite(input.calories) &&
    input.calories >= 800 &&
    input.calories <= 6000
  ) {
    next.calories = Math.round(input.calories);
  }

  if (
    typeof input?.waterLiters === 'number' &&
    Number.isFinite(input.waterLiters) &&
    input.waterLiters >= 0.5 &&
    input.waterLiters <= 8
  ) {
    next.waterLiters = Math.round(input.waterLiters * 10) / 10;
  }

  return next;
};

export const loadNutritionTargets =
  async (): Promise<NutritionTargetOverrides> => {
    try {
      const raw = await AsyncStorage.getItem(NUTRITION_TARGET_KEY);
      if (!raw) return {};

      return cleanTargets(JSON.parse(raw));
    } catch {
      return {};
    }
  };

export const saveNutritionTargets = async (
  targets: NutritionTargetOverrides,
): Promise<NutritionTargetOverrides> => {
  const clean = cleanTargets(targets);
  await AsyncStorage.setItem(
    NUTRITION_TARGET_KEY,
    JSON.stringify(clean),
  );
  return clean;
};

export const clearNutritionTargets = async () => {
  await AsyncStorage.removeItem(NUTRITION_TARGET_KEY);
};
