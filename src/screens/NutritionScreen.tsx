import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import {
  useFocusEffect,
  useNavigation,
  CommonActions,
} from '@react-navigation/native';

import { buildNutritionPlan } from '../nutrition/nutritionPlanner';
import { ProfileInput } from '../recommendation/programRecommender';
import {
  loadNutritionTargets,
  saveNutritionTargets,
  clearNutritionTargets,
  type NutritionTargetOverrides,
} from '../nutrition/nutritionTargets';
import { markNutritionTipRead } from '../services/gamification';

const PROFILE_KEY = 'user:profile';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#F0F5ED';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

const BLUE = '#2B82D9';
const YELLOW = '#D99A00';
const PURPLE = '#8B5FC6';

const ILLUSTRATIONS = {
  hero: require('../../assets/images/nutrition_hero.png'),
  breakfast: require('../../assets/images/meal_breakfast.png'),
  lunch: require('../../assets/images/meal_lunch.png'),
  dinner: require('../../assets/images/meal_dinner.png'),
  snack: require('../../assets/images/meal_snack.png'),
};
const clamp = (value: number) => Math.max(0, Math.min(100, value));

const ProgressRing: React.FC<{
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  children?: React.ReactNode;
}> = ({ size, strokeWidth, progress, color, children }) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = clamp(progress);
  const dash = (safeProgress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={size} height={size}>
        <G rotation="-90" originX={center} originY={center}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(109, 120, 111, 0.18)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            fill="transparent"
          />
        </G>
      </Svg>

      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
};

const MacroDonut: React.FC<{
  protein: number;
  carbs: number;
  fats: number;
}> = ({ protein, carbs, fats }) => {
  const size = 116;
  const strokeWidth = 17;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: protein, color: BLUE },
    { value: carbs, color: '#63C934' },
    { value: fats, color: YELLOW },
    { value: Math.max(0, 100 - protein - carbs - fats), color: PURPLE },
  ];

  let offset = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={size} height={size}>
        <G rotation="-90" originX={center} originY={center}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(109, 120, 111, 0.16)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {segments.map((seg, index) => {
            const dash = (clamp(seg.value) / 100) * circumference;
            const dashOffset = -offset;
            offset += dash;

            if (seg.value <= 0) return null;

            return (
              <Circle
                key={`${seg.color}-${index}`}
                cx={center}
                cy={center}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            );
          })}
        </G>
      </Svg>

      <View style={styles.donutHole} />
    </View>
  );
};

const MacroLegendRow: React.FC<{
  color: string;
  label: string;
  percent: number;
  grams: number;
}> = ({ color, label, percent, grams }) => {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />

      <Text style={styles.legendLabel}>{label}</Text>

      <Text style={styles.legendValue}>
        {percent}% ({grams}g)
      </Text>
    </View>
  );
};

const GoalRingCard: React.FC<{
  title: string;
  value: string | number;
  unit: string;
  color: string;
  progress: number;
}> = ({ title, value, unit, color, progress }) => {
  return (
    <View style={styles.goalCard}>
      <Text style={styles.goalTitle}>{title}</Text>

      <ProgressRing
        size={112}
        strokeWidth={8}
        progress={progress}
        color={color}
      >
        <Text style={styles.goalValue}>{value}</Text>
        <Text style={styles.goalUnit}>{unit}</Text>
      </ProgressRing>
    </View>
  );
};

