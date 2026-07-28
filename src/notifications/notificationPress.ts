// FILE: src/notifications/notificationPress.ts
import notifee, {
  EventType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  openNotificationTarget,
} from '../navigation/navigationRef';

export const PENDING_NOTIFICATION_KEY =
  'gymforge:pendingNotification';

export const savePendingNotification =
  async (
    data?:
      | Record<string, unknown>
      | null,
  ) => {
    if (!data) {
      return;
    }

    await AsyncStorage.setItem(
      PENDING_NOTIFICATION_KEY,
      JSON.stringify(data),
    );
  };

export const consumePendingNotification =
  async () => {
    try {
      const raw =
        await AsyncStorage.getItem(
          PENDING_NOTIFICATION_KEY,
        );

      if (!raw) {
        return;
      }

      await AsyncStorage.removeItem(
        PENDING_NOTIFICATION_KEY,
      );

      openNotificationTarget(
        JSON.parse(raw),
      );
    } catch (error) {
      console.log(
        '[notifications] consume press error',
        error,
      );
    }
  };

export const registerForegroundNotificationPress =
  () => {
    return notifee.onForegroundEvent(
      ({
        type,
        detail,
      }) => {
        if (
          type === EventType.PRESS
        ) {
          openNotificationTarget(
            detail.notification
              ?.data,
          );
        }
      },
    );
  };

export const handleInitialNotification =
  async () => {
    try {
      const initial =
        await notifee
          .getInitialNotification();

      if (
        initial?.notification
          ?.data
      ) {
        openNotificationTarget(
          initial.notification
            .data,
        );
      }

      await consumePendingNotification();
    } catch (error) {
      console.log(
        '[notifications] initial press error',
        error,
      );
    }
  };
