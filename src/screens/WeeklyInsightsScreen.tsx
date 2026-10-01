// FILE: src/screens/WeeklyInsightsScreen.tsx
import FoodAccentCard from '../components/FoodAccentCard';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage
  from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import {
  buildNutritionPlan,
  type AdvancedNutritionPlan,
} from '../nutrition/nutritionPlanner';
import {
  loadNutritionTargets,
} from '../nutrition/nutritionTargets';
import {
  calculateDailyNutrition,
  loadMealLogs,
} from '../nutrition/mealLog';
import {
  buildWeeklyNutritionReport,
  getPastDateKeys,
  type WeeklyNutritionReport,
} from '../nutrition/caloLensInsights';

const PROFILE_KEY =
  'user:profile';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const CYAN = '#F29132';
const YELLOW = '#F5A623';
const BORDER = '#F1D9C8';

const emptyReport:
WeeklyNutritionReport = {
  days: [],
  averageScore: 0,
  averageCalories: 0,
  calorieGoalDays: 0,
  proteinGoalDays: 0,
  loggedDays: 0,
};

const StatBox:
React.FC<{
  value: string;
  label: string;
  accent: string;
}> = ({
  value,
  label,
  accent,
}) => (
  <View style={styles.statBox}>
    <Text
      style={[
        styles.statValue,
        {
          color: accent,
        },
      ]}
    >
      {value}
    </Text>

    <Text style={styles.statLabel}>
      {label}
    </Text>
  </View>
);

