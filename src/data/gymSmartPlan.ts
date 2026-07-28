// FILE: src/data/gymSmartPlan.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TrainingDaysPerWeek = 3 | 4 | 5 | 6;

export type Gender = 'male' | 'female' | 'other';

export type UserGymProfile = {
  name?: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  healthNote?: string;
  injured?: boolean;
  injuryNote?: string;
  goal?: string;
};

export type SmartGymExercise = {
  id: string;

  /**
   * ID gốc của bài tập.
   * Dùng để tìm note i18n và bài tương tự khi id bị đổi thành unique id.
   */
  baseExerciseId?: string;

  name: string;
  muscleGroup:
    | 'chest'
    | 'back'
    | 'legs'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'core'
    | 'cardio';
  sets: number;
  reps: string;
  restSeconds: number;
  note: string;
  extraNoteKeys?: string[];
  demoUrl?: string;
};

export type SmartGymDay = {
  id: string;
  dayNumber: number;
  title: string;
  focus: string;
  durationMin: number;
  intensity: 'light' | 'moderate' | 'hard';
  exercises: SmartGymExercise[];
};

export type SmartGymPlan = {
  id: string;
  daysPerWeek: TrainingDaysPerWeek;
  title: string;
  description: string;
  advice: string;
  days: SmartGymDay[];
};

const USER_PROFILE_KEY = 'user:profile';
const GYM_DAYS_KEY = 'gym:daysPerWeek';

const CDN_BASE = 'https://insanity-workouts-cdn.b-cdn.net/Gym';

const v = (file: string) => {
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return file;
  }

  return `${CDN_BASE}/${file.replace(/^\/+/, '')}`;
};

/**
 * Tự đổi giáo án theo tuần.
 * Week 1 -> variant 0
 * Week 2 -> variant 1
 * Week 3 -> variant 2
 * Week 4 -> variant 3
 * Week 5 quay lại variant 0
 */
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const PROGRAM_ANCHOR = new Date('2026-01-05T00:00:00').getTime();

export const getAutoGymWeekNumber = () => {
  const diff = Date.now() - PROGRAM_ANCHOR;
  const week = Math.floor(diff / WEEK_MS);

  return ((week % 12) + 12) % 12 + 1;
};

export const getAutoGymWeekVariant = () => {
  return (getAutoGymWeekNumber() - 1) % 4;
};

