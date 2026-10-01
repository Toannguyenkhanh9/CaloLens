// FILE: src/components/NutritionScoreCard.tsx
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
  type NutritionTargetSummary,
} from '../nutrition/mealLog';
import {
  calculateNutritionScore,
} from '../nutrition/caloLensInsights';

const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF5A1F';
const CYAN = '#F47B35';
const YELLOW = '#F4A51C';

export const NutritionScoreCard:
React.FC<{
  target: NutritionTargetSummary;
}> = ({target}) => {
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

  const result =
    useMemo(
      () =>
        calculateNutritionScore({
          consumed,
          target,
          mealCount:
            meals.length,
        }),
      [
        consumed,
        meals.length,
        target,
      ],
    );

  const levelText =
    result.level === 'excellent'
      ? t(
          'caloLensInsights.scoreExcellent',
          'Excellent balance',
        )
      : result.level === 'good'
      ? t(
          'caloLensInsights.scoreGood',
          'Good progress',
        )
      : t(
          'caloLensInsights.scoreFocus',
          'Needs more attention',
        );

  const accent =
    result.level === 'excellent'
      ? NEON
      : result.level === 'good'
      ? CYAN
      : YELLOW;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() =>
        navigation.navigate(
          'WeeklyInsights',
        )
      }
    >
      <View
        style={[
          styles.scoreRing,
          {
            borderColor:
              accent,
          },
        ]}
      >
        <Text style={styles.scoreValue}>
          {result.score}
        </Text>

        <Text style={styles.scoreUnit}>
          /100
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.kicker}>
          {t(
            'caloLensInsights.scoreKicker',
            'NUTRITION SCORE',
          )}
        </Text>

        <Text style={styles.title}>
          {levelText}
        </Text>

        <Text style={styles.description}>
          {t(
            'caloLensInsights.scoreDescription',
            'Based on calories, protein, macro balance and meal logging today.',
          )}
        </Text>

        <Text style={styles.link}>
          {t(
            'caloLensInsights.viewWeekly',
            'View weekly report',
          )}{'  ›'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles =
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        'rgba(255, 90, 31, 0.24)',
      padding: 14,
      marginBottom: 13,
      shadowColor: '#B89079',
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },
    scoreRing: {
      width: 78,
      height: 78,
      borderRadius: 39,
      borderWidth: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7FAF5',
      marginRight: 13,
    },
    scoreValue: {
      color: TEXT,
      fontSize: 24,
      fontWeight: '900',
    },
    scoreUnit: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '800',
      marginTop: -2,
    },
    body: {
      flex: 1,
    },
    kicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    title: {
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
      marginTop: 3,
    },
    description: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    link: {
      color: NEON,
      fontSize: 11,
      fontWeight: '900',
      marginTop: 7,
    },
  });

export default NutritionScoreCard;
