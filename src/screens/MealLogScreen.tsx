// FILE: src/screens/MealLogScreen.tsx
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  calculateDailyNutrition,
  deleteMealLog,
  getNutritionDateKey,
  loadMealLogs,
  MealLog,
} from '../nutrition/mealLog';
import {
  copyMealToDate,
  saveMealAsFavorite,
} from '../nutrition/mealFavorites';
import {
  loadNutritionTargets,
} from '../nutrition/nutritionTargets';
import {
  buildNutritionPlan,
} from '../nutrition/nutritionPlanner';
import type {
  ProfileInput,
} from '../recommendation/programRecommender';

const PROFILE_KEY = 'user:profile';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#201914';
const MUTED = '#786C64';
const ORANGE = '#FF5A1F';
const ORANGE_DARK = '#F04C12';
const PEACH = '#FFF0E4';
const BORDER = '#F3E5DB';
const TRACK = '#F2E8E1';
const YELLOW = '#FFB01F';
const PINK = '#FF6F7D';

const FALLBACK_MEAL_IMAGE =
  require('../assets/calo_guidance_food.jpg');

type DailyTargets = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
};

const DEFAULT_TARGETS: DailyTargets = {
  calories: 2000,
  proteinG: 120,
  carbsG: 250,
  fatsG: 70,
};

const dateFromKey = (
  key: string,
) => {
  const [
    year,
    month,
    day,
  ] = key.split('-').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  );
};

const shiftDateKey = (
  key: string,
  amount: number,
) => {
  const date = dateFromKey(key);

  date.setDate(
    date.getDate() + amount,
  );

  return getNutritionDateKey(date);
};

const clamp = (
  value: number,
  min: number,
  max: number,
) => Math.min(max, Math.max(min, value));

const getMealIcon = (
  mealType: string,
) => {
  switch (mealType) {
    case 'breakfast':
      return '☀️';
    case 'lunch':
      return '🍴';
    case 'dinner':
      return '🌙';
    default:
      return '🍎';
  }
};

