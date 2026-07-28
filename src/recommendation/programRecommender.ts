// FILE: src/recommendation/programRecommender.ts
import { WorkoutProgram } from '../data/programs';
import {
  getProgramCatalogMeta,
  getProgramDurationBucket,
  ProgramGoalTag,
} from '../data/programCatalog';

export type ProfileInput = {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  injured?: boolean;
  healthNote?: string;
  goal?:
    | 'lose_weight'
    | 'build_muscle'
    | 'maintain'
    | 'recomp'
    | 'endurance'
    | 'flexibility';
};

export type ProgramRecommendation = {
  primary: WorkoutProgram | null;
  alternatives: WorkoutProgram[];
  reasonLines: string[];
};

function calcBMI(profile?: ProfileInput | null) {
  if (!profile?.heightCm || !profile?.weightKg) return null;
  const h = profile.heightCm / 100;
  if (!h) return null;
  return +(profile.weightKg / (h * h)).toFixed(1);
}

function mapGoalToTags(goal?: ProfileInput['goal']): ProgramGoalTag[] {
  switch (goal) {
    case 'lose_weight':
      return ['lose_weight', 'cardio', 'core'];
    case 'build_muscle':
      return ['build_muscle', 'core'];
    case 'maintain':
      return ['cardio', 'core'];
    case 'recomp':
      return ['build_muscle', 'cardio', 'core'];
    case 'endurance':
      return ['cardio', 'core'];
    case 'flexibility':
      return ['mobility', 'core'];
    default:
      return ['cardio', 'core'];
  }
}

export function recommendPrograms(
  profile: ProfileInput | null | undefined,
  programs: WorkoutProgram[]
): ProgramRecommendation {
  if (!programs.length) {
    return { primary: null, alternatives: [], reasonLines: [] };
  }

  const bmi = calcBMI(profile);
  const goalTags = mapGoalToTags(profile?.goal);
  const injured = !!profile?.injured;
  const age = profile?.age ?? 30;

  const scored = programs.map((program) => {
    const meta = getProgramCatalogMeta(program.id);
    const durationBucket = getProgramDurationBucket(program);

    let score = 0;
    const reasons: string[] = [];

    const matchedGoals = meta.goals.filter((g) => goalTags.includes(g)).length;
    score += matchedGoals * 5;

    if (matchedGoals > 0) {
      reasons.push('Matches your current goal.');
    }

    if (injured) {
      if (meta.goals.includes('mobility') || meta.goals.includes('core')) {
        score += 6;
        reasons.push('Safer emphasis on mobility/core for recovery.');
      }
      if (meta.level === 'advanced') {
        score -= 6;
      }
    }

    if (bmi !== null && bmi >= 30) {
      if (meta.level === 'beginner') score += 6;
      if (durationBucket === 'short') score += 3;
      if (meta.level === 'advanced') score -= 4;
    } else if (bmi !== null && bmi >= 25) {
      if (meta.goals.includes('lose_weight') || meta.goals.includes('cardio')) {
        score += 4;
      }
      if (meta.level === 'beginner' || meta.level === 'intermediate') {
        score += 2;
      }
    }

    if (age >= 50) {
      if (meta.level === 'beginner') score += 4;
      if (meta.goals.includes('mobility')) score += 4;
      if (durationBucket === 'short') score += 2;
    }

    if (!injured && age < 45 && (profile?.goal === 'build_muscle' || profile?.goal === 'recomp')) {
      if (meta.level === 'advanced') score += 3;
    }

    // Ưu tiên chương trình free nhẹ nếu user chưa rõ profile
    if (!profile?.goal && !profile?.weightKg && !profile?.heightCm) {
      if (!program.premium) score += 2;
      if (meta.level === 'beginner') score += 3;
    }

    // Tie-break mềm theo duration
    if (durationBucket === 'medium') score += 1;

    return { program, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);

  const primary = scored[0]?.program ?? null;
  const alternatives = scored.slice(1, 3).map((x) => x.program);

  const reasonLines =
    scored[0]?.reasons.length
      ? Array.from(new Set(scored[0].reasons))
      : ['Selected based on your current profile and workout goal.'];

  return {
    primary,
    alternatives,
    reasonLines,
  };
}