const EXERCISES: Record<string, SmartGymExercise> = {
  // --------------------
  // LEGS
  // --------------------
  squat: {
    id: 'squat',
    name: 'Squat',
    muscleGroup: 'legs',
    sets: 4,
    reps: '6-10',
    restSeconds: 150,
    note: 'Brace your core, keep your chest up and push through your mid-foot.',
    demoUrl: v('squat.MP4'),
  },
  gobletSquat: {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    muscleGroup: 'legs',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    note: 'Keep your chest up, brace your core and control the movement.',
    demoUrl: v('gobletSquat.mp4'),
  },
  smithlowbarsquat: {
    id: 'smith-low-bar-squat',
    name: 'Smith Low Bar Squat',
    muscleGroup: 'legs',
    sets: 3,
    reps: '8-12',
    restSeconds: 120,
    note: 'Walk your feet as close under you as possible to avoid feeling like you are falling backward and achieve a full range of motion',
    demoUrl: v('smithlowbarsquat.mp4'),
  },
  legPress: {
    id: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'legs',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    note: 'Keep your feet stable and do not let your knees collapse inward.',
    demoUrl: v('legPress.mp4'),
  },
  legextensions: {
    id: 'leg-extensions',
    name: 'Leg Extensions',
    muscleGroup: 'legs',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    note: 'Keep your feet stable and do not let your knees collapse inward.',
    demoUrl: v('legextensions.mp4'),
  },
    lyinglegcurl: {
    id: 'lying-leg-curl',
    name: 'Lying leg curl',
    muscleGroup: 'legs',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    note: 'Keep your feet stable and do not let your knees collapse inward.',
    demoUrl: v('lyinglegcurl.mp4'),
  },
  romanianDeadlift: {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'legs',
    sets: 3,
    reps: '8-10',
    restSeconds: 90,
    note: 'Push your hips back, keep your back neutral and feel your hamstrings stretch.',
    demoUrl: v('romanianDeadlift.MP4'),
  },
    trapbardeadlift: {
    id: 'trap-bar-deadlift',
    name: 'Trap Bar Deadlift',
    muscleGroup: 'legs',
    sets: 3,
    reps: '8-10',
    restSeconds: 90,
    note: 'Keep your lats tight by crushing your armpits, hinge and bend your knees, and drive your feet into the ground to execute a trap bar deadlift.',
    demoUrl: v('trapbardeadlift.mp4'),
  },
  hipThrust: {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'legs',
    sets: 3,
    reps: '10-12',
    restSeconds: 90,
    note: 'Drive through your heels and squeeze your glutes at the top.',
    demoUrl: v('hipThrust.mp4'),
  },
  hipAbduction: {
    id: 'hip-abduction',
    name: 'Hip Abduction',
    muscleGroup: 'legs',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Control the movement and squeeze your glutes at the outer range.',
    demoUrl: v('hipAbduction.mp4'),
  },
    bulgariansplitsquat: {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'legs',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Sit on a bench and extend your working leg out in front of you. Keep your legs about hip-width apart.',
    demoUrl: v('BulgarianSplitSquat.mp4'),
  },
  dumbbellsquat: {
    id: 'dumbbell-squat',
    name: 'Dumbbell Squat',
    muscleGroup: 'legs',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Keep your head up, back straight, and lower until thighs are parallel to the floor, ensuring knees do not go past your toes.',
    demoUrl: v('dumbbellsquat.mp4'),
  },

  // --------------------
  // CHEST
  // --------------------
  machineChestPress: {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    muscleGroup: 'chest',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Press with control and avoid locking your elbows aggressively.',
    demoUrl: v('machineChestPress.mp4'),
  },
  benchPress: {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    sets: 4,
    reps: '6-8',
    restSeconds: 120,
    note: 'Keep your shoulder blades tight and press with control.',
    demoUrl: v('benchPress.mp4'),
  },
  inclineBarbellBenchPress: {
    id: 'incline-bb-bench-press',
    name: 'Incline BB Bench Press',
    muscleGroup: 'chest',
    sets: 4,
    reps: '6-10',
    restSeconds: 120,
    note: 'Keep your upper back tight and press slightly upward with control.',
    demoUrl: v('inclineBarbellBenchPress.mp4'),
  },
  inclineDumbbellPress: {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    sets: 3,
    reps: '8-10',
    restSeconds: 90,
    note: 'Press upward with control and keep your shoulders stable.',
    demoUrl: v('inclineDumbbellPress.mp4'),
  },
  upperCableFly: {
    id: 'upper-cable-fly',
    name: 'Upper Cable Fly',
    muscleGroup: 'chest',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Bring the handles upward and inward, focusing on upper chest squeeze.',
    demoUrl: v('upperCableFly.MP4'),
  },
    machinechestfly: {
    id: 'machine-chest-fly',
    name: 'Machine Chest Fly',
    muscleGroup: 'chest',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Keep a slight bend in your elbows, point them back, keep your chest up, and straighten your arms as handles meet.',
    demoUrl: v('machinechestfly.mp4'),
  },
  leverchestpress: {
    id: 'lever-chest-press',
    name: 'Lever Chest Press',
    muscleGroup: 'chest',
    sets: 3,
    reps: '8-15',
    restSeconds: 60,
    note: 'Properly adjust seating, height, and handles below pectoral muscles. Press forward extending elbows, then slowly return to just before initial position.',
    demoUrl: v('leverchestpress.mp4'),
  },
  // --------------------
  // BACK
  // --------------------
  latPulldown: {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'back',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    note: 'Pull your elbows down and squeeze your back at the bottom.',
    demoUrl: v('latPulldown.mp4'),
  },
  singleArmLatPulldown: {
    id: 'single-arm-lat-pulldown',
    name: 'Single Arm Lat Pull Down',
    muscleGroup: 'back',
    sets: 3,
    reps: '10-12 each side',
    restSeconds: 75,
    note: 'Pull your elbow toward your hip and feel one lat working at a time.',
    demoUrl: v('singleArmLatPulldown.mp4'),
  },
  seatedRow: {
    id: 'seated-row',
    name: 'Seated Cable Row',
    muscleGroup: 'back',
    sets: 3,
    reps: '10-12',
    restSeconds: 75,
    note: 'Pull toward your lower ribs and squeeze your shoulder blades.',
    demoUrl: v('seatedRow.mp4'),
  },
  lowRow: {
    id: 'low-row',
    name: 'Low Row',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Pull low toward your waist and keep your torso stable.',
    demoUrl: v('lowRow.mp4'),
  },
  assistedPullUp: {
    id: 'assisted-pull-up',
    name: 'Assisted Pull-up',
    muscleGroup: 'back',
    sets: 3,
    reps: '6-10',
    restSeconds: 90,
    note: 'Pull your chest toward the bar and control the way down.',
    demoUrl: v('assistedPullUp.mp4'),
  },
    straightarmpushdown: {
    id: 'straight-arm-pushdown',
    name: 'Straight Arm Pushdown',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Pull low toward your waist and keep your torso stable.',
    demoUrl: v('straightarmpushdown.mp4'),
  },
    chestsupportdbrow: {
    id: 'Chest-support-db-row',
    name: 'Chest-support DB Row',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Use a bench at a slight incline, keep legs straight, pull dumbbells towards hips, and pinch shoulder blades together at the top.',
    demoUrl: v('chestsupportdbrow.mp4'),
  },
  wideneutralgriplatpulldown: {
    id: 'wide-neutral-grip-lat-pulldown',
    name: 'Wide Neutral Grip Lat Pull Down',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'The Cable Wide Neutral Grip Lat Pulldown targets the latissimus dorsi muscles, along with the biceps, shoulders, and upper back.',
    demoUrl: v('wideneutralgriplatpulldown.mp4'),
  },
    singlearmdumbbellrow: {
    id: 'single-arm-dumbbell-row',
    name: 'Single Arm Dumbbell Row',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'The one arm dumbbell row is a variation of the dumbbell row and an exercise used to build back muscle and strength.',
    demoUrl: v('singlearmdumbbellrow.mp4'),
  },
    underhandlatpulldown: {
    id: 'underhand-lat-pulldown',
    name: 'Underhand Lat Pulldown',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Grab the bar just outside shoulder width with an underhand grip, lean back with chest up, pull to upper chest, and drive elbows down and in.',
    demoUrl: v('underhandlatpulldown.mp4'),
  },
    tbarrow: {
    id: 't-bar-row',
    name: 'T-Bar Row',
    muscleGroup: 'back',
    sets: 3,
    reps: '8-12',
    restSeconds: 90,
    note: 'Stand over the bar with a flat back leaned forward slightly greater than parallel to the ground, with your arms extended underneath your shoulders',
    demoUrl: v('tbarrow.mp4'),
  },
  // --------------------
  // SHOULDERS
  // --------------------
  dumbbellShoulderPress: {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-10',
    restSeconds: 90,
    note: 'Keep your ribs down and press the dumbbells overhead smoothly.',
    demoUrl: v('dumbbellShoulderPress.mp4'),
  },
  lateralRaise: {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Raise with control and avoid shrugging your shoulders.',
    demoUrl: v('lateralRaise.mp4'),
  },
  machineshoulderpress: {
    id: 'machine-shoulder-press',
    name: 'Machine Shoulder Press',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Set up the handles/seat height to start the movement from shoulder height. Hold the handles with a neutral grip (palms facing each other).',
    demoUrl: v('machineshoulderpress.mp4'),
  },
    cablelateralraise: {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Stand straight up with your arms in front of you (crossed over). The weight should be slightly off the stack. This is the starting position for the movement.',
    demoUrl: v('cablelateralraise.mp4'),
  },
    dumbbellfrontraise: {
    id: 'dumbbell-front-raise',
    name: 'Dumbbell Front Raisee',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Begin by raising your arms straight out in front of your body with your palms facing the floor while keeping a slight Bend in your elbows.',
    demoUrl: v('dumbbellfrontraise.mp4'),
  },
    dumbbellreardeltfly: {
    id: 'dumbbell-rear-delt-fly',
    name: 'Dumbbell Rear Delt Fly',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Begin by raising your arms straight out in front of your body with your palms facing the floor while keeping a slight Bend in your elbows.',
    demoUrl: v('dumbbellreardeltfly.mp4'),
  },
    widegripbarbelluprightrow: {
    id: 'wide-grip-barbell-upright-row',
    name: 'Wide Grip Barbell Upright Row',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Stand upright with your feet shoulder-width apart and holding the barbell with an overhand grip much wider than shoulder-width apart.',
    demoUrl: v('widegripbarbelluprightrow.mp4'),
  },
    seatedbarbellshoulderpress: {
    id: 'seated-barbell-shoulder-press',
    name: 'Seated Barbell Shoulder Press',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'The seated barbell shoulder press is a variation of the overhead press and an exercise used to build shoulder strength and muscle.',
    demoUrl: v('seatedbarbellshoulderpress.mp4'),
  },
    cablefrontraise: {
    id: 'cable-front-raise',
    name: 'Cable Front Raise',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Connect the small bar attachment and set the cable pulley at the bottom of the pole',
    demoUrl: v('cablefrontraise.mp4'),
  },
    cableuprightrow: {
    id: 'cable-upright-row',
    name: 'Cable Upright Row',
    muscleGroup: 'shoulders',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Stand upright holding the bar in front of you with a greater than shoulder-width overhand grip',
    demoUrl: v('cableuprightrow.mp4'),
  },
  // --------------------
  // BICEPS
  // --------------------
  dumbbellCurl: {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    muscleGroup: 'biceps',
    sets: 2,
    reps: '10-12',
    restSeconds: 60,
    note: 'Keep your elbows close to your body and avoid swinging.',
    demoUrl: v('dumbbellCurl.mp4'),
  },
  dbHammerCurl: {
    id: 'db-hammer-curl',
    name: 'DB Hammer Curl',
    muscleGroup: 'biceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Keep your palms facing each other and curl without swinging.',
    demoUrl: v('dbHammerCurl.mp4'),
  },
  normalGripEzBbCurl: {
    id: 'normal-grip-ez-bb-curl',
    name: 'Normal Grip EZ BB Curl',
    muscleGroup: 'biceps',
    sets: 3,
    reps: '8-12',
    restSeconds: 60,
    note: 'Use a shoulder-width grip and keep your elbows steady.',
    demoUrl: v('normalGripEzBbCurl.mp4'),
  },
  cablecurls: {
    id: 'cable-curls',
    name: 'Cable Curls',
    muscleGroup: 'biceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Set up for this type of cable curl by attaching a straight bar to the low pulley cable and selecting the weight you want to use on the stack.',
    demoUrl: v('cablecurls.mp4'),
  },
    proneinclinedumbbellcurl: {
    id: 'cprone-incline-dumbbell-curl',
    name: 'Prone Incline Dumbbell Curl',
    muscleGroup: 'biceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Set up for the prone incline dumbbell curl by setting an adjustable back bench to an angle of around 30-40 degrees',
    demoUrl: v('proneinclinedumbbellcurl.mp4'),
  },
    cablepreachercurl: {
    id: 'cable-preacher-curl',
    name: 'Cable Preacher Curl',
    muscleGroup: 'biceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Set up for the cable preacher curl with rope extension by grabbing a preacher bench and placing it in front of a low pulley cable machine',
    demoUrl: v('cablepreachercurl.mp4'),
  },
  // --------------------
  // TRICEPS
  // --------------------
  tricepsPushdown: {
    id: 'triceps-pushdown',
    name: 'Triceps Pushdown',
    muscleGroup: 'triceps',
    sets: 2,
    reps: '10-12',
    restSeconds: 60,
    note: 'Lock your elbows near your sides and fully extend with control.',
    demoUrl: v('tricepsPushdown.mp4'),
  },
  dbTricepsExtension: {
    id: 'db-triceps-extension',
    name: 'DB Triceps Extension',
    muscleGroup: 'triceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Keep your upper arm stable and extend the dumbbell with control.',
    demoUrl: v('dbTricepsExtension.mp4'),
  },
  onearmcableunderhandtricepextension: {
    id: 'one-arm-cable-underhand-tricep-extension',
    name: 'One Arm Cable Underhand Tricep Extension',
    muscleGroup: 'triceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Stand upright with one hand behind your back and the other hand gripping the handle at shoulder-width with an underhand grip in front of your shoulder.',
    demoUrl: v('onearmcableunderhandtricepextension.mp4'),
  },
    overheadcabletricepextension: {
    id: 'overhead-cable-tricep-extension',
    name: 'Overhead Cable Tricep Extension',
    muscleGroup: 'triceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Set up for the exercise by attaching a rope to the low pulley of a pulley cable machine and selecting the weight you want to use on the stack',
    demoUrl: v('overheadcabletricepextension.mp4'),
  },
    cableonearmtricepextension: {
    id: 'cable-one-arm-tricep-extension',
    name: 'Cable One Arm Tricep Extension',
    muscleGroup: 'triceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Set up for the one-arm cable tricep extension by attaching a single grip handle to a high pulley cable and selecting the weight you want to use on the stack',
    demoUrl: v('cableonearmtricepextension.mp4'),
  },
    dumbbellskullcrusher: {
    id: 'dumbbell-skull-crusher',
    name: 'Dumbbell Skull Crusher',
    muscleGroup: 'triceps',
    sets: 3,
    reps: '10-12',
    restSeconds: 60,
    note: 'Lay on a flat bench, hold dumbbells over your head, and lower them to about 90 degrees.',
    demoUrl: v('dumbbellskullcrusher.mp4'),
  },


  // --------------------
  // CORE / CARDIO
  // --------------------
  plank: {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'core',
    sets: 3,
    reps: '30-45 sec',
    restSeconds: 60,
    note: 'Keep your body straight and avoid dropping your hips.',
    demoUrl: v('plank.mp4'),
  },
    declineabcrunch: {
    id: 'decline-ab-crunch',
    name: 'Decline AB Crunch',
    muscleGroup: 'core',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Lie on a decline bench with your legs secured on the end. Position your hands so they are interlocked behind your head',
    demoUrl: v('declineabcrunch.mp4'),
  },
    crunch: {
    id: 'crunch',
    name: 'Crunch',
    muscleGroup: 'core',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Lie down on your back. Plant your feet on the floor, hip-width apart',
    demoUrl: v('crunch.mp4'),
  },
    abroller: {
    id: 'ab-roller',
    name: 'Ab Roller',
    muscleGroup: 'core',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Brace your core, move hips forward, and keep a straight line',
    demoUrl: v('abroller.mp4'),
  },
    mountainclimbers: {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    muscleGroup: 'core',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Start in a high plank position. Bring one knee toward your chest. Quickly switch legs as if running in place',
    demoUrl: v('mountainclimbers.mp4'),
  },
    dumbbellsidebend: {
    id: 'dumbbell-side-bend',
    name: 'Dumbbell Side Bend',
    muscleGroup: 'core',
    sets: 3,
    reps: '12-15',
    restSeconds: 60,
    note: 'Grab a set of dumbbells and sit down on the end of a flat bench with one dumbbell in each hand, palms facing in and hanging by your side',
    demoUrl: v('dumbbellsidebend.mp4'),
  },
  treadmillWalk: {
    id: 'treadmill-walk',
    name: 'Incline Treadmill Walk',
    muscleGroup: 'cardio',
    sets: 1,
    reps: '8-12 min',
    restSeconds: 30,
    note: 'Keep a steady pace. You should be able to talk but still feel challenged.',
    demoUrl: v('treadmillWalk.mp4'),
  },
};

