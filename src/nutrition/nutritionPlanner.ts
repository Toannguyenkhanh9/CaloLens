// FILE: src/nutrition/nutritionPlanner.ts
import type { ProfileInput } from '../recommendation/programRecommender';
import type { NutritionTargetOverrides } from './nutritionTargets';

export type NutritionGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain'
  | 'recomp'
  | 'endurance'
  | 'flexibility';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MealOption = {
  id: string;
  type: MealType;
  title: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  tags?: string[];
};

export type MealGroup = {
  type: MealType;
  title: string;
  options: MealOption[];
};

export type MealCalorieSplit = {
  key: MealType;
  label: string;
  calories: number;
  percent: number;
};

export type AdvancedProfile = Partial<ProfileInput> & {
  name?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goal?: NutritionGoal;
  injured?: boolean;
  injuryNote?: string;
  healthNote?: string;
  activityLevel?: ActivityLevel;
  workoutDaysPerWeek?: number;
  workoutMinutesPerDay?: number;
};

export type AdvancedNutritionPlan = {
  calories: number;
  waterLiters: number;

  proteinG: number;
  carbsG: number;
  fatsG: number;

  meals: string[];
  tips: string[];
  mealGroups: MealGroup[];

  advanced: {
    bmi: number;
    bmiLabel: string;

    bmr: number;
    tdee: number;
    calorieDelta: number;

    goal: NutritionGoal;
    goalLabel: string;

    activityLevel: ActivityLevel;
    activityLabel: string;
    activityFactor: number;

    proteinPerKg: number;
    fatPerKg: number;

    fiberG: number;

    proteinPercent: number;
    carbsPercent: number;
    fatsPercent: number;

    mealSplit: MealCalorieSplit[];

    hydrationSchedule: string[];
    warnings: string[];

    summary: string;
  };
};

type TranslateFn = (
  key: string,
  defaultValue?: string,
  options?: Record<string, any>,
) => string;

const defaultT: TranslateFn = (key, defaultValue, options) => {
  let text = defaultValue || key;

  if (options) {
    Object.keys(options).forEach((name) => {
      text = text.replace(new RegExp(`{{${name}}}`, 'g'), String(options[name]));
    });
  }

  return text;
};

const tr = (
  t: TranslateFn | undefined,
  key: string,
  defaultValue: string,
  options?: Record<string, any>,
) => {
  return (t || defaultT)(key, defaultValue, options);
};

const round = (n: number) => Math.round(n);
const round1 = (n: number) => Math.round(n * 10) / 10;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

function normalizeGoal(goal?: string): NutritionGoal {
  if (goal === 'lose_weight') return 'lose_weight';
  if (goal === 'build_muscle') return 'build_muscle';
  if (goal === 'recomp') return 'recomp';
  if (goal === 'endurance') return 'endurance';
  if (goal === 'flexibility') return 'flexibility';
  return 'maintain';
}

function getActivityLevel(profile: AdvancedProfile): ActivityLevel {
  if (profile.activityLevel) return profile.activityLevel;
  if (profile.injured) return 'light';

  switch (profile.goal) {
    case 'build_muscle':
    case 'endurance':
      return 'moderate';
    case 'lose_weight':
    case 'recomp':
      return 'light';
    default:
      return 'light';
  }
}

function getActivityFactor(level: ActivityLevel) {
  switch (level) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'active':
      return 1.725;
    case 'very_active':
      return 1.9;
    default:
      return 1.375;
  }
}

function getActivityLabel(level: ActivityLevel, t?: TranslateFn) {
  switch (level) {
    case 'sedentary':
      return tr(t, 'nutrition.activity.sedentary', 'Sedentary');
    case 'light':
      return tr(t, 'nutrition.activity.light', 'Light activity');
    case 'moderate':
      return tr(t, 'nutrition.activity.moderate', 'Moderate activity');
    case 'active':
      return tr(t, 'nutrition.activity.active', 'Active');
    case 'very_active':
      return tr(t, 'nutrition.activity.very_active', 'Very active');
    default:
      return tr(t, 'nutrition.activity.light', 'Light activity');
  }
}

