// FILE: src/services/gymAdvanced.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getGymExercise,
} from '../data/gymSmartPlan';

import type {
  SmartGymDay,
  SmartGymExercise,
  UserGymProfile,
} from '../data/gymSmartPlan';

import {
  loadGymPersonalRecords,
  loadGymWorkoutHistory,
} from '../store/gymProgress';
import {
  ensureUniqueExerciseIds,
} from '../data/gymSmartPlan';

const BODY_MEASUREMENT_KEY = 'gym:bodyMeasurements:v1';
const PROGRESS_PHOTO_KEY = 'gym:progressPhotos:v1';
const EQUIPMENT_MODE_KEY = 'gym:equipmentMode:v1';
const MISSED_WORKOUT_DISMISS_KEY = 'gym:missedWorkoutDismiss:v1';

export type GymEquipmentMode =
  | 'full_gym'
  | 'dumbbell_only'
  | 'machines'
  | 'no_barbell'
  | 'home';

export type QuickWorkoutTarget =
  | 'full_body'
  | 'chest'
  | 'back'
  | 'legs'
  | 'arms'
  | 'core'
  | 'fat_burn';

export type BodyMeasurementEntry = {
  id: string;
  createdAt: number;
  weightKg?: string;
  chestCm?: string;
  waistCm?: string;
  hipsCm?: string;
  thighCm?: string;
  armCm?: string;
  note?: string;
};

export type ProgressPhotoEntry = {
  id: string;
  createdAt: number;
  uri: string;
  pose: 'front' | 'side' | 'back' | 'other';
  note?: string;
};

export type GymWeeklyRecap = {
  weekStart: number;
  weekEnd: number;
  workoutsCompleted: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  prCount: number;
  topMuscleGroup: string;
};

export type GymAchievement = {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress: number;
  target: number;
};

export type MuscleRecoveryItem = {
  muscleGroup: string;
  lastTrainedAt?: number | null;
  hoursSince: number;
  recoveryHours: number;
  percent: number;
  status: 'ready' | 'recovering' | 'fresh';
};

const now = () => Date.now();

const makeId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const parseNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;

  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));

  return Number.isFinite(n) ? n : 0;
};

const getMondayStart = (time = Date.now()) => {
  const d = new Date(time);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d.getTime();
};

const getWeekEnd = (weekStart: number) => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);

  return d.getTime();
};

const inferMuscleGroup = (
  exerciseId = '',
  exerciseName = '',
): string => {
  const raw = `${exerciseId} ${exerciseName}`.toLowerCase();

  if (
    raw.includes('squat') ||
    raw.includes('leg') ||
    raw.includes('lunge') ||
    raw.includes('hip') ||
    raw.includes('deadlift')
  ) {
    return 'legs';
  }

  if (
    raw.includes('bench') ||
    raw.includes('chest') ||
    raw.includes('press')
  ) {
    return 'chest';
  }

  if (
    raw.includes('row') ||
    raw.includes('pull') ||
    raw.includes('lat')
  ) {
    return 'back';
  }

  if (
    raw.includes('shoulder') ||
    raw.includes('lateral')
  ) {
    return 'shoulders';
  }

  if (
    raw.includes('curl') ||
    raw.includes('triceps') ||
    raw.includes('arm')
  ) {
    return 'arms';
  }

  if (
    raw.includes('plank') ||
    raw.includes('crunch') ||
    raw.includes('core') ||
    raw.includes('dead bug')
  ) {
    return 'core';
  }

  return 'full body';
};

export const loadGymEquipmentMode = async (): Promise<GymEquipmentMode> => {
  const raw = await AsyncStorage.getItem(EQUIPMENT_MODE_KEY);

  if (
    raw === 'full_gym' ||
    raw === 'dumbbell_only' ||
    raw === 'machines' ||
    raw === 'no_barbell' ||
    raw === 'home'
  ) {
    return raw;
  }

  return 'full_gym';
};

export const saveGymEquipmentMode = async (
  mode: GymEquipmentMode,
) => {
  await AsyncStorage.setItem(EQUIPMENT_MODE_KEY, mode);
};

