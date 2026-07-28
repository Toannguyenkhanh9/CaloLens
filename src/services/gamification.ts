// FILE: src/services/gamification.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const GAMIFICATION_CHANGED_EVENT = 'gamificationChanged';

const STORAGE_KEY = 'gamification:v1';

export type MissionId = 'workout' | 'water' | 'weight' | 'nutritionTip';

export type AchievementId =
  | 'firstWorkout'
  | 'tenWorkouts'
  | 'twentyFiveWorkouts'
  | 'streak3'
  | 'streak7'
  | 'level5'
  | 'level10'
  | 'mission10'
  | 'water7';

export type DailyMission = {
  id: MissionId;
  titleKey: string;
  defaultTitle: string;
  xp: number;
  completed: boolean;
};

export type GamificationState = {
  totalXp: number;
  level: number;
  streak: number;
  bestStreak: number;
  completedWorkouts: number;
  totalMinutes: number;
  totalMissionsCompleted: number;
  totalWaterDays: number;
  lastWorkoutDate: string | null;
  lastWaterDate: string | null;
  todayDate: string;
  missions: DailyMission[];
  achievements: AchievementId[];
};

export type AchievementDefinition = {
  id: AchievementId;
  emoji: string;
  titleKey: string;
  defaultTitle: string;
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'firstWorkout',
    emoji: '🏁',
    titleKey: 'gamification.achievements.firstWorkout',
    defaultTitle: 'First workout',
  },
  {
    id: 'tenWorkouts',
    emoji: '💪',
    titleKey: 'gamification.achievements.tenWorkouts',
    defaultTitle: '10 workouts',
  },
  {
    id: 'twentyFiveWorkouts',
    emoji: '🔥',
    titleKey: 'gamification.achievements.twentyFiveWorkouts',
    defaultTitle: '25 workouts',
  },
  {
    id: 'streak3',
    emoji: '🔥',
    titleKey: 'gamification.achievements.streak3',
    defaultTitle: '3-day streak',
  },
  {
    id: 'streak7',
    emoji: '🏆',
    titleKey: 'gamification.achievements.streak7',
    defaultTitle: '7-day streak',
  },
  {
    id: 'level5',
    emoji: '⭐',
    titleKey: 'gamification.achievements.level5',
    defaultTitle: 'Reach level 5',
  },
  {
    id: 'level10',
    emoji: '👑',
    titleKey: 'gamification.achievements.level10',
    defaultTitle: 'Reach level 10',
  },
  {
    id: 'mission10',
    emoji: '✅',
    titleKey: 'gamification.achievements.mission10',
    defaultTitle: 'Complete 10 missions',
  },
  {
    id: 'water7',
    emoji: '💧',
    titleKey: 'gamification.achievements.water7',
    defaultTitle: 'Drink water 7 days',
  },
];

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;
};

const dateToTime = (date: string) => {
  return new Date(`${date}T00:00:00`).getTime();
};

const dayDiff = (from: string, to: string) => {
  const diff = dateToTime(to) - dateToTime(from);
  return Math.round(diff / (24 * 60 * 60 * 1000));
};

export const getLevelInfo = (totalXp: number) => {
  let remaining = Math.max(0, totalXp);
  let level = 1;
  let need = 300;

  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = 300 + (level - 1) * 100;
  }

  return {
    level,
    currentXp: remaining,
    nextXp: need,
    progressPercent: Math.min(100, Math.round((remaining / need) * 100)),
  };
};

const buildTodayMissions = (): DailyMission[] => {
  return [
    {
      id: 'workout',
      titleKey: 'gamification.missions.workout',
      defaultTitle: "Complete today's workout",
      xp: 50,
      completed: false,
    },
    {
      id: 'water',
      titleKey: 'gamification.missions.water',
      defaultTitle: 'Reach your water goal',
      xp: 20,
      completed: false,
    },
    {
      id: 'weight',
      titleKey: 'gamification.missions.weight',
      defaultTitle: 'Update your weight',
      xp: 15,
      completed: false,
    },
    {
      id: 'nutritionTip',
      titleKey: 'gamification.missions.nutritionTip',
      defaultTitle: 'Read one nutrition tip',
      xp: 10,
      completed: false,
    },
  ];
};

const defaultState = (): GamificationState => {
  const today = todayKey();

  return {
    totalXp: 0,
    level: 1,
    streak: 0,
    bestStreak: 0,
    completedWorkouts: 0,
    totalMinutes: 0,
    totalMissionsCompleted: 0,
    totalWaterDays: 0,
    lastWorkoutDate: null,
    lastWaterDate: null,
    todayDate: today,
    missions: buildTodayMissions(),
    achievements: [],
  };
};