function getGoalLabel(goal: NutritionGoal, t?: TranslateFn) {
  switch (goal) {
    case 'lose_weight':
      return tr(t, 'nutrition.goals.lose_weight', 'Fat loss');
    case 'build_muscle':
      return tr(t, 'nutrition.goals.build_muscle', 'Build muscle');
    case 'maintain':
      return tr(t, 'nutrition.goals.maintain', 'Maintain');
    case 'recomp':
      return tr(t, 'nutrition.goals.recomp', 'Body recomposition');
    case 'endurance':
      return tr(t, 'nutrition.goals.endurance', 'Endurance');
    case 'flexibility':
      return tr(t, 'nutrition.goals.flexibility', 'General wellness');
    default:
      return tr(t, 'nutrition.goals.maintain', 'Maintain');
  }
}

function getBmi(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return round1(weightKg / (heightM * heightM));
}

function getBmiLabel(bmi: number, t?: TranslateFn) {
  if (bmi < 18.5) return tr(t, 'nutrition.bmiLabels.under', 'Underweight');
  if (bmi < 25) return tr(t, 'nutrition.bmiLabels.normal', 'Normal');
  if (bmi < 30) return tr(t, 'nutrition.bmiLabels.over', 'Overweight');
  return tr(t, 'nutrition.bmiLabels.obese', 'Obese');
}

function getBmr(profile: AdvancedProfile, weightKg: number, heightCm: number) {
  const age = profile.age || 28;

  if (profile.gender === 'male') {
    return round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }

  if (profile.gender === 'female') {
    return round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }

  return round(10 * weightKg + 6.25 * heightCm - 5 * age - 78);
}

function getCalorieDelta(goal: NutritionGoal, bmi: number) {
  switch (goal) {
    case 'lose_weight':
      if (bmi < 20) return -0.05;
      if (bmi >= 30) return -0.22;
      return -0.18;

    case 'build_muscle':
      if (bmi >= 28) return 0.03;
      return 0.1;

    case 'recomp':
      return -0.06;

    case 'endurance':
      return 0.05;

    case 'flexibility':
    case 'maintain':
    default:
      return 0;
  }
}

function getProteinPerKg(goal: NutritionGoal, bmi: number) {
  switch (goal) {
    case 'lose_weight':
      return bmi >= 25 ? 1.9 : 1.7;
    case 'build_muscle':
      return 2.0;
    case 'recomp':
      return 2.0;
    case 'endurance':
      return 1.6;
    case 'flexibility':
    case 'maintain':
    default:
      return 1.6;
  }
}

function getFatPerKg(goal: NutritionGoal) {
  switch (goal) {
    case 'build_muscle':
      return 0.9;
    case 'lose_weight':
      return 0.75;
    case 'recomp':
      return 0.8;
    default:
      return 0.8;
  }
}

function meal(
  id: string,
  type: MealType,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatsG: number,
  titleKey: string,
  titleDefault: string,
  descKey: string,
  descDefault: string,
  t?: TranslateFn,
  tags: string[] = [],
): MealOption {
  return {
    id,
    type,
    title: tr(t, titleKey, titleDefault),
    description: tr(t, descKey, descDefault),
    calories,
    proteinG,
    carbsG,
    fatsG,
    tags,
  };
}

