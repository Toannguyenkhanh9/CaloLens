// FILE: src/nutrition/caloLensInsights.ts
import type {
  DailyNutritionTotal,
  MealLog,
  NutritionTargetSummary,
} from './mealLog';
import type {
  AdvancedNutritionPlan,
  MealOption,
  MealType,
} from './nutritionPlanner';

export type NutritionScoreLevel =
  | 'excellent'
  | 'good'
  | 'focus';

export type NutritionScoreBreakdown = {
  calories: number;
  protein: number;
  macros: number;
  logging: number;
};

export type NutritionScoreResult = {
  score: number;
  level: NutritionScoreLevel;
  breakdown: NutritionScoreBreakdown;
};

export type NextMealSuggestion =
  MealOption & {
    fitScore: number;
  };

export type WeeklyNutritionDay = {
  dateKey: string;
  total: DailyNutritionTotal;
  mealCount: number;
  score: NutritionScoreResult;
};

export type WeeklyNutritionReport = {
  days: WeeklyNutritionDay[];
  averageScore: number;
  averageCalories: number;
  calorieGoalDays: number;
  proteinGoalDays: number;
  loggedDays: number;
};

const clamp = (
  value: number,
  min: number,
  max: number,
) =>
  Math.max(
    min,
    Math.min(max, value),
  );

const round1 = (
  value: number,
) =>
  Math.round(value * 10) / 10;

const ratioScore = (
  ratio: number,
  idealMin: number,
  idealMax: number,
  maxPoints: number,
) => {
  if (
    ratio >= idealMin &&
    ratio <= idealMax
  ) {
    return maxPoints;
  }

  const distance =
    ratio < idealMin
      ? idealMin - ratio
      : ratio - idealMax;

  return Math.round(
    maxPoints *
      clamp(
        1 - distance / 0.65,
        0,
        1,
      ),
  );
};

export const calculateNutritionScore = ({
  consumed,
  target,
  mealCount,
}: {
  consumed: DailyNutritionTotal;
  target: NutritionTargetSummary;
  mealCount: number;
}): NutritionScoreResult => {
  const calorieRatio =
    consumed.calories /
    Math.max(1, target.calories);

  const proteinRatio =
    consumed.proteinG /
    Math.max(1, target.proteinG);

  const carbsRatio =
    consumed.carbsG /
    Math.max(1, target.carbsG);

  const fatsRatio =
    consumed.fatsG /
    Math.max(1, target.fatsG);

  const caloriePoints =
    ratioScore(
      calorieRatio,
      0.85,
      1.05,
      40,
    );

  const proteinPoints =
    Math.round(
      30 *
        clamp(
          proteinRatio,
          0,
          1,
        ),
    );

  const carbsPoints =
    ratioScore(
      carbsRatio,
      0.65,
      1.15,
      10,
    );

  const fatsPoints =
    ratioScore(
      fatsRatio,
      0.55,
      1.1,
      10,
    );

  const loggingPoints =
    Math.round(
      10 *
        clamp(
          mealCount / 3,
          0,
          1,
        ),
    );

  const breakdown = {
    calories: caloriePoints,
    protein: proteinPoints,
    macros:
      carbsPoints +
      fatsPoints,
    logging: loggingPoints,
  };

  const score =
    clamp(
      Object.values(
        breakdown,
      ).reduce(
        (sum, item) =>
          sum + item,
        0,
      ),
      0,
      100,
    );

  return {
    score,
    level:
      score >= 85
        ? 'excellent'
        : score >= 65
        ? 'good'
        : 'focus',
    breakdown,
  };
};

export const getNextMealType = (
  date = new Date(),
): MealType => {
  const hour =
    date.getHours();

  if (hour < 10) {
    return 'breakfast';
  }

  if (hour < 15) {
    return 'lunch';
  }

  if (hour < 20) {
    return 'dinner';
  }

  return 'snack';
};

export const getRemainingNutrition = ({
  consumed,
  target,
}: {
  consumed: DailyNutritionTotal;
  target: NutritionTargetSummary;
}) => ({
  calories:
    Math.max(
      0,
      Math.round(
        target.calories -
        consumed.calories,
      ),
    ),
  proteinG:
    Math.max(
      0,
      round1(
        target.proteinG -
        consumed.proteinG,
      ),
    ),
  carbsG:
    Math.max(
      0,
      round1(
        target.carbsG -
        consumed.carbsG,
      ),
    ),
  fatsG:
    Math.max(
      0,
      round1(
        target.fatsG -
        consumed.fatsG,
      ),
    ),
});

