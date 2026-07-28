// FILE: src/notifications/weightReminder.ts
import notifee, { AndroidImportance, TimestampTrigger, TriggerType } from '@notifee/react-native';
import { getEveryDays } from '../weight/weightStore';

async function ensureChannel() {
  await notifee.createChannel({ id: 'reminders', name: 'Reminders', importance: AndroidImportance.HIGH });
}
export async function scheduleNextWeightReminder() {
  const every = await getEveryDays();
  const next = new Date();           // 20:00 ngày + every
  next.setHours(20, 0, 0, 0);
  next.setDate(next.getDate() + every);

  await ensureChannel();
  const trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp: next.getTime() };
  await notifee.createTriggerNotification(
    { title: 'Cập nhật cân nặng', body: 'Đã đến lúc nhập cân nặng hôm nay.', android: { channelId: 'reminders' } },
    trigger
  );
}
