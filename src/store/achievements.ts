// FILE: src/store/achievements.ts
import { WorkoutProgram } from '../data/programs';
import { getDashboardStats } from './progressStats';
import { getWorkoutHistory, getWeeklyWorkoutCount } from './workoutHistory';

export type AchievementItem = {
  id: string;
  title: string;
  unlocked: boolean;
  progress: number;
  target: number;
};

export async function getAchievements(programs: WorkoutProgram[]): Promise<AchievementItem[]> {
  const [stats, history, weekCount] = await Promise.all([
    getDashboardStats(programs),
    getWorkoutHistory(),
    getWeeklyWorkoutCount(7),
  ]);

  const total = history.length;
  const completedPrograms = stats.completedPrograms;
  const streak = stats.streakDays;

  return [
    {
      id: 'first_workout',
      title: 'First Workout',
      unlocked: total >= 1,
      progress: Math.min(total, 1),
      target: 1,
    },
    {
      id: 'ten_workouts',
      title: '10 Workouts',
      unlocked: total >= 10,
      progress: Math.min(total, 10),
      target: 10,
    },
    {
      id: 'twentyfive_workouts',
      title: '25 Workouts',
      unlocked: total >= 25,
      progress: Math.min(total, 25),
      target: 25,
    },
    {
      id: 'streak_3',
      title: '3-Day Streak',
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      target: 3,
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    },
    {
      id: 'week_4',
      title: '4 Workouts This Week',
      unlocked: weekCount >= 4,
      progress: Math.min(weekCount, 4),
      target: 4,
    },
    {
      id: 'finish_program',
      title: 'Complete 1 Program',
      unlocked: completedPrograms >= 1,
      progress: Math.min(completedPrograms, 1),
      target: 1,
    },
  ];
}