const mealFitScore = ({
  option,
  remainingCalories,
  remainingProtein,
  remainingFats,
}: {
  option: MealOption;
  remainingCalories: number;
  remainingProtein: number;
  remainingFats: number;
}) => {
  let score = 0;

  const calorieTarget =
    Math.max(
      180,
      Math.min(
        remainingCalories,
        750,
      ),
    );

  const calorieDistance =
    Math.abs(
      option.calories -
      calorieTarget,
    );

  score +=
    Math.max(
      0,
      45 -
        calorieDistance / 14,
    );

  if (
    remainingProtein > 25
  ) {
    score +=
      Math.min(
        35,
        option.proteinG * 0.9,
      );
  } else {
    score +=
      Math.min(
        15,
        option.proteinG * 0.4,
      );
  }

  if (
    remainingFats < 12 &&
    option.fatsG > 16
  ) {
    score -= 18;
  }

  if (
    option.calories >
    remainingCalories + 160
  ) {
    score -= 20;
  }

  if (
    option.tags?.includes(
      'balanced',
    )
  ) {
    score += 8;
  }

  if (
    option.tags?.includes(
      'high_protein',
    )
  ) {
    score += 6;
  }

  return score;
};

export const selectNextMealSuggestions = ({
  plan,
  consumed,
  limit = 3,
  date = new Date(),
}: {
  plan: AdvancedNutritionPlan;
  consumed: DailyNutritionTotal;
  limit?: number;
  date?: Date;
}): NextMealSuggestion[] => {
  const type =
    getNextMealType(date);

  const remaining =
    getRemainingNutrition({
      consumed,
      target: plan,
    });

  const primaryGroup =
    plan.mealGroups.find(
      group =>
        group.type === type,
    );

  const pool =
    primaryGroup?.options?.length
      ? primaryGroup.options
      : plan.mealGroups.flatMap(
          group =>
            group.options,
        );

  return pool
    .map(option => ({
      ...option,
      fitScore:
        mealFitScore({
          option,
          remainingCalories:
            remaining.calories,
          remainingProtein:
            remaining.proteinG,
          remainingFats:
            remaining.fatsG,
        }),
    }))
    .sort(
      (a, b) =>
        b.fitScore -
        a.fitScore,
    )
    .slice(0, limit);
};

export const mealOptionToCandidate = (
  option: MealOption,
) => ({
  id:
    `suggestion-${option.id}-${Date.now()}`,
  name: option.title,
  estimatedGrams: 100,
  caloriesPer100g:
    option.calories,
  proteinPer100g:
    option.proteinG,
  carbsPer100g:
    option.carbsG,
  fatsPer100g:
    option.fatsG,
  confidence: 1,
});

export const getPastDateKeys = (
  count: number,
  endDate = new Date(),
) => {
  const result: string[] = [];

  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    const date =
      new Date(endDate);

    date.setHours(
      12,
      0,
      0,
      0,
    );

    date.setDate(
      date.getDate() -
      index,
    );

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

    result.push(
      `${year}-${month}-${day}`,
    );
  }

  return result;
};

export const buildWeeklyNutritionReport = ({
  days,
  target,
}: {
  days: Array<{
    dateKey: string;
    total: DailyNutritionTotal;
    meals: MealLog[];
  }>;
  target: NutritionTargetSummary;
}): WeeklyNutritionReport => {
  const normalized =
    days.map(day => ({
      dateKey: day.dateKey,
      total: day.total,
      mealCount:
        day.meals.length,
      score:
        calculateNutritionScore({
          consumed: day.total,
          target,
          mealCount:
            day.meals.length,
        }),
    }));

  const logged =
    normalized.filter(
      item =>
        item.mealCount > 0,
    );

  const denominator =
    Math.max(1, logged.length);

  return {
    days: normalized,
    averageScore:
      Math.round(
        logged.reduce(
          (sum, item) =>
            sum +
            item.score.score,
          0,
        ) / denominator,
      ),
    averageCalories:
      Math.round(
        logged.reduce(
          (sum, item) =>
            sum +
            item.total.calories,
          0,
        ) / denominator,
      ),
    calorieGoalDays:
      normalized.filter(item => {
        const ratio =
          item.total.calories /
          Math.max(
            1,
            target.calories,
          );

        return (
          item.mealCount > 0 &&
          ratio >= 0.85 &&
          ratio <= 1.05
        );
      }).length,
    proteinGoalDays:
      normalized.filter(
        item =>
          item.mealCount > 0 &&
          item.total.proteinG >=
            target.proteinG * 0.9,
      ).length,
    loggedDays:
      logged.length,
  };
};