type ExerciseKey = keyof typeof EXERCISES;
export const stripExerciseInstanceId = (id: string) => {
  return String(id).replace(/__\d+$/g, '');
};

export const ensureUniqueExerciseIds = (
  exercises: SmartGymExercise[],
): SmartGymExercise[] => {
  const used: Record<string, number> = {};

  return exercises.map((exercise) => {
    const baseExerciseId =
      exercise.baseExerciseId ||
      stripExerciseInstanceId(exercise.id);

    const count = (used[baseExerciseId] || 0) + 1;
    used[baseExerciseId] = count;

    return {
      ...exercise,
      baseExerciseId,
      id:
        count === 1
          ? baseExerciseId
          : `${baseExerciseId}__${count}`,
    };
  });
};
export const getExerciseNoteKey = (
  exercise: Pick<SmartGymExercise, 'id' | 'baseExerciseId'>,
) => {
  const rawId =
    exercise.baseExerciseId ||
    stripExerciseInstanceId(exercise.id);

  const safeId = rawId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `gym.exerciseNotes.${safeId}`;
};

const getExerciseKeyById = (
  exerciseId: string,
): ExerciseKey | null => {
  const cleanId = stripExerciseInstanceId(exerciseId);

  const found = Object.entries(EXERCISES).find(
    ([, exercise]) => exercise.id === cleanId,
  );

  return found ? (found[0] as ExerciseKey) : null;
};