const MealCard: React.FC<{
  title: string;
  image: any;
}> = ({ title, image }) => {
  return (
    <View style={styles.mealCard}>
      <ImageBackground
        source={image}
        style={styles.mealImage}
        imageStyle={styles.mealImageStyle}
        resizeMode="cover"
      >
        <View style={styles.mealShade} />
      </ImageBackground>

      <Text style={styles.mealName} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
};
const DailyGoalEditModal: React.FC<{
  visible: boolean;
  caloriesValue: string;
  waterValue: string;
  onChangeCalories: (value: string) => void;
  onChangeWater: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onReset: () => void;
  t: (key: string, defaultValue?: string, options?: any) => string;
}> = ({
  visible,
  caloriesValue,
  waterValue,
  onChangeCalories,
  onChangeWater,
  onClose,
  onSave,
  onReset,
  t,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalWrap}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          <Text style={styles.modalKicker}>
            {t('nutrition.customTargetKicker', 'CUSTOM TARGET')}
          </Text>

          <Text style={styles.modalTitle}>
            {t('nutrition.editDailyGoals', 'Edit daily goals')}
          </Text>

          <Text style={styles.modalDesc}>
            {t(
              'nutrition.editDailyGoalsDesc',
              'Change calories or water target. The app will recalculate macros and meal suggestions automatically.',
            )}
          </Text>

          <Text style={styles.inputLabel}>
            {t('nutrition.calories', 'Calories')}
          </Text>

          <TextInput
            value={caloriesValue}
            onChangeText={onChangeCalories}
            keyboardType="number-pad"
            placeholder="2000"
            placeholderTextColor="#8A948C"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>
            {t('nutrition.water', 'Water')} ({t('nutrition.liter', 'L')})
          </Text>

          <TextInput
            value={waterValue}
            onChangeText={onChangeWater}
            keyboardType="decimal-pad"
            placeholder="2.5"
            placeholderTextColor="#8A948C"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.modalBtn, styles.modalBtnGhost]}
              onPress={onReset}
            >
              <Text style={styles.modalBtnGhostText}>
                {t('nutrition.resetAuto', 'Auto')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.modalBtn, styles.modalBtnCancel]}
              onPress={onClose}
            >
              <Text style={styles.modalBtnCancelText}>
                {t('common.cancel', 'Cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.modalBtn, styles.modalBtnSave]}
              onPress={onSave}
            >
              <Text style={styles.modalBtnSaveText}>
                {t('weight.save', 'Save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
export const NutritionScreen: React.FC = () => {
  const { t } = useTranslation();
const navigation = useNavigation<any>();
const [targetOverrides, setTargetOverrides] =
  useState<NutritionTargetOverrides>({});

const [showGoalEditor, setShowGoalEditor] = useState(false);
const [caloriesInput, setCaloriesInput] = useState('');
const [waterInput, setWaterInput] = useState('');
const openAdvancedMealPlan = () => {
  const currentRouteNames = navigation.getState?.()?.routeNames || [];

  if (currentRouteNames.includes('AdvancedMealPlan')) {
    navigation.navigate('AdvancedMealPlan');
    return;
  }

  const parent = navigation.getParent?.();
  const parentRouteNames = parent?.getState?.()?.routeNames || [];

  if (parentRouteNames.includes('Nutrition')) {
    parent.navigate('Nutrition', {
      screen: 'AdvancedMealPlan',
    });
    return;
  }

  navigation.dispatch(
    CommonActions.navigate({
      name: 'Nutrition',
      params: {
        screen: 'AdvancedMealPlan',
      },
    }),
  );
};
  const [profile, setProfile] = useState<ProfileInput | null>(null);
useFocusEffect(
  useCallback(() => {
    markNutritionTipRead();
  }, []),
);
useFocusEffect(
  useCallback(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        setProfile(raw ? JSON.parse(raw) : null);

        const savedTargets = await loadNutritionTargets();
        setTargetOverrides(savedTargets);
      } catch {
        setProfile(null);
        setTargetOverrides({});
      }
    })();
  }, []),
);

const plan = useMemo(
  () => buildNutritionPlan(profile, t as any, targetOverrides),
  [profile, t, targetOverrides],
);
const openGoalEditor = () => {
  if (!plan) return;

  setCaloriesInput(String(targetOverrides.calories || plan.calories));
  setWaterInput(String(targetOverrides.waterLiters || plan.waterLiters));
  setShowGoalEditor(true);
};

const saveGoalEditor = async () => {
  const nextCalories = Number(caloriesInput.replace(',', '.'));
  const nextWater = Number(waterInput.replace(',', '.'));

  const saved = await saveNutritionTargets({
    calories: Number.isFinite(nextCalories) ? nextCalories : undefined,
    waterLiters: Number.isFinite(nextWater) ? nextWater : undefined,
  });

  setTargetOverrides(saved);
  setShowGoalEditor(false);
};

const resetGoalEditor = async () => {
  await clearNutritionTargets();
  setTargetOverrides({});
  setShowGoalEditor(false);
};

  const macroStats = useMemo(() => {
    if (!plan) {
      return {
        proteinPercent: 0,
        carbsPercent: 0,
        fatsPercent: 0,
      };
    }

    const total = plan.proteinG * 4 + plan.carbsG * 4 + plan.fatsG * 9;

    if (!total) {
      return {
        proteinPercent: 0,
        carbsPercent: 0,
        fatsPercent: 0,
      };
    }

    return {
      proteinPercent: clamp(Math.round((plan.proteinG * 4 * 100) / total)),
      carbsPercent: clamp(Math.round((plan.carbsG * 4 * 100) / total)),
      fatsPercent: clamp(Math.round((plan.fatsG * 9 * 100) / total)),
    };
  }, [plan]);

  const firstTip =
    plan?.tips?.[0] ||
    t(
      'nutrition.tipFallback',
      'Drink enough water and prioritize protein-rich foods to support muscle recovery.',
    );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View pointerEvents="none" style={styles.greenGlow} />
      <View pointerEvents="none" style={styles.blueGlow} />
      <View pointerEvents="none" style={styles.bottomGlow} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroImageWrap}>
          <ImageBackground
            source={ILLUSTRATIONS.hero}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroImageOverlay} />

            {/* <View style={styles.stepBox}>
              <Text style={styles.stepText}>
                {t('nutrition.heroStep', '3')}
              </Text>
            </View> */}

            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>
                {t('nutrition.heroTitleLine1', 'Personalized')}
              </Text>

              <Text style={styles.heroTitleAccent}>
                {t('nutrition.heroTitleLine2', 'nutrition plan')}
              </Text>

