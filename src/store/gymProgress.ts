// FILE: src/store/gymProgress.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const makeKey = (programId: string, dayId: string) => {
  return `gymProgress:${programId}:${dayId}`;
};

const GYM_WORKOUT_HISTORY_KEY = 'gym:workoutHistory:v1';
const GYM_PERSONAL_RECORDS_KEY = 'gym:personalRecords:v1';

export type GymExerciseSetLog = {
  weightKg: string;
  reps: string;
  completed: boolean;
  rpe?: number | null;
};

export type GymExerciseLog = {
  sets: GymExerciseSetLog[];
  exerciseRpe?: number | null;
  updatedAt?: number;
};

export type GymDayProgress = {
  completedExercises: Record<string, boolean>;
  exerciseLogs: Record<string, GymExerciseLog>;
  sessionRpe?: number | null;
  completedAt?: number | null;
};

export type GymWorkoutHistoryExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: GymExerciseSetLog[];
  exerciseRpe?: number | null;
};

export type GymPersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimatedOneRepMax: number;
  achievedAt: number;
  historyEntryId: string;
};

export type GymWorkoutHistoryEntry = {
  id: string;
  programId: string;
  dayId: string;
  dayTitle: string;
  completedAt: number;
  sessionRpe?: number | null;
  exercises: GymWorkoutHistoryExercise[];
  personalRecords?: GymPersonalRecord[];
};

const defaultProgress = (): GymDayProgress => ({
  completedExercises: {},
  exerciseLogs: {},
  sessionRpe: null,
  completedAt: null,
});

const parseNumber = (value?: string | number | null) => {
  if (value === null || value === undefined) return 0;

  const n = Number(String(value).replace(',', '.').replace(/[^\d.]/g, ''));

  return Number.isFinite(n) ? n : 0;
};

export const estimateOneRepMax = (weightKg: number, reps: number) => {
  if (!weightKg || !reps) return 0;

  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
};

export const makeDefaultGymSets = (
  setCount: number,
  defaultReps = '',
): GymExerciseSetLog[] => {
  return Array.from({
    length: Math.max(1, setCount),
  }).map(() => ({
    weightKg: '',
    reps: defaultReps,
    completed: false,
    rpe: null,
  }));
};

const normalizeSets = (
  sets: GymExerciseSetLog[] | undefined,
  setCount: number,
  defaultReps = '',
): GymExerciseSetLog[] => {
  const base = makeDefaultGymSets(setCount, defaultReps);

  if (!Array.isArray(sets)) {
    return base;
  }

  return base.map((item, index) => ({
    ...item,
    ...(sets[index] || {}),
  }));
};

export const getBestSetFromSets = (sets: GymExerciseSetLog[]) => {
  return sets.reduce(
    (best, item) => {
      if (!item.completed) return best;

      const weightKg = parseNumber(item.weightKg);
      const reps = parseNumber(item.reps);
      const estimatedOneRepMax = estimateOneRepMax(weightKg, reps);

      if (
        estimatedOneRepMax > best.estimatedOneRepMax ||
        (estimatedOneRepMax === best.estimatedOneRepMax &&
          weightKg > best.weightKg)
      ) {
        return {
          weightKg,
          reps,
          estimatedOneRepMax,
        };
      }

      return best;
    },
    {
      weightKg: 0,
      reps: 0,
      estimatedOneRepMax: 0,
    },
  );
};

export const loadGymDayProgress = async (
  programId: string,
  dayId: string,
): Promise<GymDayProgress> => {
  try {
    const raw = await AsyncStorage.getItem(makeKey(programId, dayId));

    if (!raw) {
      return defaultProgress();
    }

    const parsed = JSON.parse(raw);

    return {
      ...defaultProgress(),
      ...parsed,
      completedExercises: parsed?.completedExercises || {},
      exerciseLogs: parsed?.exerciseLogs || {},
    };
  } catch {
    return defaultProgress();
  }
};

export const saveGymDayProgress = async (
  programId: string,
  dayId: string,
  progress: GymDayProgress,
) => {
  await AsyncStorage.setItem(
    makeKey(programId, dayId),
    JSON.stringify(progress),
  );
};