const SIMILAR_EXERCISES: Partial<Record<ExerciseKey, ExerciseKey[]>> = {
  // Legs
  squat: [
    'smithlowbarsquat',
    'legPress',
    'dumbbellsquat',
    'bulgariansplitsquat',
  ],
  gobletSquat: [
    'dumbbellsquat',
    'legPress',
    'smithlowbarsquat',
  ],
  smithlowbarsquat: [
    'squat',
    'legPress',
    'dumbbellsquat',
  ],
  legPress: [
    'squat',
    'smithlowbarsquat',
    'dumbbellsquat',
    'legextensions',
  ],
  romanianDeadlift: [
    'trapbardeadlift',
    'lyinglegcurl',
    'hipThrust',
  ],
  trapbardeadlift: [
    'romanianDeadlift',
    'legPress',
    'smithlowbarsquat',
  ],
  hipThrust: [
    'hipAbduction',
    'romanianDeadlift',
    'lyinglegcurl',
  ],
  hipAbduction: [
    'hipThrust',
    'bulgariansplitsquat',
    'legPress',
  ],
  legextensions: [
    'legPress',
    'smithlowbarsquat',
    'dumbbellsquat',
  ],
  lyinglegcurl: [
    'romanianDeadlift',
    'trapbardeadlift',
    'hipThrust',
  ],
  bulgariansplitsquat: [
    'dumbbellsquat',
    'legPress',
    'smithlowbarsquat',
  ],
  dumbbellsquat: [
    'gobletSquat',
    'squat',
    'legPress',
  ],

  // Chest
  benchPress: [
    'inclineBarbellBenchPress',
    'machineChestPress',
    'leverchestpress',
    'inclineDumbbellPress',
  ],
  machineChestPress: [
    'benchPress',
    'leverchestpress',
    'inclineDumbbellPress',
  ],
  inclineBarbellBenchPress: [
    'inclineDumbbellPress',
    'benchPress',
    'machineChestPress',
  ],
  inclineDumbbellPress: [
    'inclineBarbellBenchPress',
    'machineChestPress',
    'benchPress',
  ],
  upperCableFly: [
    'machinechestfly',
    'inclineDumbbellPress',
    'leverchestpress',
  ],
  machinechestfly: [
    'upperCableFly',
    'leverchestpress',
    'machineChestPress',
  ],
  leverchestpress: [
    'machineChestPress',
    'benchPress',
    'machinechestfly',
  ],

  // Back
  latPulldown: [
    'wideneutralgriplatpulldown',
    'underhandlatpulldown',
    'singleArmLatPulldown',
    'assistedPullUp',
  ],
  singleArmLatPulldown: [
    'latPulldown',
    'wideneutralgriplatpulldown',
    'underhandlatpulldown',
  ],
  wideneutralgriplatpulldown: [
    'latPulldown',
    'singleArmLatPulldown',
    'underhandlatpulldown',
  ],
  underhandlatpulldown: [
    'latPulldown',
    'singleArmLatPulldown',
    'assistedPullUp',
  ],
  seatedRow: [
    'lowRow',
    'chestsupportdbrow',
    'singlearmdumbbellrow',
    'tbarrow',
  ],
  lowRow: [
    'seatedRow',
    'chestsupportdbrow',
    'tbarrow',
  ],
  chestsupportdbrow: [
    'singlearmdumbbellrow',
    'seatedRow',
    'lowRow',
  ],
  singlearmdumbbellrow: [
    'chestsupportdbrow',
    'seatedRow',
    'tbarrow',
  ],
  tbarrow: [
    'seatedRow',
    'lowRow',
    'chestsupportdbrow',
  ],
  straightarmpushdown: [
    'latPulldown',
    'singleArmLatPulldown',
    'wideneutralgriplatpulldown',
  ],

  // Shoulders
  dumbbellShoulderPress: [
    'machineshoulderpress',
    'seatedbarbellshoulderpress',
    'lateralRaise',
  ],
  machineshoulderpress: [
    'dumbbellShoulderPress',
    'seatedbarbellshoulderpress',
  ],
  seatedbarbellshoulderpress: [
    'dumbbellShoulderPress',
    'machineshoulderpress',
  ],
  lateralRaise: [
    'cablelateralraise',
    'dumbbellreardeltfly',
    'cableuprightrow',
  ],
  cablelateralraise: [
    'lateralRaise',
    'dumbbellreardeltfly',
  ],
  dumbbellreardeltfly: [
    'lateralRaise',
    'cablelateralraise',
  ],

  // Biceps
  dumbbellCurl: [
    'dbHammerCurl',
    'normalGripEzBbCurl',
    'cablecurls',
    'proneinclinedumbbellcurl',
  ],
  dbHammerCurl: [
    'dumbbellCurl',
    'normalGripEzBbCurl',
    'cablecurls',
  ],
  normalGripEzBbCurl: [
    'dumbbellCurl',
    'dbHammerCurl',
    'cablepreachercurl',
  ],
  cablecurls: [
    'normalGripEzBbCurl',
    'dumbbellCurl',
    'cablepreachercurl',
  ],
  cablepreachercurl: [
    'cablecurls',
    'normalGripEzBbCurl',
    'proneinclinedumbbellcurl',
  ],

  // Triceps
  tricepsPushdown: [
    'cableonearmtricepextension',
    'overheadcabletricepextension',
    'dbTricepsExtension',
  ],
  dbTricepsExtension: [
    'dumbbellskullcrusher',
    'overheadcabletricepextension',
    'tricepsPushdown',
  ],
  overheadcabletricepextension: [
    'dbTricepsExtension',
    'tricepsPushdown',
    'cableonearmtricepextension',
  ],
  cableonearmtricepextension: [
    'onearmcableunderhandtricepextension',
    'tricepsPushdown',
    'overheadcabletricepextension',
  ],
  dumbbellskullcrusher: [
    'dbTricepsExtension',
    'overheadcabletricepextension',
  ],

  // Core
  plank: [
    'abroller',
    'crunch',
    'declineabcrunch',
    'mountainclimbers',
  ],
  crunch: [
    'declineabcrunch',
    'abroller',
    'plank',
  ],
  declineabcrunch: [
    'crunch',
    'abroller',
    'plank',
  ],
  abroller: [
    'plank',
    'crunch',
    'mountainclimbers',
  ],
};

