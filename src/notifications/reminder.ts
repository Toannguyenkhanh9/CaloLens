// FILE: src/notifications/reminder.ts
import './notificationBackground';
import '../i18n/gymNotificationTranslations';

import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import {
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

import {
  buildSmartGymPlan,
  loadGymDaysPerWeek,
  loadUserGymProfile,
  SmartGymDay,
  TrainingDaysPerWeek,
} from '../data/gymSmartPlan';

import {
  applyEquipmentToPlan,
  loadGymEquipmentMode,
} from '../services/gymAdvanced';

import {
  translateGymDayTitle,
} from '../utils/gymI18n';

import {
  loadWeeklyRetentionStats,
} from '../services/gymRetention';

const CHANNEL_ID = 'gymforge-workout';

const DAILY_REMINDER_ID =
  'daily-workout-reminder';
const DAILY_SMART_PREFIX =
  'smart-workout-reminder';
const INACTIVE_REMINDER_ID =
  'inactive-workout-reminder';
const WEEKLY_GOAL_REMINDER_ID =
  'weekly-goal-reminder';

const LAST_WORKOUT_KEY =
  'workout:lastAt';
const INACTIVE_REMINDER_SCHEDULED_AT_KEY =
  'workout:inactiveReminderScheduledAt';

export const DAILY_REMINDER_SETTINGS_KEY =
  'workout:dailyReminderSettings';

const THREE_DAYS_MS =
  3 * 24 * 60 * 60 * 1000;

const TRAINING_WEEKDAYS:
Record<TrainingDaysPerWeek, number[]> = {
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
};

export type DailyReminderSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
};

export type ReminderText = {
  title: string;
  body: string;
};

export type NotificationTarget =
  | 'gym'
  | 'progress'
  | 'quick';

const DEFAULT_DAILY_REMINDER:
DailyReminderSettings = {
  enabled: false,
  hour: 20,
  minute: 0,
};

const clampHour = (
  value: number,
) => {
  if (!Number.isFinite(value)) {
    return 20;
  }

  return Math.max(
    0,
    Math.min(
      23,
      Math.round(value),
    ),
  );
};

const clampMinute = (
  value: number,
) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      59,
      Math.round(value),
    ),
  );
};

const normalizeDailySettings = (
  input?:
    | Partial<DailyReminderSettings>
    | null,
): DailyReminderSettings => {
  return {
    enabled:
      !!input?.enabled,
    hour:
      typeof input?.hour === 'number'
        ? clampHour(input.hour)
        : DEFAULT_DAILY_REMINDER.hour,
    minute:
      typeof input?.minute === 'number'
        ? clampMinute(input.minute)
        : DEFAULT_DAILY_REMINDER.minute,
  };
};

const requestNotificationPermission =
  async () => {
    try {
      const settings =
        await notifee.requestPermission();

      return (
        settings.authorizationStatus ===
          AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus ===
          AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      console.log(
        '[notifications] permission error',
        error,
      );

      return false;
    }
  };

const ensureWorkoutChannel =
  async () => {
    if (Platform.OS !== 'android') {
      return;
    }

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: i18n.t(
        'notifications.channelName',
        'GymForge reminders',
      ),
      importance:
        AndroidImportance.DEFAULT,
      visibility:
        AndroidVisibility.PUBLIC,
    });
  };

const getNextDailyTimestamp = (
  hour: number,
  minute: number,
) => {
  const fire = new Date();

  fire.setHours(
    hour,
    minute,
    0,
    0,
  );

  if (
    fire.getTime() <= Date.now()
  ) {
    fire.setDate(
      fire.getDate() + 1,
    );
  }

  return fire.getTime();
};

const getNextWeekdayTimestamp = (
  weekday: number,
  hour: number,
  minute: number,
) => {
  const fire = new Date();

  fire.setHours(
    hour,
    minute,
    0,
    0,
  );

  let addDays =
    (
      weekday -
      fire.getDay() +
      7
    ) % 7;

  if (
    addDays === 0 &&
    fire.getTime() <= Date.now()
  ) {
    addDays = 7;
  }

  fire.setDate(
    fire.getDate() + addDays,
  );

  return fire.getTime();
};