export const updateGymExerciseSet = async (
  programId: string,
  dayId: string,
  exerciseId: string,
  setIndex: number,
  patch: Partial<GymExerciseSetLog>,
  setCount: number,
  defaultReps = '',
) => {
  const current = await loadGymDayProgress(programId, dayId);
  const currentLog = current.exerciseLogs[exerciseId];

  const sets = normalizeSets(
    currentLog?.sets,
    setCount,
    defaultReps,
  );

  sets[setIndex] = {
    ...sets[setIndex],
    ...patch,
  };

  const allSetsDone = sets.every(item => item.completed);

  const next: GymDayProgress = {
    ...current,
    completedExercises: {
      ...current.completedExercises,
      [exerciseId]: allSetsDone,
    },
    exerciseLogs: {
      ...current.exerciseLogs,
      [exerciseId]: {
        ...currentLog,
        sets,
        updatedAt: Date.now(),
      },
    },
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const updateGymExerciseRpe = async (
  programId: string,
  dayId: string,
  exerciseId: string,
  rpe: number,
) => {
  const current = await loadGymDayProgress(programId, dayId);
  const currentLog = current.exerciseLogs[exerciseId] || {
    sets: [],
  };

  const next: GymDayProgress = {
    ...current,
    exerciseLogs: {
      ...current.exerciseLogs,
      [exerciseId]: {
        ...currentLog,
        exerciseRpe: rpe,
        updatedAt: Date.now(),
      },
    },
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const markGymSessionRpe = async (
  programId: string,
  dayId: string,
  rpe: number,
) => {
  const current = await loadGymDayProgress(programId, dayId);

  const next: GymDayProgress = {
    ...current,
    sessionRpe: rpe,
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const setGymExerciseCompleted = async (
  programId: string,
  dayId: string,
  exerciseId: string,
  completed: boolean,
  setCount: number,
  defaultReps = '',
) => {
  const current = await loadGymDayProgress(programId, dayId);
  const currentLog = current.exerciseLogs[exerciseId];

  const sets = normalizeSets(
    currentLog?.sets,
    setCount,
    defaultReps,
  ).map(item => ({
    ...item,
    reps: item.reps || defaultReps,
    completed,
  }));

  const next: GymDayProgress = {
    ...current,
    completedExercises: {
      ...current.completedExercises,
      [exerciseId]: completed,
    },
    exerciseLogs: {
      ...current.exerciseLogs,
      [exerciseId]: {
        ...currentLog,
        sets,
        updatedAt: Date.now(),
      },
    },
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const toggleGymExercise = async (
  programId: string,
  dayId: string,
  exerciseId: string,
) => {
  const current = await loadGymDayProgress(programId, dayId);
  const nextDone = !current.completedExercises[exerciseId];

  const next: GymDayProgress = {
    ...current,
    completedExercises: {
      ...current.completedExercises,
      [exerciseId]: nextDone,
    },
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const markGymDayCompleted = async (
  programId: string,
  dayId: string,
) => {
  const current = await loadGymDayProgress(programId, dayId);

  const next: GymDayProgress = {
    ...current,
    completedAt: Date.now(),
  };

  await saveGymDayProgress(programId, dayId, next);

  return next;
};

export const loadGymWorkoutHistory = async (): Promise<
  GymWorkoutHistoryEntry[]
> => {
  try {
    const raw = await AsyncStorage.getItem(GYM_WORKOUT_HISTORY_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const appendGymWorkoutHistory = async (
  entry: GymWorkoutHistoryEntry,
) => {
  const current = await loadGymWorkoutHistory();

  const next = [
    entry,
    ...current.filter(item => item.id !== entry.id),
  ].slice(0, 300);

  await AsyncStorage.setItem(
    GYM_WORKOUT_HISTORY_KEY,
    JSON.stringify(next),
  );

  return next;
};

export const clearGymWorkoutHistory = async () => {
  await AsyncStorage.removeItem(GYM_WORKOUT_HISTORY_KEY);
};

export const loadGymPersonalRecords = async (): Promise<
  GymPersonalRecord[]
> => {
  try {
    const raw = await AsyncStorage.getItem(GYM_PERSONAL_RECORDS_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGymPersonalRecords = async (
  records: GymPersonalRecord[],
) => {
  await AsyncStorage.setItem(
    GYM_PERSONAL_RECORDS_KEY,
    JSON.stringify(records),
  );
};

export const updatePersonalRecordsFromWorkout = async (
  entry: GymWorkoutHistoryEntry,
) => {
  const current = await loadGymPersonalRecords();
  const map = new Map<string, GymPersonalRecord>();

  current.forEach(item => {
    map.set(item.exerciseId, item);
  });

  const newRecords: GymPersonalRecord[] = [];

  entry.exercises.forEach(exercise => {
    const bestSet = getBestSetFromSets(exercise.sets);

    if (!bestSet.weightKg || !bestSet.reps) {
      return;
    }

    const old = map.get(exercise.exerciseId);

    const isNewRecord =
      !old ||
      bestSet.estimatedOneRepMax > old.estimatedOneRepMax ||
      (bestSet.estimatedOneRepMax === old.estimatedOneRepMax &&
        bestSet.weightKg > old.weightKg);

    if (!isNewRecord) {
      return;
    }

    const record: GymPersonalRecord = {
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      weightKg: bestSet.weightKg,
      reps: bestSet.reps,
      estimatedOneRepMax: bestSet.estimatedOneRepMax,
      achievedAt: entry.completedAt,
      historyEntryId: entry.id,
    };

    map.set(exercise.exerciseId, record);
    newRecords.push(record);
  });

  const next = Array.from(map.values()).sort(
    (a, b) => b.achievedAt - a.achievedAt,
  );

  await saveGymPersonalRecords(next);

  return newRecords;
};

export const clearGymPersonalRecords = async () => {
  await AsyncStorage.removeItem(GYM_PERSONAL_RECORDS_KEY);
};