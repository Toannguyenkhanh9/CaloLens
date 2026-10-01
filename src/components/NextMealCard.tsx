// FILE: src/components/NextMealCard.tsx
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
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
  loadMealLogs,
} from '../nutrition/mealLog';
import type {
  AdvancedNutritionPlan,
} from '../nutrition/nutritionPlanner';
import {
  getRemainingNutrition,
  mealOptionToCandidate,
  selectNextMealSuggestions,
} from '../nutrition/caloLensInsights';
import type {
  MealSuggestion as TastePilotMealSuggestion,
} from '../tastepilot/types';

const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF5A1F';
const CYAN = '#F47B35';
const BORDER = '#F0DDD0';

export const NextMealCard:
React.FC<{
  plan: AdvancedNutritionPlan;
}> = ({plan}) => {
  const {t} =
    useTranslation();

  const navigation =
    useNavigation<any>();

  const [meals, setMeals] =
    useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadMealLogs().then(
        setMeals,
      );
    }, []),
  );

  const consumed =
    useMemo(
      () =>
        calculateDailyNutrition(
          meals,
        ),
      [meals],
    );

  const remaining =
    useMemo(
      () =>
        getRemainingNutrition({
          consumed,
          target: plan,
        }),
      [consumed, plan],
    );

  const suggestions =
    useMemo(
      () =>
        selectNextMealSuggestions({
          plan,
          consumed,
        }),
      [consumed, plan],
    );

  const addSuggestion = (
    suggestion:
      typeof suggestions[number],
  ) => {
    navigation.navigate(
      'MealReview',
      {
        source: 'manual',
        foods: [
          mealOptionToCandidate(
            suggestion,
          ),
        ],
      },
    );
  };

  const findNearbySuggestion = (
    suggestion:
      typeof suggestions[number],
  ) => {
    const meal: TastePilotMealSuggestion = {
      id: `calolens-${suggestion.id}`,
      canonicalId: suggestion.id,
      name: suggestion.title,
      canonicalName: suggestion.title,
      cuisine: 'CaloLens',
      canonicalCuisine: 'CaloLens',
      estimatedMin: suggestion.calories,
      estimatedMax: suggestion.calories,
      reason: suggestion.description,
      searchKeyword: suggestion.title,
      mealType: suggestion.type,
      recommendationSource: 'ai',
    };

    navigation.navigate(
      'TastePilotFeature',
      {
        screen: 'Restaurants',
        params: {
          meal,
          mode: 'daily',
          initialFilter: 'all',
          initialSort: 'distance',
          source: 'calolens-next-meal',
        },
      },
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>
            {t(
              'caloLensInsights.nextMealKicker',
              'NEXT MEAL',
            )}
          </Text>

          <Text style={styles.title}>
            {t(
              'caloLensInsights.nextMealTitle',
              'What should you eat next?',
            )}
          </Text>
        </View>

        <View style={styles.icon}>
          <Text style={styles.iconText}>
            🍽️
          </Text>
        </View>
      </View>

      <View style={styles.remainingRow}>
        <View style={styles.remainingItem}>
          <Text style={styles.remainingValue}>
            {remaining.calories}
          </Text>
          <Text style={styles.remainingLabel}>
            kcal
          </Text>
        </View>

        <View style={styles.remainingDivider} />

        <View style={styles.remainingItem}>
          <Text style={styles.remainingValue}>
            {Math.round(
              remaining.proteinG,
            )}g
          </Text>
          <Text style={styles.remainingLabel}>
            {t(
              'nutrition.protein',
              'Protein',
            )}
          </Text>
        </View>

        <View style={styles.remainingDivider} />

        <View style={styles.remainingItem}>
          <Text style={styles.remainingValue}>
            {Math.round(
              remaining.fatsG,
            )}g
          </Text>
          <Text style={styles.remainingLabel}>
            {t(
              'nutrition.fat',
              'Fat',
            )}
          </Text>
        </View>
      </View>

      {suggestions.map(
        suggestion => (
          <View
            key={suggestion.id}
            style={styles.suggestion}
          >
            <View style={styles.suggestionBody}>
              <Text style={styles.suggestionTitle}>
                {suggestion.title}
              </Text>

              <Text
                style={styles.suggestionDesc}
                numberOfLines={2}
              >
                {suggestion.description}
              </Text>

              <Text style={styles.suggestionMacro}>
                {suggestion.calories} kcal
                {'  •  '}
                {suggestion.proteinG}g P
                {'  •  '}
                {suggestion.fatsG}g F
              </Text>

              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.nearbyButton}
                onPress={() =>
                  findNearbySuggestion(
                    suggestion,
                  )
                }
              >
                <Text style={styles.nearbyIcon}>
                  📍
                </Text>
                <Text style={styles.nearbyButtonText}>
                  {t(
                    'caloLensInsights.findNearby',
                    'Find nearby',
                  )}
                </Text>
                <Text style={styles.nearbyArrow}>
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.addButton}
              onPress={() =>
                addSuggestion(
                  suggestion,
                )
              }
              accessibilityRole="button"
              accessibilityLabel={t(
                'caloLensInsights.addToday',
                'Add today',
              )}
            >
              <Text style={styles.addButtonText}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        ),
      )}
    </View>
  );
};

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(244, 123, 53, 0.24)',
      padding: 14,
      marginBottom: 13,
      shadowColor: '#B89079',
      shadowOpacity: 0.08,
      shadowRadius: 11,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    kicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: TEXT,
      fontSize: 19,
      fontWeight: '900',
      marginTop: 3,
    },
    icon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 90, 31, 0.10)',
    },
    iconText: {
      fontSize: 19,
    },
    remainingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F4F8F1',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      paddingVertical: 10,
      marginTop: 13,
      marginBottom: 10,
    },
    remainingItem: {
      flex: 1,
      alignItems: 'center',
    },
    remainingValue: {
      color: TEXT,
      fontSize: 16,
      fontWeight: '900',
    },
    remainingLabel: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '800',
      marginTop: 2,
    },
    remainingDivider: {
      width: 1,
      height: 27,
      backgroundColor: BORDER,
    },
    suggestion: {
      minHeight: 96,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#F3E8E0',
      paddingVertical: 10,
    },
    suggestionBody: {
      flex: 1,
    },
    suggestionTitle: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    suggestionDesc: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
    },
    suggestionMacro: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      marginTop: 5,
    },
    nearbyButton: {
      alignSelf: 'flex-start',
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 90, 31, 0.26)',
      backgroundColor: 'rgba(255, 90, 31, 0.08)',
      paddingHorizontal: 10,
      marginTop: 8,
    },
    nearbyIcon: {
      fontSize: 13,
      marginRight: 5,
    },
    nearbyButtonText: {
      color: NEON,
      fontSize: 10,
      fontWeight: '900',
    },
    nearbyArrow: {
      color: NEON,
      fontSize: 16,
      fontWeight: '900',
      marginLeft: 5,
      marginTop: -1,
    },
    addButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      marginLeft: 9,
    },
    addButtonText: {
      color: '#10230F',
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 22,
    },
  });

export default NextMealCard;