const notificationData = (
  target: NotificationTarget,
  extra: Record<string, string> = {},
) => ({
  target,
  ...extra,
});

const getSmartWorkoutSchedule =
  async () => {
    const [
      daysPerWeek,
      profile,
      equipment,
    ] = await Promise.all([
      loadGymDaysPerWeek(),
      loadUserGymProfile(),
      loadGymEquipmentMode(),
    ]);

    const basePlan =
      buildSmartGymPlan(
        daysPerWeek,
        profile,
      );

    const plan =
      applyEquipmentToPlan(
        basePlan,
        equipment,
      );

    const weekdays =
      TRAINING_WEEKDAYS[
        daysPerWeek
      ];

    return plan.days
      .map(
        (
          day,
          index,
        ) => ({
          day,
          weekday:
            weekdays[index],
          programId:
            plan.id,
          daysPerWeek,
        }),
      )
      .filter(
        item =>
          typeof item.weekday ===
          'number',
      );
  };

const translateDayTitle = (
  day: SmartGymDay,
) => {
  try {
    return translateGymDayTitle(
      day,
      i18n.t.bind(i18n) as any,
    );
  } catch {
    return day.title;
  }
};

const cancelNotificationIds =
  async (
    ids: string[],
  ) => {
    await Promise.all(
      ids.map(
        async id => {
          try {
            await notifee.cancelNotification(
              id,
            );
          } catch {}

          try {
            await notifee
              .cancelTriggerNotification(
                id,
              );
          } catch {}
        },
      ),
    );
  };

const dailyNotificationIds =
  () => [
    DAILY_REMINDER_ID,
    ...Array.from(
      {
        length: 7,
      },
      (
        _,
        index,
      ) =>
        `${DAILY_SMART_PREFIX}-${index + 1}`,
    ),
  ];

/**
 * Gọi một lần khi ứng dụng mở.
 */
export async function initNotifications() {
  const granted =
    await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  await ensureWorkoutChannel();

  const daily =
    await loadDailyReminderSettings();

  if (daily.enabled) {
    await scheduleDailyReminder(
      daily.hour,
      daily.minute,
    );
  }

  await scheduleInactiveWorkoutReminder();
  await scheduleWeeklyGoalReminder();

  return true;
}

export async function loadDailyReminderSettings():
Promise<DailyReminderSettings> {
  try {
    const raw =
      await AsyncStorage.getItem(
        DAILY_REMINDER_SETTINGS_KEY,
      );

    if (!raw) {
      return DEFAULT_DAILY_REMINDER;
    }

    return normalizeDailySettings(
      JSON.parse(raw),
    );
  } catch {
    return DEFAULT_DAILY_REMINDER;
  }
}

export async function saveDailyReminderSettings(
  settings:
    Partial<DailyReminderSettings>,
): Promise<DailyReminderSettings> {
  const next =
    normalizeDailySettings(
      settings,
    );

  await AsyncStorage.setItem(
    DAILY_REMINDER_SETTINGS_KEY,
    JSON.stringify(next),
  );

  return next;
}

