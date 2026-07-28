// FILE: src/components/AchievementsCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AchievementItem } from '../store/achievements';

type Props = {
  items: AchievementItem[];
  t: (key: string, defaultValue?: string, options?: any) => string;
};

const NEON = '#7CFF3A';
const CYAN = '#19E6D2';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';

export const AchievementsCard: React.FC<Props> = ({ items, t }) => {
  const getTitle = (id: string) => {
    switch (id) {
      case 'first_workout':
        return t('achievements.firstWorkout', 'First Workout');
      case 'ten_workouts':
        return t('achievements.tenWorkouts', '10 Workouts');
      case 'twentyfive_workouts':
        return t('achievements.twentyfiveWorkouts', '25 Workouts');
      case 'streak_3':
        return t('achievements.streak3', '3-Day Streak');
      case 'streak_7':
        return t('achievements.streak7', '7-Day Streak');
      case 'week_4':
        return t('achievements.week4', '4 Workouts This Week');
      case 'finish_program':
        return t('achievements.finishProgram', 'Complete 1 Program');
      default:
        return id;
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'first_workout':
        return '🔥';
      case 'ten_workouts':
        return '🏆';
      case 'twentyfive_workouts':
        return '💪';
      case 'streak_3':
        return '⚡';
      case 'streak_7':
        return '💎';
      case 'week_4':
        return '📈';
      case 'finish_program':
        return '👑';
      default:
        return '🏅';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>BADGES</Text>
          <Text style={styles.title}>
            {t('achievements.title', 'Achievements')}
          </Text>
        </View>

        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {items.filter((x) => x.unlocked).length}/{items.length}
          </Text>
        </View>
      </View>

      <View style={styles.wrap}>
        {items.map((item) => {
          const unlocked = item.unlocked;

          return (
            <View
              key={item.id}
              style={[
                styles.badge,
                unlocked ? styles.badgeOn : styles.badgeOff,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  unlocked ? styles.iconCircleOn : styles.iconCircleOff,
                ]}
              >
                <Text style={styles.iconText}>{getIcon(item.id)}</Text>
              </View>

              <Text
                style={[
                  styles.badgeTitle,
                  unlocked ? styles.badgeTitleOn : styles.badgeTitleOff,
                ]}
                numberOfLines={2}
              >
                {getTitle(item.id)}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.round((item.progress / Math.max(1, item.target)) * 100),
                      )}%`,
                      backgroundColor: unlocked ? NEON : 'rgba(148, 163, 184, 0.35)',
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.badgeProgress,
                  unlocked ? styles.badgeProgressOn : styles.badgeProgressOff,
                ]}
              >
                {item.progress}/{item.target}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 22,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.22)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -70,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(25, 230, 210, 0.10)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  },
  countPill: {
    backgroundColor: 'rgba(124, 255, 58, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countText: {
    color: NEON,
    fontSize: 12,
    fontWeight: '900',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '48%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    minHeight: 128,
    marginBottom: 10,
  },
  badgeOn: {
    backgroundColor: 'rgba(12, 38, 27, 0.96)',
    borderColor: 'rgba(124, 255, 58, 0.55)',
  },
  badgeOff: {
    backgroundColor: CARD_2,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconCircleOn: {
    backgroundColor: 'rgba(124, 255, 58, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.45)',
  },
  iconCircleOff: {
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  iconText: {
    fontSize: 21,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
    minHeight: 36,
  },
  badgeTitleOn: {
    color: TEXT,
  },
  badgeTitleOff: {
    color: '#CBD5E1',
  },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    overflow: 'hidden',
    marginTop: 9,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  badgeProgress: {
    fontSize: 12,
    fontWeight: '900',
    marginTop: 7,
  },
  badgeProgressOn: {
    color: NEON,
  },
  badgeProgressOff: {
    color: MUTED,
  },
});

export default AchievementsCard;