function buildMealLibrary(t?: TranslateFn): MealOption[] {
  return [
    meal('bf_1', 'breakfast', 420, 18, 52, 14, 'nutrition.mealOptions.bf_1.title', 'Oatmeal with banana and peanut butter', 'nutrition.mealOptions.bf_1.desc', 'Oats, banana, peanut butter and milk', t, ['balanced', 'easy']),
    meal('bf_2', 'breakfast', 480, 24, 34, 24, 'nutrition.mealOptions.bf_2.title', 'Eggs, whole grain toast and avocado', 'nutrition.mealOptions.bf_2.desc', 'Eggs, whole grain toast, avocado and vegetables', t, ['high_protein', 'balanced']),
    meal('bf_3', 'breakfast', 360, 26, 40, 10, 'nutrition.mealOptions.bf_3.title', 'Greek yogurt bowl', 'nutrition.mealOptions.bf_3.desc', 'Greek yogurt, berries, banana and granola', t, ['light', 'lose_weight']),
    meal('bf_4', 'breakfast', 520, 35, 48, 18, 'nutrition.mealOptions.bf_4.title', 'Protein smoothie', 'nutrition.mealOptions.bf_4.desc', 'Whey protein, banana, oats, milk and peanut butter', t, ['build_muscle']),

    meal('ln_1', 'lunch', 620, 45, 58, 18, 'nutrition.mealOptions.ln_1.title', 'Grilled chicken rice bowl', 'nutrition.mealOptions.ln_1.desc', 'Chicken breast, rice, broccoli and olive oil', t, ['balanced', 'high_protein']),
    meal('ln_2', 'lunch', 680, 42, 60, 22, 'nutrition.mealOptions.ln_2.title', 'Beef and sweet potato plate', 'nutrition.mealOptions.ln_2.desc', 'Lean beef, sweet potato and mixed vegetables', t, ['build_muscle']),
    meal('ln_3', 'lunch', 520, 24, 44, 22, 'nutrition.mealOptions.ln_3.title', 'Tofu quinoa salad', 'nutrition.mealOptions.ln_3.desc', 'Tofu, quinoa, greens, tomatoes and avocado', t, ['lose_weight', 'vegetarian']),
    meal('ln_4', 'lunch', 540, 32, 46, 18, 'nutrition.mealOptions.ln_4.title', 'Turkey wrap combo', 'nutrition.mealOptions.ln_4.desc', 'Turkey wrap, vegetables and yogurt dip', t, ['easy', 'balanced']),

    meal('dn_1', 'dinner', 610, 38, 42, 28, 'nutrition.mealOptions.dn_1.title', 'Salmon with potatoes and salad', 'nutrition.mealOptions.dn_1.desc', 'Salmon, boiled potatoes and green salad', t, ['balanced']),
    meal('dn_2', 'dinner', 640, 44, 54, 20, 'nutrition.mealOptions.dn_2.title', 'Lean beef with rice and vegetables', 'nutrition.mealOptions.dn_2.desc', 'Lean beef, rice and vegetables', t, ['build_muscle']),
    meal('dn_3', 'dinner', 430, 36, 28, 12, 'nutrition.mealOptions.dn_3.title', 'White fish and steamed vegetables', 'nutrition.mealOptions.dn_3.desc', 'White fish, vegetables and a small rice portion', t, ['lose_weight', 'light']),
    meal('dn_4', 'dinner', 590, 40, 56, 16, 'nutrition.mealOptions.dn_4.title', 'Chicken pasta', 'nutrition.mealOptions.dn_4.desc', 'Chicken breast, whole wheat pasta and tomato sauce', t, ['balanced']),

    meal('sn_1', 'snack', 250, 20, 16, 10, 'nutrition.mealOptions.sn_1.title', 'Protein yogurt and nuts', 'nutrition.mealOptions.sn_1.desc', 'Greek yogurt, almonds and berries', t, ['balanced']),
    meal('sn_2', 'snack', 230, 24, 22, 3, 'nutrition.mealOptions.sn_2.title', 'Protein shake and banana', 'nutrition.mealOptions.sn_2.desc', 'Whey protein shake with banana', t, ['build_muscle']),
    meal('sn_3', 'snack', 210, 6, 22, 10, 'nutrition.mealOptions.sn_3.title', 'Apple with peanut butter', 'nutrition.mealOptions.sn_3.desc', 'Apple slices with peanut butter', t, ['easy']),
    meal('sn_4', 'snack', 190, 18, 14, 5, 'nutrition.mealOptions.sn_4.title', 'Cottage cheese cup', 'nutrition.mealOptions.sn_4.desc', 'Cottage cheese with fruit', t, ['lose_weight', 'light']),
  ];
}