export const getSimilarExercises = (
  exercise: SmartGymExercise,
  profile?: UserGymProfile | null,
): SmartGymExercise[] => {
  const key = getExerciseKeyById(exercise.id);

  if (!key) {
    return [];
  }

  const similarKeys =
    SIMILAR_EXERCISES[key] ||
    (Object.entries(EXERCISES)
      .filter(([, item]) => item.muscleGroup === exercise.muscleGroup)
      .map(([itemKey]) => itemKey as ExerciseKey));

  return similarKeys
    .filter((itemKey) => EXERCISES[itemKey].id !== exercise.id)
    .map((itemKey) => personalizeExercise(cloneExercise(itemKey), profile))
    .slice(0, 6);
};

export const replaceExerciseInDay = (
  day: SmartGymDay,
  oldExerciseId: string,
  newExerciseId: string,
  profile?: UserGymProfile | null,
): SmartGymDay => {
  const newKey = getExerciseKeyById(newExerciseId);

  if (!newKey) {
    return day;
  }

  const replacement = personalizeExercise(
    cloneExercise(newKey),
    profile,
  );

  return {
    ...day,
    exercises: ensureUniqueExerciseIds(
      day.exercises.map((item) =>
        item.id === oldExerciseId ? replacement : item,
      ),
    ),
  };
};
type ExerciseSpec =
  | ExerciseKey
  | [ExerciseKey, Partial<SmartGymExercise>];

const cloneExercise = (
  key: ExerciseKey,
  override?: Partial<SmartGymExercise>,
): SmartGymExercise => {
  const exercise = EXERCISES[key];

  return {
    ...exercise,
    baseExerciseId: exercise.id,
    ...override,
  };
};
export type GymExerciseKey =
  keyof typeof EXERCISES;

/**
 * Trả về bài tập từ thư viện chính.
 *
 * Tất cả màn hình phải lấy bài tập từ hàm này để giữ nguyên:
 * - exercise.id
 * - demoUrl
 * - tên file video
 * - offline video key
 */
export const getGymExercise = (
  key: GymExerciseKey,
  override?: Partial<SmartGymExercise>,
): SmartGymExercise => {
  return {
    ...EXERCISES[key],
    ...override,
  };
};
const makeExercises = (
  specs: ExerciseSpec[],
): SmartGymExercise[] => {
  return specs.map((spec) => {
    if (Array.isArray(spec)) {
      return cloneExercise(spec[0], spec[1]);
    }

    return cloneExercise(spec);
  });
};

const weeklyExercises = (
  variants: ExerciseSpec[][],
  weekVariant: number,
): SmartGymExercise[] => {
  const selected = variants[weekVariant % variants.length];

  return makeExercises(selected);
};

export const loadUserGymProfile = async (): Promise<UserGymProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveGymDaysPerWeek = async (
  days: TrainingDaysPerWeek,
) => {
  await AsyncStorage.setItem(GYM_DAYS_KEY, String(days));
};

export const loadGymDaysPerWeek = async (): Promise<TrainingDaysPerWeek> => {
  const raw = await AsyncStorage.getItem(GYM_DAYS_KEY);
  const n = Number(raw);

  if (n === 3 || n === 4 || n === 5 || n === 6) {
    return n;
  }

  return 4;
};

const calcBmi = (profile?: UserGymProfile | null) => {
  if (!profile?.heightCm || !profile?.weightKg) {
    return null;
  }

  const h = profile.heightCm / 100;

  if (!h) {
    return null;
  }

  return profile.weightKg / (h * h);
};

