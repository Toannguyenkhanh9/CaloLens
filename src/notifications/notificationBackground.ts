// FILE: src/notifications/notificationBackground.ts
import notifee, {
  EventType,
} from '@notifee/react-native';

import {
  savePendingNotification,
} from './notificationPress';

notifee.onBackgroundEvent(
  async ({
    type,
    detail,
  }) => {
    if (
      type === EventType.PRESS
    ) {
      await savePendingNotification(
        detail.notification?.data,
      );
    }
  },
);