export const WeeklyInsightsScreen:
React.FC = () => {
  const {t, i18n} =
    useTranslation();

  const [plan, setPlan] =
    useState<
      AdvancedNutritionPlan | null
    >(null);

  const [report, setReport] =
    useState<WeeklyNutritionReport>(
      emptyReport,
    );

  const load =
    useCallback(async () => {
      const [rawProfile, targets] =
        await Promise.all([
          AsyncStorage.getItem(
            PROFILE_KEY,
          ),
          loadNutritionTargets(),
        ]);

      const profile =
        rawProfile
          ? JSON.parse(rawProfile)
          : null;

      const nextPlan =
        buildNutritionPlan(
          profile,
          t as any,
          targets,
        );

      setPlan(nextPlan);

      if (!nextPlan) {
        setReport(emptyReport);
        return;
      }

      const dateKeys =
        getPastDateKeys(7)
          .reverse();

      const days =
        await Promise.all(
          dateKeys.map(
            async dateKey => {
              const meals =
                await loadMealLogs(
                  dateKey,
                );

              return {
                dateKey,
                meals,
                total:
                  calculateDailyNutrition(
                    meals,
                  ),
              };
            },
          ),
        );

      setReport(
        buildWeeklyNutritionReport({
          days,
          target: nextPlan,
        }),
      );
    }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const guidance =
    useMemo(() => {
      if (
        report.loggedDays < 3
      ) {
        return t(
          'caloLensInsights.weeklyNeedMoreLogs',
          'Log meals on at least three days to get a more useful weekly pattern.',
        );
      }

      if (
        report.proteinGoalDays < 4
      ) {
        return t(
          'caloLensInsights.weeklyProteinAdvice',
          'Protein was below target on several days. Add a lean protein source to each main meal.',
        );
      }

      if (
        report.calorieGoalDays >= 5
      ) {
        return t(
          'caloLensInsights.weeklyOnTrackAdvice',
          'Your calorie consistency is strong. Keep the current target for another week.',
        );
      }

      return t(
        'caloLensInsights.weeklyConsistencyAdvice',
        'Try to keep daily intake closer to your target and avoid large swings between days.',
      );
    }, [report, t]);

  const locale =
    i18n.resolvedLanguage ||
    i18n.language ||
    'en';

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <HeroFoodCornerAccent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>
              {t(
                'caloLensInsights.weeklyKicker',
                'LAST 7 DAYS',
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            {t(
              'caloLensInsights.weeklyTitle',
              'Weekly nutrition report',
            )}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'caloLensInsights.weeklySubtitle',
              'See how consistently your meals matched your calorie and macro targets.',
            )}
          </Text>
        </View>

        {!plan ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ◎
            </Text>

            <Text style={styles.emptyTitle}>
              {t(
                'caloLensInsights.profileRequired',
                'Complete your body profile',
              )}
            </Text>

            <Text style={styles.emptyText}>
              {t(
                'caloLensInsights.profileRequiredBody',
                'CaloLens needs your calorie and macro targets before building a weekly report.',
              )}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.scoreCard}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>
                  {report.averageScore}
                </Text>

                <Text style={styles.scoreUnit}>
                  /100
                </Text>
              </View>

              <View style={styles.scoreBody}>
                <Text style={styles.scoreKicker}>
                  {t(
                    'caloLensInsights.weeklyAverage',
                    'WEEKLY AVERAGE',
                  )}
                </Text>

                <Text style={styles.scoreTitle}>
                  {report.averageScore >= 80
                    ? t(
                        'caloLensInsights.strongWeek',
                        'Strong week',
                      )
                    : t(
                        'caloLensInsights.buildConsistency',
                        'Build consistency',
                      )}
                </Text>

                <Text style={styles.scoreDescription}>
                  {guidance}
                </Text>
              </View>
            </View>

            <View style={styles.statGrid}>
              <StatBox
                value={`${report.calorieGoalDays}/7`}
                label={t(
                  'caloLensInsights.calorieGoalDays',
                  'Calorie goal days',
                )}
                accent={NEON}
              />

              <StatBox
                value={`${report.proteinGoalDays}/7`}
                label={t(
                  'caloLensInsights.proteinGoalDays',
                  'Protein goal days',
                )}
                accent={CYAN}
              />
            </View>

            <View style={styles.statGrid}>
              <StatBox
                value={`${report.averageCalories}`}
                label={t(
                  'caloLensInsights.averageCalories',
                  'Average kcal',
                )}
                accent={YELLOW}
              />

              <StatBox
                value={`${report.loggedDays}/7`}
                label={t(
                  'caloLensInsights.loggedDays',
                  'Days logged',
                )}
                accent="#FF9350"
              />
            </View>

            <Text style={styles.sectionTitle}>
              {t(
                'caloLensInsights.dailyScores',
                'Daily scores',
              )}
            </Text>

            <View style={styles.daysCard}>
              {report.days.map(day => {
                const date =
                  new Date(
                    `${day.dateKey}T12:00:00`,
                  );

                const label =
                  new Intl.DateTimeFormat(
                    locale,
                    {
                      weekday: 'short',
                    },
                  ).format(date);

                return (
                  <View
                    key={day.dateKey}
                    style={styles.dayItem}
                  >
                    <Text style={styles.dayLabel}>
                      {label}
                    </Text>

                    <View style={styles.dayTrack}>
                      <View
                        style={[
                          styles.dayFill,
                          {
                            width:
                              `${day.score.score}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.dayScore}>
                      {day.mealCount > 0
                        ? day.score.score
                        : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.guidanceCard}>
              <View style={styles.guidanceIcon}>
                <Text style={styles.guidanceIconText}>
                  ✦
                </Text>
              </View>

              <View style={styles.guidanceBody}>
                <Text style={styles.guidanceTitle}>
                  {t(
                    'caloLensInsights.nextWeekFocus',
                    'Focus for next week',
                  )}
                </Text>

                <Text style={styles.guidanceText}>
                  {guidance}
                </Text>
              </View>
            </View>
          </>
        )}

        <FoodAccentCard variant="guidance" height={160} />
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: BG,
    },
    content: {
      paddingHorizontal: 8,
      paddingTop: 18,
      paddingBottom: 150,
    },
    hero: {
      paddingHorizontal: 5,
      marginBottom: 18,
    },
    kickerPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        'rgba(242, 145, 50, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(242, 145, 50, 0.28)',
      marginBottom: 13,
    },
    kickerText: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: TEXT,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '900',
    },
    subtitle: {
      color: MUTED,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 8,
      maxWidth: 355,
    },
    scoreCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.25)',
      padding: 15,
      marginBottom: 12,
      shadowColor: '#C28A66',
      shadowOpacity: 0.08,
      shadowRadius: 11,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    scoreCircle: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 8,
      borderColor: NEON,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFBF7',
      marginRight: 13,
    },
    scoreValue: {
      color: TEXT,
      fontSize: 26,
      fontWeight: '900',
    },
    scoreUnit: {
      color: MUTED,
      fontSize: 9,
      marginTop: -2,
    },
    scoreBody: {
      flex: 1,
    },
    scoreKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    scoreTitle: {
      color: TEXT,
      fontSize: 19,
      fontWeight: '900',
      marginTop: 3,
    },
    scoreDescription: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 5,
    },
    statGrid: {
      flexDirection: 'row',
      marginHorizontal: -4,
      marginBottom: 8,
    },
    statBox: {
      flex: 1,
      minHeight: 91,
      backgroundColor: CARD,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 13,
      marginHorizontal: 4,
    },
    statValue: {
      fontSize: 23,
      fontWeight: '900',
    },
    statLabel: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '800',
      marginTop: 6,
    },
    sectionTitle: {
      color: TEXT,
      fontSize: 19,
      fontWeight: '900',
      marginHorizontal: 5,
      marginTop: 9,
      marginBottom: 10,
    },
    daysCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 13,
      marginBottom: 12,
    },
    dayItem: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 38,
    },
    dayLabel: {
      width: 42,
      color: MUTED,
      fontSize: 11,
      fontWeight: '900',
      textTransform: 'capitalize',
    },
    dayTrack: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: '#F6E8DC',
    },
    dayFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: NEON,
    },
    dayScore: {
      width: 35,
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'right',
    },
    guidanceCard: {
      flexDirection: 'row',
      backgroundColor: '#FFF9E8',
      borderRadius: 19,
      borderWidth: 1,
      borderColor: '#F0DBA2',
      padding: 14,
    },
    guidanceIcon: {
      width: 39,
      height: 39,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF0B8',
      marginRight: 10,
    },
    guidanceIconText: {
      color: YELLOW,
      fontSize: 18,
      fontWeight: '900',
    },
    guidanceBody: {
      flex: 1,
    },
    guidanceTitle: {
      color: '#8B6500',
      fontSize: 14,
      fontWeight: '900',
    },
    guidanceText: {
      color: '#5C594E',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    emptyCard: {
      backgroundColor: CARD,
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.22)',
      padding: 22,
      alignItems: 'center',
    },
    emptyIcon: {
      color: NEON,
      fontSize: 42,
      fontWeight: '900',
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
      marginTop: 9,
    },
    emptyText: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 6,
    },
  });

export default WeeklyInsightsScreen;