const shouldUseLightPlan = (profile?: UserGymProfile | null) => {
  return !!profile?.injured || Number(profile?.age || 0) >= 45;
};

const shouldAddCardio = (profile?: UserGymProfile | null) => {
  const bmi = calcBmi(profile);
  const goal = String(profile?.goal || '').toLowerCase();

  return (
    (!!bmi && bmi >= 25) ||
    goal.includes('lose') ||
    goal.includes('fat') ||
    goal.includes('recomp')
  );
};

const personalizeExercise = (
  exercise: SmartGymExercise,
  profile?: UserGymProfile | null,
): SmartGymExercise => {
  const light = shouldUseLightPlan(profile);
  const bmi = calcBmi(profile);

  let next: SmartGymExercise = {
    ...exercise,
    extraNoteKeys: exercise.extraNoteKeys || [],
  };

  if (light) {
    next = {
      ...next,
      sets: Math.max(2, next.sets - 1),
      restSeconds: next.restSeconds + 15,
      extraNoteKeys: [
        ...(next.extraNoteKeys || []),
        'gym.exerciseNotes.light_safety',
      ],
    };
  }

  if (bmi && bmi >= 30 && next.muscleGroup === 'legs') {
    next = {
      ...next,
      reps: next.reps.includes('6-8') ? '8-10' : next.reps,
      extraNoteKeys: [
        ...(next.extraNoteKeys || []),
        'gym.exerciseNotes.high_bmi_leg_safety',
      ],
    };
  }

  return next;
};
const makeDay = (
  dayNumber: number,
  title: string,
  focus: string,
  durationMin: number,
  intensity: SmartGymDay['intensity'],
  exercises: SmartGymExercise[],
  profile?: UserGymProfile | null,
): SmartGymDay => {
const personalized = ensureUniqueExerciseIds(
  exercises.map((item) =>
    personalizeExercise(item, profile),
  ),
);

  return {
    id: `day-${dayNumber}`,
    dayNumber,
    title,
    focus,
    durationMin,
    intensity,
    exercises: personalized,
  };
};

const addCardioIfNeeded = (
  day: SmartGymDay,
  profile?: UserGymProfile | null,
): SmartGymDay => {
  if (!shouldAddCardio(profile)) {
    return day;
  }

  const hasCardio = day.exercises.some(
    (item) => item.muscleGroup === 'cardio',
  );

  if (hasCardio) {
    return day;
  }

  return {
    ...day,
    durationMin: day.durationMin + 10,
    exercises: [
      ...day.exercises,
      personalizeExercise(cloneExercise('treadmillWalk'), profile),
    ],
  };
};

export const getGymPlanAdvice = (
  daysPerWeek: TrainingDaysPerWeek,
  profile?: UserGymProfile | null,
) => {
  const age = Number(profile?.age || 0);
  const bmi = calcBmi(profile);
  const weekNumber = getAutoGymWeekNumber();

  if (!profile) {
    return `Week ${weekNumber}: Complete your profile to personalize this gym schedule.`;
  }

  if (profile.injured) {
    return `Week ${weekNumber}: Recommended ${daysPerWeek} days/week with lighter load, longer rest and joint-friendly exercise rotation.`;
  }

  if (age >= 45) {
    return `Week ${weekNumber}: Recommended ${daysPerWeek} days/week with moderate intensity, longer rest and controlled tempo.`;
  }

  if (bmi && bmi >= 30) {
    return `Week ${weekNumber}: Recommended ${daysPerWeek} days/week with strength training plus short cardio finishers for better fat-loss support.`;
  }

  if (daysPerWeek >= 5) {
    return `Week ${weekNumber}: Rotating exercises weekly to train each muscle group with enough recovery.`;
  }

  return `Week ${weekNumber}: Balanced plan for strength, muscle gain and recovery with weekly exercise variation.`;
};