/**
 * Đặt nhắc đúng các ngày có lịch Gym.
 *
 * Mỗi buổi tập dùng RepeatFrequency.WEEKLY,
 * vì vậy tên buổi tập không bị sai như khi dùng
 * một notification lặp DAILY.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  text: Partial<ReminderText> = {},
) {
  const granted =
    await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  await ensureWorkoutChannel();
  await cancelDailyReminder(false);

  const safeHour =
    clampHour(hour);
  const safeMinute =
    clampMinute(minute);

  try {
    const schedule =
      await getSmartWorkoutSchedule();

    if (schedule.length > 0) {
      await Promise.all(
        schedule.map(
          async (
            item,
            index,
          ) => {
            const dayTitle =
              translateDayTitle(
                item.day,
              );

            const trigger:
            TimestampTrigger = {
              type:
                TriggerType.TIMESTAMP,
              timestamp:
                getNextWeekdayTimestamp(
                  item.weekday,
                  safeHour,
                  safeMinute,
                ),
              repeatFrequency:
                RepeatFrequency.WEEKLY,
              alarmManager: {
                allowWhileIdle:
                  true,
              },
            };

            await notifee
              .createTriggerNotification(
                {
                  id:
                    `${DAILY_SMART_PREFIX}-${index + 1}`,
                  title:
                    text.title ||
                    i18n.t(
                      'notifications.smartTitle',
                      {
                        day:
                          dayTitle,
                        defaultValue:
                          'Today: {{day}} 💪',
                      },
                    ),
                  body:
                    text.body ||
                    i18n.t(
                      'notifications.smartBody',
                      {
                        duration:
                          item.day
                            .durationMin,
                        exercises:
                          item.day
                            .exercises
                            .length,
                        defaultValue:
                          '{{duration}} min • {{exercises}} exercises. Tap to start.',
                      },
                    ),
                  data:
                    notificationData(
                      'gym',
                      {
                        programId:
                          item.programId,
                        dayId:
                          item.day.id,
                      },
                    ),
                  android: {
                    channelId:
                      CHANNEL_ID,
                    pressAction: {
                      id:
                        'open-gym',
                    },
                  },
                  ios: {},
                },
                trigger,
              );
          },
        ),
      );
    } else {
      await scheduleGenericDailyReminder(
        safeHour,
        safeMinute,
        text,
      );
    }
  } catch (error) {
    console.log(
      '[notifications] smart daily schedule error',
      error,
    );

    await scheduleGenericDailyReminder(
      safeHour,
      safeMinute,
      text,
    );
  }

  await saveDailyReminderSettings({
    enabled: true,
    hour: safeHour,
    minute: safeMinute,
  });

  return true;
}

const scheduleGenericDailyReminder =
  async (
    hour: number,
    minute: number,
    text:
      Partial<ReminderText>,
  ) => {
    const trigger:
    TimestampTrigger = {
      type:
        TriggerType.TIMESTAMP,
      timestamp:
        getNextDailyTimestamp(
          hour,
          minute,
        ),
      repeatFrequency:
        RepeatFrequency.DAILY,
      alarmManager: {
        allowWhileIdle:
          true,
      },
    };

    await notifee
      .createTriggerNotification(
        {
          id:
            DAILY_REMINDER_ID,
          title:
            text.title ||
            i18n.t(
              'notifications.dailyTitle',
              'Time to train 💪',
            ),
          body:
            text.body ||
            i18n.t(
              'notifications.dailyBody',
              'Open GymForge and complete today’s workout.',
            ),
          data:
            notificationData(
              'gym',
            ),
          android: {
            channelId:
              CHANNEL_ID,
            pressAction: {
              id:
                'open-gym',
            },
          },
          ios: {},
        },
        trigger,
      );
  };

export async function cancelDailyReminder(
  saveDisabled = true,
) {
  await cancelNotificationIds(
    dailyNotificationIds(),
  );

  if (saveDisabled) {
    const current =
      await loadDailyReminderSettings();

    await saveDailyReminderSettings({
      ...current,
      enabled: false,
    });
  }
}

/**
 * Gọi khi người dùng hoàn thành một buổi tập.
 */
export async function markWorkoutActivity() {
  const now = Date.now();

  await AsyncStorage.setItem(
    LAST_WORKOUT_KEY,
    String(now),
  );

  await cancelInactiveWorkoutReminder();
  await scheduleInactiveWorkoutReminder();
  await scheduleWeeklyGoalReminder();
}

export async function getLastWorkoutAt():
Promise<number | null> {
  try {
    const raw =
      await AsyncStorage.getItem(
        LAST_WORKOUT_KEY,
      );

    if (!raw) {
      return null;
    }

    const ts =
      Number.parseInt(
        raw,
        10,
      );

    return Number.isNaN(ts)
      ? null
      : ts;
  } catch {
    return null;
  }
}

export async function cancelInactiveWorkoutReminder() {
  await cancelNotificationIds([
    INACTIVE_REMINDER_ID,
  ]);

  try {
    await AsyncStorage.removeItem(
      INACTIVE_REMINDER_SCHEDULED_AT_KEY,
    );
  } catch {}
}