export const buildWeeklyRecap = async (): Promise<GymWeeklyRecap> => {
  const [history, records] = await Promise.all([
    loadGymWorkoutHistory(),
    loadGymPersonalRecords(),
  ]);

  const weekStart = getMondayStart();
  const weekEnd = getWeekEnd(weekStart);

  const weekHistory = history.filter(item => {
    return item.completedAt >= weekStart && item.completedAt <= weekEnd;
  });

  let totalSets = 0;
  let totalReps = 0;
  let totalVolumeKg = 0;

  const muscleCount: Record<string, number> = {};

  weekHistory.forEach(entry => {
    entry.exercises.forEach(exercise => {
      const muscle = inferMuscleGroup(
        exercise.exerciseId,
        exercise.exerciseName,
      );

      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;

      exercise.sets.forEach(set => {
        if (!set.completed) return;

        const reps = parseNumber(set.reps);
        const weight = parseNumber(set.weightKg);

        totalSets += 1;
        totalReps += reps;
        totalVolumeKg += weight * reps;
      });
    });
  });

  const prCount = records.filter(item => {
    return item.achievedAt >= weekStart && item.achievedAt <= weekEnd;
  }).length;

  const topMuscleGroup =
    Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'none';

  return {
    weekStart,
    weekEnd,
    workoutsCompleted: weekHistory.length,
    totalSets,
    totalReps,
    totalVolumeKg: Math.round(totalVolumeKg),
    prCount,
    topMuscleGroup,
  };
};

export const buildGymAchievements = async (): Promise<GymAchievement[]> => {
  const [history, records] = await Promise.all([
    loadGymWorkoutHistory(),
    loadGymPersonalRecords(),
  ]);

  const totalWorkouts = history.length;
  const totalPr = records.length;

  const weekStart = getMondayStart();
  const workoutsThisWeek = history.filter(
    item => item.completedAt >= weekStart,
  ).length;

  const totalSets = history.reduce((sum, entry) => {
    return (
      sum +
      entry.exercises.reduce((s, exercise) => {
        return s + exercise.sets.filter(set => set.completed).length;
      }, 0)
    );
  }, 0);

  return [
    {
      id: 'first_gym_workout',
      title: 'First Gym Workout',
      desc: 'Complete your first gym workout.',
      unlocked: totalWorkouts >= 1,
      progress: Math.min(totalWorkouts, 1),
      target: 1,
    },
    {
      id: 'gym_10_workouts',
      title: '10 Gym Workouts',
      desc: 'Complete 10 gym workouts.',
      unlocked: totalWorkouts >= 10,
      progress: Math.min(totalWorkouts, 10),
      target: 10,
    },
    {
      id: 'weekly_3_days',
      title: '3 Days This Week',
      desc: 'Train at least 3 days this week.',
      unlocked: workoutsThisWeek >= 3,
      progress: Math.min(workoutsThisWeek, 3),
      target: 3,
    },
    {
      id: 'first_pr',
      title: 'First Personal Record',
      desc: 'Break your first personal record.',
      unlocked: totalPr >= 1,
      progress: Math.min(totalPr, 1),
      target: 1,
    },
    {
      id: 'hundred_sets',
      title: '100 Sets Logged',
      desc: 'Complete 100 gym sets.',
      unlocked: totalSets >= 100,
      progress: Math.min(totalSets, 100),
      target: 100,
    },
  ];
};

export const getMissedWorkoutSuggestion = async (
  plannedDaysPerWeek: number,
) => {
  const dismissedRaw = await AsyncStorage.getItem(MISSED_WORKOUT_DISMISS_KEY);
  const dismissedAt = Number(dismissedRaw || 0);

  if (dismissedAt && now() - dismissedAt < 24 * 60 * 60 * 1000) {
    return {
      missed: false,
      title: '',
      text: '',
    };
  }

  const history = await loadGymWorkoutHistory();
  const latest = history.slice().sort((a, b) => b.completedAt - a.completedAt)[0];

  if (!latest) {
    return {
      missed: false,
      title: 'Start your first gym workout',
      text: 'Choose a gym day or start a quick workout today.',
    };
  }

  const daysSince =
    (now() - latest.completedAt) / (1000 * 60 * 60 * 24);

  const expectedGap = Math.max(1, Math.floor(7 / plannedDaysPerWeek));

  if (daysSince > expectedGap + 1) {
    return {
      missed: true,
      title: 'Missed workout detected',
      text: `You have not trained for ${Math.floor(
        daysSince,
      )} days. You can train today, skip it, or continue your weekly plan.`,
    };
  }

  return {
    missed: false,
    title: '',
    text: '',
  };
};

