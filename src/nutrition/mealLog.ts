// FILE: src/nutrition/mealLog.ts
import AsyncStorage
  from '@react-native-async-storage/async-storage';

export type LoggedMealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack';

export type FoodLogSource =
  | 'ai'
  | 'manual'
  | 'search'
  | 'barcode';

export type FoodLogItem = {
  id: string;
  name: string;
  grams: number;

  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;

  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatsPer100g?: number;

  confidence?: number;
  source: FoodLogSource;
};

export type MealLog = {
  id: string;
  dateKey: string;
  mealType: LoggedMealType;
  createdAt: number;
  photoUri?: string;
  foods: FoodLogItem[];
};

export type DailyNutritionTotal = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
};

export type NutritionTargetSummary = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
};

export type NutritionAdviceItem = {
  key: string;
  defaultValue: string;
  options?: Record<string, string | number>;
  level:
    | 'good'
    | 'info'
    | 'warning';
};

const KEY_PREFIX =
  'nutrition:mealLogs';

const round1 = (
  value: number,
) => Math.round(value * 10) / 10;

const safeNumber = (
  value: unknown,
) => {
  const parsed =
    Number.parseFloat(
      String(value ?? '')
        .replace(',', '.'),
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

export const getNutritionDateKey = (
  date = new Date(),
) => {
  const year =
    date.getFullYear();
  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0');
  const day =
    String(
      date.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const keyForDate = (
  dateKey: string,
) => `${KEY_PREFIX}:${dateKey}`;

const normalizeFood = (
  value: any,
): FoodLogItem => ({
  id:
    String(
      value?.id ||
        `${Date.now()}-${Math.random()}`,
    ),
  name:
    String(
      value?.name ||
        'Food',
    ),
  grams:
    Math.max(
      0,
      round1(
        safeNumber(
          value?.grams,
        ),
      ),
    ),
  calories:
    Math.max(
      0,
      Math.round(
        safeNumber(
          value?.calories,
        ),
      ),
    ),
  proteinG:
    Math.max(
      0,
      round1(
        safeNumber(
          value?.proteinG,
        ),
      ),
    ),
  carbsG:
    Math.max(
      0,
      round1(
        safeNumber(
          value?.carbsG,
        ),
      ),
    ),
  fatsG:
    Math.max(
      0,
      round1(
        safeNumber(
          value?.fatsG,
        ),
      ),
    ),
  caloriesPer100g:
    value?.caloriesPer100g == null
      ? undefined
      : Math.max(
          0,
          safeNumber(
            value.caloriesPer100g,
          ),
        ),
  proteinPer100g:
    value?.proteinPer100g == null
      ? undefined
      : Math.max(
          0,
          safeNumber(
            value.proteinPer100g,
          ),
        ),
  carbsPer100g:
    value?.carbsPer100g == null
      ? undefined
      : Math.max(
          0,
          safeNumber(
            value.carbsPer100g,
          ),
        ),
  fatsPer100g:
    value?.fatsPer100g == null
      ? undefined
      : Math.max(
          0,
          safeNumber(
            value.fatsPer100g,
          ),
        ),
  confidence:
    value?.confidence == null
      ? undefined
      : Math.max(
          0,
          Math.min(
            1,
            safeNumber(
              value.confidence,
            ),
          ),
        ),
  source:
    value?.source === 'manual' ||
    value?.source === 'search' ||
    value?.source === 'barcode'
      ? value.source
      : 'ai',
});

const normalizeMeal = (
  value: any,
  fallbackDateKey: string,
): MealLog => ({
  id:
    String(
      value?.id ||
        `${Date.now()}-${Math.random()}`,
    ),
  dateKey:
    String(
      value?.dateKey ||
        fallbackDateKey,
    ),
  mealType:
    value?.mealType === 'breakfast' ||
    value?.mealType === 'lunch' ||
    value?.mealType === 'dinner'
      ? value.mealType
      : 'snack',
  createdAt:
    Number(
      value?.createdAt,
    ) || Date.now(),
  photoUri:
    value?.photoUri
      ? String(value.photoUri)
      : undefined,
  foods:
    Array.isArray(value?.foods)
      ? value.foods.map(
          normalizeFood,
        )
      : [],
});

export const loadMealLogs = async (
  dateKey =
    getNutritionDateKey(),
): Promise<MealLog[]> => {
  try {
    const raw =
      await AsyncStorage.getItem(
        keyForDate(dateKey),
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(item =>
        normalizeMeal(
          item,
          dateKey,
        ),
      )
      .sort(
        (a, b) =>
          b.createdAt -
          a.createdAt,
      );
  } catch (error) {
    console.log(
      '[nutrition] load meal logs error',
      error,
    );

    return [];
  }
};

export const saveMealLogs = async (
  dateKey: string,
  logs: MealLog[],
) => {
  await AsyncStorage.setItem(
    keyForDate(dateKey),
    JSON.stringify(logs),
  );
};

export const addMealLog = async (
  input: Omit<
    MealLog,
    'id' | 'dateKey' | 'createdAt'
  > & {
    dateKey?: string;
    createdAt?: number;
  },
): Promise<MealLog[]> => {
  const dateKey =
    input.dateKey ||
    getNutritionDateKey();

  const current =
    await loadMealLogs(
      dateKey,
    );

  const nextMeal =
    normalizeMeal(
      {
        ...input,
        id:
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 9)}`,
        dateKey,
        createdAt:
          input.createdAt ||
          Date.now(),
      },
      dateKey,
    );

  const next = [
    nextMeal,
    ...current,
  ];

  await saveMealLogs(
    dateKey,
    next,
  );

  return next;
};

export const deleteMealLog = async (
  dateKey: string,
  mealId: string,
): Promise<MealLog[]> => {
  const current =
    await loadMealLogs(
      dateKey,
    );

  const next =
    current.filter(
      item =>
        item.id !== mealId,
    );

  await saveMealLogs(
    dateKey,
    next,
  );

  return next;
};

export const calculateDailyNutrition = (
  meals: MealLog[],
): DailyNutritionTotal => {
  const total =
    meals.reduce(
      (
        result,
        meal,
      ) => {
        meal.foods.forEach(
          food => {
            result.calories +=
              safeNumber(
                food.calories,
              );
            result.proteinG +=
              safeNumber(
                food.proteinG,
              );
            result.carbsG +=
              safeNumber(
                food.carbsG,
              );
            result.fatsG +=
              safeNumber(
                food.fatsG,
              );
          },
        );

        return result;
      },
      {
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatsG: 0,
      },
    );

  return {
    calories:
      Math.round(
        total.calories,
      ),
    proteinG:
      round1(
        total.proteinG,
      ),
    carbsG:
      round1(
        total.carbsG,
      ),
    fatsG:
      round1(
        total.fatsG,
      ),
  };
};

export const calculateFromPer100g = ({
  grams,
  caloriesPer100g,
  proteinPer100g,
  carbsPer100g,
  fatsPer100g,
}: {
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
}) => {
  const safeGrams =
    Math.max(
      0,
      safeNumber(grams),
    );

  const ratio =
    safeGrams / 100;

  return {
    calories:
      Math.round(
        safeNumber(
          caloriesPer100g,
        ) * ratio,
      ),
    proteinG:
      round1(
        safeNumber(
          proteinPer100g,
        ) * ratio,
      ),
    carbsG:
      round1(
        safeNumber(
          carbsPer100g,
        ) * ratio,
      ),
    fatsG:
      round1(
        safeNumber(
          fatsPer100g,
        ) * ratio,
      ),
  };
};

export const buildDailyNutritionAdvice = ({
  consumed,
  target,
}: {
  consumed: DailyNutritionTotal;
  target: NutritionTargetSummary;
}): NutritionAdviceItem[] => {
  const advice:
    NutritionAdviceItem[] = [];

  const calorieTarget =
    Math.max(
      1,
      target.calories,
    );

  const calorieRatio =
    consumed.calories /
    calorieTarget;

  const remainingCalories =
    Math.round(
      target.calories -
      consumed.calories,
    );

  if (calorieRatio < 0.5) {
    advice.push({
      key:
        'mealScan.adviceLowCalories',
      defaultValue:
        'You still have about {{count}} kcal available today. Prioritize a balanced meal.',
      options: {
        count:
          Math.max(
            0,
            remainingCalories,
          ),
      },
      level: 'info',
    });
  } else if (
    calorieRatio < 0.85
  ) {
    advice.push({
      key:
        'mealScan.adviceOnTrack',
      defaultValue:
        'Your calorie intake is currently on track for today.',
      level: 'good',
    });
  } else if (
    calorieRatio <= 1.05
  ) {
    advice.push({
      key:
        'mealScan.adviceNearTarget',
      defaultValue:
        'You are close to your calorie target. Choose the remaining meals carefully.',
      level: 'good',
    });
  } else {
    advice.push({
      key:
        'mealScan.adviceOverTarget',
      defaultValue:
        'You are about {{count}} kcal above today’s target. Prefer lighter meals for the rest of the day.',
      options: {
        count:
          Math.abs(
            remainingCalories,
          ),
      },
      level: 'warning',
    });
  }

  const proteinRemaining =
    target.proteinG -
    consumed.proteinG;

  if (proteinRemaining > 25) {
    advice.push({
      key:
        'mealScan.adviceProteinLow',
      defaultValue:
        'You still need about {{count}} g protein. Consider lean meat, fish, eggs, yogurt or whey.',
      options: {
        count:
          Math.round(
            proteinRemaining,
          ),
      },
      level: 'info',
    });
  }

  if (
    target.fatsG > 0 &&
    consumed.fatsG /
      target.fatsG >
      1.1
  ) {
    advice.push({
      key:
        'mealScan.adviceFatHigh',
      defaultValue:
        'Fat intake is already high. Limit fried foods, creamy sauces and added oil.',
      level: 'warning',
    });
  }

  if (
    advice.length === 1 &&
    calorieRatio >= 0.5 &&
    calorieRatio <= 1.05 &&
    proteinRemaining <= 25
  ) {
    advice.push({
      key:
        'mealScan.adviceBalanced',
      defaultValue:
        'Calories and protein are well balanced so far. Keep portions consistent.',
      level: 'good',
    });
  }

  return advice.slice(0, 3);
};
