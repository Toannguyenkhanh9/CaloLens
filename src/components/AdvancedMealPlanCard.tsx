// FILE: src/components/AdvancedMealPlanCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MealGroup, MealOption } from '../nutrition/nutritionPlanner';

type Props = {
  mealGroups?: MealGroup[];
  t: (key: string, defaultValue?: string, options?: any) => string;
};

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';

const MealOptionCard: React.FC<{
  meal: MealOption;
  index: number;
}> = ({ meal, index }) => {
  return (
    <View style={styles.mealOptionCard}>
      <View style={styles.mealOptionHeader}>
        <View style={styles.mealIndex}>
          <Text style={styles.mealIndexText}>{index + 1}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.mealOptionTitle}>{meal.title}</Text>
          <Text style={styles.mealOptionDesc}>{meal.description}</Text>
        </View>
      </View>

      <View style={styles.mealMetaRow}>
        <Text style={styles.mealMeta}>{meal.calories} kcal</Text>
        <Text style={styles.mealMeta}>P {meal.proteinG}g</Text>
        <Text style={styles.mealMeta}>C {meal.carbsG}g</Text>
        <Text style={styles.mealMeta}>F {meal.fatsG}g</Text>
      </View>
    </View>
  );
};

export const AdvancedMealPlanCard: React.FC<Props> = ({ mealGroups, t }) => {
  if (!mealGroups?.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>
            {t('nutrition.advancedMealPlanKicker', 'MEAL OPTIONS')}
          </Text>

          <Text style={styles.title}>
            {t('nutrition.advancedMealPlan', 'Advanced meal plan')}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {t(
          'nutrition.advancedMealPlanDesc',
          'Choose from multiple meals for each time of day. Calories and macros are estimated for easier planning.',
        )}
      </Text>

      {mealGroups.map((group) => (
        <View key={group.type} style={styles.mealSection}>
          <Text style={styles.mealSectionTitle}>{group.title}</Text>

          {group.options.map((meal, index) => (
            <MealOptionCard key={meal.id} meal={meal} index={index} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.22)',
    shadowColor: '#00FFD1',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(124, 255, 58, 0.10)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  title: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 21,
    lineHeight: 27,
  },
  badge: {
    marginLeft: 10,
    backgroundColor: NEON,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: BG,
    fontWeight: '900',
    fontSize: 11,
  },
  subtitle: {
    color: MUTED,
    lineHeight: 20,
    marginBottom: 14,
    fontSize: 13,
  },

  mealSection: {
    marginTop: 12,
  },
  mealSectionTitle: {
    color: '#E5E7EB',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 10,
  },

  mealOptionCard: {
    backgroundColor: CARD_2,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.16)',
    marginBottom: 10,
  },
  mealOptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(124, 255, 58, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.35)',
  },
  mealIndexText: {
    color: NEON,
    fontWeight: '900',
    fontSize: 15,
  },
  mealOptionTitle: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 15,
    lineHeight: 20,
  },
  mealOptionDesc: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },

  mealMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 11,
  },
  mealMeta: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '900',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 7,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.12)',
  },
});

export default AdvancedMealPlanCard;