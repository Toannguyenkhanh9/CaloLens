// FILE: src/notifications/waterReminder.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

export const WATER_REMINDER_KEY = 'nutrition:waterReminder';
const WATER_NOTIFICATION_IDS_KEY = 'nutrition:waterReminderIds';
const CHANNEL_ID = 'water-reminders';

export type WaterReminderSettings = {
  enabled: boolean;
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  targetLiters: number;
};

export type WaterReminderText = {
  title: string;
  body: string;
};

export const DEFAULT_WATER_REMINDER: WaterReminderSettings = {
  enabled: false,
  startHour: 8,
  endHour: 22,
  intervalMinutes: 120,
  targetLiters: 2,
};

const normalizeSettings = (
  input?: Partial<WaterReminderSettings> | null,
): WaterReminderSettings => {
  return {
    enabled: !!input?.enabled,
    startHour:
      typeof input?.startHour === 'number'
        ? Math.max(0, Math.min(23, input.startHour))
        : DEFAULT_WATER_REMINDER.startHour,
    endHour:
      typeof input?.endHour === 'number'
        ? Math.max(0, Math.min(23, input.endHour))
        : DEFAULT_WATER_REMINDER.endHour,
    intervalMinutes:
      typeof input?.intervalMinutes === 'number'
        ? Math.max(30, Math.min(360, input.intervalMinutes))
        : DEFAULT_WATER_REMINDER.intervalMinutes,
    targetLiters:
      typeof input?.targetLiters === 'number'
        ? Math.max(0.5, Math.min(8, input.targetLiters))
        : DEFAULT_WATER_REMINDER.targetLiters,
  };
};

const getReminderTimes = (settings: WaterReminderSettings) => {
  const times: Array<{ hour: number; minute: number }> = [];

  const start = settings.startHour * 60;
  const end = settings.endHour * 60;
  const step = settings.intervalMinutes;

  for (let value = start; value <= end; value += step) {
    times.push({
      hour: Math.floor(value / 60),
      minute: value % 60,
    });
  }

  return times.length > 0 ? times : [{ hour: 8, minute: 0 }];
};

const getNextTimestamp = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  return date.getTime();
};

const requestPermission = async () => {
  const settings = await notifee.requestPermission();

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
};

const ensureChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Water reminders',
    importance: AndroidImportance.DEFAULT,
  });
};

const saveIds = async (ids: string[]) => {
  await AsyncStorage.setItem(WATER_NOTIFICATION_IDS_KEY, JSON.stringify(ids));
};

const loadIds = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(WATER_NOTIFICATION_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const loadWaterReminderSettings =
  async (): Promise<WaterReminderSettings> => {
    try {
      const raw = await AsyncStorage.getItem(WATER_REMINDER_KEY);

      if (!raw) {
        return DEFAULT_WATER_REMINDER;
      }

      return normalizeSettings(JSON.parse(raw));
    } catch {
      return DEFAULT_WATER_REMINDER;
    }
  };

export const saveWaterReminderSettings = async (
  settings: Partial<WaterReminderSettings>,
) => {
  const next = normalizeSettings(settings);
  await AsyncStorage.setItem(WATER_REMINDER_KEY, JSON.stringify(next));
  return next;
};

export const cancelWaterReminders = async () => {
  const ids = await loadIds();

  await Promise.all(
    ids.map(async (id) => {
      try {
        await notifee.cancelTriggerNotification(id);
      } catch {}
    }),
  );

  await saveIds([]);
};

export const scheduleWaterReminders = async (
  input: Partial<WaterReminderSettings>,
  text: WaterReminderText,
) => {
  const granted = await requestPermission();

  if (!granted) {
    return false;
  }

  await ensureChannel();
  await cancelWaterReminders();

  const settings = normalizeSettings({
    ...input,
    enabled: true,
  });

  const times = getReminderTimes(settings);
  const amountMl =
    Math.max(100, Math.round((settings.targetLiters * 1000) / times.length / 50) * 50);

  const ids: string[] = [];

  for (const time of times) {
    const id = `water-reminder-${time.hour}-${time.minute}`;
    ids.push(id);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: getNextTimestamp(time.hour, time.minute),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: text.title,
        body: text.body.replace('{{amount}}', String(amountMl)),
        android: {
          channelId: CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  }

  await saveIds(ids);
  await saveWaterReminderSettings(settings);

  return true;
};

export const disableWaterReminders = async () => {
  await cancelWaterReminders();

  const current = await loadWaterReminderSettings();
  await saveWaterReminderSettings({
    ...current,
    enabled: false,
  });
};