<Text
  style={styles.heroSubtitle}
  numberOfLines={3}
  adjustsFontSizeToFit
>
  {t(
    'nutrition.subtitle',
    'The app suggests calories, water and nutrition ratios based on your personal goal.',
  )}
</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.phoneMock}>
          <View style={styles.phoneTopBar}>
            <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.phoneTitle}>
              {t('nutrition.screenTitle', 'Nutrition')}
            </Text>

            <TouchableOpacity activeOpacity={0.8} style={styles.iconBtn}>
              <Text style={styles.bellIcon}>♡</Text>
            </TouchableOpacity>
          </View>

          {!plan ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🥗</Text>

              <Text style={styles.emptyTitle}>
                {t('nutrition.noProfileTitle', 'Complete your profile first')}
              </Text>

              <Text style={styles.emptyText}>
                {t(
                  'nutrition.noProfileText',
                  'Add your height, weight and goal to get personalized calories, macros and water targets.',
                )}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('nutrition.dailyGoal', 'Daily goals')}
                  </Text>

<TouchableOpacity activeOpacity={0.85} onPress={openGoalEditor}>
  <Text style={styles.editText}>
    {t('nutrition.edit', 'Edit')}
  </Text>
</TouchableOpacity>
                </View>

                <View style={styles.goalRow}>
                  <GoalRingCard
                    title={t('nutrition.calories', 'Calories')}
                    value={plan.calories}
                    unit={t('nutrition.kcal', 'kcal')}
                    color={YELLOW}
                    progress={76}
                  />

                  <GoalRingCard
                    title={t('nutrition.water', 'Water')}
                    value={plan.waterLiters}
                    unit={t('nutrition.liter', 'L')}
                    color={BLUE}
                    progress={70}
                  />
                </View>
              </View>
<View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>
                  {t('nutrition.macroRatio', 'Macro ratio')}
                </Text>

                <View style={styles.divider} />

                <View style={styles.macroLayout}>
                  <MacroDonut
                    protein={macroStats.proteinPercent}
                    carbs={macroStats.carbsPercent}
                    fats={macroStats.fatsPercent}
                  />

                  <View style={styles.macroLegend}>
                    <MacroLegendRow
                      color={BLUE}
                      label={t('nutrition.protein', 'Protein')}
                      percent={macroStats.proteinPercent}
                      grams={plan.proteinG}
                    />

                    <MacroLegendRow
                      color="#63C934"
                      label={t('nutrition.carb', 'Carb')}
                      percent={macroStats.carbsPercent}
                      grams={plan.carbsG}
                    />

                    <MacroLegendRow
                      color={YELLOW}
                      label={t('nutrition.fat', 'Fat')}
                      percent={macroStats.fatsPercent}
                      grams={plan.fatsG}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.mealSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t('nutrition.sampleMeals', 'Sample meals')}
                  </Text>

<TouchableOpacity
  activeOpacity={0.8}
  onPress={openAdvancedMealPlan}
>
  <Text style={styles.editText}>
    {t('nutrition.viewAll', 'View all')} ›
  </Text>
</TouchableOpacity>
                </View>

                <View style={styles.mealGrid}>
                  <MealCard
                    title={t('nutrition.breakfast', 'Breakfast')}
                    image={ILLUSTRATIONS.breakfast}
                  />

                  <MealCard
                    title={t('nutrition.lunch', 'Lunch')}
                    image={ILLUSTRATIONS.lunch}
                  />

                  <MealCard
                    title={t('nutrition.dinner', 'Dinner')}
                    image={ILLUSTRATIONS.dinner}
                  />

                  <MealCard
                    title={t('nutrition.snack', 'Snack')}
                    image={ILLUSTRATIONS.snack}
                  />
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>
                  {t('nutrition.mealPlan', 'Meal suggestions')}
                </Text>

                {plan.meals.map((meal, index) => (
                  <View key={`${meal}-${index}`} style={styles.mealListRow}>
                    <View style={styles.mealIndex}>
                      <Text style={styles.mealIndexText}>{index + 1}</Text>
                    </View>

                    <Text style={styles.mealListText}>{meal}</Text>
                  </View>
                ))}
              </View>
