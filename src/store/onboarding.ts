// FILE: src/storage/onboarding.ts
import AsyncStorage
  from '@react-native-async-storage/async-storage';

export const ONBOARDING_DONE_KEY =
  'gymforge:onboarding:done';

export const USER_PROFILE_KEY =
  'user:profile';

export type OnboardingState = {
  completed: boolean;
  source:
    | 'flag'
    | 'profile'
    | 'none';
};

const hasUsableProfile = (
  raw: string | null,
): boolean => {
  if (!raw) {
    return false;
  }

  try {
    const profile =
      JSON.parse(raw);

    return !!(
      profile &&
      typeof profile === 'object' &&
      typeof profile.name === 'string' &&
      profile.name.trim().length >= 2 &&
      profile.gender &&
      Number(profile.age) > 0 &&
      Number(profile.heightCm) > 0 &&
      Number(profile.weightKg) > 0 &&
      profile.goal
    );
  } catch {
    return false;
  }
};

export const getOnboardingState =
  async (): Promise<OnboardingState> => {
    const [
      doneValue,
      profileValue,
    ] = await Promise.all([
      AsyncStorage.getItem(
        ONBOARDING_DONE_KEY,
      ),
      AsyncStorage.getItem(
        USER_PROFILE_KEY,
      ),
    ]);

    if (doneValue === '1') {
      return {
        completed: true,
        source: 'flag',
      };
    }

    if (hasUsableProfile(profileValue)) {
      await AsyncStorage.setItem(
        ONBOARDING_DONE_KEY,
        '1',
      );

      return {
        completed: true,
        source: 'profile',
      };
    }

    return {
      completed: false,
      source: 'none',
    };
  };

export const markOnboardingCompleted =
  async (): Promise<void> => {
    await AsyncStorage.setItem(
      ONBOARDING_DONE_KEY,
      '1',
    );
  };

export const resetOnboarding =
  async (): Promise<void> => {
    await AsyncStorage.removeItem(
      ONBOARDING_DONE_KEY,
    );
  };