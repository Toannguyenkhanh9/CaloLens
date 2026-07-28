// FILE: src/screens/MealLogScreen.tsx
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

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

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

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
  const date =
    dateFromKey(key);

  date.setDate(
    date.getDate() +
      amount,
  );

  return getNutritionDateKey(
    date,
  );
};

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

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const total = useMemo(
    () =>
      calculateDailyNutrition(
        meals,
      ),
    [meals],
  );

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
          style:
            'destructive',
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

  const formattedDate =
    new Intl.DateTimeFormat(
      i18n.resolvedLanguage ||
      i18n.language ||
      'en',
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
    <View style={styles.container}>
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
              ☆{' '}
              {t(
                'caloLensInsights.favorites',
                'Favorites',
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity
            activeOpacity={0.8}
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

          <Text style={styles.dateText}>
            {formattedDate}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
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

        <View style={styles.summary}>
          <Text style={styles.summaryCalories}>
            {total.calories}{' '}
            kcal
          </Text>

          <Text style={styles.summaryMacros}>
            {total.proteinG}g P •{' '}
            {total.carbsG}g C •{' '}
            {total.fatsG}g F
          </Text>
        </View>

        {meals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              🥗
            </Text>

            <Text style={styles.emptyTitle}>
              {t(
                'mealScan.noMeals',
                'No food has been logged today.',
              )}
            </Text>
          </View>
        ) : (
          meals.map(
            meal => {
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
                    <View style={styles.mealHeaderBody}>
                      <Text style={styles.mealType}>
                        {t(
                          `mealScan.${meal.mealType}`,
                          meal.mealType,
                        )}
                      </Text>

                      <Text style={styles.mealCalories}>
                        {mealTotal.calories}
                        {' kcal'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        deleteMeal(meal)
                      }
                    >
                      <Text style={styles.deleteText}>
                        {t(
                          'common.delete',
                          'Delete',
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {meal.foods.map(
                    food => (
                      <View
                        key={food.id}
                        style={styles.foodRow}
                      >
                        <View style={styles.foodBody}>
                          <Text style={styles.foodName}>
                            {food.name}
                          </Text>

                          <Text style={styles.foodMeta}>
                            {food.grams}g •{' '}
                            {food.proteinG}g P •{' '}
                            {food.carbsG}g C •{' '}
                            {food.fatsG}g F
                          </Text>
                        </View>

                        <Text style={styles.foodCalories}>
                          {food.calories}{' '}
                          kcal
                        </Text>
                      </View>
                    ),
                  )}


                  <View style={styles.mealActions}>
                    <TouchableOpacity
                      activeOpacity={0.84}
                      style={styles.favoriteMealButton}
                      onPress={() =>
                        saveFavorite(meal)
                      }
                    >
                      <Text style={styles.favoriteMealText}>
                        ☆{' '}
                        {t(
                          'caloLensInsights.saveFavorite',
                          'Save favorite',
                        )}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.84}
                      style={styles.copyMealButton}
                      onPress={() =>
                        copyToday(meal)
                      }
                    >
                      <Text style={styles.copyMealText}>
                        ↻{' '}
                        {t(
                          'caloLensInsights.copyToday',
                          'Copy to today',
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            },
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BG,
    },
    content: {
      padding: 18,
      paddingBottom: 80,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: TEXT,
      fontSize: 30,
      fontWeight: '900',
    },
    favoriteHeaderButton: {
      paddingHorizontal: 11,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.26)',
    },
    favoriteHeaderText: {
      color: '#4F9E2A',
      fontSize: 10,
      fontWeight: '900',
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
    },
    dateButton: {
      width: 42,
      height: 42,
      borderRadius: 15,
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateButtonText: {
      color: NEON,
      fontSize: 30,
      lineHeight: 32,
    },
    dateText: {
      flex: 1,
      color: TEXT,
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'center',
      textTransform: 'capitalize',
    },
    summary: {
      backgroundColor:
        'rgba(124, 255, 58, 0.1)',
      borderWidth: 1,
      borderColor:
        'rgba(124, 255, 58, 0.3)',
      borderRadius: 20,
      padding: 15,
      marginTop: 15,
    },
    summaryCalories: {
      color: NEON,
      fontSize: 29,
      fontWeight: '900',
    },
    summaryMacros: {
      color: TEXT,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 4,
    },
    emptyCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      marginTop: 14,
    },
    emptyIcon: {
      fontSize: 38,
    },
    emptyTitle: {
      color: MUTED,
      fontSize: 13,
      fontWeight: '800',
      marginTop: 10,
    },
    mealCard: {
      backgroundColor: CARD,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.17)',
      padding: 13,
      marginTop: 12,
    },
    mealHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    mealHeaderBody: {
      flex: 1,
    },
    mealType: {
      color: CYAN,
      fontSize: 12,
      fontWeight: '900',
      textTransform: 'uppercase',
    },
    mealCalories: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
      marginTop: 3,
    },
    deleteText: {
      color: '#FB7185',
      fontSize: 12,
      fontWeight: '900',
    },
    foodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: BG,
      borderRadius: 14,
      padding: 10,
      marginTop: 7,
    },
    foodBody: {
      flex: 1,
    },
    foodName: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    foodMeta: {
      color: MUTED,
      fontSize: 10,
      marginTop: 3,
    },
    foodCalories: {
      color: NEON,
      fontSize: 12,
      fontWeight: '900',
      marginLeft: 8,
    },
    mealActions: {
      flexDirection: 'row',
      marginTop: 10,
      marginHorizontal: -4,
    },
    favoriteMealButton: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor:
        'rgba(217, 154, 0, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.24)',
      marginHorizontal: 4,
    },
    favoriteMealText: {
      color: '#8B6500',
      fontSize: 10,
      fontWeight: '900',
    },
    copyMealButton: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.26)',
      marginHorizontal: 4,
    },
    copyMealText: {
      color: '#4F9E2A',
      fontSize: 10,
      fontWeight: '900',
    },
  });

export default MealLogScreen;
