// FILE: src/screens/CaloLensHomeScreen.tsx
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';
import AsyncStorage
  from '@react-native-async-storage/async-storage';
import Svg, {Circle} from 'react-native-svg';

import {
  buildNutritionPlan,
} from '../nutrition/nutritionPlanner';
import type {
  ProfileInput,
} from '../recommendation/programRecommender';
import {
  clearNutritionTargets,
  loadNutritionTargets,
  saveNutritionTargets,
  type NutritionTargetOverrides,
} from '../nutrition/nutritionTargets';
import NextMealCard
  from '../components/NextMealCard';
import NutritionScoreCard
  from '../components/NutritionScoreCard';
import FrequentMealsCard
  from '../components/FrequentMealsCard';

const PROFILE_KEY =
  'user:profile';

const HERO_FOOD_IMAGE =
  require('../assets/calo_home_hero_food.jpg');

const GUIDANCE_FOOD_IMAGE =
  require('../assets/calo_guidance_food.jpg');

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#FFF0E4';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF5A1F';
const CYAN = '#F47B35';
const YELLOW = '#F4A51C';
const BLUE = '#FF8A3D';
const PINK = '#FF6B6B';
const BORDER = '#F0DDD0';
const TRACK = '#F3E8E0';

type QuickActionProps = {
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
  onPress: () => void;
};

const QuickAction:
React.FC<QuickActionProps> = ({
  icon,
  title,
  subtitle,
  accent,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.86}
    style={styles.quickAction}
    onPress={onPress}
  >
    <View
      style={[
        styles.quickIcon,
        {
          borderColor:
            `${accent}66`,
          backgroundColor:
            `${accent}18`,
        },
      ]}
    >
      <Text style={styles.quickIconText}>
        {icon}
      </Text>
    </View>

    <View style={styles.quickBody}>
      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text
        style={styles.quickSubtitle}
        numberOfLines={2}
      >
        {subtitle}
      </Text>
    </View>

    <Text
      style={[
        styles.quickArrow,
        {
          color: accent,
        },
      ]}
    >
      ›
    </Text>
  </TouchableOpacity>
);

type TargetMetricProps = {
  label: string;
  value: string;
  accent: string;
};

const TargetMetric:
React.FC<TargetMetricProps> = ({
  label,
  value,
  accent,
}) => (
  <View style={styles.targetMetric}>
    <View
      style={[
        styles.metricDot,
        {
          backgroundColor:
            accent,
        },
      ]}
    />

    <Text style={styles.metricLabel}>
      {label}
    </Text>

    <Text style={styles.metricValue}>
      {value}
    </Text>
  </View>
);


type DailyTarget = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
};

type DailyTotals = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
};

const EMPTY_TOTALS: DailyTotals = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatsG: 0,
};

