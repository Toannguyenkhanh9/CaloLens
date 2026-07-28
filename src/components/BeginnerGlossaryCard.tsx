// FILE: src/components/BeginnerGlossaryCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';

export const BeginnerGlossaryCard: React.FC = () => {
  const { t } = useTranslation();

  const rows = [
    {
      key: 'restDay',
      icon: '🛌',
      title: t('beginner.terms.restDay.title', 'Rest day'),
      desc: t(
        'beginner.terms.restDay.desc',
        'A recovery day. Your body rests and rebuilds, so do not skip it.',
      ),
    },
    {
      key: 'warmUp',
      icon: '🔥',
      title: t('beginner.terms.warmUp.title', 'Warm-up'),
      desc: t(
        'beginner.terms.warmUp.desc',
        'Light movement before training to prepare your body and reduce injury risk.',
      ),
    },
    {
      key: 'cooldown',
      icon: '🧘',
      title: t('beginner.terms.cooldown.title', 'Cooldown'),
      desc: t(
        'beginner.terms.cooldown.desc',
        'Easy movement or stretching after training to help your body recover.',
      ),
    },
    {
      key: 'hiit',
      icon: '⚡',
      title: t('beginner.terms.hiit.title', 'HIIT'),
      desc: t(
        'beginner.terms.hiit.desc',
        'High-Intensity Interval Training: short bursts of hard work followed by short rest.',
      ),
    },
    {
      key: 'rep',
      icon: '🔁',
      title: t('beginner.terms.rep.title', 'Rep'),
      desc: t(
        'beginner.terms.rep.desc',
        'One complete movement of an exercise. Example: one squat = one rep.',
      ),
    },
    {
      key: 'set',
      icon: '📦',
      title: t('beginner.terms.set.title', 'Set'),
      desc: t(
        'beginner.terms.set.desc',
        'A group of reps. Example: 10 squats done together = 1 set.',
      ),
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.kicker}>BEGINNER</Text>

          <Text style={styles.title}>
            {t('beginner.glossaryTitle', 'Beginner guide')}
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>💡</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        {t(
          'beginner.glossarySubtitle',
          'Quick explanations for common workout terms.',
        )}
      </Text>

      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{row.icon}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.term}>{row.title}</Text>
              <Text style={styles.desc}>{row.desc}</Text>
            </View>
          </View>
        ))}
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
    backgroundColor: 'rgba(25, 230, 210, 0.11)',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 19,
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 12,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 255, 58, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },

  list: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD_2,
    borderRadius: 18,
    padding: 13,
    marginTop: 9,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(124, 255, 58, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  term: {
    color: TEXT,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 4,
  },
  desc: {
    color: MUTED,
    lineHeight: 20,
    fontSize: 13,
  },
});

export default BeginnerGlossaryCard;