// FILE: src/screens/CaloLensHomeScreen.tsx
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ImageBackground,
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

const HERO_IMAGE =
  require(
    '../../assets/images/nutrition_hero.png',
  );

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#F0F5ED';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';
const YELLOW = '#D99A00';
const BLUE = '#2B82D9';
const PINK = '#D85E78';
const BORDER = '#DDE8D9';
const TRACK = '#E8EEE5';

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

const MacroProgressRow:
React.FC<{
  label: string;
  current: number;
  target: number;
  color: string;
}> = ({
  label,
  current,
  target,
  color,
}) => (
  <View style={styles.lightMacroRow}>
    <View style={styles.lightMacroHeader}>
      <Text style={styles.lightMacroLabel}>
        {label}
      </Text>

      <Text style={styles.lightMacroValue}>
        {Math.round(current)}
        {' / '}
        {Math.round(target)}
        g
      </Text>
    </View>

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

  const remainingProtein =
    Math.max(
      0,
      Math.round(
        target.proteinG -
        totals.proteinG,
      ),
    );

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
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lightCalorieRow}>
        <View>
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
          <Text style={styles.lightRemainingText}>
            {remainingCalories}{' '}
            {t(
              'mealScan.kcalLeft',
              'kcal left',
            )}
          </Text>
        </View>
      </View>

      <ProgressBar
        progress={
          calorieProgress
        }
        color={NEON}
      />

      <View style={styles.lightMacroList}>
        <MacroProgressRow
          label={t(
            'nutrition.protein',
            'Protein',
          )}
          current={
            totals.proteinG
          }
          target={
            target.proteinG
          }
          color={BLUE}
        />

        <MacroProgressRow
          label={t(
            'nutrition.carb',
            'Carb',
          )}
          current={
            totals.carbsG
          }
          target={
            target.carbsG
          }
          color={CYAN}
        />

        <MacroProgressRow
          label={t(
            'nutrition.fat',
            'Fat',
          )}
          current={
            totals.fatsG
          }
          target={
            target.fatsG
          }
          color={YELLOW}
        />
      </View>

      <View style={styles.lightActionRow}>
        <TouchableOpacity
          activeOpacity={0.88}
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
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.lightManualButton}
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
          <Text style={styles.lightManualText}>
            ＋{' '}
            {t(
              'mealScan.manual',
              'Manual',
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.lightAdviceBox}>
        <View style={styles.lightAdviceHeading}>
          <View style={styles.lightAdviceIcon}>
            <Text style={styles.lightAdviceIconText}>
              ✦
            </Text>
          </View>

          <Text style={styles.lightAdviceTitle}>
            {t(
              'caloLens.todayAdvice',
              'Today’s guidance',
            )}
          </Text>
        </View>

        <Text style={styles.lightAdviceLine}>
          •{' '}
          {remainingCalories > 0
            ? t(
                'mealScan.remainingCaloriesAdvice',
                {
                  count:
                    remainingCalories,
                  defaultValue:
                    'You still have about {{count}} kcal available today. Prioritize a balanced meal.',
                },
              )
            : t(
                'mealScan.calorieGoalReachedAdvice',
                'You have reached your calorie target. Keep the rest of the day light and balanced.',
              )}
        </Text>

        <Text style={styles.lightAdviceLine}>
          •{' '}
          {remainingProtein > 0
            ? t(
                'mealScan.remainingProteinAdvice',
                {
                  count:
                    remainingProtein,
                  defaultValue:
                    'You still need about {{count}} g protein. Consider lean meat, fish, eggs, yogurt or whey.',
                },
              )
            : t(
                'mealScan.proteinGoalReachedAdvice',
                'Your protein target is on track today.',
              )}
        </Text>
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
        backgroundColor="#F5F8F2"
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
          <ImageBackground
            source={HERO_IMAGE}
            resizeMode="cover"
            style={styles.hero}
            imageStyle={
              styles.heroImage
            }
          >
            <View
              style={
                styles.heroOverlay
              }
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
                <Text
                  style={
                    styles.profileIcon
                  }
                >
                  👤
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroKicker}>
                {t(
                  'caloLens.homeKicker',
                  'YOUR DAILY NUTRITION',
                )}
              </Text>

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
          </ImageBackground>

          <View style={styles.mainContent}>
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

                <View style={styles.adviceCard}>
                  <View style={styles.adviceHeader}>
                    <View style={styles.adviceIcon}>
                      <Text
                        style={
                          styles.adviceIconText
                        }
                      >
                        ✦
                      </Text>
                    </View>

                    <Text style={styles.adviceTitle}>
                      {t(
                        'caloLens.todayAdvice',
                        'Today’s guidance',
                      )}
                    </Text>
                  </View>

                  <Text style={styles.adviceText}>
                    {firstTip}
                  </Text>
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
        'rgba(99, 201, 52, 0.10)',
    },
    bottomGlow: {
      position: 'absolute',
      bottom: 20,
      left: -120,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor:
        'rgba(24, 163, 155, 0.07)',
    },
    hero: {
      height: 325,
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 35,
      justifyContent:
        'space-between',
      overflow: 'hidden',
      backgroundColor: '#EEF4EA',
    },
    heroImage: {
      opacity: 0.46,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(248, 251, 246, 0.57)',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    brand: {
      color: TEXT,
      fontSize: 27,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    brandAccent: {
      color: NEON,
    },
    brandTag: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.05,
      marginTop: 2,
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.33)',
      shadowColor: '#748578',
      shadowOpacity: 0.13,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    profileIcon: {
      fontSize: 18,
    },
    heroTextBlock: {
      maxWidth: 335,
    },
    heroKicker: {
      color: CYAN,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1,
    },
    heroTitle: {
      color: TEXT,
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
      letterSpacing: -0.8,
      marginTop: 8,
    },
    heroSubtitle: {
      color: '#445048',
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '600',
      marginTop: 9,
      maxWidth: 320,
    },
    mainContent: {
      marginTop: -22,
      paddingHorizontal: 8,
    },
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
      shadowColor: '#879487',
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
        'rgba(99, 201, 52, 0.30)',
      padding: 18,
      shadowColor: '#879487',
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
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.26)',
      padding: 16,
      marginBottom: 14,
      shadowColor: '#7C8B7E',
      shadowOpacity: 0.11,
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
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    lightIntakeTitle: {
      color: TEXT,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 4,
    },
    lightViewLog: {
      color: NEON,
      fontSize: 13,
      fontWeight: '900',
      marginTop: 5,
    },
    lightCalorieRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 18,
      marginBottom: 11,
    },
    lightCalorieLine: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    lightConsumedValue: {
      color: NEON,
      fontSize: 36,
      lineHeight: 40,
      fontWeight: '900',
    },
    lightTargetValue: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
    },
    lightConsumedLabel: {
      color: MUTED,
      fontSize: 11,
      marginTop: 3,
    },
    lightRemainingPill: {
      backgroundColor:
        'rgba(99, 201, 52, 0.11)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.30)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 10,
    },
    lightRemainingText: {
      color: '#4D9C29',
      fontSize: 11,
      fontWeight: '900',
    },
    lightProgressTrack: {
      height: 9,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: TRACK,
    },
    lightProgressFill: {
      height: '100%',
      borderRadius: 999,
    },
    lightMacroList: {
      marginTop: 17,
    },
    lightMacroRow: {
      marginBottom: 13,
    },
    lightMacroHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 7,
    },
    lightMacroLabel: {
      color: MUTED,
      fontSize: 12,
      fontWeight: '800',
    },
    lightMacroValue: {
      color: TEXT,
      fontSize: 12,
      fontWeight: '900',
    },
    lightActionRow: {
      flexDirection: 'row',
      marginTop: 7,
      marginHorizontal: -4,
    },
    lightScanButton: {
      flex: 1.4,
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      borderRadius: 999,
      marginHorizontal: 4,
      shadowColor: NEON,
      shadowOpacity: 0.20,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 4,
    },
    lightScanIcon: {
      fontSize: 15,
      marginRight: 7,
    },
    lightScanText: {
      color: '#10230F',
      fontSize: 14,
      fontWeight: '900',
    },
    lightManualButton: {
      flex: 1,
      minHeight: 52,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7FAF5',
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.32)',
      marginHorizontal: 4,
    },
    lightManualText: {
      color: CYAN,
      fontSize: 13,
      fontWeight: '900',
    },
    lightAdviceBox: {
      backgroundColor: '#FFF9E8',
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#F1D99A',
      padding: 13,
      marginTop: 14,
    },
    lightAdviceHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    lightAdviceIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF0B8',
      marginRight: 8,
    },
    lightAdviceIconText: {
      color: YELLOW,
      fontSize: 15,
      fontWeight: '900',
    },
    lightAdviceTitle: {
      color: '#8B6500',
      fontSize: 14,
      fontWeight: '900',
    },
    lightAdviceLine: {
      color: '#4C504B',
      fontSize: 12,
      lineHeight: 19,
      marginTop: 3,
    },
    targetCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.22)',
      padding: 14,
      marginBottom: 12,
      shadowColor: '#879487',
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
        'rgba(24, 163, 155, 0.22)',
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
        'rgba(43, 130, 217, 0.11)',
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
        'rgba(43, 130, 217, 0.18)',
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
        'rgba(99, 201, 52, 0.22)',
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 10,
      shadowColor: '#879487',
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
        'rgba(99, 201, 52, 0.28)',
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
      color: '#455047',
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
        'rgba(24, 163, 155, 0.32)',
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
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