function getMealTargetRange(totalCalories: number, type: MealType) {
  switch (type) {
    case 'breakfast':
      return [totalCalories * 0.16, totalCalories * 0.3];
    case 'lunch':
      return [totalCalories * 0.22, totalCalories * 0.4];
    case 'dinner':
      return [totalCalories * 0.22, totalCalories * 0.4];
    case 'snack':
      return [totalCalories * 0.06, totalCalories * 0.2];
    default:
      return [0, totalCalories];
  }
}

function scoreMeal(
  option: MealOption,
  goal: NutritionGoal,
  min: number,
  max: number,
) {
  let score = 0;

  if (option.calories >= min && option.calories <= max) score += 4;

  if (goal === 'build_muscle' && option.proteinG >= 24) score += 3;
  if (goal === 'lose_weight' && option.calories <= max && option.proteinG >= 18) score += 3;
  if (goal === 'recomp' && option.proteinG >= 20) score += 3;
  if (goal === 'maintain') score += 2;

  if (option.tags?.includes(goal)) score += 3;
  if (option.tags?.includes('balanced')) score += 1;
  if (option.tags?.includes('high_protein')) score += 1;

  return score;
}

function getMealGroupTitle(type: MealType, t?: TranslateFn) {
  switch (type) {
    case 'breakfast':
      return tr(t, 'nutrition.mealGroups.breakfast', 'Breakfast options');
    case 'lunch':
      return tr(t, 'nutrition.mealGroups.lunch', 'Lunch options');
    case 'dinner':
      return tr(t, 'nutrition.mealGroups.dinner', 'Dinner options');
    case 'snack':
      return tr(t, 'nutrition.mealGroups.snack', 'Snack options');
    default:
      return type;
  }
}

function buildMealGroups(
  totalCalories: number,
  goal: NutritionGoal,
  t?: TranslateFn,
): MealGroup[] {
  const library = buildMealLibrary(t);
  const types: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return types.map((type) => {
    const [min, max] = getMealTargetRange(totalCalories, type);

    const options = library
      .filter((item) => item.type === type)
      .map((item) => ({
        ...item,
        __score: scoreMeal(item, goal, min, max),
      }))
      .sort((a, b) => b.__score - a.__score)
      .slice(0, 4)
      .map(({ __score, ...rest }) => rest as MealOption);

    return {
      type,
      title: getMealGroupTitle(type, t),
      options,
    };
  });
}

function buildSimpleMeals(mealGroups: MealGroup[], t?: TranslateFn): string[] {
  return mealGroups.map((group) => {
    const best = group.options[0];

    if (!best) return group.title;

    return tr(
      t,
      `nutrition.simpleMeal.${group.type}`,
      '{{meal}} • about {{calories}} kcal',
      {
        meal: best.title,
        calories: best.calories,
      },
    );
  });
}

