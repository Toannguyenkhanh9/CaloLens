// FILE: src/components/TodayMenuCard.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  buildTodayMenu,
  TodayMealType,
} from '../nutrition/todayMenu';

type Props = {
  targetCalories: number;
  t: (key: string, defaultValue?: string, options?: any) => string;
};

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';
const YELLOW = '#FACC15';

const getMealEmoji = (type: TodayMealType) => {
  switch (type) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '🍱';
    case 'dinner':
      return '🌙';
    case 'snack':
      return '🍎';
    default:
      return '🥗';
  }
};

const getMealLabelKey = (type: TodayMealType) => {
  switch (type) {
    case 'breakfast':
      return {
        key: 'nutrition.breakfast',
        fallback: 'Breakfast',
      };
    case 'lunch':
      return {
        key: 'nutrition.lunch',
        fallback: 'Lunch',
      };
    case 'dinner':
      return {
        key: 'nutrition.dinner',
        fallback: 'Dinner',
      };
    case 'snack':
      return {
        key: 'nutrition.snack',
        fallback: 'Snack',
      };
    default:
      return {
        key: 'nutrition.meal',
        fallback: 'Meal',
      };
  }
};

export const TodayMenuCard: React.FC<Props> = ({
  targetCalories,
  t,
}) => {
  const menu = useMemo(() => {
    return buildTodayMenu(targetCalories);
  }, [targetCalories]);

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {t('nutrition.todayMenuKicker', 'TODAY MENU')}
          </Text>

          <Text style={styles.title}>
            {t('nutrition.todayMenuTitle', "Today's meal suggestion")}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'nutrition.todayMenuDesc',
              'This menu changes automatically every day based on your daily calorie target.',
            )}
          </Text>
        </View>

        <View style={styles.caloriePill}>
          <Text style={styles.caloriePillText}>
            {menu.totalCalories}
          </Text>
          <Text style={styles.caloriePillUnit}>
            {t('nutrition.kcal', 'kcal')}
          </Text>
        </View>
      </View>

      <View style={styles.dateBox}>
        <Text style={styles.dateText}>
          {t('nutrition.todayMenuDate', 'Today')} • {menu.dateKey}
        </Text>
      </View>

      <View style={styles.mealList}>
        {menu.meals.map((meal) => {
          const label = getMealLabelKey(meal.type);

          return (
            <View key={`${meal.type}-${meal.id}`} style={styles.mealRow}>
              <View style={styles.mealIcon}>
                <Text style={styles.mealEmoji}>
                  {getMealEmoji(meal.type)}
                </Text>
              </View>

              <View style={styles.mealContent}>
                <View style={styles.mealTop}>
                  <Text style={styles.mealType}>
                    {t(label.key, label.fallback)}
                  </Text>

                  <Text style={styles.mealCalories}>
                    {meal.calories} {t('nutrition.kcal', 'kcal')}
                  </Text>
                </View>

                <Text style={styles.mealTitle}>
                  {t(meal.titleKey, meal.defaultTitle)}
                </Text>

                <Text style={styles.mealDesc}>
                  {t(meal.descKey, meal.defaultDesc)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.22)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    right: -70,
    top: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124, 255, 58, 0.11)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  title: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  caloriePill: {
    marginLeft: 10,
    minWidth: 70,
    borderRadius: 18,
    backgroundColor: NEON,
    paddingVertical: 9,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  caloriePillText: {
    color: BG,
    fontSize: 17,
    fontWeight: '900',
  },
  caloriePillUnit: {
    color: BG,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  dateBox: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(250, 204, 21, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateText: {
    color: YELLOW,
    fontSize: 12,
    fontWeight: '900',
  },
  mealList: {
    gap: 9,
  },
  mealRow: {
    flexDirection: 'row',
    backgroundColor: CARD_2,
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  mealIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(25, 230, 210, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealContent: {
    flex: 1,
  },
  mealTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealType: {
    flex: 1,
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  mealCalories: {
    color: NEON,
    fontSize: 12,
    fontWeight: '900',
  },
  mealTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  mealDesc: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
});

export default TodayMenuCard;