<View style={styles.adviceSection}>
                <Text style={styles.sectionTitle}>
                  {t('nutrition.tips', 'Advice')}
                </Text>

                <View style={styles.adviceCard}>
                  <View style={styles.adviceIcon}>
                    <Text style={styles.adviceIconText}>♢</Text>
                  </View>

                  <Text style={styles.adviceText}>{firstTip}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.footerBanner}>
          <Text style={styles.footerTitle}>
            {t('nutrition.footer1', 'From today,')}
          </Text>

          <Text style={styles.footerTitleStrong}>
            {t('nutrition.footer2', 'a better version of you')}
          </Text>

          <View style={styles.footerTags}>
            <Text style={styles.footerTag}>◎ {t('nutrition.science', 'Science')}</Text>
            <Text style={styles.footerDivider}>|</Text>
            <Text style={styles.footerTag}>♡ {t('nutrition.effective', 'Effective')}</Text>
            <Text style={styles.footerDivider}>|</Text>
            <Text style={styles.footerTag}>⚡ {t('nutrition.sustainable', 'Sustainable')}</Text>
          </View>
        </View>
      </ScrollView>
            <DailyGoalEditModal
        visible={showGoalEditor}
        caloriesValue={caloriesInput}
        waterValue={waterInput}
        onChangeCalories={setCaloriesInput}
        onChangeWater={setWaterInput}
        onClose={() => setShowGoalEditor(false)}
        onSave={saveGoalEditor}
        onReset={resetGoalEditor}
        t={t as any}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 160,
  },

  greenGlow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 201, 52, 0.10)',
  },
  blueGlow: {
    position: 'absolute',
    top: 320,
    left: -120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(43, 130, 217, 0.08)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(99, 201, 52, 0.08)',
  },

heroImageWrap: {
  marginHorizontal: 0,
  height: 460,
  overflow: 'hidden',
  backgroundColor: '#EEF4EA',
},
heroImage: {
  flex: 1,
  paddingHorizontal: 24,
  paddingTop: 28,
  paddingBottom: 95,
},
  heroImageStyle: {
    opacity: 0.48,
  },
  heroImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 251, 246, 0.60)',
  },
stepBox: {
  width: 54,
  height: 54,
  borderRadius: 12,
  backgroundColor: NEON,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 18,
  shadowColor: NEON,
  shadowOpacity: 0.26,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
},
  stepText: {
    color: '#10230F',
    fontSize: 27,
    fontWeight: '900',
  },