function buildTips(params: {
  t?: TranslateFn;
  goal: NutritionGoal;
  proteinG: number;
  waterLiters: number;
  fiberG: number;
  injured?: boolean;
  healthNote?: string;
}) {
  const tips = [
    tr(
      params.t,
      'nutrition.dynamicTips.protein',
      'Aim for about {{proteinG}}g protein per day and spread it across 3–4 meals.',
      { proteinG: params.proteinG },
    ),
    tr(
      params.t,
      'nutrition.dynamicTips.water',
      'Drink around {{waterLiters}}L water daily. Add more on hot days or intense workout days.',
      { waterLiters: params.waterLiters },
    ),
    tr(
      params.t,
      'nutrition.dynamicTips.fiber',
      'Target at least {{fiberG}}g fiber from vegetables, fruit, beans and whole grains.',
      { fiberG: params.fiberG },
    ),
  ];

  if (params.goal === 'lose_weight') {
    tips.push(
      tr(
        params.t,
        'nutrition.dynamicTips.lose_weight',
        'Keep a moderate calorie deficit. Avoid cutting calories too aggressively.',
      ),
    );
  }

  if (params.goal === 'build_muscle') {
    tips.push(
      tr(
        params.t,
        'nutrition.dynamicTips.build_muscle',
        'Combine a small calorie surplus with progressive strength training.',
      ),
    );
  }

  if (params.goal === 'recomp') {
    tips.push(
      tr(
        params.t,
        'nutrition.dynamicTips.recomp',
        'Prioritize protein and consistency. Body recomposition works best with steady training.',
      ),
    );
  }

  if (params.injured) {
    tips.push(
      tr(
        params.t,
        'nutrition.dynamicTips.injured',
        'Because you marked an injury, avoid aggressive deficits and prioritize recovery foods.',
      ),
    );
  }

  if (params.healthNote?.trim()) {
    tips.push(
      tr(
        params.t,
        'nutrition.dynamicTips.healthNote',
        'You added a health note. Treat this plan as general guidance and adjust carefully.',
      ),
    );
  }

  return tips;
}

function buildWarnings(
  profile: AdvancedProfile,
  calories: number,
  bmi: number,
  t?: TranslateFn,
) {
  const warnings: string[] = [];

  if (calories < 1400) {
    warnings.push(
      tr(
        t,
        'nutrition.warnings.lowCalories',
        'Your target calories are low. Make sure you still get enough protein, micronutrients and recovery.',
      ),
    );
  }

  if (bmi < 18.5) {
    warnings.push(
      tr(
        t,
        'nutrition.warnings.lowBmi',
        'BMI is low. A fat-loss goal may not be suitable.',
      ),
    );
  }

  if (profile.injured) {
    warnings.push(
      tr(
        t,
        'nutrition.warnings.injured',
        'Injury marked: prioritize recovery, sleep, hydration and joint-friendly training.',
      ),
    );
  }

  if (profile.healthNote?.trim()) {
    warnings.push(
      tr(
        t,
        'nutrition.warnings.healthNote',
        'Health note detected: this plan is not medical advice.',
      ),
    );
  }

  return warnings;
}

function buildHydrationSchedule(t?: TranslateFn) {
  return [
    tr(t, 'nutrition.hydrationSchedule.morning', 'Morning: 500ml after waking up'),
    tr(t, 'nutrition.hydrationSchedule.beforeWorkout', 'Before workout: 300–500ml'),
    tr(t, 'nutrition.hydrationSchedule.duringWorkout', 'During workout: small sips every 10–15 minutes'),
    tr(t, 'nutrition.hydrationSchedule.evening', 'Evening: finish remaining water target'),
  ];
}

