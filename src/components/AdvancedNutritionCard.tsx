// FILE: src/components/AdvancedNutritionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AdvancedNutritionPlan } from '../nutrition/nutritionPlanner';

type Props = {
  plan: AdvancedNutritionPlan;
  t: (key: string, defaultValue?: string, options?: any) => string;
};

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';

const StatBox = ({
  label,
  value,
  sub,
  accent = NEON,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) => {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
};

export const AdvancedNutritionCard: React.FC<Props> = ({ plan, t }) => {
  const a = plan.advanced;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {t('nutrition.advancedMode', 'ADVANCED MODE')}
          </Text>
          <Text style={styles.title}>
            {t('nutrition.advancedTitle', 'Professional nutrition analysis')}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('nutrition.pro', 'PRO')}</Text>
        </View>
      </View>

      <Text style={styles.summary}>{a.summary}</Text>

      <View style={styles.grid}>
        <StatBox
          label={t('nutrition.bmi', 'BMI')}
          value={a.bmi}
          sub={a.bmiLabel}
          accent={NEON}
        />

        <StatBox
          label={t('nutrition.bmr', 'BMR')}
          value={a.bmr}
          sub={t('nutrition.kcalPerDay', 'kcal/day')}
          accent={CYAN}
        />

        <StatBox
          label={t('nutrition.tdee', 'TDEE')}
          value={a.tdee}
          sub={a.activityLabel}
          accent="#FACC15"
        />

        <StatBox
          label={t('nutrition.adjustment', 'Adjustment')}
          value={`${a.calorieDelta > 0 ? '+' : ''}${a.calorieDelta}%`}
          sub={a.goalLabel}
          accent={a.calorieDelta < 0 ? '#FB7185' : NEON}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('nutrition.mealSplit', 'Meal calorie split')}
        </Text>

        {a.mealSplit.map((meal) => (
          <View key={meal.key} style={styles.splitRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.splitLabel}>{meal.label}</Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${meal.percent}%` }]} />
              </View>
            </View>

            <Text style={styles.splitValue}>{meal.calories} kcal</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('nutrition.hydration', 'Hydration schedule')}
        </Text>

        {a.hydrationSchedule.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.bulletRow}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {a.warnings.length > 0 ? (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>
            {t('nutrition.note', 'Important note')}
          </Text>

          {a.warnings.map((item, index) => (
            <Text key={`${item}-${index}`} style={styles.warningText}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
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
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontSize: 18,
    lineHeight: 23,
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
  summary: {
    color: '#E5E7EB',
    lineHeight: 21,
    marginBottom: 14,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: CARD_2,
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  statValue: {
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 5,
  },
  statSub: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  section: {
    marginTop: 8,
    backgroundColor: CARD_2,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  sectionTitle: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  splitLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: NEON,
  },
  splitValue: {
    color: TEXT,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 10,
    width: 76,
    textAlign: 'right',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    color: NEON,
    fontWeight: '900',
    marginRight: 9,
  },
  bulletText: {
    flex: 1,
    color: '#E5E7EB',
    lineHeight: 20,
    fontSize: 13,
  },
  warningBox: {
    marginTop: 12,
    backgroundColor: 'rgba(69, 40, 12, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.42)',
    borderRadius: 18,
    padding: 13,
  },
  warningTitle: {
    color: '#FDE68A',
    fontWeight: '900',
    marginBottom: 7,
  },
  warningText: {
    color: '#FFF7ED',
    lineHeight: 20,
    fontSize: 13,
    marginTop: 3,
  },
});

export default AdvancedNutritionCard;