const toFiniteNumber = (
  value: unknown,
) => {
  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const readNumber = (
  value: any,
  keys: string[],
) => {
  for (const key of keys) {
    const parsed =
      toFiniteNumber(
        value?.[key],
      );

    if (parsed !== 0) {
      return parsed;
    }
  }

  return 0;
};

const getLocalDateKey = (
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

const nutritionFromFood = (
  food: any,
): DailyTotals => {
  const grams =
    Math.max(
      0,
      readNumber(
        food,
        [
          'estimatedGrams',
          'grams',
          'weightG',
          'portionGrams',
        ],
      ),
    );

  const factor =
    grams > 0
      ? grams / 100
      : 1;

  const directCalories =
    readNumber(
      food,
      [
        'calories',
        'kcal',
        'totalCalories',
      ],
    );

  const directProtein =
    readNumber(
      food,
      [
        'proteinG',
        'protein',
        'totalProteinG',
      ],
    );

  const directCarbs =
    readNumber(
      food,
      [
        'carbsG',
        'carbs',
        'totalCarbsG',
      ],
    );

  const directFats =
    readNumber(
      food,
      [
        'fatsG',
        'fatG',
        'fat',
        'totalFatsG',
      ],
    );

  return {
    calories:
      directCalories ||
      readNumber(
        food,
        [
          'caloriesPer100g',
        ],
      ) * factor,
    proteinG:
      directProtein ||
      readNumber(
        food,
        [
          'proteinPer100g',
        ],
      ) * factor,
    carbsG:
      directCarbs ||
      readNumber(
        food,
        [
          'carbsPer100g',
        ],
      ) * factor,
    fatsG:
      directFats ||
      readNumber(
        food,
        [
          'fatsPer100g',
          'fatPer100g',
        ],
      ) * factor,
  };
};

const addTotals = (
  left: DailyTotals,
  right: DailyTotals,
): DailyTotals => ({
  calories:
    left.calories +
    right.calories,
  proteinG:
    left.proteinG +
    right.proteinG,
  carbsG:
    left.carbsG +
    right.carbsG,
  fatsG:
    left.fatsG +
    right.fatsG,
});

const nutritionFromLog = (
  log: any,
): DailyTotals => {
  const direct: DailyTotals = {
    calories:
      readNumber(
        log,
        [
          'totalCalories',
          'calories',
          'kcal',
        ],
      ),
    proteinG:
      readNumber(
        log,
        [
          'totalProteinG',
          'proteinG',
          'protein',
        ],
      ),
    carbsG:
      readNumber(
        log,
        [
          'totalCarbsG',
          'carbsG',
          'carbs',
        ],
      ),
    fatsG:
      readNumber(
        log,
        [
          'totalFatsG',
          'fatsG',
          'fatG',
          'fat',
        ],
      ),
  };

  const foods =
    Array.isArray(
      log?.foods,
    )
      ? log.foods
      : Array.isArray(
          log?.items,
        )
      ? log.items
      : [];

  if (
    direct.calories > 0 ||
    direct.proteinG > 0 ||
    direct.carbsG > 0 ||
    direct.fatsG > 0
  ) {
    return direct;
  }

  return foods.reduce(
    (
      total: DailyTotals,
      food: any,
    ) =>
      addTotals(
        total,
        nutritionFromFood(
          food,
        ),
      ),
    {
      ...EMPTY_TOTALS,
    },
  );
};

const clampPercent = (
  value: number,
) =>
  Math.max(
    0,
    Math.min(
      100,
      value,
    ),
  );

const ProgressBar:
React.FC<{
  progress: number;
  color: string;
}> = ({
  progress,
  color,
}) => (
  <View style={styles.lightProgressTrack}>
    <View
      style={[
        styles.lightProgressFill,
        {
          width:
            `${clampPercent(
              progress,
            )}%`,
          backgroundColor:
            color,
        },
      ]}
    />
  </View>
);

const CalorieRing:
React.FC<{
  progress: number;
}> = ({progress}) => {
  const size = 86;
  const strokeWidth = 9;
  const radius =
    (size - strokeWidth) / 2;
  const circumference =
    2 * Math.PI * radius;
  const safeProgress =
    clampPercent(progress);
  const dashOffset =
    circumference *
    (1 - safeProgress / 100);

  return (
    <View
      style={[
        styles.calorieRingWrap,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1E4D9"
          strokeWidth={strokeWidth}
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={NEON}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.calorieRingCenter}>
        <Text style={styles.calorieRingPercent}>
          {Math.round(safeProgress)}%
        </Text>
      </View>
    </View>
  );
};

const MacroProgressRow:
React.FC<{
  label: string;
  short: string;
  current: number;
  target: number;
  color: string;
}> = ({
  label,
  short,
  current,
  target,
  color,
}) => (
  <View style={styles.lightMacroRow}>
    <View style={styles.lightMacroHeader}>
      <View style={styles.lightMacroNameRow}>
        <View
          style={[
            styles.lightMacroBadge,
            {
              backgroundColor:
                `${color}18`,
            },
          ]}
        >
          <Text
            style={[
              styles.lightMacroBadgeText,
              {color},
            ]}
          >
            {short}
          </Text>
        </View>

        <Text style={styles.lightMacroLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.lightMacroValue}>
        {Math.round(current)}
        {' / '}
        {Math.round(target)}
        g
      </Text>
    </View>

    <View style={styles.lightMacroBarOffset}>
      <ProgressBar
        progress={
          target > 0
            ? current *
              100 /
              target
            : 0
        }
        color={color}
      />
    </View>
  </View>
);

const LightDailyIntakeCard:
React.FC<{
  target: DailyTarget;
}> = ({
  target,
}) => {
  const {t} =
    useTranslation();

  const navigation =
    useNavigation<any>();

  const [
    totals,
    setTotals,
  ] =
    useState<DailyTotals>({
      ...EMPTY_TOTALS,
    });

  const loadTotals =
    useCallback(
      async () => {
        try {
          const key =
            `nutrition:mealLogs:${getLocalDateKey()}`;

          const raw =
            await AsyncStorage.getItem(
              key,
            );

          if (!raw) {
            setTotals({
              ...EMPTY_TOTALS,
            });
            return;
          }

          const parsed =
            JSON.parse(raw);

          const logs =
            Array.isArray(parsed)
              ? parsed
              : Array.isArray(
                  parsed?.meals,
                )
              ? parsed.meals
              : Array.isArray(
                  parsed?.items,
                )
              ? parsed.items
              : [];

          const next =
            logs.reduce(
              (
                sum: DailyTotals,
                log: any,
              ) =>
                addTotals(
                  sum,
                  nutritionFromLog(
                    log,
                  ),
                ),
              {
                ...EMPTY_TOTALS,
              },
            );

          setTotals(next);
        } catch (error) {
          console.log(
            '[CaloLensHome] meal total error',
            error,
          );

          setTotals({
            ...EMPTY_TOTALS,
          });
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      loadTotals();
    }, [loadTotals]),
  );

  const remainingCalories =
    Math.max(
      0,
      Math.round(
        target.calories -
        totals.calories,
      ),
    );

  const calorieProgress =
    target.calories > 0
      ? totals.calories *
        100 /
        target.calories
      : 0;

  return (
    <View style={styles.lightIntakeCard}>
      <View style={styles.lightIntakeHeader}>
        <View>
          <Text style={styles.lightKicker}>
            {t(
              'mealScan.today',
              'TODAY',
            )}
          </Text>

          <Text style={styles.lightIntakeTitle}>
            {t(
              'mealScan.dailyIntake',
              'Daily intake',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() =>
            navigation.navigate(
              'MealLog',
            )
          }
        >
          <Text style={styles.lightViewLog}>
            {t(
              'mealScan.viewLog',
              'View log',
            )}{'  ›'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.intakeSummaryRow}>
        <CalorieRing
          progress={calorieProgress}
        />

        <View style={styles.intakeSummaryBody}>
          <View style={styles.lightCalorieLine}>
            <Text style={styles.lightConsumedValue}>
              {Math.round(
                totals.calories,
              )}
            </Text>

            <Text style={styles.lightTargetValue}>
              {' / '}
              {Math.round(
                target.calories,
              )}
            </Text>
          </View>

          <Text style={styles.lightConsumedLabel}>
            {t(
              'mealScan.kcalConsumed',
              'kcal consumed',
            )}
          </Text>
        </View>

        <View style={styles.lightRemainingPill}>
          <Text style={styles.lightRemainingValue}>
            {remainingCalories}
          </Text>

          <Text style={styles.lightRemainingLabel}>
            {t(
              'mealScan.kcalLeft',
              'kcal left',
            )}
          </Text>
        </View>
      </View>

      <View style={styles.lightMacroList}>
        <MacroProgressRow
          short="P"
          label={t(
            'nutrition.protein',
            'Protein',
          )}
          current={totals.proteinG}
          target={target.proteinG}
          color="#FF7043"
        />

        <MacroProgressRow
          short="C"
          label={t(
            'nutrition.carb',
            'Carb',
          )}
          current={totals.carbsG}
          target={target.carbsG}
          color="#F7AE21"
        />

        <MacroProgressRow
          short="F"
          label={t(
            'nutrition.fat',
            'Fat',
          )}
          current={totals.fatsG}
          target={target.fatsG}
          color="#FF6C78"
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.lightScanButton}
        onPress={() =>
          navigation.navigate(
            'MealScanner',
          )
        }
      >
        <Text style={styles.lightScanIcon}>
          📷
        </Text>

        <Text style={styles.lightScanText}>
          {t(
            'mealScan.scanFood',
            'Scan food',
          )}
        </Text>

        <Text style={styles.lightScanArrow}>
          ›
        </Text>
      </TouchableOpacity>

      <View style={styles.homeQuickRow}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.homeQuickButton}
          onPress={() =>
            navigation.navigate(
              'MealReview',
              {
                foods: [],
                source: 'manual',
              },
            )
          }
        >
          <Text style={styles.homeQuickIcon}>＋</Text>
          <Text style={styles.homeQuickText}>
            {t(
              'mealScan.manual',
              'Manual',
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.homeQuickButton}
          onPress={() =>
            navigation.navigate(
              'FavoriteMeals',
            )
          }
        >
          <Text style={styles.homeQuickIcon}>♥</Text>
          <Text style={styles.homeQuickTextDark}>
            {t(
              'mealScan.favorites',
              'Favorites',
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.homeQuickButton}
          onPress={() =>
            navigation.navigate(
              'QuickAdd',
            )
          }
        >
          <Text style={styles.homeQuickIcon}>▦</Text>
          <Text style={styles.homeQuickTextDark}>
            {t(
              'mealScan.frequent',
              'Frequent',
            )}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const LightGuidanceCard:
React.FC<{
  tip: string;
}> = ({tip}) => {
  const {t} =
    useTranslation();

  return (
    <View style={styles.guidanceHeroCard}>
      <View style={styles.guidanceHeroBody}>
        <View style={styles.guidanceHeroTitleRow}>
          <View style={styles.guidanceBulb}>
            <Text style={styles.guidanceBulbText}>
              ✦
            </Text>
          </View>

          <Text style={styles.guidanceHeroTitle}>
            {t(
              'caloLens.todayAdvice',
              'Today’s guidance',
            )}
          </Text>
        </View>

        <Text
          style={styles.guidanceHeroText}
          numberOfLines={3}
        >
          {tip}
        </Text>
      </View>

      <View style={styles.guidanceImageWrap}>
        <View style={styles.guidanceOrangeHalo} />
        <Image
          source={GUIDANCE_FOOD_IMAGE}
          resizeMode="cover"
          style={styles.guidanceFoodImage}
        />
      </View>
    </View>
  );
};

const LightHydrationCard:
React.FC<{
  targetLiters: number;
  onPress: () => void;
}> = ({
  targetLiters,
  onPress,
}) => {
  const {t} =
    useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.lightHydrationCard}
      onPress={onPress}
    >
      <View style={styles.lightHydrationIcon}>
        <Text style={styles.lightHydrationIconText}>
          💧
        </Text>
      </View>

      <View style={styles.lightHydrationBody}>
        <Text style={styles.lightHydrationKicker}>
          {t(
            'nutrition.waterReminderKicker',
            'HYDRATION',
          )}
        </Text>

        <Text style={styles.lightHydrationTitle}>
          {t(
            'nutrition.waterTarget',
            'Water target',
          )}
        </Text>

        <Text style={styles.lightHydrationSubtitle}>
          {t(
            'caloLens.waterTargetBody',
            'Keep your daily hydration goal visible and easy to follow.',
          )}
        </Text>
      </View>

      <View style={styles.lightHydrationValueBox}>
        <Text style={styles.lightHydrationValue}>
          {targetLiters}
        </Text>

        <Text style={styles.lightHydrationUnit}>
          L
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const GoalEditor: React.FC<{
  visible: boolean;
  calories: string;
  water: string;
  onChangeCalories: (
    value: string,
  ) => void;
  onChangeWater: (
    value: string,
  ) => void;
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
}> = ({
  visible,
  calories,
  water,
  onChangeCalories,
  onChangeWater,
  onClose,
  onSave,
  onReset,
}) => {
  const {t} = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.modalWrap}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          <Text style={styles.modalKicker}>
            {t(
              'caloLens.customTarget',
              'CUSTOM TARGET',
            )}
          </Text>

          <Text style={styles.modalTitle}>
            {t(
              'caloLens.editDailyGoal',
              'Edit daily targets',
            )}
          </Text>

          <Text style={styles.modalDescription}>
            {t(
              'caloLens.editDailyGoalBody',
              'CaloLens will recalculate macros and meal suggestions from these targets.',
            )}
          </Text>

          <Text style={styles.inputLabel}>
            {t(
              'nutrition.calories',
              'Calories',
            )}
          </Text>

          <TextInput
            value={calories}
            onChangeText={
              onChangeCalories
            }
            keyboardType="number-pad"
            placeholder="2000"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>
            {t(
              'nutrition.water',
              'Water',
            )}{' '}
            ({t(
              'nutrition.liter',
              'L',
            )})
          </Text>

          <TextInput
            value={water}
            onChangeText={
              onChangeWater
            }
            keyboardType="decimal-pad"
            placeholder="2.5"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.resetButton}
              onPress={onReset}
            >
              <Text style={styles.resetText}>
                {t(
                  'nutrition.resetAuto',
                  'Auto',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                {t(
                  'common.cancel',
                  'Cancel',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.saveButton}
              onPress={onSave}
            >
              <Text style={styles.saveText}>
                {t(
                  'weight.save',
                  'Save',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const CaloLensHomeScreen:
React.FC = () => {
  const {t} =
    useTranslation();

  const navigation =
    useNavigation<any>();

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileInput | null>(
      null,
    );

  const [
    targetOverrides,
    setTargetOverrides,
  ] =
    useState<NutritionTargetOverrides>(
      {},
    );

  const [
    editorVisible,
    setEditorVisible,
  ] =
    useState(false);

  const [
    caloriesInput,
    setCaloriesInput,
  ] =
    useState('');

  const [
    waterInput,
    setWaterInput,
  ] =
    useState('');

  const loadData =
    useCallback(
      async () => {
        try {
          const [
            rawProfile,
            targets,
          ] =
            await Promise.all([
              AsyncStorage.getItem(
                PROFILE_KEY,
              ),
              loadNutritionTargets(),
            ]);

          setProfile(
            rawProfile
              ? JSON.parse(
                  rawProfile,
                )
              : null,
          );

          setTargetOverrides(
            targets,
          );
        } catch (error) {
          console.log(
            '[CaloLensHome] load error',
            error,
          );

          setProfile(null);
          setTargetOverrides(
            {},
          );
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const plan =
    useMemo(
      () =>
        buildNutritionPlan(
          profile,
          t as any,
          targetOverrides,
        ),
      [
        profile,
        t,
        targetOverrides,
      ],
    );

  const openGoalEditor =
    () => {
      if (!plan) {
        return;
      }

      setCaloriesInput(
        String(
          targetOverrides
            .calories ||
          plan.calories,
        ),
      );

      setWaterInput(
        String(
          targetOverrides
            .waterLiters ||
          plan.waterLiters,
        ),
      );

      setEditorVisible(true);
    };

  const saveGoalEditor =
    async () => {
      const calories =
        Number(
          caloriesInput.replace(
            ',',
            '.',
          ),
        );

      const water =
        Number(
          waterInput.replace(
            ',',
            '.',
          ),
        );

      const saved =
        await saveNutritionTargets({
          calories:
            Number.isFinite(
              calories,
            )
              ? calories
              : undefined,
          waterLiters:
            Number.isFinite(
              water,
            )
              ? water
              : undefined,
        });

      setTargetOverrides(saved);
      setEditorVisible(false);
    };

  const resetGoalEditor =
    async () => {
      await clearNutritionTargets();
      setTargetOverrides({});
      setEditorVisible(false);
    };

  const firstTip =
    plan?.tips?.[0] ||
    t(
      'caloLens.adviceFallback',
      'Log each meal and prioritize protein to make your daily target easier to reach.',
    );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF8F2"
        translucent={false}
      />

      <View
        pointerEvents="none"
        style={styles.topGlow}
      />

      <View
        pointerEvents="none"
        style={styles.bottomGlow}
      />

      <SafeAreaView
        edges={[
          'top',
          'left',
          'right',
        ]}
        style={styles.safe}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <View style={styles.hero}>
            <View
              pointerEvents="none"
              style={styles.heroDecorTop}
            />
            <View
              pointerEvents="none"
              style={styles.heroDecorDotOne}
            />
            <View
              pointerEvents="none"
              style={styles.heroDecorDotTwo}
            />

            <View style={styles.brandRow}>
              <View>
                <Text style={styles.brand}>
                  Calo
                  <Text style={styles.brandAccent}>
                    Lens
                  </Text>
                </Text>

                <Text style={styles.brandTag}>
                  {t(
                    'caloLens.brandTag',
                    'AI MEAL & CALORIE TRACKER',
                  )}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.86}
                style={styles.profileButton}
                onPress={() =>
                  navigation.navigate(
                    'UserProfile',
                  )
                }
              >
                <Text style={styles.profileIcon}>
                  👤
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>
                  {t(
                    'caloLens.homeTitle',
                    'Eat with a clear target',
                  )}
                </Text>

                <Text style={styles.heroSubtitle}>
                  {t(
                    'caloLens.homeSubtitle',
                    'Scan meals, track calories and adjust portions around your personal goal.',
                  )}
                </Text>
              </View>

              <View style={styles.heroFoodWrap}>
                <View style={styles.heroFoodHalo} />
                <Image
                  source={HERO_FOOD_IMAGE}
                  resizeMode="cover"
                  style={styles.heroFoodImage}
                />
              </View>
            </View>
          </View>

          <View style={styles.mainContent}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.discoverCard}
              onPress={() => navigation.navigate('TastePilotFeature')}
            >
              <View style={styles.discoverIconWrap}>
                <Text style={styles.discoverIcon}>🍽️</Text>
              </View>
              <View style={styles.discoverCopy}>
                <Text style={styles.discoverBadge}>
                  {t('caloLensDiscover.badge', 'AI DISCOVER')}
                </Text>
                <Text style={styles.discoverTitle}>
                  {t('caloLensDiscover.title', 'Discover meals')}
                </Text>
                <Text style={styles.discoverBody}>
                  {t('caloLensDiscover.body', 'Get meal ideas, local food and nearby places that fit your taste.')}
                </Text>
              </View>
              <Text style={styles.discoverArrow}>›</Text>
            </TouchableOpacity>

            {!plan ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>
                  ◎
                </Text>

                <Text style={styles.emptyTitle}>
                  {t(
                    'caloLens.completeProfile',
                    'Set up your calorie target',
                  )}
                </Text>

                <Text style={styles.emptyText}>
                  {t(
                    'caloLens.completeProfileBody',
                    'Enter age, height, weight, activity level and body goal to calculate your daily calories and macros.',
                  )}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'UserProfile',
                    )
                  }
                >
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    {t(
                      'caloLens.setupProfile',
                      'Set up profile',
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <LightDailyIntakeCard
                  target={{
                    calories:
                      plan.calories,
                    proteinG:
                      plan.proteinG,
                    carbsG:
                      plan.carbsG,
                    fatsG:
                      plan.fatsG,
                  }}
                />

                <LightGuidanceCard
                  tip={firstTip}
                />

                <NextMealCard
                  plan={plan}
                />

                <NutritionScoreCard
                  target={{
                    calories:
                      plan.calories,
                    proteinG:
                      plan.proteinG,
                    carbsG:
                      plan.carbsG,
                    fatsG:
                      plan.fatsG,
                  }}
                />

                <FrequentMealsCard />

                <Text style={styles.sectionTitle}>
                  {t(
                    'caloLens.quickActions',
                    'Quick actions',
                  )}
                </Text>

                <View style={styles.quickGrid}>
                  <QuickAction
                    icon="📷"
                    title={t(
                      'caloLens.scanMeal',
                      'Scan meal',
                    )}
                    subtitle={t(
                      'caloLens.scanMealBody',
                      'Estimate calories and macros from a photo.',
                    )}
                    accent={NEON}
                    onPress={() =>
                      navigation.navigate(
                        'MealScanner',
                      )
                    }
                  />

                  <QuickAction
                    icon="📖"
                    title={t(
                      'caloLens.foodLog',
                      'Food log',
                    )}
                    subtitle={t(
                      'caloLens.foodLogBody',
                      'Review meals and daily totals.',
                    )}
                    accent={CYAN}
                    onPress={() =>
                      navigation.navigate(
                        'MealLog',
                      )
                    }
                  />

                  <QuickAction
                    icon="◎"
                    title={t(
                      'caloLens.fullPlan',
                      'Nutrition plan',
                    )}
                    subtitle={t(
                      'caloLens.fullPlanBody',
                      'View targets, macros and meal suggestions.',
                    )}
                    accent={YELLOW}
                    onPress={() =>
                      navigation.navigate(
                        'NutritionPlan',
                      )
                    }
                  />

                  <QuickAction
                    icon="⚙️"
                    title={t(
                      'caloLens.editTargets',
                      'Edit targets',
                    )}
                    subtitle={t(
                      'caloLens.editTargetsBody',
                      'Adjust daily calories and water.',
                    )}
                    accent={BLUE}
                    onPress={
                      openGoalEditor
                    }
                  />
                </View>

                <View style={styles.targetCard}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardKicker}>
                        {t(
                          'caloLens.personalTarget',
                          'PERSONAL TARGET',
                        )}
                      </Text>

                      <Text style={styles.cardTitle}>
                        {t(
                          'caloLens.dailyTargets',
                          'Daily targets',
                        )}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={
                        openGoalEditor
                      }
                    >
                      <Text style={styles.editText}>
                        {t(
                          'nutrition.edit',
                          'Edit',
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calorieTarget}>
                    <Text
                      style={
                        styles.calorieTargetValue
                      }
                    >
                      {plan.calories}
                    </Text>

                    <Text
                      style={
                        styles.calorieTargetUnit
                      }
                    >
                      {t(
                        'nutrition.kcal',
                        'kcal',
                      )}
                    </Text>
                  </View>

                  <TargetMetric
                    label={t(
                      'nutrition.protein',
                      'Protein',
                    )}
                    value={`${plan.proteinG} g`}
                    accent={BLUE}
                  />

                  <TargetMetric
                    label={t(
                      'nutrition.carb',
                      'Carb',
                    )}
                    value={`${plan.carbsG} g`}
                    accent={NEON}
                  />

                  <TargetMetric
                    label={t(
                      'nutrition.fat',
                      'Fat',
                    )}
                    value={`${plan.fatsG} g`}
                    accent={YELLOW}
                  />

                  <TargetMetric
                    label={t(
                      'nutrition.water',
                      'Water',
                    )}
                    value={`${plan.waterLiters} L`}
                    accent={CYAN}
                  />
                </View>

                <LightHydrationCard
                  targetLiters={
                    plan.waterLiters
                  }
                  onPress={() =>
                    navigation.navigate(
                      'NutritionPlan',
                    )
                  }
                />

                <TouchableOpacity
                  activeOpacity={0.86}
                  style={
                    styles.fullPlanButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      'AdvancedMealPlan',
                    )
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.fullPlanTitle
                      }
                    >
                      {t(
                        'caloLens.advancedPlan',
                        'Advanced meal plan',
                      )}
                    </Text>

                    <Text
                      style={
                        styles.fullPlanSubtitle
                      }
                    >
                      {t(
                        'caloLens.advancedPlanBody',
                        'Open detailed meal groups and calorie distribution.',
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.fullPlanArrow
                    }
                  >
                    ›
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <GoalEditor
        visible={editorVisible}
        calories={caloriesInput}
        water={waterInput}
        onChangeCalories={
          setCaloriesInput
        }
        onChangeWater={
          setWaterInput
        }
        onClose={() =>
          setEditorVisible(false)
        }
        onSave={saveGoalEditor}
        onReset={
          resetGoalEditor
        }
      />
    </View>
  );
};

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: BG,
    },
    safe: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: 155,
    },
    topGlow: {
      position: 'absolute',
      top: -120,
      right: -100,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor:
        'rgba(255, 90, 31, 0.10)',
    },
    bottomGlow: {
      position: 'absolute',
      bottom: 20,
      left: -120,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor:
        'rgba(244, 123, 53, 0.07)',
    },
    hero: {
      height: 305,
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 28,
      justifyContent: 'space-between',
      overflow: 'hidden',
      backgroundColor: '#FFF9F3',
    },
    heroDecorTop: {
      position: 'absolute',
      top: -90,
      right: -65,
      width: 225,
      height: 225,
      borderRadius: 112,
      backgroundColor: '#FFE6CF',
      transform: [
        {rotate: '14deg'},
      ],
    },
    heroDecorDotOne: {
      position: 'absolute',
      top: 104,
      right: 188,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#FF7A23',
      opacity: 0.85,
    },
    heroDecorDotTwo: {
      position: 'absolute',
      top: 132,
      right: 211,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#F8B329',
      opacity: 0.9,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 4,
    },
    brand: {
      color: TEXT,
      fontSize: 29,
      fontWeight: '900',
      letterSpacing: -1,
    },
    brandAccent: {
      color: NEON,
    },
    brandTag: {
      color: '#A45A34',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.15,
      marginTop: 1,
    },
    profileButton: {
      width: 45,
      height: 45,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#F4D4C1',
      shadowColor: '#9B6849',
      shadowOpacity: 0.13,
      shadowRadius: 9,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    profileIcon: {
      fontSize: 19,
    },
    heroBody: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      position: 'relative',
    },
    heroTextBlock: {
      width: '58%',
      paddingTop: 4,
      zIndex: 3,
    },
    heroTitle: {
      color: TEXT,
      fontSize: 31,
      lineHeight: 35,
      fontWeight: '900',
      letterSpacing: -0.9,
      marginTop: 3,
    },
    heroSubtitle: {
      color: '#554C45',
      fontSize: 12.5,
      lineHeight: 18,
      fontWeight: '600',
      marginTop: 10,
      maxWidth: 205,
    },
    heroFoodWrap: {
      position: 'absolute',
      right: -25,
      bottom: -22,
      width: 190,
      height: 190,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    heroFoodHalo: {
      position: 'absolute',
      right: -24,
      bottom: -30,
      width: 196,
      height: 196,
      borderRadius: 98,
      backgroundColor: '#FF7A23',
      transform: [
        {rotate: '-12deg'},
      ],
    },
    heroFoodImage: {
      width: 166,
      height: 166,
      borderRadius: 83,
      borderWidth: 4,
      borderColor: '#FFF7EF',
      shadowColor: '#9C5D33',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 5,
    },
    mainContent: {
      marginTop: -16,
      paddingHorizontal: 12,
    },
    discoverCard: {
      marginTop: 12,
      marginBottom: 8,
      borderRadius: 24,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF1E6',
      borderWidth: 1,
      borderColor: '#FFD1B7',
      shadowColor: '#B9896E',
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: {width: 0, height: 6},
      elevation: 3,
    },
    discoverIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: '#FF5A1F',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },
    discoverIcon: {fontSize: 27},
    discoverCopy: {flex: 1},
    discoverBadge: {fontSize: 10, fontWeight: '900', letterSpacing: 1.2, color: '#C84E20'},
    discoverTitle: {fontSize: 18, lineHeight: 23, fontWeight: '900', color: '#21170F', marginTop: 3},
    discoverBody: {fontSize: 12, lineHeight: 18, color: '#78695F', marginTop: 4},
    discoverArrow: {fontSize: 28, fontWeight: '900', color: '#FF5A1F', marginLeft: 8},

    sectionTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 6,
      marginBottom: 11,
      paddingHorizontal: 4,
    },
    quickGrid: {
      marginBottom: 12,
    },
    quickAction: {
      minHeight: 78,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginBottom: 8,
      shadowColor: '#B89079',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },
    quickIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    quickIconText: {
      fontSize: 20,
    },
    quickBody: {
      flex: 1,
    },
    quickTitle: {
      color: TEXT,
      fontSize: 15,
      fontWeight: '900',
    },
    quickSubtitle: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
    },
    quickArrow: {
      fontSize: 28,
      lineHeight: 30,
      marginLeft: 8,
    },
    emptyCard: {
      backgroundColor: CARD,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(255, 90, 31, 0.30)',
      padding: 18,
      shadowColor: '#B89079',
      shadowOpacity: 0.10,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },
    emptyIcon: {
      color: NEON,
      fontSize: 38,
      fontWeight: '900',
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 12,
    },
    emptyText: {
      color: MUTED,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
    },
    primaryButton: {
      backgroundColor: NEON,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 16,
    },
    primaryButtonText: {
      color: '#10230F',
      fontSize: 14,
      fontWeight: '900',
    },
    lightIntakeCard: {
      backgroundColor: CARD,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: '#F3E2D6',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 14,
      marginBottom: 12,
      shadowColor: '#A56B46',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      elevation: 4,
    },
    lightIntakeHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    lightKicker: {
      color: NEON,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    lightIntakeTitle: {
      color: TEXT,
      fontSize: 23,
      lineHeight: 28,
      fontWeight: '900',
      marginTop: 2,
      letterSpacing: -0.5,
    },
    lightViewLog: {
      color: NEON,
      fontSize: 12.5,
      fontWeight: '900',
      marginTop: 7,
    },
    intakeSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
    },
    calorieRingWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    calorieRingCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    calorieRingPercent: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    intakeSummaryBody: {
      flex: 1,
      paddingHorizontal: 11,
    },
    lightCalorieLine: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'nowrap',
    },
    lightConsumedValue: {
      color: '#4DAE39',
      fontSize: 30,
      lineHeight: 34,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    lightTargetValue: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
    },
    lightConsumedLabel: {
      color: MUTED,
      fontSize: 10.5,
      marginTop: 2,
      fontWeight: '600',
    },
    lightRemainingPill: {
      minWidth: 78,
      backgroundColor: '#FFF4E8',
      borderWidth: 1,
      borderColor: '#F6DEC7',
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lightRemainingValue: {
      color: TEXT,
      fontSize: 16,
      lineHeight: 19,
      fontWeight: '900',
    },
    lightRemainingLabel: {
      color: MUTED,
      fontSize: 9.5,
      fontWeight: '700',
      marginTop: 1,
    },
    lightProgressTrack: {
      height: 7,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: '#F2ECE7',
    },
    lightProgressFill: {
      height: '100%',
      borderRadius: 999,
    },
    lightMacroList: {
      marginTop: 16,
    },
    lightMacroRow: {
      marginBottom: 11,
    },
    lightMacroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    lightMacroNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lightMacroBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    lightMacroBadgeText: {
      fontSize: 10,
      fontWeight: '900',
    },
    lightMacroLabel: {
      color: '#4F4A45',
      fontSize: 12,
      fontWeight: '800',
    },
    lightMacroValue: {
      color: TEXT,
      fontSize: 11.5,
      fontWeight: '900',
    },
    lightMacroBarOffset: {
      marginLeft: 32,
    },
    lightScanButton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      borderRadius: 18,
      marginTop: 7,
      shadowColor: NEON,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 4,
    },
    lightScanIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    lightScanText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
    },
    lightScanArrow: {
      position: 'absolute',
      right: 18,
      color: '#FFFFFF',
      fontSize: 26,
      lineHeight: 28,
      fontWeight: '500',
    },
    homeQuickRow: {
      flexDirection: 'row',
      marginHorizontal: -3,
      marginTop: 10,
    },
    homeQuickButton: {
      flex: 1,
      minHeight: 42,
      marginHorizontal: 3,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#F2DCCB',
      backgroundColor: '#FFFDFB',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    homeQuickIcon: {
      color: NEON,
      fontSize: 14,
      fontWeight: '900',
      marginRight: 4,
    },
    homeQuickText: {
      color: NEON,
      fontSize: 10.5,
      fontWeight: '900',
    },
    homeQuickTextDark: {
      color: TEXT,
      fontSize: 10.5,
      fontWeight: '800',
    },
    guidanceHeroCard: {
      minHeight: 126,
      flexDirection: 'row',
      overflow: 'hidden',
      backgroundColor: '#FFF2CE',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#F7DFA4',
      marginBottom: 14,
      shadowColor: '#D49B43',
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },
    guidanceHeroBody: {
      flex: 1,
      paddingLeft: 16,
      paddingTop: 15,
      paddingBottom: 14,
      paddingRight: 3,
      zIndex: 3,
    },
    guidanceHeroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    guidanceBulb: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#FFE5A1',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    guidanceBulbText: {
      color: '#F5A800',
      fontSize: 15,
      fontWeight: '900',
    },
    guidanceHeroTitle: {
      color: '#68410B',
      fontSize: 15,
      fontWeight: '900',
    },
    guidanceHeroText: {
      color: '#6B5A45',
      fontSize: 11.5,
      lineHeight: 17,
      marginTop: 9,
      paddingRight: 4,
    },
    guidanceImageWrap: {
      width: 132,
      position: 'relative',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    guidanceOrangeHalo: {
      position: 'absolute',
      right: -46,
      bottom: -54,
      width: 176,
      height: 176,
      borderRadius: 88,
      backgroundColor: '#FFC35A',
      opacity: 0.36,
    },
    guidanceFoodImage: {
      width: 122,
      height: 106,
      borderTopLeftRadius: 55,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 22,
    },
    targetCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.22)',
      padding: 14,
      marginBottom: 12,
      shadowColor: '#B89079',
      shadowOpacity: 0.07,
      shadowRadius: 9,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    cardKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    cardTitle: {
      color: TEXT,
      fontSize: 19,
      fontWeight: '900',
      marginTop: 3,
    },
    editText: {
      color: NEON,
      fontSize: 13,
      fontWeight: '900',
    },
    calorieTarget: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 15,
      marginBottom: 12,
    },
    calorieTargetValue: {
      color: NEON,
      fontSize: 38,
      lineHeight: 41,
      fontWeight: '900',
    },
    calorieTargetUnit: {
      color: MUTED,
      fontSize: 13,
      fontWeight: '800',
      marginLeft: 7,
      marginBottom: 5,
    },
    targetMetric: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 38,
      borderTopWidth: 1,
      borderTopColor: '#E9EEE7',
    },
    metricDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 9,
    },
    metricLabel: {
      flex: 1,
      color: MUTED,
      fontSize: 12,
      fontWeight: '800',
    },
    metricValue: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    adviceCard: {
      backgroundColor: '#FFF9E8',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#F0DBA2',
      padding: 14,
      marginBottom: 12,
    },
    adviceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    adviceIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF0B8',
      marginRight: 10,
    },
    adviceIconText: {
      color: YELLOW,
      fontSize: 17,
      fontWeight: '900',
    },
    adviceTitle: {
      color: '#8B6500',
      fontSize: 15,
      fontWeight: '900',
    },
    adviceText: {
      color: '#4A514B',
      fontSize: 13,
      lineHeight: 20,
      marginTop: 11,
    },
    lightHydrationCard: {
      minHeight: 90,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F1FBFA',
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.22)',
      padding: 13,
      marginBottom: 12,
    },
    lightHydrationIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 147, 80, 0.11)',
      marginRight: 11,
    },
    lightHydrationIconText: {
      fontSize: 21,
    },
    lightHydrationBody: {
      flex: 1,
    },
    lightHydrationKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    lightHydrationTitle: {
      color: TEXT,
      fontSize: 15,
      fontWeight: '900',
      marginTop: 2,
    },
    lightHydrationSubtitle: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    lightHydrationValueBox: {
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        'rgba(255, 147, 80, 0.18)',
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginLeft: 9,
    },
    lightHydrationValue: {
      color: BLUE,
      fontSize: 20,
      fontWeight: '900',
    },
    lightHydrationUnit: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '800',
      marginTop: 1,
    },
    fullPlanButton: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      backgroundColor: CARD,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        'rgba(255, 90, 31, 0.22)',
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
      shadowColor: '#B89079',
      shadowOpacity: 0.07,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },
    fullPlanTitle: {
      color: TEXT,
      fontSize: 15,
      fontWeight: '900',
    },
    fullPlanSubtitle: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 4,
      maxWidth: 280,
    },
    fullPlanArrow: {
      color: NEON,
      fontSize: 30,
      marginLeft: 8,
    },
    modalWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(20, 30, 22, 0.30)',
    },
    modalCard: {
      width: '100%',
      backgroundColor: CARD,
      borderRadius: 23,
      borderWidth: 1,
      borderColor:
        'rgba(255, 90, 31, 0.28)',
      padding: 17,
      shadowColor: '#657168',
      shadowOpacity: 0.16,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 7,
    },
    modalKicker: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    modalTitle: {
      color: TEXT,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 4,
    },
    modalDescription: {
      color: MUTED,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
      marginBottom: 15,
    },
    inputLabel: {
      color: '#5F544D',
      fontSize: 12,
      fontWeight: '900',
      marginBottom: 7,
    },
    input: {
      minHeight: 48,
      borderRadius: 15,
      backgroundColor: CARD_2,
      borderWidth: 1,
      borderColor: BORDER,
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
      paddingHorizontal: 13,
      marginBottom: 13,
    },
    modalActions: {
      flexDirection: 'row',
      marginTop: 3,
    },
    resetButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.32)',
      backgroundColor:
        'rgba(244, 123, 53, 0.08)',
      paddingVertical: 12,
      alignItems: 'center',
      marginRight: 4,
    },
    resetText: {
      color: CYAN,
      fontWeight: '900',
    },
    cancelButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: CARD_2,
      paddingVertical: 12,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    cancelText: {
      color: TEXT,
      fontWeight: '900',
    },
    saveButton: {
      flex: 1,
      borderRadius: 14,
      backgroundColor: NEON,
      paddingVertical: 12,
      alignItems: 'center',
      marginLeft: 4,
    },
    saveText: {
      color: '#10230F',
      fontWeight: '900',
    },
  });

export default CaloLensHomeScreen;
