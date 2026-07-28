// FILE: src/store/progressStats.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutProgram, generateProgramDays } from '../data/programs';

const SESSION_LOG_KEY = 'progress:sessionLog';

type SessionLog = Record<
  string,
  {
    programId: string;
    dayId: string;
    completedAt: number;
  }
>;

export type DashboardStats = {
  totalWorkouts: number;
  workoutsThisWeek: number;
  streakDays: number;
  completedPrograms: number;
  lastWorkoutAt: number | null;
};

async function readLog(): Promise<SessionLog> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_LOG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeLog(log: SessionLog) {
  await AsyncStorage.setItem(SESSION_LOG_KEY, JSON.stringify(log));
}

function toLocalDateKey(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStreakDays(timestamps: number[]) {
  if (!timestamps.length) return 0;

  const uniqueDates = Array.from(
    new Set(timestamps.map((ts) => toLocalDateKey(ts)))
  ).sort((a, b) => (a > b ? -1 : 1));

  const latest = new Date(uniqueDates[0] + 'T00:00:00').getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - latest) / (24 * 60 * 60 * 1000));

  // nếu nghỉ quá 1 ngày thì streak về 0
  if (diffDays > 1) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + 'T00:00:00').getTime();
    const curr = new Date(uniqueDates[i] + 'T00:00:00').getTime();
    const gap = Math.floor((prev - curr) / (24 * 60 * 60 * 1000));
    if (gap === 1) streak += 1;
    else break;
  }

  return streak;
}

export async function markSessionCompleted(programId: string, dayId: string) {
  const log = await readLog();
  const key = `${programId}:${dayId}`;

  if (log[key]) return false;

  log[key] = {
    programId,
    dayId,
    completedAt: Date.now(),
  };

  await writeLog(log);
  return true;
}

export async function getDashboardStats(
  programs: WorkoutProgram[] = []
): Promise<DashboardStats> {
  const log = await readLog();
  const sessions = Object.values(log).sort((a, b) => b.completedAt - a.completedAt);
  const timestamps = sessions.map((s) => s.completedAt);

  const now = new Date();
  const weekStart = startOfWeek(now).getTime();

  const workoutsThisWeek = sessions.filter((s) => s.completedAt >= weekStart).length;

  let completedPrograms = 0;

  for (const program of programs) {
    const workoutDays = generateProgramDays(program).filter((d) => !d.isRest);
    const done = workoutDays.every((d) => !!log[`${program.id}:${d.id}`]);
    if (done) completedPrograms += 1;
  }

  return {
    totalWorkouts: sessions.length,
    workoutsThisWeek,
    streakDays: getStreakDays(timestamps),
    completedPrograms,
    lastWorkoutAt: sessions[0]?.completedAt ?? null,
  };
}