export const dismissMissedWorkoutToday = async () => {
  await AsyncStorage.setItem(MISSED_WORKOUT_DISMISS_KEY, String(Date.now()));
};

export const loadBodyMeasurements = async (): Promise<
  BodyMeasurementEntry[]
> => {
  try {
    const raw = await AsyncStorage.getItem(BODY_MEASUREMENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addBodyMeasurement = async (
  entry: Omit<BodyMeasurementEntry, 'id' | 'createdAt'>,
) => {
  const current = await loadBodyMeasurements();

  const next = [
    {
      ...entry,
      id: makeId(),
      createdAt: Date.now(),
    },
    ...current,
  ].slice(0, 200);

  await AsyncStorage.setItem(BODY_MEASUREMENT_KEY, JSON.stringify(next));

  return next;
};

export const deleteBodyMeasurement = async (id: string) => {
  const current = await loadBodyMeasurements();
  const next = current.filter(item => item.id !== id);

  await AsyncStorage.setItem(BODY_MEASUREMENT_KEY, JSON.stringify(next));

  return next;
};

export const loadProgressPhotos = async (): Promise<
  ProgressPhotoEntry[]
> => {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_PHOTO_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addProgressPhoto = async (
  entry: Omit<ProgressPhotoEntry, 'id' | 'createdAt'>,
) => {
  const current = await loadProgressPhotos();

  const next = [
    {
      ...entry,
      id: makeId(),
      createdAt: Date.now(),
    },
    ...current,
  ].slice(0, 300);

  await AsyncStorage.setItem(PROGRESS_PHOTO_KEY, JSON.stringify(next));

  return next;
};

export const deleteProgressPhoto = async (id: string) => {
  const current = await loadProgressPhotos();
  const next = current.filter(item => item.id !== id);

  await AsyncStorage.setItem(PROGRESS_PHOTO_KEY, JSON.stringify(next));

  return next;
};

export const buildMuscleRecoveryMap = async (): Promise<
  MuscleRecoveryItem[]
> => {
  const history = await loadGymWorkoutHistory();

  const groups = [
    'chest',
    'back',
    'legs',
    'shoulders',
    'arms',
    'core',
    'full body',
  ];

  const latestMap: Record<string, number> = {};

  history.forEach(entry => {
    entry.exercises.forEach(exercise => {
      const group = inferMuscleGroup(
        exercise.exerciseId,
        exercise.exerciseName,
      );

      latestMap[group] = Math.max(
        latestMap[group] || 0,
        entry.completedAt,
      );
    });
  });

  return groups.map(group => {
    const lastTrainedAt = latestMap[group] || null;
    const recoveryHours =
      group === 'legs' || group === 'back' ? 48 : 36;

    const hoursSince = lastTrainedAt
      ? Math.floor((Date.now() - lastTrainedAt) / (1000 * 60 * 60))
      : 999;

    const percent = Math.min(
      100,
      Math.round((hoursSince / recoveryHours) * 100),
    );

    const status =
      !lastTrainedAt
        ? 'fresh'
        : percent >= 100
          ? 'ready'
          : 'recovering';

    return {
      muscleGroup: group,
      lastTrainedAt,
      hoursSince,
      recoveryHours,
      percent,
      status,
    };
  });
};

/**
 * Thư viện bài tập dùng cho Tập nhanh.
 *
 * Tất cả bài đều lấy từ EXERCISES trong gymSmartPlan để giữ nguyên:
 * - id
 * - demoUrl
 * - note
 * - muscleGroup
 * - offline video key
 */
const QUICK_EXERCISES = {
  // Legs
  squat: getGymExercise('squat'),
  goblet_squat: getGymExercise('gobletSquat'),
  smith_low_bar_squat: getGymExercise('smithlowbarsquat'),
  leg_press: getGymExercise('legPress'),
  leg_extensions: getGymExercise('legextensions'),
  lying_leg_curl: getGymExercise('lyinglegcurl'),
  romanian_deadlift: getGymExercise('romanianDeadlift'),
  trap_bar_deadlift: getGymExercise('trapbardeadlift'),
  hip_thrust: getGymExercise('hipThrust'),
  hip_abduction: getGymExercise('hipAbduction'),
  bulgarian_split_squat: getGymExercise('bulgariansplitsquat'),
  dumbbell_squat: getGymExercise('dumbbellsquat'),

  // Chest
  machine_chest_press: getGymExercise('machineChestPress'),
  bench_press: getGymExercise('benchPress'),
  incline_barbell_bench_press: getGymExercise(
    'inclineBarbellBenchPress',
  ),
  incline_dumbbell_press: getGymExercise('inclineDumbbellPress'),
  upper_cable_fly: getGymExercise('upperCableFly'),
  machine_chest_fly: getGymExercise('machinechestfly'),
  lever_chest_press: getGymExercise('leverchestpress'),

  // Back
  lat_pulldown: getGymExercise('latPulldown'),
  single_arm_lat_pulldown: getGymExercise('singleArmLatPulldown'),
  seated_row: getGymExercise('seatedRow'),
  low_row: getGymExercise('lowRow'),
  assisted_pull_up: getGymExercise('assistedPullUp'),
  straight_arm_pushdown: getGymExercise('straightarmpushdown'),
  chest_support_db_row: getGymExercise('chestsupportdbrow'),
  wide_neutral_grip_lat_pulldown: getGymExercise(
    'wideneutralgriplatpulldown',
  ),
  single_arm_dumbbell_row: getGymExercise(
    'singlearmdumbbellrow',
  ),
  underhand_lat_pulldown: getGymExercise('underhandlatpulldown'),
  t_bar_row: getGymExercise('tbarrow'),

  // Shoulders
  dumbbell_shoulder_press: getGymExercise(
    'dumbbellShoulderPress',
  ),
  lateral_raise: getGymExercise('lateralRaise'),
  machine_shoulder_press: getGymExercise('machineshoulderpress'),
  cable_lateral_raise: getGymExercise('cablelateralraise'),
  dumbbell_front_raise: getGymExercise('dumbbellfrontraise'),
  dumbbell_rear_delt_fly: getGymExercise('dumbbellreardeltfly'),
  wide_grip_barbell_upright_row: getGymExercise(
    'widegripbarbelluprightrow',
  ),
  seated_barbell_shoulder_press: getGymExercise(
    'seatedbarbellshoulderpress',
  ),
  cable_front_raise: getGymExercise('cablefrontraise'),
  cable_upright_row: getGymExercise('cableuprightrow'),

  // Biceps
  dumbbell_curl: getGymExercise('dumbbellCurl'),
  db_hammer_curl: getGymExercise('dbHammerCurl'),
  normal_grip_ez_bb_curl: getGymExercise('normalGripEzBbCurl'),
  cable_curls: getGymExercise('cablecurls'),
  prone_incline_dumbbell_curl: getGymExercise(
    'proneinclinedumbbellcurl',
  ),
  cable_preacher_curl: getGymExercise('cablepreachercurl'),

  // Triceps
  triceps_pushdown: getGymExercise('tricepsPushdown'),
  db_triceps_extension: getGymExercise('dbTricepsExtension'),
  one_arm_cable_underhand_triceps_extension: getGymExercise(
    'onearmcableunderhandtricepextension',
  ),
  overhead_cable_triceps_extension: getGymExercise(
    'overheadcabletricepextension',
  ),
  cable_one_arm_triceps_extension: getGymExercise(
    'cableonearmtricepextension',
  ),
  dumbbell_skull_crusher: getGymExercise('dumbbellskullcrusher'),

  // Core / Cardio
  plank: getGymExercise('plank'),
  decline_ab_crunch: getGymExercise('declineabcrunch'),
  crunch: getGymExercise('crunch'),
  ab_roller: getGymExercise('abroller'),
  mountain_climbers: getGymExercise('mountainclimbers'),
  dumbbell_side_bend: getGymExercise('dumbbellsidebend'),
  treadmill_walk: getGymExercise('treadmillWalk'),
};

const normalizeExerciseId = (id: string) => {
  return id
    .toLowerCase()
    .replace(/__\d+$/g, '')
    .replace(/-/g, '_');
};

const dedupeExercises = (
  exercises: SmartGymExercise[],
): SmartGymExercise[] => {
  const used = new Set<string>();

  return exercises.filter(item => {
    const id = normalizeExerciseId(
      item.baseExerciseId || item.id,
    );

    if (used.has(id)) {
      return false;
    }

    used.add(id);
    return true;
  });
};

export const replaceExerciseForEquipment = (
  item: SmartGymExercise,
  mode: GymEquipmentMode,
): SmartGymExercise => {
  if (mode === 'full_gym') {
    return item;
  }

  const id = normalizeExerciseId(
    item.baseExerciseId || item.id,
  );

  if (mode === 'dumbbell_only' || mode === 'home') {
    if (item.muscleGroup === 'chest') {
      if (id.includes('dumbbell')) {
        return item;
      }

      return QUICK_EXERCISES.incline_dumbbell_press;
    }

    if (item.muscleGroup === 'back') {
      if (
        id.includes('dumbbell_row') ||
        id.includes('chest_support_db_row')
      ) {
        return item;
      }

      return QUICK_EXERCISES.single_arm_dumbbell_row;
    }

    if (item.muscleGroup === 'legs') {
      if (
        id.includes('lying_leg_curl') ||
        id.includes('leg_extension')
      ) {
        return QUICK_EXERCISES.romanian_deadlift;
      }

      if (
        id.includes('leg_press') ||
        id.includes('smith') ||
        id.includes('trap_bar') ||
        id === 'squat'
      ) {
        return QUICK_EXERCISES.goblet_squat;
      }

      return item;
    }

    if (item.muscleGroup === 'shoulders') {
      if (
        id.includes('press') &&
        !id.includes('dumbbell')
      ) {
        return QUICK_EXERCISES.dumbbell_shoulder_press;
      }

      if (
        id.includes('front_raise') &&
        !id.includes('dumbbell')
      ) {
        return QUICK_EXERCISES.dumbbell_front_raise;
      }

      if (
        id.includes('cable') ||
        id.includes('barbell') ||
        id.includes('machine')
      ) {
        return QUICK_EXERCISES.lateral_raise;
      }

      return item;
    }

    if (item.muscleGroup === 'biceps') {
      if (
        id.includes('cable') ||
        id.includes('ez_bb')
      ) {
        return id.includes('preacher')
          ? QUICK_EXERCISES.prone_incline_dumbbell_curl
          : QUICK_EXERCISES.db_hammer_curl;
      }

      return item;
    }

    if (item.muscleGroup === 'triceps') {
      if (id.includes('cable')) {
        return QUICK_EXERCISES.db_triceps_extension;
      }

      return item;
    }

    if (
      mode === 'home' &&
      item.muscleGroup === 'cardio'
    ) {
      return QUICK_EXERCISES.mountain_climbers;
    }

    return item;
  }

  if (mode === 'machines') {
    if (item.muscleGroup === 'chest') {
      if (
        id.includes('machine') ||
        id.includes('lever')
      ) {
        return item;
      }

      return id.includes('fly')
        ? QUICK_EXERCISES.machine_chest_fly
        : QUICK_EXERCISES.machine_chest_press;
    }

    if (item.muscleGroup === 'back') {
      if (
        id.includes('pulldown') ||
        id.includes('seated_row') ||
        id.includes('low_row') ||
        id.includes('straight_arm')
      ) {
        return item;
      }

      return QUICK_EXERCISES.seated_row;
    }

    if (item.muscleGroup === 'legs') {
      if (
        id.includes('leg_press') ||
        id.includes('leg_extension') ||
        id.includes('lying_leg_curl') ||
        id.includes('hip_abduction')
      ) {
        return item;
      }

      return id.includes('deadlift') ||
        id.includes('curl')
        ? QUICK_EXERCISES.lying_leg_curl
        : QUICK_EXERCISES.leg_press;
    }

    if (item.muscleGroup === 'shoulders') {
      if (
        id.includes('machine') ||
        id.includes('cable')
      ) {
        return item;
      }

      return id.includes('press')
        ? QUICK_EXERCISES.machine_shoulder_press
        : QUICK_EXERCISES.cable_lateral_raise;
    }

    if (item.muscleGroup === 'biceps') {
      if (id.includes('cable')) {
        return item;
      }

      return QUICK_EXERCISES.cable_curls;
    }

    if (item.muscleGroup === 'triceps') {
      if (id.includes('cable') || id.includes('pushdown')) {
        return item;
      }

      return QUICK_EXERCISES.triceps_pushdown;
    }

    return item;
  }

  if (mode === 'no_barbell') {
    if (
      id === 'bench_press' ||
      id.includes('barbell_bench')
    ) {
      return QUICK_EXERCISES.incline_dumbbell_press;
    }

    if (
      id === 'squat' ||
      id.includes('smith') ||
      id.includes('trap_bar')
    ) {
      return QUICK_EXERCISES.goblet_squat;
    }

    if (id.includes('t_bar_row')) {
      return QUICK_EXERCISES.chest_support_db_row;
    }

    if (
      id.includes('barbell_shoulder_press') ||
      id.includes('barbell_upright_row')
    ) {
      return QUICK_EXERCISES.dumbbell_shoulder_press;
    }

    if (id.includes('ez_bb')) {
      return QUICK_EXERCISES.db_hammer_curl;
    }

    return item;
  }

  return item;
};

export const applyEquipmentToGymDay = (
  day: SmartGymDay,
  mode: GymEquipmentMode,
): SmartGymDay => {
  return {
    ...day,
    exercises: ensureUniqueExerciseIds(
      dedupeExercises(
        day.exercises.map(item =>
          replaceExerciseForEquipment(item, mode),
        ),
      ),
    ),
  };
};

export const applyEquipmentToPlan = <
  T extends { days: SmartGymDay[] },
>(
  plan: T,
  mode: GymEquipmentMode,
): T => {
  return {
    ...plan,
    days: plan.days.map(day =>
      applyEquipmentToGymDay(day, mode),
    ),
  };
};

/**
 * Mỗi nhóm có 4 biến thể.
 * Ứng dụng tự đổi biến thể theo ngày và loại thiết bị.
 */
const QUICK_WORKOUT_VARIANTS: Record<
  QuickWorkoutTarget,
  SmartGymExercise[][]
> = {
  full_body: [
    [
      QUICK_EXERCISES.squat,
      QUICK_EXERCISES.bench_press,
      QUICK_EXERCISES.lat_pulldown,
      QUICK_EXERCISES.dumbbell_shoulder_press,
      QUICK_EXERCISES.db_hammer_curl,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.romanian_deadlift,
      QUICK_EXERCISES.incline_dumbbell_press,
      QUICK_EXERCISES.seated_row,
      QUICK_EXERCISES.lateral_raise,
      QUICK_EXERCISES.triceps_pushdown,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.leg_press,
      QUICK_EXERCISES.machine_chest_press,
      QUICK_EXERCISES.single_arm_lat_pulldown,
      QUICK_EXERCISES.hip_thrust,
      QUICK_EXERCISES.dumbbell_curl,
      QUICK_EXERCISES.ab_roller,
    ],
    [
      QUICK_EXERCISES.goblet_squat,
      QUICK_EXERCISES.upper_cable_fly,
      QUICK_EXERCISES.chest_support_db_row,
      QUICK_EXERCISES.dumbbell_rear_delt_fly,
      QUICK_EXERCISES.db_triceps_extension,
      QUICK_EXERCISES.mountain_climbers,
    ],
  ],

  chest: [
    [
      QUICK_EXERCISES.bench_press,
      QUICK_EXERCISES.incline_dumbbell_press,
      QUICK_EXERCISES.upper_cable_fly,
      QUICK_EXERCISES.lateral_raise,
      QUICK_EXERCISES.triceps_pushdown,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.incline_barbell_bench_press,
      QUICK_EXERCISES.machine_chest_press,
      QUICK_EXERCISES.machine_chest_fly,
      QUICK_EXERCISES.dumbbell_shoulder_press,
      QUICK_EXERCISES.db_triceps_extension,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.lever_chest_press,
      QUICK_EXERCISES.incline_dumbbell_press,
      QUICK_EXERCISES.upper_cable_fly,
      QUICK_EXERCISES.cable_lateral_raise,
      QUICK_EXERCISES.overhead_cable_triceps_extension,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.machine_chest_press,
      QUICK_EXERCISES.bench_press,
      QUICK_EXERCISES.machine_chest_fly,
      QUICK_EXERCISES.dumbbell_front_raise,
      QUICK_EXERCISES.dumbbell_skull_crusher,
      QUICK_EXERCISES.decline_ab_crunch,
    ],
  ],

  back: [
    [
      QUICK_EXERCISES.lat_pulldown,
      QUICK_EXERCISES.seated_row,
      QUICK_EXERCISES.single_arm_dumbbell_row,
      QUICK_EXERCISES.dumbbell_rear_delt_fly,
      QUICK_EXERCISES.dumbbell_curl,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.single_arm_lat_pulldown,
      QUICK_EXERCISES.low_row,
      QUICK_EXERCISES.chest_support_db_row,
      QUICK_EXERCISES.straight_arm_pushdown,
      QUICK_EXERCISES.db_hammer_curl,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.wide_neutral_grip_lat_pulldown,
      QUICK_EXERCISES.t_bar_row,
      QUICK_EXERCISES.assisted_pull_up,
      QUICK_EXERCISES.cable_upright_row,
      QUICK_EXERCISES.normal_grip_ez_bb_curl,
      QUICK_EXERCISES.ab_roller,
    ],
    [
      QUICK_EXERCISES.underhand_lat_pulldown,
      QUICK_EXERCISES.seated_row,
      QUICK_EXERCISES.single_arm_dumbbell_row,
      QUICK_EXERCISES.dumbbell_rear_delt_fly,
      QUICK_EXERCISES.cable_preacher_curl,
      QUICK_EXERCISES.dumbbell_side_bend,
    ],
  ],

  legs: [
    [
      QUICK_EXERCISES.squat,
      QUICK_EXERCISES.romanian_deadlift,
      QUICK_EXERCISES.leg_press,
      QUICK_EXERCISES.lying_leg_curl,
      QUICK_EXERCISES.hip_thrust,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.smith_low_bar_squat,
      QUICK_EXERCISES.leg_extensions,
      QUICK_EXERCISES.hip_abduction,
      QUICK_EXERCISES.bulgarian_split_squat,
      QUICK_EXERCISES.lying_leg_curl,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.trap_bar_deadlift,
      QUICK_EXERCISES.goblet_squat,
      QUICK_EXERCISES.leg_press,
      QUICK_EXERCISES.hip_thrust,
      QUICK_EXERCISES.hip_abduction,
      QUICK_EXERCISES.ab_roller,
    ],
    [
      QUICK_EXERCISES.dumbbell_squat,
      QUICK_EXERCISES.romanian_deadlift,
      QUICK_EXERCISES.bulgarian_split_squat,
      QUICK_EXERCISES.leg_extensions,
      QUICK_EXERCISES.lying_leg_curl,
      QUICK_EXERCISES.dumbbell_side_bend,
    ],
  ],

  arms: [
    [
      QUICK_EXERCISES.dumbbell_curl,
      QUICK_EXERCISES.db_hammer_curl,
      QUICK_EXERCISES.triceps_pushdown,
      QUICK_EXERCISES.db_triceps_extension,
      QUICK_EXERCISES.lateral_raise,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.normal_grip_ez_bb_curl,
      QUICK_EXERCISES.cable_curls,
      QUICK_EXERCISES.overhead_cable_triceps_extension,
      QUICK_EXERCISES.cable_one_arm_triceps_extension,
      QUICK_EXERCISES.dumbbell_front_raise,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.prone_incline_dumbbell_curl,
      QUICK_EXERCISES.cable_preacher_curl,
      QUICK_EXERCISES.dumbbell_skull_crusher,
      QUICK_EXERCISES.one_arm_cable_underhand_triceps_extension,
      QUICK_EXERCISES.dumbbell_rear_delt_fly,
      QUICK_EXERCISES.ab_roller,
    ],
    [
      QUICK_EXERCISES.db_hammer_curl,
      QUICK_EXERCISES.normal_grip_ez_bb_curl,
      QUICK_EXERCISES.triceps_pushdown,
      QUICK_EXERCISES.dumbbell_skull_crusher,
      QUICK_EXERCISES.cable_lateral_raise,
      QUICK_EXERCISES.dumbbell_side_bend,
    ],
  ],

  core: [
    [
      QUICK_EXERCISES.plank,
      QUICK_EXERCISES.crunch,
      QUICK_EXERCISES.ab_roller,
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.treadmill_walk,
    ],
    [
      QUICK_EXERCISES.decline_ab_crunch,
      QUICK_EXERCISES.dumbbell_side_bend,
      QUICK_EXERCISES.plank,
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.treadmill_walk,
    ],
    [
      QUICK_EXERCISES.ab_roller,
      QUICK_EXERCISES.crunch,
      QUICK_EXERCISES.dumbbell_side_bend,
      QUICK_EXERCISES.plank,
      QUICK_EXERCISES.treadmill_walk,
    ],
    [
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.decline_ab_crunch,
      QUICK_EXERCISES.ab_roller,
      QUICK_EXERCISES.plank,
      QUICK_EXERCISES.treadmill_walk,
    ],
  ],

  fat_burn: [
    [
      QUICK_EXERCISES.goblet_squat,
      QUICK_EXERCISES.incline_dumbbell_press,
      QUICK_EXERCISES.single_arm_dumbbell_row,
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.treadmill_walk,
      QUICK_EXERCISES.plank,
    ],
    [
      QUICK_EXERCISES.dumbbell_squat,
      QUICK_EXERCISES.dumbbell_shoulder_press,
      QUICK_EXERCISES.lat_pulldown,
      QUICK_EXERCISES.db_hammer_curl,
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.crunch,
    ],
    [
      QUICK_EXERCISES.leg_press,
      QUICK_EXERCISES.machine_chest_press,
      QUICK_EXERCISES.seated_row,
      QUICK_EXERCISES.lateral_raise,
      QUICK_EXERCISES.treadmill_walk,
      QUICK_EXERCISES.ab_roller,
    ],
    [
      QUICK_EXERCISES.bulgarian_split_squat,
      QUICK_EXERCISES.upper_cable_fly,
      QUICK_EXERCISES.chest_support_db_row,
      QUICK_EXERCISES.triceps_pushdown,
      QUICK_EXERCISES.mountain_climbers,
      QUICK_EXERCISES.dumbbell_side_bend,
    ],
  ],
};

const getQuickVariantIndex = (
  target: QuickWorkoutTarget,
  equipmentMode: GymEquipmentMode,
  variantCount: number,
) => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);

  const dayOfYear = Math.floor(
    (today.getTime() - startOfYear.getTime()) /
      (24 * 60 * 60 * 1000),
  );

  const salt = `${target}:${equipmentMode}`
    .split('')
    .reduce(
      (sum, char) => sum + char.charCodeAt(0),
      0,
    );

  return (dayOfYear + salt) % variantCount;
};

const selectQuickExercises = (
  primary: SmartGymExercise[],
  allVariants: SmartGymExercise[][],
  equipmentMode: GymEquipmentMode,
  limit: number,
) => {
  const candidates = [
    ...primary,
    ...allVariants.flat(),
  ].map(item =>
    replaceExerciseForEquipment(
      item,
      equipmentMode,
    ),
  );

  return dedupeExercises(candidates).slice(
    0,
    limit,
  );
};

export const buildQuickGymDay = (
  target: QuickWorkoutTarget,
  equipmentMode: GymEquipmentMode,
  profile?: UserGymProfile | null,
): SmartGymDay => {
  const injured = !!profile?.injured;
  const variants = QUICK_WORKOUT_VARIANTS[target];

  const variantIndex = getQuickVariantIndex(
    target,
    equipmentMode,
    variants.length,
  );

  const desiredCount =
    target === 'core' ? 5 : 6;

  const selectedExercises =
    selectQuickExercises(
      variants[variantIndex],
      variants,
      equipmentMode,
      desiredCount,
    );

  const exercises = ensureUniqueExerciseIds(
    selectedExercises,
  );

  const titleMap: Record<
    QuickWorkoutTarget,
    string
  > = {
    full_body: 'Quick Full Body',
    chest: 'Quick Chest',
    back: 'Quick Back',
    legs: 'Quick Legs',
    arms: 'Quick Arms',
    core: 'Quick Core',
    fat_burn: 'Quick Fat Burn',
  };

  const durationMap: Record<
    QuickWorkoutTarget,
    number
  > = {
    full_body: 40,
    chest: 35,
    back: 35,
    legs: 40,
    arms: 35,
    core: 30,
    fat_burn: 40,
  };

  return {
    id: `quick-${target}`,
    dayNumber: 1,
    title: titleMap[target],
    focus: 'Quick gym session',
    durationMin: durationMap[target],
    intensity: injured
      ? 'light'
      : target === 'fat_burn'
        ? 'hard'
        : 'moderate',
    exercises,
  };
};