// FILE: src/components/WaterReminderCard.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  DEFAULT_WATER_REMINDER,
  disableWaterReminders,
  loadWaterReminderSettings,
  scheduleWaterReminders,
  saveWaterReminderSettings,
  WaterReminderSettings,
} from '../notifications/waterReminder';

type Props = {
  targetLiters: number;
  t: (key: string, defaultValue?: string, options?: any) => string;
};

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.96)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';

const INTERVALS = [60, 90, 120, 180];

export const WaterReminderCard: React.FC<Props> = ({ targetLiters, t }) => {
  const [settings, setSettings] = useState<WaterReminderSettings>({
    ...DEFAULT_WATER_REMINDER,
    targetLiters,
  });

  useEffect(() => {
    (async () => {
      const saved = await loadWaterReminderSettings();

      setSettings({
        ...saved,
        targetLiters,
      });
    })();
  }, [targetLiters]);

  const schedule = async (next: WaterReminderSettings) => {
    const saved = await saveWaterReminderSettings(next);
    setSettings(saved);

    if (saved.enabled) {
      await scheduleWaterReminders(saved, {
        title: t('nutrition.waterReminderTitle', 'Time to drink water'),
        body: t(
          'nutrition.waterReminderBody',
          'Drink about {{amount}}ml of water to stay hydrated.',
        ),
      });
    }
  };

  const toggleEnabled = async () => {
    if (settings.enabled) {
      await disableWaterReminders();

      setSettings({
        ...settings,
        enabled: false,
      });

      return;
    }

    await schedule({
      ...settings,
      enabled: true,
      targetLiters,
    });
  };

  const changeInterval = async (minutes: number) => {
    const next = {
      ...settings,
      intervalMinutes: minutes,
      targetLiters,
    };

    await schedule(next);
  };

  const activeText = settings.enabled
    ? t('nutrition.waterReminderOn', 'On')
    : t('nutrition.waterReminderOff', 'Off');

  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>💧</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>
            {t('nutrition.waterReminderKicker', 'HYDRATION')}
          </Text>

          <Text style={styles.title}>
            {t('nutrition.waterReminder', 'Water reminder')}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'nutrition.waterReminderDesc',
              'Get gentle reminders during the day based on your water target.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.toggle,
            settings.enabled && styles.toggleOn,
          ]}
          onPress={toggleEnabled}
        >
          <Text
            style={[
              styles.toggleText,
              settings.enabled && styles.toggleTextOn,
            ]}
          >
            {activeText}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>{targetLiters}L</Text>
          <Text style={styles.infoLabel}>
            {t('nutrition.waterTarget', 'Water target')}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoValue}>
            {settings.startHour}:00–{settings.endHour}:00
          </Text>
          <Text style={styles.infoLabel}>
            {t('nutrition.reminderTime', 'Reminder time')}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>
        {t('nutrition.reminderInterval', 'Reminder interval')}
      </Text>

      <View style={styles.intervalRow}>
        {INTERVALS.map((item) => {
          const active = settings.intervalMinutes === item;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[
                styles.intervalBtn,
                active && styles.intervalBtnActive,
              ]}
              onPress={() => changeInterval(item)}
            >
              <Text
                style={[
                  styles.intervalText,
                  active && styles.intervalTextActive,
                ]}
              >
                {item}m
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    borderColor: 'rgba(56, 189, 248, 0.22)',
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
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  kicker: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  title: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  toggle: {
    marginLeft: 10,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: CARD_2,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.20)',
  },
  toggleOn: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  toggleText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
  },
  toggleTextOn: {
    color: BG,
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginHorizontal: -5,
  },
  infoBox: {
    flex: 1,
    backgroundColor: CARD_2,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  infoValue: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '900',
  },
  infoLabel: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
    fontWeight: '700',
  },

  sectionLabel: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 15,
    marginBottom: 9,
  },
  intervalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  intervalBtn: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: CARD_2,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginRight: 8,
    marginBottom: 8,
  },
  intervalBtnActive: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  intervalText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '900',
  },
  intervalTextActive: {
    color: BG,
  },
});

export default WaterReminderCard;