heroTextBlock: {
  maxWidth: 335,
},
heroTitle: {
  color: TEXT,
  fontSize: 34,
  lineHeight: 40,
  fontWeight: '900',
  letterSpacing: -0.8,
},
heroTitleAccent: {
  color: NEON,
  fontSize: 37,
  lineHeight: 43,
  fontWeight: '900',
  letterSpacing: -0.8,
},
heroSubtitle: {
  color: TEXT,
  fontSize: 18,
  lineHeight: 26,
  fontWeight: '600',
  marginTop: 14,
  maxWidth: 335,
},
phoneMock: {
  marginHorizontal: 8,
  marginTop: -180,
  borderRadius: 34,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  borderWidth: 1,
  borderColor: '#DDE8D9',
  paddingHorizontal: 10,
  paddingTop: 18,
  paddingBottom: 12,
  shadowColor: '#7D887F',
  shadowOpacity: 0.38,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 10,
},
  phoneTopBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#566158',
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '300',
  },
  bellIcon: {
    color: '#566158',
    fontSize: 28,
    fontWeight: '300',
  },
  phoneTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDE8D9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
  },
  editText: {
    color: NEON,
    fontSize: 15,
    fontWeight: '800',
  },

  goalRow: {
    flexDirection: 'row',
    marginHorizontal: -3,
  },
  goalCard: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: '#F3F7F0',
    borderRadius: 18,
    padding: 14,
  },
  goalTitle: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalValue: {
    color: TEXT,
    fontSize: 27,
    fontWeight: '900',
  },
  goalUnit: {
    color: '#455047',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#E1E9DE',
    marginTop: 12,
    marginBottom: 14,
  },
  macroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donutWrap: {
    width: 126,
    height: 126,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    position: 'absolute',
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
  },
  macroLegend: {
    flex: 1,
    paddingLeft: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendLabel: {
    color: '#455047',
    fontSize: 15,
    fontWeight: '700',
    width: 58,
  },
  legendValue: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
    flex: 1,
    textAlign: 'right',
  },

  mealSection: {
    marginBottom: 14,
  },
  mealGrid: {
    flexDirection: 'row',
    marginHorizontal: -3,
  },
  mealCard: {
    flex: 1,
    marginHorizontal: 3,
  },
  mealImage: {
    height: 84,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: CARD_2,
  },
  mealImageStyle: {
    borderRadius: 14,
  },
  mealShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mealName: {
    color: '#455047',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },

  mealListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F5ED',
    borderRadius: 14,
    padding: 11,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.12)',
  },
  mealIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(99, 201, 52, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mealIndexText: {
    color: NEON,
    fontSize: 12,
    fontWeight: '900',
  },
  mealListText: {
    flex: 1,
    color: '#455047',
    fontSize: 14,
    lineHeight: 21,
  },

  adviceSection: {
    marginBottom: 10,
  },
  adviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDE8D9',
    marginTop: 10,
  },
  adviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NEON,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  adviceIconText: {
    color: '#10230F',
    fontSize: 24,
    fontWeight: '900',
  },
  adviceText: {
    flex: 1,
    color: '#2F3B32',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },

  mockNav: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E6ECE3',
    marginHorizontal: -14,
    marginBottom: -12,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  mockNavItem: {
    flex: 1,
    alignItems: 'center',
  },
  mockNavItemActive: {
    flex: 1,
    alignItems: 'center',
  },
  mockNavIcon: {
    color: MUTED,
    fontSize: 20,
  },
  mockNavIconActive: {
    color: NEON,
    fontSize: 24,
  },
  mockNavText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  mockNavTextActive: {
    color: NEON,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  footerBanner: {
    marginHorizontal: 8,
    marginTop: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(109, 120, 111, 0.20)',
  },
  footerTitle: {
    color: TEXT,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  footerTitleStrong: {
    color: NEON,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },
  footerTags: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerTag: {
    color: '#455047',
    fontSize: 14,
    fontWeight: '800',
    marginHorizontal: 7,
  },
  footerDivider: {
    color: 'rgba(109, 120, 111, 0.60)',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.24)',
  },
  emptyEmoji: {
    fontSize: 34,
    marginBottom: 12,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
  },
  modalWrap: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 8,
},
modalBackdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.58)',
},
modalCard: {
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 18,
  borderWidth: 1,
  borderColor: 'rgba(99, 201, 52, 0.27)',
  shadowColor: '#18A39B',
  shadowOpacity: 0.14,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10,
  },
  elevation: 8,
},
modalKicker: {
  color: CYAN,
  fontSize: 11,
  fontWeight: '900',
  letterSpacing: 1.1,
  marginBottom: 5,
},
modalTitle: {
  color: TEXT,
  fontSize: 22,
  fontWeight: '900',
},
modalDesc: {
  color: MUTED,
  fontSize: 14,
  lineHeight: 21,
  marginTop: 8,
  marginBottom: 16,
},
inputLabel: {
  color: '#455047',
  fontSize: 13,
  fontWeight: '900',
  marginBottom: 8,
},
input: {
  backgroundColor: '#F0F5ED',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(109, 120, 111, 0.22)',
  color: TEXT,
  fontSize: 18,
  fontWeight: '900',
  paddingHorizontal: 14,
  paddingVertical: 12,
  marginBottom: 14,
},
modalActions: {
  flexDirection: 'row',
  marginTop: 4,
},
modalBtn: {
  flex: 1,
  borderRadius: 14,
  paddingVertical: 12,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  marginHorizontal: 4,
},
modalBtnGhost: {
  backgroundColor: 'rgba(24, 163, 155, 0.08)',
  borderColor: 'rgba(24, 163, 155, 0.30)',
},
modalBtnCancel: {
  backgroundColor: '#F0F5ED',
  borderColor: 'rgba(109, 120, 111, 0.24)',
},
modalBtnSave: {
  backgroundColor: NEON,
  borderColor: NEON,
},
modalBtnGhostText: {
  color: CYAN,
  fontWeight: '900',
},
modalBtnCancelText: {
  color: '#455047',
  fontWeight: '900',
},
modalBtnSaveText: {
  color: '#10230F',
  fontWeight: '900',
},
});

export default NutritionScreen;