const ensureToday = (state: GamificationState): GamificationState => {
  const today = todayKey();

  if (state.todayDate !== today) {
    return {
      ...state,
      todayDate: today,
      missions: buildTodayMissions(),
    };
  }

  return state;
};

const normalizeState = (input: Partial<GamificationState> | null): GamificationState => {
  const base = defaultState();
  const merged = {
    ...base,
    ...(input || {}),
  };

  const levelInfo = getLevelInfo(merged.totalXp || 0);

  return ensureToday({
    ...merged,
    level: levelInfo.level,
    achievements: Array.isArray(merged.achievements)
      ? merged.achievements
      : [],
    missions: Array.isArray(merged.missions)
      ? merged.missions
      : buildTodayMissions(),
  });
};

const saveState = async (state: GamificationState) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadGamification = async (): Promise<GamificationState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const state = defaultState();
      await saveState(state);
      return state;
    }

    const state = normalizeState(JSON.parse(raw));
    await saveState(state);

    return state;
  } catch {
    return defaultState();
  }
};

const addXpToState = (state: GamificationState, xp: number) => {
  const totalXp = Math.max(0, state.totalXp + Math.max(0, xp));
  const levelInfo = getLevelInfo(totalXp);

  state.totalXp = totalXp;
  state.level = levelInfo.level;
};

const completeMissionOnState = (
  state: GamificationState,
  missionId: MissionId,
) => {
  const mission = state.missions.find((item) => item.id === missionId);

  if (!mission || mission.completed) {
    return 0;
  }

  mission.completed = true;
  state.totalMissionsCompleted += 1;

  addXpToState(state, mission.xp);

  return mission.xp;
};

const unlockAchievements = (state: GamificationState): AchievementId[] => {
  const unlocked: AchievementId[] = [];

  const checks: Array<[AchievementId, boolean]> = [
    ['firstWorkout', state.completedWorkouts >= 1],
    ['tenWorkouts', state.completedWorkouts >= 10],
    ['twentyFiveWorkouts', state.completedWorkouts >= 25],
    ['streak3', state.streak >= 3],
    ['streak7', state.streak >= 7],
    ['level5', state.level >= 5],
    ['level10', state.level >= 10],
    ['mission10', state.totalMissionsCompleted >= 10],
    ['water7', state.totalWaterDays >= 7],
  ];

  checks.forEach(([id, ok]) => {
    if (ok && !state.achievements.includes(id)) {
      state.achievements.push(id);
      unlocked.push(id);
    }
  });

  return unlocked;
};

const emitChanged = (
  state: GamificationState,
  unlockedAchievements: AchievementId[] = [],
) => {
  DeviceEventEmitter.emit(GAMIFICATION_CHANGED_EVENT, {
    state,
    unlockedAchievements,
  });
};

export const completeDailyMission = async (missionId: MissionId) => {
  const state = await loadGamification();

  completeMissionOnState(state, missionId);
  const unlockedAchievements = unlockAchievements(state);

  await saveState(state);
  emitChanged(state, unlockedAchievements);

  return {
    state,
    unlockedAchievements,
  };
};

export const markWorkoutCompleted = async (minutes = 0) => {
  const state = await loadGamification();
  const today = todayKey();

  if (state.lastWorkoutDate !== today) {
    if (state.lastWorkoutDate) {
      const diff = dayDiff(state.lastWorkoutDate, today);
      state.streak = diff === 1 ? state.streak + 1 : 1;
    } else {
      state.streak = 1;
    }

    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.lastWorkoutDate = today;
  }

  state.completedWorkouts += 1;
  state.totalMinutes += Math.max(0, Math.round(minutes));

  addXpToState(state, 50);
  completeMissionOnState(state, 'workout');

  const unlockedAchievements = unlockAchievements(state);

  await saveState(state);
  emitChanged(state, unlockedAchievements);

  return {
    state,
    unlockedAchievements,
  };
};

export const markWaterGoalCompleted = async () => {
  const state = await loadGamification();
  const today = todayKey();

  if (state.lastWaterDate !== today) {
    state.totalWaterDays += 1;
    state.lastWaterDate = today;
  }

  completeMissionOnState(state, 'water');

  const unlockedAchievements = unlockAchievements(state);

  await saveState(state);
  emitChanged(state, unlockedAchievements);

  return {
    state,
    unlockedAchievements,
  };
};

export const markWeightUpdated = async () => {
  return completeDailyMission('weight');
};

export const markNutritionTipRead = async () => {
  return completeDailyMission('nutritionTip');
};

export const resetGamificationForDebug = async () => {
  const state = defaultState();
  await saveState(state);
  emitChanged(state, []);

  return state;
};