// FILE: src/screens/AdvancedMealPlanScreen.tsx
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
} from '../nutrition/nutritionPlanner';
import type {
  ProfileInput,
} from '../recommendation/programRecommender';

const PROFILE_KEY =
  'user:profile';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';
const BORDER = '#DDE8D9';

const mealIcons = [
  '🌅',
  '🍱',
  '🍽️',
  '🍎',
];

export const AdvancedMealPlanScreen:
React.FC = () => {
  const {t} =
    useTranslation();

  const [
    profile,
    setProfile,
  ] =
    useState<ProfileInput | null>(
      null,
    );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const raw =
            await AsyncStorage.getItem(
              PROFILE_KEY,
            );

          setProfile(
            raw
              ? JSON.parse(raw)
              : null,
          );
        } catch {
          setProfile(null);
        }
      })();
    }, []),
  );

  const plan =
    useMemo(
      () =>
        buildNutritionPlan(
          profile,
          t as any,
        ),
      [
        profile,
        t,
      ],
    );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <View
        pointerEvents="none"
        style={styles.glowTop}
      />

      <View
        pointerEvents="none"
        style={styles.glowBottom}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>
              {t(
                'nutrition.advancedMealPlanKicker',
                'MEAL OPTIONS',
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            {t(
              'nutrition.advancedMealPlan',
              'Advanced meal plan',
            )}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'nutrition.advancedMealPlanDesc',
              'Choose balanced meals for each time of day. Calories and macros are estimated for easier planning.',
            )}
          </Text>
        </View>

        {!plan ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>
                🥗
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              {t(
                'nutrition.noProfileTitle',
                'Complete your profile first',
              )}
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
            <View style={styles.targetCard}>
              <View>
                <Text style={styles.targetKicker}>
                  {t(
                    'nutrition.dailyGoal',
                    'DAILY TARGET',
                  )}
                </Text>

                <Text style={styles.targetValue}>
                  {plan.calories}{' '}
                  <Text style={styles.targetUnit}>
                    kcal
                  </Text>
                </Text>
              </View>

              <View style={styles.targetMacroWrap}>
                <Text style={styles.targetMacro}>
                  P {plan.proteinG}g
                </Text>

                <Text style={styles.targetMacro}>
                  C {plan.carbsG}g
                </Text>

                <Text style={styles.targetMacro}>
                  F {plan.fatsG}g
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              {t(
                'nutrition.mealPlan',
                'Meal suggestions',
              )}
            </Text>

            {plan.meals.map(
              (
                meal,
                index,
              ) => (
                <View
                  key={`${meal}-${index}`}
                  style={styles.mealCard}
                >
                  <View style={styles.mealIcon}>
                    <Text style={styles.mealIconText}>
                      {mealIcons[
                        index %
                        mealIcons.length
                      ]}
                    </Text>
                  </View>

                  <View style={styles.mealBody}>
                    <Text style={styles.mealOrder}>
                      {t(
                        'nutrition.meal',
                        'MEAL',
                      )}{' '}
                      {index + 1}
                    </Text>

                    <Text style={styles.mealText}>
                      {meal}
                    </Text>
                  </View>

                  <Text style={styles.mealCheck}>
                    ✓
                  </Text>
                </View>
              ),
            )}

            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Text style={styles.tipIconText}>
                  ✦
                </Text>
              </View>

              <View style={styles.tipBody}>
                <Text style={styles.tipTitle}>
                  {t(
                    'nutrition.tips',
                    'Planning tip',
                  )}
                </Text>

                <Text style={styles.tipText}>
                  {plan.tips?.[0] ||
                    t(
                      'nutrition.tipFallback',
                      'Keep portions flexible and adjust them to your daily calorie target.',
                    )}
                </Text>
              </View>
            </View>
          </>
        )}
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
      paddingBottom: 160,
    },
    glowTop: {
      position: 'absolute',
      top: -90,
      right: -90,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
    },
    glowBottom: {
      position: 'absolute',
      bottom: 60,
      left: -110,
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor:
        'rgba(99, 201, 52, 0.08)',
    },
    hero: {
      paddingHorizontal: 5,
      marginBottom: 18,
    },
    kickerPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.30)',
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
      marginBottom: 14,
    },
    kickerText: {
      color: CYAN,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.1,
    },
    title: {
      color: TEXT,
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
    },
    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 9,
      maxWidth: 360,
    },
    targetCard: {
      minHeight: 105,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      backgroundColor: CARD,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.26)',
      padding: 15,
      marginBottom: 20,
      shadowColor: '#849087',
      shadowOpacity: 0.09,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },
    targetKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    targetValue: {
      color: NEON,
      fontSize: 31,
      fontWeight: '900',
      marginTop: 5,
    },
    targetUnit: {
      color: MUTED,
      fontSize: 12,
      fontWeight: '800',
    },
    targetMacroWrap: {
      alignItems: 'flex-end',
    },
    targetMacro: {
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
      marginVertical: 2,
    },
    sectionTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginHorizontal: 5,
      marginBottom: 11,
    },
    mealCard: {
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 12,
      marginBottom: 9,
      shadowColor: '#879487',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },
    mealIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      marginRight: 11,
    },
    mealIconText: {
      fontSize: 22,
    },
    mealBody: {
      flex: 1,
    },
    mealOrder: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    mealText: {
      color: TEXT,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '700',
      marginTop: 4,
    },
    mealCheck: {
      color: NEON,
      fontSize: 18,
      fontWeight: '900',
      marginLeft: 8,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: '#FFF9E8',
      borderRadius: 19,
      borderWidth: 1,
      borderColor: '#F0DBA2',
      padding: 14,
      marginTop: 7,
    },
    tipIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF0B8',
      marginRight: 10,
    },
    tipIconText: {
      color: '#D99A00',
      fontSize: 17,
      fontWeight: '900',
    },
    tipBody: {
      flex: 1,
    },
    tipTitle: {
      color: '#8B6500',
      fontSize: 14,
      fontWeight: '900',
    },
    tipText: {
      color: '#5C594E',
      fontSize: 12,
      lineHeight: 19,
      marginTop: 5,
    },
    emptyCard: {
      backgroundColor: CARD,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.24)',
      padding: 18,
    },
    emptyIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      marginBottom: 12,
    },
    emptyEmoji: {
      fontSize: 25,
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
    },
    emptyText: {
      color: MUTED,
      fontSize: 13,
      lineHeight: 20,
      marginTop: 7,
    },
  });

export default AdvancedMealPlanScreen;