export function buildNutritionPlan(
  profile: AdvancedProfile | null,
  t?: TranslateFn,
  overrides?: NutritionTargetOverrides,
): AdvancedNutritionPlan | null {
  if (!profile?.heightCm || !profile?.weightKg) {
    return null;
  }

  const weightKg = profile.weightKg;
  const heightCm = profile.heightCm;

  const goal = normalizeGoal(profile.goal);
  const goalLabel = getGoalLabel(goal, t);

  const bmi = getBmi(weightKg, heightCm);
  const bmiLabel = getBmiLabel(bmi, t);

  const activityLevel = getActivityLevel(profile);
  const activityFactor = getActivityFactor(activityLevel);
  const activityLabel = getActivityLabel(activityLevel, t);

  const bmr = getBmr(profile, weightKg, heightCm);
  const tdee = round(bmr * activityFactor);

  const calorieDelta = getCalorieDelta(goal, bmi);
  const minCalories = profile.gender === 'female' ? 1250 : 1450;

const calculatedCalories = round(
  clamp(tdee * (1 + calorieDelta), minCalories, 4200),
);

const calories =
  typeof overrides?.calories === 'number'
    ? round(clamp(overrides.calories, 800, 6000))
    : calculatedCalories;

  const proteinPerKg = getProteinPerKg(goal, bmi);
  const fatPerKg = getFatPerKg(goal);

  const proteinG = round(weightKg * proteinPerKg);
  const fatsG = round(weightKg * fatPerKg);

  const remainingCalories = Math.max(0, calories - proteinG * 4 - fatsG * 9);
  const carbsG = round(remainingCalories / 4);

  const macroCalories = proteinG * 4 + carbsG * 4 + fatsG * 9;

  const proteinPercent = macroCalories
    ? round((proteinG * 4 * 100) / macroCalories)
    : 0;

  const carbsPercent = macroCalories
    ? round((carbsG * 4 * 100) / macroCalories)
    : 0;

  const fatsPercent = macroCalories
    ? round((fatsG * 9 * 100) / macroCalories)
    : 0;

const calculatedWaterLiters = round1(
  clamp(weightKg * 0.035 + (activityFactor >= 1.55 ? 0.4 : 0.2), 1.6, 4.5),
);

const waterLiters =
  typeof overrides?.waterLiters === 'number'
    ? round1(clamp(overrides.waterLiters, 0.5, 8))
    : calculatedWaterLiters;

  const fiberG = round((calories / 1000) * 14);

  const mealSplit: MealCalorieSplit[] = [
    {
      key: 'breakfast',
      label: tr(t, 'nutrition.breakfast', 'Breakfast'),
      percent: 25,
      calories: round(calories * 0.25),
    },
    {
      key: 'lunch',
      label: tr(t, 'nutrition.lunch', 'Lunch'),
      percent: 35,
      calories: round(calories * 0.35),
    },
    {
      key: 'dinner',
      label: tr(t, 'nutrition.dinner', 'Dinner'),
      percent: 30,
      calories: round(calories * 0.3),
    },
    {
      key: 'snack',
      label: tr(t, 'nutrition.snack', 'Snack'),
      percent: 10,
      calories: round(calories * 0.1),
    },
  ];

  const mealGroups = buildMealGroups(calories, goal, t);
  const meals = buildSimpleMeals(mealGroups, t);

  const tips = buildTips({
    t,
    goal,
    proteinG,
    waterLiters,
    fiberG,
    injured: profile.injured,
    healthNote: profile.healthNote,
  });

  const warnings = buildWarnings(profile, calories, bmi, t);

  const summary = tr(
    t,
    'nutrition.summary',
    '{{goalLabel}} plan: {{calories}} kcal/day, {{proteinG}}g protein, {{carbsG}}g carbs, {{fatsG}}g fats. Estimated BMR {{bmr}}, TDEE {{tdee}}.',
    {
      goalLabel,
      calories,
      proteinG,
      carbsG,
      fatsG,
      bmr,
      tdee,
    },
  );

  return {
    calories,
    waterLiters,

    proteinG,
    carbsG,
    fatsG,

    meals,
    tips,
    mealGroups,

    advanced: {
      bmi,
      bmiLabel,

      bmr,
      tdee,
      calorieDelta: round(calorieDelta * 100),

      goal,
      goalLabel,

      activityLevel,
      activityLabel,
      activityFactor,

      proteinPerKg,
      fatPerKg,

      fiberG,

      proteinPercent,
      carbsPercent,
      fatsPercent,

      mealSplit,

      hydrationSchedule: buildHydrationSchedule(t),
      warnings,

      summary,
    },
  };
}