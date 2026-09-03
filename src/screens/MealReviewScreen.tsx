// FILE: src/screens/MealReviewScreen.tsx
import React, {
  useMemo,
  useState,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import type {
  AiFoodCandidate,
} from '../nutrition/mealAi';
import {
  addMealLog,
  calculateFromPer100g,
  FoodLogItem,
  LoggedMealType,
} from '../nutrition/mealLog';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

type EditableFood =
  AiFoodCandidate;

const numberValue = (
  value: string,
) => {
  const parsed =
    Number.parseFloat(
      value.replace(',', '.'),
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const createEmptyFood =
  (): EditableFood => ({
    id:
      `manual-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
    name: '',
    estimatedGrams: 100,
    caloriesPer100g: 0,
    proteinPer100g: 0,
    carbsPer100g: 0,
    fatsPer100g: 0,
  });

const getDefaultMealType =
  (): LoggedMealType => {
    const hour =
      new Date().getHours();

    if (hour < 10) {
      return 'breakfast';
    }

    if (hour < 15) {
      return 'lunch';
    }

    if (hour < 21) {
      return 'dinner';
    }

    return 'snack';
  };

export const MealReviewScreen:
React.FC = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<any>();
  const route =
    useRoute<any>();

  const source =
    route.params?.source ===
    'manual'
      ? 'manual'
      : 'ai';

  const imageUri =
    route.params?.imageUri as
      | string
      | undefined;

  const initialFoods =
    Array.isArray(
      route.params?.foods,
    )
      ? route.params
          .foods as EditableFood[]
      : [];

  const [
    foods,
    setFoods,
  ] = useState<EditableFood[]>(
    initialFoods.length
      ? initialFoods
      : [createEmptyFood()],
  );

  const [
    mealType,
    setMealType,
  ] = useState<LoggedMealType>(
    getDefaultMealType(),
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const updateFood = (
    id: string,
    patch:
      Partial<EditableFood>,
  ) => {
    setFoods(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  };

  const totals =
    useMemo(
      () =>
        foods.reduce(
          (
            result,
            food,
          ) => {
            const value =
              calculateFromPer100g({
                grams:
                  food.estimatedGrams,
                caloriesPer100g:
                  food.caloriesPer100g,
                proteinPer100g:
                  food.proteinPer100g,
                carbsPer100g:
                  food.carbsPer100g,
                fatsPer100g:
                  food.fatsPer100g,
              });

            result.calories +=
              value.calories;
            result.proteinG +=
              value.proteinG;
            result.carbsG +=
              value.carbsG;
            result.fatsG +=
              value.fatsG;

            return result;
          },
          {
            calories: 0,
            proteinG: 0,
            carbsG: 0,
            fatsG: 0,
          },
        ),
      [foods],
    );

  const save =
    async () => {
      const validFoods =
        foods.filter(
          item =>
            item.name.trim() &&
            item.estimatedGrams > 0 &&
            item.caloriesPer100g >= 0,
        );

      if (!validFoods.length) {
        Alert.alert(
          t(
            'mealScan.missingFoodTitle',
            'Add at least one food',
          ),
          t(
            'mealScan.missingFoodBody',
            'Enter the food name, portion and calories before saving.',
          ),
        );
        return;
      }

      try {
        setSaving(true);

        const loggedFoods:
          FoodLogItem[] =
          validFoods.map(
            food => {
              const value =
                calculateFromPer100g({
                  grams:
                    food.estimatedGrams,
                  caloriesPer100g:
                    food.caloriesPer100g,
                  proteinPer100g:
                    food.proteinPer100g,
                  carbsPer100g:
                    food.carbsPer100g,
                  fatsPer100g:
                    food.fatsPer100g,
                });

              return {
                id: food.id,
                name:
                  food.name.trim(),
                grams:
                  food.estimatedGrams,
                calories:
                  value.calories,
                proteinG:
                  value.proteinG,
                carbsG:
                  value.carbsG,
                fatsG:
                  value.fatsG,
                caloriesPer100g:
                  food.caloriesPer100g,
                proteinPer100g:
                  food.proteinPer100g,
                carbsPer100g:
                  food.carbsPer100g,
                fatsPer100g:
                  food.fatsPer100g,
                confidence:
                  food.confidence,
                source,
              };
            },
          );

        await addMealLog({
          mealType,
          photoUri:
            imageUri,
          foods:
            loggedFoods,
        });

        navigation.popToTop();
      } catch (error) {
        console.log(
          '[nutrition] save meal error',
          error,
        );

        Alert.alert(
          t(
            'common.error',
            'Error',
          ),
          t(
            'mealScan.saveError',
            'Unable to save this meal.',
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const mealTypes:
  LoggedMealType[] = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          {t(
            'mealScan.reviewTitle',
            'Review meal',
          )}
        </Text>

        <Text style={styles.subtitle}>
          {t(
            'mealScan.reviewSubtitle',
            'Confirm the food names and portions before adding them to today’s intake.',
          )}
        </Text>

        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            style={styles.photo}
          />
        ) : null}

        <View style={styles.topSummarySection}>
        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>
            {t(
              'mealScan.mealTotal',
              'Meal total',
            )}
          </Text>

          <Text style={styles.totalCalories}>
            {Math.round(
              totals.calories,
            )}{' '}
            kcal
          </Text>

          <Text style={styles.totalMacros}>
            {Math.round(
              totals.proteinG,
            )}g P •{' '}
            {Math.round(
              totals.carbsG,
            )}g C •{' '}
            {Math.round(
              totals.fatsG,
            )}g F
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.86}
          style={[
            styles.saveButton,
            saving &&
              styles.disabled,
          ]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving
              ? t(
                  'mealScan.saving',
                  'Saving…',
                )
              : t(
                  'mealScan.saveMeal',
                  'Add to today',
                )}
          </Text>
        </TouchableOpacity>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {t(
              'mealScan.estimateDisclaimer',
              'Calories and nutrients are estimates. Results vary by ingredients, cooking method and actual portion size.',
            )}
          </Text>
        </View>
        </View>

        <Text style={styles.sectionLabel}>
          {t(
            'mealScan.mealType',
            'Meal type',
          )}
        </Text>

        <View style={styles.segmentRow}>
          {mealTypes.map(
            type => {
              const active =
                type ===
                mealType;

              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.86}
                  style={[
                    styles.segment,
                    active &&
                      styles.segmentActive,
                  ]}
                  onPress={() =>
                    setMealType(
                      type,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active &&
                        styles.segmentTextActive,
                    ]}
                  >
                    {t(
                      `mealScan.${type}`,
                      type,
                    )}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        {foods.map(
          (
            food,
            index,
          ) => {
            const calculated =
              calculateFromPer100g({
                grams:
                  food.estimatedGrams,
                caloriesPer100g:
                  food.caloriesPer100g,
                proteinPer100g:
                  food.proteinPer100g,
                carbsPer100g:
                  food.carbsPer100g,
                fatsPer100g:
                  food.fatsPer100g,
              });

            return (
              <View
                key={food.id}
                style={styles.foodCard}
              >
                <View style={styles.foodHeader}>
                  <Text style={styles.foodIndex}>
                    {t(
                      'mealScan.foodNumber',
                      {
                        count:
                          index + 1,
                        defaultValue:
                          'Food {{count}}',
                      },
                    )}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      setFoods(
                        current =>
                          current.filter(
                            item =>
                              item.id !==
                              food.id,
                          ),
                      )
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

                <Text style={styles.inputLabel}>
                  {t(
                    'mealScan.foodName',
                    'Food name',
                  )}
                </Text>

                <TextInput
                  value={food.name}
                  onChangeText={value =>
                    updateFood(
                      food.id,
                      {
                        name:
                          value,
                      },
                    )
                  }
                  placeholder={t(
                    'mealScan.foodNamePlaceholder',
                    'e.g. Grilled chicken',
                  )}
                  placeholderTextColor="#8A948C"
                  style={styles.input}
                />

                <View style={styles.twoColumn}>
                  <View style={styles.field}>
                    <Text style={styles.inputLabel}>
                      {t(
                        'mealScan.grams',
                        'Grams',
                      )}
                    </Text>

                    <TextInput
                      value={String(
                        food.estimatedGrams,
                      )}
                      onChangeText={value =>
                        updateFood(
                          food.id,
                          {
                            estimatedGrams:
                              numberValue(
                                value,
                              ),
                          },
                        )
                      }
                      keyboardType="decimal-pad"
                      placeholder="100"
                      placeholderTextColor="#8A948C"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldLast}>
                    <Text style={styles.inputLabel}>
                      {t(
                        'mealScan.caloriesPer100g',
                        'kcal / 100g',
                      )}
                    </Text>

                    <TextInput
                      value={String(
                        food.caloriesPer100g,
                      )}
                      onChangeText={value =>
                        updateFood(
                          food.id,
                          {
                            caloriesPer100g:
                              numberValue(
                                value,
                              ),
                          },
                        )
                      }
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#8A948C"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.threeColumn}>
                  <View style={styles.smallField}>
                    <Text style={styles.smallLabel}>
                      {t(
                        'nutrition.protein',
                        'Protein',
                      )}/100g
                    </Text>

                    <TextInput
                      value={String(
                        food.proteinPer100g,
                      )}
                      onChangeText={value =>
                        updateFood(
                          food.id,
                          {
                            proteinPer100g:
                              numberValue(
                                value,
                              ),
                          },
                        )
                      }
                      keyboardType="decimal-pad"
                      style={styles.smallInput}
                    />
                  </View>

                  <View style={styles.smallField}>
                    <Text style={styles.smallLabel}>
                      {t(
                        'nutrition.carb',
                        'Carb',
                      )}/100g
                    </Text>

                    <TextInput
                      value={String(
                        food.carbsPer100g,
                      )}
                      onChangeText={value =>
                        updateFood(
                          food.id,
                          {
                            carbsPer100g:
                              numberValue(
                                value,
                              ),
                          },
                        )
                      }
                      keyboardType="decimal-pad"
                      style={styles.smallInput}
                    />
                  </View>

                  <View style={styles.smallFieldLast}>
                    <Text style={styles.smallLabel}>
                      {t(
                        'nutrition.fat',
                        'Fat',
                      )}/100g
                    </Text>

                    <TextInput
                      value={String(
                        food.fatsPer100g,
                      )}
                      onChangeText={value =>
                        updateFood(
                          food.id,
                          {
                            fatsPer100g:
                              numberValue(
                                value,
                              ),
                          },
                        )
                      }
                      keyboardType="decimal-pad"
                      style={styles.smallInput}
                    />
                  </View>
                </View>

                <Text style={styles.foodTotal}>
                  {calculated.calories}{' '}
                  kcal •{' '}
                  {calculated.proteinG}g P •{' '}
                  {calculated.carbsG}g C •{' '}
                  {calculated.fatsG}g F
                </Text>
              </View>
            );
          },
        )}

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.addButton}
          onPress={() =>
            setFoods(current => [
              ...current,
              createEmptyFood(),
            ])
          }
        >
          <Text style={styles.addText}>
            ＋{' '}
            {t(
              'mealScan.addFood',
              'Add food',
            )}
          </Text>
        </TouchableOpacity>


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
    title: {
      color: TEXT,
      fontSize: 30,
      fontWeight: '900',
    },
    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      marginBottom: 15,
    },
    photo: {
      width: '100%',
      height: 230,
      borderRadius: 22,
      backgroundColor: CARD,
      marginBottom: 12,
    },
    topSummarySection: {
      marginBottom: 18,
    },
    sectionLabel: {
      color: TEXT,
      fontSize: 15,
      fontWeight: '900',
      marginBottom: 9,
    },
    segmentRow: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    segment: {
      flex: 1,
      minHeight: 39,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.20)',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 3,
    },
    segmentActive: {
      backgroundColor: NEON,
      borderColor: NEON,
    },
    segmentText: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '900',
    },
    segmentTextActive: {
      color: '#10230F',
    },
    foodCard: {
      backgroundColor: CARD,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.17)',
      padding: 13,
      marginBottom: 12,
    },
    foodHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    foodIndex: {
      flex: 1,
      color: CYAN,
      fontSize: 12,
      fontWeight: '900',
    },
    deleteText: {
      color: '#FB7185',
      fontSize: 12,
      fontWeight: '900',
    },
    inputLabel: {
      color: '#526057',
      fontSize: 11,
      fontWeight: '900',
      marginBottom: 6,
    },
    input: {
      minHeight: 44,
      borderRadius: 13,
      backgroundColor: BG,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.18)',
      color: TEXT,
      paddingHorizontal: 11,
      fontSize: 14,
      fontWeight: '800',
      marginBottom: 10,
    },
    twoColumn: {
      flexDirection: 'row',
    },
    field: {
      flex: 1,
      marginRight: 5,
    },
    fieldLast: {
      flex: 1,
      marginLeft: 5,
    },
    threeColumn: {
      flexDirection: 'row',
    },
    smallField: {
      flex: 1,
      marginRight: 5,
    },
    smallFieldLast: {
      flex: 1,
      marginLeft: 5,
    },
    smallLabel: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '800',
      marginBottom: 5,
    },
    smallInput: {
      minHeight: 40,
      borderRadius: 12,
      backgroundColor: BG,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.17)',
      color: TEXT,
      paddingHorizontal: 9,
      fontWeight: '900',
    },
    foodTotal: {
      color: NEON,
      fontSize: 12,
      fontWeight: '900',
      marginTop: 11,
    },
    addButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.30)',
      paddingVertical: 12,
      alignItems: 'center',
    },
    addText: {
      color: CYAN,
      fontSize: 14,
      fontWeight: '900',
    },
    totalCard: {
      backgroundColor:
        'rgba(124, 255, 58, 0.1)',
      borderWidth: 1,
      borderColor:
        'rgba(124, 255, 58, 0.3)',
      borderRadius: 19,
      padding: 14,
      marginTop: 0,
    },
    totalTitle: {
      color: TEXT,
      fontSize: 14,
      fontWeight: '900',
    },
    totalCalories: {
      color: NEON,
      fontSize: 30,
      fontWeight: '900',
      marginTop: 5,
    },
    totalMacros: {
      color: '#455047',
      fontSize: 12,
      fontWeight: '800',
      marginTop: 4,
    },
    notice: {
      backgroundColor:
        '#FFF9E8',
      borderWidth: 1,
      borderColor:
        'rgba(250, 204, 21, 0.2)',
      borderRadius: 14,
      padding: 11,
      marginTop: 10,
    },
    noticeText: {
      color: '#8B6500',
      fontSize: 11,
      lineHeight: 17,
    },
    saveButton: {
      borderRadius: 999,
      backgroundColor: NEON,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 12,
    },
    saveText: {
      color: '#10230F',
      fontSize: 15,
      fontWeight: '900',
    },
    disabled: {
      opacity: 0.6,
    },
  });

export default MealReviewScreen;