export const buildSmartGymPlan = (
  daysPerWeek: TrainingDaysPerWeek,
  profile?: UserGymProfile | null,
): SmartGymPlan => {
  const light = shouldUseLightPlan(profile);
  const weekVariant = getAutoGymWeekVariant();

  let days: SmartGymDay[] = [];

  if (daysPerWeek === 3) {
    days = [
      makeDay(
        1,
        'Full Body A',
        'Chest • Back • Legs',
        light ? 45 : 55,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              light ? 'dumbbellsquat' : 'squat',
              light ? 'machineChestPress' : 'benchPress',
              'latPulldown',
              'seatedRow',
              'legextensions',
              'plank',
            ],
            [
              'smithlowbarsquat',
              'inclineBarbellBenchPress',
              'singleArmLatPulldown',
              'lowRow',
              'lyinglegcurl',
              'crunch',
            ],
            [
              'legPress',
              'inclineDumbbellPress',
              'wideneutralgriplatpulldown',
              'chestsupportdbrow',
              'hipThrust',
              'abroller',
            ],
            [
              'trapbardeadlift',
              'machineChestPress',
              'underhandlatpulldown',
              'singlearmdumbbellrow',
              'hipAbduction',
              'declineabcrunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        2,
        'Full Body B',
        'Legs • Shoulders • Arms',
        light ? 45 : 55,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              'romanianDeadlift',
              'hipThrust',
              'dumbbellShoulderPress',
              'lateralRaise',
              'dbHammerCurl',
              'tricepsPushdown',
            ],
            [
              'legPress',
              'hipAbduction',
              'machineshoulderpress',
              'cablelateralraise',
              'normalGripEzBbCurl',
              'dbTricepsExtension',
            ],
            [
              'smithlowbarsquat',
              'lyinglegcurl',
              'dumbbellreardeltfly',
              'cablecurls',
              'overheadcabletricepextension',
              'plank',
            ],
            [
              'bulgariansplitsquat',
              'romanianDeadlift',
              'seatedbarbellshoulderpress',
              'proneinclinedumbbellcurl',
              'dumbbellskullcrusher',
              'mountainclimbers',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        3,
        'Full Body C',
        'Strength • Hypertrophy • Core',
        light ? 45 : 55,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              'legPress',
              'upperCableFly',
              'singleArmLatPulldown',
              'chestsupportdbrow',
              'dbHammerCurl',
              'cableonearmtricepextension',
            ],
            [
              light ? 'machineChestPress' : 'benchPress',
              'tbarrow',
              'lyinglegcurl',
              'hipAbduction',
              'cablepreachercurl',
              'declineabcrunch',
            ],
            [
              'inclineBarbellBenchPress',
              'underhandlatpulldown',
              'lowRow',
              'legextensions',
              'overheadcabletricepextension',
              'abroller',
            ],
            [
              'leverchestpress',
              'wideneutralgriplatpulldown',
              'singlearmdumbbellrow',
              'hipThrust',
              'dumbbellCurl',
              'tricepsPushdown',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
    ];
  }

  if (daysPerWeek === 4) {
    days = [
      makeDay(
        1,
        'Upper Body A',
        'Chest • Back • Shoulders',
        light ? 45 : 60,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              light ? 'machineChestPress' : 'benchPress',
              'latPulldown',
              'inclineDumbbellPress',
              'seatedRow',
              'dumbbellShoulderPress',
              'lateralRaise',
            ],
            [
              light ? 'machineChestPress' : 'inclineBarbellBenchPress',
              'singleArmLatPulldown',
              'upperCableFly',
              'lowRow',
              'machineshoulderpress',
              'cablelateralraise',
            ],
            [
              'leverchestpress',
              'wideneutralgriplatpulldown',
              'machinechestfly',
              'chestsupportdbrow',
              'dumbbellreardeltfly',
              'lateralRaise',
            ],
            [
              light ? 'machineChestPress' : 'benchPress',
              'underhandlatpulldown',
              'inclineDumbbellPress',
              'tbarrow',
              'seatedbarbellshoulderpress',
              'cablelateralraise',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        2,
        'Lower Body A',
        'Quads • Hamstrings • Core',
        light ? 45 : 60,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              light ? 'dumbbellsquat' : 'squat',
              'romanianDeadlift',
              'legPress',
              'legextensions',
              'lyinglegcurl',
              'plank',
            ],
            [
              'smithlowbarsquat',
              'legPress',
              'hipAbduction',
              'lyinglegcurl',
              'crunch',
            ],
            [
              'trapbardeadlift',
              'legextensions',
              'romanianDeadlift',
              'hipThrust',
              'abroller',
            ],
            [
              'dumbbellsquat',
              'bulgariansplitsquat',
              'lyinglegcurl',
              'hipAbduction',
              'declineabcrunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        3,
        'Upper Body B',
        'Back • Chest • Arms',
        light ? 45 : 60,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              'seatedRow',
              'machineChestPress',
              'singleArmLatPulldown',
              'dbHammerCurl',
              'tricepsPushdown',
              'plank',
            ],
            [
              'lowRow',
              'upperCableFly',
              'wideneutralgriplatpulldown',
              'normalGripEzBbCurl',
              'dbTricepsExtension',
              'crunch',
            ],
            [
              'tbarrow',
              'inclineBarbellBenchPress',
              'straightarmpushdown',
              'cablecurls',
              'overheadcabletricepextension',
              'abroller',
            ],
            [
              'chestsupportdbrow',
              'leverchestpress',
              'underhandlatpulldown',
              'cablepreachercurl',
              'dumbbellskullcrusher',
              'declineabcrunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        4,
        'Lower Body B',
        'Glutes • Legs • Core',
        light ? 45 : 60,
        light ? 'light' : 'moderate',
        weeklyExercises(
          [
            [
              'legPress',
              'hipThrust',
              'romanianDeadlift',
              'hipAbduction',
              'cableonearmtricepextension',
              'crunch',
            ],
            [
              'smithlowbarsquat',
              'lyinglegcurl',
              'legextensions',
              'hipThrust',
              'plank',
            ],
            [
              light ? 'dumbbellsquat' : 'squat',
              'trapbardeadlift',
              'hipAbduction',
              'legPress',
              'mountainclimbers',
            ],
            [
              'bulgariansplitsquat',
              'legPress',
              'lyinglegcurl',
              'hipThrust',
              'abroller',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
    ];
  }

  if (daysPerWeek === 5) {
    days = [
      makeDay(
        1,
        'Push Day',
        'Chest • Shoulders • Triceps',
        light ? 45 : 60,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              light ? 'machineChestPress' : 'benchPress',
              'inclineDumbbellPress',
              'dumbbellShoulderPress',
              'lateralRaise',
              'tricepsPushdown',
            ],
            [
              light ? 'machineChestPress' : 'inclineBarbellBenchPress',
              'upperCableFly',
              'machineshoulderpress',
              'cablelateralraise',
              'overheadcabletricepextension',
            ],
            [
              'leverchestpress',
              'machinechestfly',
              'seatedbarbellshoulderpress',
              'dumbbellreardeltfly',
              'dbTricepsExtension',
            ],
            [
              light ? 'machineChestPress' : 'benchPress',
              'inclineDumbbellPress',
              'machineshoulderpress',
              'lateralRaise',
              'dumbbellskullcrusher',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        2,
        'Pull Day',
        'Back • Biceps',
        light ? 45 : 60,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              'latPulldown',
              'seatedRow',
              'straightarmpushdown',
              'dumbbellCurl',
              'dbHammerCurl',
            ],
            [
              'singleArmLatPulldown',
              'lowRow',
              'chestsupportdbrow',
              'normalGripEzBbCurl',
              'cablecurls',
            ],
            [
              'wideneutralgriplatpulldown',
              'tbarrow',
              'underhandlatpulldown',
              'proneinclinedumbbellcurl',
              'cablepreachercurl',
            ],
            [
              'assistedPullUp',
              'singlearmdumbbellrow',
              'straightarmpushdown',
              'dbHammerCurl',
              'normalGripEzBbCurl',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        3,
        'Legs Day',
        'Quads • Hamstrings • Glutes',
        light ? 45 : 65,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              light ? 'dumbbellsquat' : 'squat',
              'romanianDeadlift',
              'legPress',
              'legextensions',
              'lyinglegcurl',
              'plank',
            ],
            [
              'smithlowbarsquat',
              'legPress',
              'hipAbduction',
              'lyinglegcurl',
              'crunch',
            ],
            [
              'trapbardeadlift',
              'hipThrust',
              'legextensions',
              'romanianDeadlift',
              'abroller',
            ],
            [
              'bulgariansplitsquat',
              'dumbbellsquat',
              'hipAbduction',
              'lyinglegcurl',
              'declineabcrunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        4,
        'Upper Hypertrophy',
        'Chest • Back • Arms',
        light ? 45 : 55,
        'moderate',
        weeklyExercises(
          [
            [
              'machineChestPress',
              'seatedRow',
              'upperCableFly',
              'latPulldown',
              'cablecurls',
              'tricepsPushdown',
            ],
            [
              'inclineDumbbellPress',
              'lowRow',
              'machinechestfly',
              'singleArmLatPulldown',
              'dbHammerCurl',
              'dbTricepsExtension',
            ],
            [
              'leverchestpress',
              'chestsupportdbrow',
              'wideneutralgriplatpulldown',
              'normalGripEzBbCurl',
              'overheadcabletricepextension',
              'plank',
            ],
            [
              'machineChestPress',
              'tbarrow',
              'upperCableFly',
              'underhandlatpulldown',
              'cablepreachercurl',
              'dumbbellskullcrusher',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        5,
        'Lower + Core',
        'Legs • Glutes • Core',
        light ? 40 : 55,
        'moderate',
        weeklyExercises(
          [
            [
              'legPress',
              'hipThrust',
              'lyinglegcurl',
              'plank',
              'crunch',
            ],
            [
              'smithlowbarsquat',
              'hipAbduction',
              'legextensions',
              'declineabcrunch',
              'abroller',
            ],
            [
              'dumbbellsquat',
              'romanianDeadlift',
              'hipThrust',
              'mountainclimbers',
              'plank',
            ],
            [
              'trapbardeadlift',
              'legPress',
              'lyinglegcurl',
              'crunch',
              'abroller',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
    ];
  }

  if (daysPerWeek === 6) {
    days = [
      makeDay(
        1,
        'Push A',
        'Chest • Shoulders • Triceps',
        light ? 45 : 55,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              light ? 'machineChestPress' : 'benchPress',
              'inclineDumbbellPress',
              'dumbbellShoulderPress',
              'tricepsPushdown',
            ],
            [
              light ? 'machineChestPress' : 'inclineBarbellBenchPress',
              'upperCableFly',
              'machineshoulderpress',
              'overheadcabletricepextension',
            ],
            [
              'leverchestpress',
              'machinechestfly',
              'lateralRaise',
              'dbTricepsExtension',
            ],
            [
              light ? 'machineChestPress' : 'benchPress',
              'inclineDumbbellPress',
              'cablelateralraise',
              'dumbbellskullcrusher',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        2,
        'Pull A',
        'Back • Biceps',
        light ? 45 : 55,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              'latPulldown',
              'seatedRow',
              'straightarmpushdown',
              'dumbbellCurl',
            ],
            [
              'singleArmLatPulldown',
              'lowRow',
              'chestsupportdbrow',
              'dbHammerCurl',
            ],
            [
              'wideneutralgriplatpulldown',
              'tbarrow',
              'underhandlatpulldown',
              'normalGripEzBbCurl',
            ],
            [
              'assistedPullUp',
              'singlearmdumbbellrow',
              'straightarmpushdown',
              'cablepreachercurl',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        3,
        'Legs A',
        'Quads • Hamstrings',
        light ? 45 : 60,
        light ? 'moderate' : 'hard',
        weeklyExercises(
          [
            [
              light ? 'dumbbellsquat' : 'squat',
              'romanianDeadlift',
              'legPress',
              'legextensions',
            ],
            [
              'smithlowbarsquat',
              'legPress',
              'lyinglegcurl',
              'hipAbduction',
            ],
            [
              'trapbardeadlift',
              'legextensions',
              'romanianDeadlift',
              'plank',
            ],
            [
              'bulgariansplitsquat',
              'dumbbellsquat',
              'lyinglegcurl',
              'crunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        4,
        'Push B',
        'Chest • Shoulders',
        light ? 40 : 50,
        'moderate',
        weeklyExercises(
          [
            [
              'machineChestPress',
              'upperCableFly',
              'lateralRaise',
              'dbTricepsExtension',
            ],
            [
              'inclineDumbbellPress',
              'machinechestfly',
              'cablelateralraise',
              'cableonearmtricepextension',
            ],
            [
              'leverchestpress',
              'machineshoulderpress',
              'dumbbellreardeltfly',
              'overheadcabletricepextension',
            ],
            [
              'machineChestPress',
              'upperCableFly',
              'dumbbellShoulderPress',
              'dumbbellskullcrusher',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        5,
        'Pull B',
        'Back • Arms',
        light ? 40 : 50,
        'moderate',
        weeklyExercises(
          [
            [
              'singleArmLatPulldown',
              'lowRow',
              'dbHammerCurl',
              'tricepsPushdown',
            ],
            [
              'seatedRow',
              'underhandlatpulldown',
              'cablecurls',
              'dbTricepsExtension',
            ],
            [
              'chestsupportdbrow',
              'wideneutralgriplatpulldown',
              'normalGripEzBbCurl',
              'overheadcabletricepextension',
            ],
            [
              'tbarrow',
              'straightarmpushdown',
              'cablepreachercurl',
              'cableonearmtricepextension',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
      makeDay(
        6,
        'Legs B',
        'Glutes • Legs • Core',
        light ? 40 : 50,
        'moderate',
        weeklyExercises(
          [
            [
              'legPress',
              'hipThrust',
              'lyinglegcurl',
              'plank',
            ],
            [
              'smithlowbarsquat',
              'hipAbduction',
              'legextensions',
              'crunch',
            ],
            [
              'dumbbellsquat',
              'romanianDeadlift',
              'hipThrust',
              'abroller',
            ],
            [
              'trapbardeadlift',
              'hipAbduction',
              'lyinglegcurl',
              'declineabcrunch',
            ],
          ],
          weekVariant,
        ),
        profile,
      ),
    ];
  }

  const finalDays = days.map((day, index) => {
    if (index % 2 === 0) {
      return addCardioIfNeeded(day, profile);
    }

    return day;
  });

  return {
    id: `smart-gym-${daysPerWeek}`,
    daysPerWeek,
    title: `${daysPerWeek}-Day Smart Gym Plan`,
    description:
      'Personalized gym schedule based on your profile, recovery and selected training frequency.',
    advice: getGymPlanAdvice(daysPerWeek, profile),
    days: finalDays,
  };
};