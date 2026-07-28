// FILE: src/components/DailyIntakeCard.tsx
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
  buildDailyNutritionAdvice,
  calculateDailyNutrition,
  DailyNutritionTotal,
  loadMealLogs,
  MealLog,
  NutritionTargetSummary,
} from '../nutrition/mealLog';

const BG = '#06111D';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';
const YELLOW = '#FACC15';

const EMPTY_TOTAL:
DailyNutritionTotal = {
  calories: 0,
  proteinG: 0,
  carbsG: 0,
  fatsG: 0,
};

const Metric: React.FC<{
  label: string;
  current: number;
  target: number;
  unit: string;
}> = ({
  label,
  current,
  target,
  unit,
}) => {
  const percent =
    target > 0
      ? Math.min(
          100,
          Math.round(
            current /
              target *
              100,
          ),
        )
      : 0;

  return (
    <View style={styles.metric}>
      <View style={styles.metricTop}>
        <Text style={styles.metricLabel}>
          {label}
        </Text>

        <Text style={styles.metricValue}>
          {Math.round(current)}
          {' / '}
          {Math.round(target)}
          {unit}
        </Text>
      </View>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width:
                `${percent}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const DailyIntakeCard:
React.FC<{
  target: NutritionTargetSummary;
}> = ({
  target,
}) => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<any>();

  const [
    meals,
    setMeals,
  ] = useState<MealLog[]>([]);

  const [
    total,
    setTotal,
  ] = useState<DailyNutritionTotal>(
    EMPTY_TOTAL,
  );

  const reload =
    useCallback(
      async () => {
        const next =
          await loadMealLogs();

        setMeals(next);
        setTotal(
          calculateDailyNutrition(
            next,
          ),
        );
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const remaining =
    target.calories -
    total.calories;

  const caloriePercent =
    target.calories > 0
      ? Math.min(
          100,
          Math.round(
            total.calories /
              target.calories *
              100,
          ),
        )
      : 0;

  const advice = useMemo(
    () =>
      buildDailyNutritionAdvice({
        consumed:
          total,
        target,
      }),
    [
      target,
      total,
    ],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerBody}>
          <Text style={styles.kicker}>
            {t(
              'mealScan.todayKicker',
              'TODAY',
            )}
          </Text>

          <Text style={styles.title}>
            {t(
              'mealScan.dailyIntake',
              'Daily intake',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              'MealLog',
            )
          }
        >
          <Text style={styles.link}>
            {t(
              'mealScan.viewLog',
              'View log',
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calorieRow}>
        <View>
          <Text style={styles.calorieValue}>
            {total.calories}
            <Text style={styles.calorieTarget}>
              {' / '}
              {target.calories}
            </Text>
          </Text>

          <Text style={styles.calorieLabel}>
            {t(
              'mealScan.consumedKcal',
              'kcal consumed',
            )}
          </Text>
        </View>

        <View
          style={[
            styles.remainingPill,
            remaining < 0 &&
              styles.overPill,
          ]}
        >
          <Text
            style={[
              styles.remainingText,
              remaining < 0 &&
                styles.overText,
            ]}
          >
            {remaining >= 0
              ? t(
                  'mealScan.remainingKcal',
                  {
                    count:
                      Math.round(
                        remaining,
                      ),
                    defaultValue:
                      '{{count}} kcal left',
                  },
                )
              : t(
                  'mealScan.overKcal',
                  {
                    count:
                      Math.abs(
                        Math.round(
                          remaining,
                        ),
                      ),
                    defaultValue:
                      '{{count}} kcal over',
                  },
                )}
          </Text>
        </View>
      </View>

      <View style={styles.calorieTrack}>
        <View
          style={[
            styles.calorieFill,
            {
              width:
                `${caloriePercent}%`,
            },
          ]}
        />
      </View>

      <Metric
        label={t(
          'nutrition.protein',
          'Protein',
        )}
        current={total.proteinG}
        target={target.proteinG}
        unit="g"
      />

      <Metric
        label={t(
          'nutrition.carb',
          'Carb',
        )}
        current={total.carbsG}
        target={target.carbsG}
        unit="g"
      />

      <Metric
        label={t(
          'nutrition.fat',
          'Fat',
        )}
        current={total.fatsG}
        target={target.fatsG}
        unit="g"
      />

      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.scanButton}
          onPress={() =>
            navigation.navigate(
              'MealScanner',
            )
          }
        >
          <Text style={styles.scanButtonText}>
            📷{' '}
            {t(
              'mealScan.scanFood',
              'Scan food',
            )}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.manualButton}
          onPress={() =>
            navigation.navigate(
              'MealReview',
              {
                foods: [],
                source:
                  'manual',
              },
            )
          }
        >
          <Text style={styles.manualButtonText}>
            ＋{' '}
            {t(
              'mealScan.manual',
              'Manual',
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.adviceCard}>
        <Text style={styles.adviceTitle}>
          ✦{' '}
          {t(
            'mealScan.adviceTitle',
            'Today’s advice',
          )}
        </Text>

        {advice.map(
          (
            item,
            index,
          ) => (
            <View
              key={`${item.key}-${index}`}
              style={styles.adviceRow}
            >
              <View
                style={[
                  styles.adviceDot,
                  item.level ===
                    'warning' &&
                    styles.warningDot,
                  item.level ===
                    'good' &&
                    styles.goodDot,
                ]}
              />

              <Text style={styles.adviceText}>
                {t(
                  item.key,
                  {
                    ...(item.options ||
                      {}),
                    defaultValue:
                      item.defaultValue,
                  },
                )}
              </Text>
            </View>
          ),
        )}
      </View>

      {meals.length === 0 ? (
        <Text style={styles.emptyText}>
          {t(
            'mealScan.noMeals',
            'No food has been logged today.',
          )}
        </Text>
      ) : (
        <Text style={styles.loggedText}>
          {t(
            'mealScan.mealsLogged',
            {
              count:
                meals.length,
              defaultValue:
                '{{count}} meals logged today',
            },
          )}
        </Text>
      )}
    </View>
  );
};

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        'rgba(11, 22, 36, 0.96)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(124, 255, 58, 0.26)',
      padding: 15,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerBody: {
      flex: 1,
    },
    kicker: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 3,
    },
    link: {
      color: NEON,
      fontSize: 13,
      fontWeight: '900',
    },
    calorieRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 16,
    },
    calorieValue: {
      color: NEON,
      fontSize: 31,
      fontWeight: '900',
    },
    calorieTarget: {
      color: TEXT,
      fontSize: 18,
    },
    calorieLabel: {
      color: MUTED,
      fontSize: 11,
      fontWeight: '700',
      marginTop: 2,
    },
    remainingPill: {
      backgroundColor:
        'rgba(124, 255, 58, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(124, 255, 58, 0.32)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    overPill: {
      backgroundColor:
        'rgba(251, 113, 133, 0.12)',
      borderColor:
        'rgba(251, 113, 133, 0.32)',
    },
    remainingText: {
      color: NEON,
      fontSize: 11,
      fontWeight: '900',
    },
    overText: {
      color: '#FB7185',
    },
    calorieTrack: {
      height: 11,
      borderRadius: 999,
      backgroundColor:
        'rgba(148, 163, 184, 0.17)',
      overflow: 'hidden',
      marginTop: 11,
      marginBottom: 14,
    },
    calorieFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: NEON,
    },
    metric: {
      marginTop: 10,
    },
    metricTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 6,
    },
    metricLabel: {
      color: MUTED,
      fontSize: 12,
      fontWeight: '800',
    },
    metricValue: {
      color: TEXT,
      fontSize: 12,
      fontWeight: '900',
    },
    track: {
      height: 7,
      borderRadius: 999,
      backgroundColor:
        'rgba(148, 163, 184, 0.14)',
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: CYAN,
    },
    actionRow: {
      flexDirection: 'row',
      marginTop: 16,
    },
    scanButton: {
      flex: 1,
      backgroundColor: NEON,
      borderRadius: 999,
      paddingVertical: 13,
      alignItems: 'center',
      marginRight: 6,
    },
    scanButtonText: {
      color: BG,
      fontSize: 14,
      fontWeight: '900',
    },
    manualButton: {
      flex: 0.7,
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(25, 230, 210, 0.38)',
      paddingVertical: 13,
      alignItems: 'center',
      marginLeft: 6,
    },
    manualButtonText: {
      color: CYAN,
      fontSize: 14,
      fontWeight: '900',
    },
    adviceCard: {
      backgroundColor:
        'rgba(6, 17, 29, 0.72)',
      borderRadius: 16,
      padding: 12,
      marginTop: 14,
    },
    adviceTitle: {
      color: YELLOW,
      fontSize: 13,
      fontWeight: '900',
      marginBottom: 7,
    },
    adviceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 6,
    },
    adviceDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: CYAN,
      marginTop: 6,
      marginRight: 8,
    },
    warningDot: {
      backgroundColor: '#FB7185',
    },
    goodDot: {
      backgroundColor: NEON,
    },
    adviceText: {
      flex: 1,
      color: '#E2E8F0',
      fontSize: 12,
      lineHeight: 18,
    },
    emptyText: {
      color: MUTED,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 11,
    },
    loggedText: {
      color: MUTED,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 11,
    },
  });

export default DailyIntakeCard;