export async function scheduleInactiveWorkoutReminder(
  text: Partial<ReminderText> = {},
) {
  const granted =
    await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  await ensureWorkoutChannel();
  await cancelNotificationIds([
    INACTIVE_REMINDER_ID,
  ]);

  const lastWorkoutAt =
    await getLastWorkoutAt();

  const baseTime =
    lastWorkoutAt ||
    Date.now();

  let reminderAt =
    baseTime +
    THREE_DAYS_MS;

  if (
    reminderAt <= Date.now()
  ) {
    reminderAt =
      Date.now() +
      60 * 1000;
  }

  const trigger:
  TimestampTrigger = {
    type:
      TriggerType.TIMESTAMP,
    timestamp:
      reminderAt,
    alarmManager: {
      allowWhileIdle:
        true,
    },
  };

  await notifee
    .createTriggerNotification(
      {
        id:
          INACTIVE_REMINDER_ID,
        title:
          text.title ||
          i18n.t(
            'notifications.inactiveTitle',
            'We miss you 💪',
          ),
        body:
          text.body ||
          i18n.t(
            'notifications.inactiveBody',
            'You have not trained for 3 days. Return to GymForge and keep your momentum.',
          ),
        data:
          notificationData(
            'gym',
          ),
        android: {
          channelId:
            CHANNEL_ID,
          pressAction: {
            id:
              'open-gym',
          },
        },
        ios: {},
      },
      trigger,
    );

  await AsyncStorage.setItem(
    INACTIVE_REMINDER_SCHEDULED_AT_KEY,
    String(reminderAt),
  );

  return true;
}

/**
 * Chủ nhật nhắc khi người dùng chưa đạt mục tiêu tuần.
 */
export async function scheduleWeeklyGoalReminder() {
  const granted =
    await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  await ensureWorkoutChannel();
  await cancelNotificationIds([
    WEEKLY_GOAL_REMINDER_ID,
  ]);

  try {
    const targetDays =
      await loadGymDaysPerWeek();

    const stats =
      await loadWeeklyRetentionStats(
        targetDays,
      );

    if (
      stats.remaining <= 0
    ) {
      return true;
    }

    const trigger:
    TimestampTrigger = {
      type:
        TriggerType.TIMESTAMP,
      timestamp:
        getNextWeekdayTimestamp(
          0,
          18,
          0,
        ),
      alarmManager: {
        allowWhileIdle:
          true,
      },
    };

    await notifee
      .createTriggerNotification(
        {
          id:
            WEEKLY_GOAL_REMINDER_ID,
          title:
            i18n.t(
              'notifications.weeklyGoalTitle',
              'Your weekly goal is waiting 🔥',
            ),
          body:
            i18n.t(
              'notifications.weeklyGoalBody',
              {
                count:
                  stats.remaining,
                defaultValue:
                  'You still have {{count}} workouts left to complete this week.',
              },
            ),
          data:
            notificationData(
              'progress',
            ),
          android: {
            channelId:
              CHANNEL_ID,
            pressAction: {
              id:
                'open-progress',
            },
          },
          ios: {},
        },
        trigger,
      );

    return true;
  } catch (error) {
    console.log(
      '[notifications] weekly goal error',
      error,
    );

    return false;
  }
}

/**
 * Test nhắc 3 ngày không tập sau N phút.
 */
export async function debugScheduleInactiveWorkoutReminderInMinutes(
  minutes: number,
) {
  const granted =
    await requestNotificationPermission();

  if (!granted) {
    return false;
  }

  await ensureWorkoutChannel();
  await cancelInactiveWorkoutReminder();

  const safeMinutes =
    Math.max(
      1,
      Math.round(minutes),
    );

  const trigger:
  TimestampTrigger = {
    type:
      TriggerType.TIMESTAMP,
    timestamp:
      Date.now() +
      safeMinutes *
        60 *
        1000,
    alarmManager: {
      allowWhileIdle:
        true,
    },
  };

  await notifee
    .createTriggerNotification(
      {
        id:
          INACTIVE_REMINDER_ID,
        title:
          i18n.t(
            'notifications.inactiveTitle',
            'We miss you 💪',
          ),
        body:
          i18n.t(
            'notifications.inactiveBody',
            'You have not trained for 3 days. Return to GymForge and keep your momentum.',
          ),
        data:
          notificationData(
            'gym',
          ),
        android: {
          channelId:
            CHANNEL_ID,
          pressAction: {
            id:
              'open-gym',
          },
        },
        ios: {},
      },
      trigger,
    );

  return true;
}
