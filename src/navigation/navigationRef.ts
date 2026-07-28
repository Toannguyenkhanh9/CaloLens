// FILE: src/navigation/navigationRef.ts
import {
  createNavigationContainerRef,
} from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<any>();

let pendingTarget:
  | Record<string, string>
  | null = null;

export const openNotificationTarget = (
  data?:
    | Record<string, unknown>
    | null,
) => {
  if (!data) {
    return;
  }

  const normalized =
    Object.fromEntries(
      Object.entries(data).map(
        ([key, value]) => [
          key,
          String(value ?? ''),
        ],
      ),
    );

  if (!navigationRef.isReady()) {
    pendingTarget =
      normalized;
    return;
  }

  const target =
    normalized.target;

  if (target === 'progress') {
    navigationRef.navigate(
      'Progress',
    );
    return;
  }

  if (target === 'quick') {
    navigationRef.navigate(
      'Quick',
    );
    return;
  }

  navigationRef.navigate(
    'Gym',
  );
};

export const flushPendingNotification =
  () => {
    if (!pendingTarget) {
      return;
    }

    const next =
      pendingTarget;

    pendingTarget = null;
    openNotificationTarget(
      next,
    );
  };