const formatTime = (
  timestamp: number,
  locale: string,
) => {
  try {
    return new Intl.DateTimeFormat(
      locale || 'en',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    ).format(new Date(timestamp));
  } catch {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes(),
    ).padStart(2, '0')}`;
  }
};

const ProgressRing:
React.FC<{
  percent: number;
}> = ({percent}) => {
  const size = 72;
  const strokeWidth = 8;
  const radius =
    (size - strokeWidth) / 2;
  const circumference =
    2 * Math.PI * radius;
  const safePercent =
    clamp(percent, 0, 100);
  const dashOffset =
    circumference *
    (1 - safePercent / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={TRACK}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ORANGE}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <Text style={styles.ringText}>
        {Math.round(safePercent)}%
      </Text>
    </View>
  );
};

const MacroDot:
React.FC<{
  color: string;
  value: string;
}> = ({color, value}) => (
  <View style={styles.macroItem}>
    <View
      style={[
        styles.macroDot,
        {backgroundColor: color},
      ]}
    />
    <Text style={styles.macroText}>
      {value}
    </Text>
  </View>
);

export const MealLogScreen:
React.FC = () => {
  const {t, i18n} =
    useTranslation();
  const navigation =
    useNavigation<any>();

  const [
    dateKey,
    setDateKey,
  ] = useState(
    getNutritionDateKey(),
  );

  const [
    meals,
    setMeals,
  ] = useState<MealLog[]>([]);

  const [
    targets,
    setTargets,
  ] = useState<DailyTargets>(
    DEFAULT_TARGETS,
  );

  const locale =
    i18n.resolvedLanguage ||
    i18n.language ||
    'en';

  const reload =
    useCallback(
      async () => {
        setMeals(
          await loadMealLogs(
            dateKey,
          ),
        );
      },
      [dateKey],
    );

  const loadTargets =
    useCallback(async () => {
      try {
        const [
          rawProfile,
          overrides,
        ] = await Promise.all([
          AsyncStorage.getItem(
            PROFILE_KEY,
          ),
          loadNutritionTargets(),
        ]);

        const profile = rawProfile
          ? (JSON.parse(
              rawProfile,
            ) as ProfileInput)
          : null;

        const plan =
          buildNutritionPlan(
            profile,
            t as any,
            overrides,
          );

        if (plan) {
          setTargets({
            calories:
              plan.calories,
            proteinG:
              plan.proteinG,
            carbsG:
              plan.carbsG,
            fatsG:
              plan.fatsG,
          });
          return;
        }

        setTargets({
          ...DEFAULT_TARGETS,
          calories:
            overrides.calories ||
            DEFAULT_TARGETS.calories,
        });
      } catch (error) {
        console.log(
          '[MealLog] target load error',
          error,
        );
      }
    }, [t]);

  useFocusEffect(
    useCallback(() => {
      reload();
      loadTargets();
    }, [reload, loadTargets]),
  );

  const total = useMemo(
    () =>
      calculateDailyNutrition(
        meals,
      ),
    [meals],
  );

  const caloriePercent =
    targets.calories > 0
      ? (total.calories /
          targets.calories) *
        100
      : 0;

  const deleteMeal = (
    meal: MealLog,
  ) => {
    Alert.alert(
      t(
        'mealScan.deleteMealTitle',
        'Delete meal?',
      ),
      t(
        'mealScan.deleteMealBody',
        'This meal will be removed from the daily total.',
      ),
      [
        {
          text: t(
            'common.cancel',
            'Cancel',
          ),
          style: 'cancel',
        },
        {
          text: t(
            'common.delete',
            'Delete',
          ),
          style: 'destructive',
          onPress: async () => {
            setMeals(
              await deleteMealLog(
                dateKey,
                meal.id,
              ),
            );
          },
        },
      ],
    );
  };

  const saveFavorite = async (
    meal: MealLog,
  ) => {
    await saveMealAsFavorite(
      meal,
    );

    Alert.alert(
      t(
        'caloLensInsights.favoriteSavedTitle',
        'Favorite saved',
      ),
      t(
        'caloLensInsights.favoriteSavedBody',
        'You can add this meal again from Favorite meals.',
      ),
    );
  };

  const copyToday = async (
    meal: MealLog,
  ) => {
    await copyMealToDate(
      meal,
    );

    Alert.alert(
      t(
        'caloLensInsights.addedTitle',
        'Added to today',
      ),
      t(
        'caloLensInsights.addedBody',
        'The meal was copied to today’s food log.',
      ),
    );

    if (
      dateKey ===
      getNutritionDateKey()
    ) {
      reload();
    }
  };

  const openMealMenu = (
    meal: MealLog,
  ) => {
    Alert.alert(
      t(
        `mealScan.${meal.mealType}`,
        meal.mealType,
      ),
      undefined,
      [
        {
          text: t(
            'caloLensInsights.saveFavorite',
            'Save favorite',
          ),
          onPress: () =>
            saveFavorite(meal),
        },
        {
          text: t(
            'caloLensInsights.copyToday',
            'Copy to today',
          ),
          onPress: () =>
            copyToday(meal),
        },
        {
          text: t(
            'common.delete',
            'Delete',
          ),
          style: 'destructive',
          onPress: () =>
            deleteMeal(meal),
        },
        {
          text: t(
            'common.cancel',
            'Cancel',
          ),
          style: 'cancel',
        },
      ],
    );
  };

  const formattedDate =
    new Intl.DateTimeFormat(
      locale,
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      },
    ).format(
      dateFromKey(
        dateKey,
      ),
    );

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <View style={styles.topDecorationOne} />
      <View style={styles.topDecorationTwo} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {t(
              'mealScan.logTitle',
              'Food log',
            )}
          </Text>

          <TouchableOpacity
            activeOpacity={0.84}
            style={styles.favoriteHeaderButton}
            onPress={() =>
              navigation.navigate(
                'FavoriteMeals',
              )
            }
          >
            <Text style={styles.favoriteHeaderText}>
              ★{' '}
              {t(
                'caloLensInsights.favorites',
                'Favorites',
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.dateButton}
            onPress={() =>
              setDateKey(
                current =>
                  shiftDateKey(
                    current,
                    -1,
                  ),
              )
            }
          >
            <Text style={styles.dateButtonText}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.dateCenter}>
            <Text style={styles.calendarIcon}>
              ▣
            </Text>
            <Text
              numberOfLines={1}
              style={styles.dateText}
            >
              {formattedDate}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.dateButton}
            onPress={() =>
              setDateKey(
                current =>
                  shiftDateKey(
                    current,
                    1,
                  ),
              )
            }
          >
            <Text style={styles.dateButtonText}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryCalories}>
              {Math.round(
                total.calories,
              )}{' '}
              kcal
            </Text>

            <Text style={styles.summaryTargetText}>
              {t(
                'mealScan.ofTargetCalories',
                'of {{calories}} kcal',
                {
                  calories:
                    targets.calories,
                },
              )}
            </Text>

            <View style={styles.macroRow}>
              <MacroDot
                color={ORANGE}
                value={`${Math.round(
                  total.proteinG,
                )}g P`}
              />
              <MacroDot
                color={YELLOW}
                value={`${Math.round(
                  total.carbsG,
                )}g C`}
              />
              <MacroDot
                color={PINK}
                value={`${Math.round(
                  total.fatsG,
                )}g F`}
              />
            </View>
          </View>

          <ProgressRing
            percent={caloriePercent}
          />
        </View>

        {meals.map(meal => {
          const mealTotal =
            calculateDailyNutrition(
              [meal],
            );

          return (
            <View
              key={meal.id}
              style={styles.mealCard}
            >
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleWrap}>
                  <View style={styles.mealTypeIconWrap}>
                    <Text style={styles.mealTypeIcon}>
                      {getMealIcon(
                        meal.mealType,
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.mealType}>
                      {t(
                        `mealScan.${meal.mealType}`,
                        meal.mealType,
                      )}
                    </Text>
                    <Text style={styles.mealTime}>
                      {formatTime(
                        meal.createdAt,
                        locale,
                      )}
                    </Text>
                  </View>
                </View>

                <Text style={styles.mealCalories}>
                  {Math.round(
                    mealTotal.calories,
                  )}{' '}
                  kcal
                </Text>
              </View>

              {meal.foods.map(
                (food, index) => (
                  <View
                    key={food.id}
                    style={styles.foodRow}
                  >
                    {index === 0 ? (
                      <Image
                        source={
                          meal.photoUri
                            ? {
                                uri: meal.photoUri,
                              }
                            : FALLBACK_MEAL_IMAGE
                        }
                        style={styles.foodImage}
                      />
                    ) : (
                      <View style={styles.foodImageSpacer} />
                    )}

                    <View style={styles.foodBody}>
                      <Text
                        numberOfLines={2}
                        style={styles.foodName}
                      >
                        {food.name}
                      </Text>

                      <Text style={styles.foodServing}>
                        {food.grams}g
                      </Text>

                      <View style={styles.foodMacroRow}>
                        <MacroDot
                          color={PINK}
                          value={`${Math.round(
                            food.proteinG,
                          )}g P`}
                        />
                        <MacroDot
                          color={YELLOW}
                          value={`${Math.round(
                            food.carbsG,
                          )}g C`}
                        />
                        <MacroDot
                          color={ORANGE}
                          value={`${Math.round(
                            food.fatsG,
                          )}g F`}
                        />
                      </View>
                    </View>

                    <View style={styles.foodRight}>
                      <TouchableOpacity
                        hitSlop={{
                          top: 8,
                          right: 8,
                          bottom: 8,
                          left: 8,
                        }}
                        onPress={() =>
                          openMealMenu(
                            meal,
                          )
                        }
                      >
                        <Text style={styles.moreText}>
                          ⋯
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.foodCalories}>
                        {Math.round(
                          food.calories,
                        )}{' '}
                        kcal
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.scanButton}
          onPress={() =>
            navigation.navigate(
              'MealScanner',
            )
          }
        >
          <Text style={styles.scanButtonPlus}>
            +
          </Text>
          <Text style={styles.scanButtonText}>
            {meals.length > 0
              ? t(
                  'mealScan.scanAnotherMeal',
                  'Scan another meal',
                )
              : t(
                  'mealScan.scanFirstMeal',
                  'Scan your first meal',
                )}
          </Text>
        </TouchableOpacity>

        <View style={styles.endCard}>
          <View style={styles.endIconWrap}>
            <Text style={styles.endIcon}>
              🥗
            </Text>
          </View>

          <Text style={styles.endTitle}>
            {meals.length > 0
              ? t(
                  'mealScan.noMoreMealsToday',
                  'No more meals today.',
                )
              : t(
                  'mealScan.noMeals',
                  'No food has been logged today.',
                )}
          </Text>

          <Text style={styles.endSubtitle}>
            {t(
              'mealScan.scanOrAddMore',
              'Scan or add more meals to track your nutrition.',
            )}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 94,
  },
  topDecorationOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -95,
    right: -70,
    backgroundColor: '#FFE3C9',
  },
  topDecorationTwo: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    top: -25,
    right: 35,
    backgroundColor: 'rgba(255, 122, 32, 0.10)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  title: {
    color: TEXT,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  favoriteHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: ORANGE,
    shadowColor: '#FF8A52',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  favoriteHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dateButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  dateButtonText: {
    color: ORANGE,
    fontSize: 34,
    lineHeight: 36,
    marginTop: -2,
  },
  dateCenter: {
    flex: 1,
    height: 46,
    marginHorizontal: 8,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  calendarIcon: {
    color: ORANGE,
    fontSize: 14,
    marginRight: 7,
  },
  dateText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 17,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F6EAE1',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#D8BBA6',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 2,
  },
  summaryMain: {
    flex: 1,
  },
  summaryCalories: {
    color: ORANGE,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  summaryTargetText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  macroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },
  macroText: {
    color: '#5F544D',
    fontSize: 10,
    fontWeight: '700',
  },
  ringText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '900',
  },
  mealCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F5E9E1',
    padding: 12,
    marginTop: 11,
    shadowColor: '#D7B8A0',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF4E8',
    marginRight: 8,
  },
  mealTypeIcon: {
    fontSize: 16,
  },
  mealType: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  mealTime: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  mealCalories: {
    color: ORANGE_DARK,
    fontSize: 13,
    fontWeight: '900',
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    paddingTop: 6,
    paddingBottom: 5,
  },
  foodImage: {
    width: 58,
    height: 58,
    borderRadius: 13,
    resizeMode: 'cover',
    backgroundColor: PEACH,
  },
  foodImageSpacer: {
    width: 58,
    height: 10,
  },
  foodBody: {
    flex: 1,
    marginLeft: 9,
    paddingRight: 6,
  },
  foodName: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  foodServing: {
    color: MUTED,
    fontSize: 9,
    marginTop: 2,
  },
  foodMacroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  foodRight: {
    minWidth: 52,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  moreText: {
    color: '#786C64',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 18,
  },
  foodCalories: {
    color: TEXT,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
  },
  scanButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: ORANGE,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6931',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  scanButtonPlus: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '400',
    marginRight: 8,
    marginTop: -1,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  endCard: {
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F4E7DE',
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 17,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: {
    fontSize: 32,
  },
  endTitle: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
  },
  endSubtitle: {
    color: MUTED,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});

export default MealLogScreen;
