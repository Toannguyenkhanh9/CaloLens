// FILE: src/nutrition/todayMenu.ts

export type TodayMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type TodayMenuTemplate = {
  id: string;
  type: TodayMealType;
  ratio: number;
  titleKey: string;
  defaultTitle: string;
  descKey: string;
  defaultDesc: string;
};

export type TodayMenuItem = TodayMenuTemplate & {
  calories: number;
};

export type TodayMenuPlan = {
  dateKey: string;
  totalCalories: number;
  meals: TodayMenuItem[];
};

const getDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

const hashText = (text: string) => {
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
};

const roundCalories = (value: number) => {
  return Math.max(50, Math.round(value / 10) * 10);
};

const BANK: Record<TodayMealType, TodayMenuTemplate[]> = {
  breakfast: [
    {
      id: 'oatsEggs',
      type: 'breakfast',
      ratio: 0.25,
      titleKey: 'nutrition.todayMenu.items.breakfast.oatsEggs.title',
      defaultTitle: 'Oatmeal, banana and eggs',
      descKey: 'nutrition.todayMenu.items.breakfast.oatsEggs.desc',
      defaultDesc: 'Oats, banana, eggs and a light protein source.',
    },
    {
      id: 'greekYogurt',
      type: 'breakfast',
      ratio: 0.25,
      titleKey: 'nutrition.todayMenu.items.breakfast.greekYogurt.title',
      defaultTitle: 'Greek yogurt bowl',
      descKey: 'nutrition.todayMenu.items.breakfast.greekYogurt.desc',
      defaultDesc: 'Greek yogurt, fruit, nuts and a small portion of oats.',
    },
    {
      id: 'chickenSandwich',
      type: 'breakfast',
      ratio: 0.25,
      titleKey: 'nutrition.todayMenu.items.breakfast.chickenSandwich.title',
      defaultTitle: 'Chicken egg sandwich',
      descKey: 'nutrition.todayMenu.items.breakfast.chickenSandwich.desc',
      defaultDesc: 'Whole-grain bread, chicken breast, egg and vegetables.',
    },
    {
      id: 'smoothie',
      type: 'breakfast',
      ratio: 0.25,
      titleKey: 'nutrition.todayMenu.items.breakfast.smoothie.title',
      defaultTitle: 'Protein smoothie',
      descKey: 'nutrition.todayMenu.items.breakfast.smoothie.desc',
      defaultDesc: 'Milk or yogurt, banana, oats and protein-rich topping.',
    },
  ],

  lunch: [
    {
      id: 'chickenRice',
      type: 'lunch',
      ratio: 0.35,
      titleKey: 'nutrition.todayMenu.items.lunch.chickenRice.title',
      defaultTitle: 'Chicken rice bowl',
      descKey: 'nutrition.todayMenu.items.lunch.chickenRice.desc',
      defaultDesc: 'Rice, chicken breast, vegetables and a healthy sauce.',
    },
    {
      id: 'beefPotato',
      type: 'lunch',
      ratio: 0.35,
      titleKey: 'nutrition.todayMenu.items.lunch.beefPotato.title',
      defaultTitle: 'Lean beef and potatoes',
      descKey: 'nutrition.todayMenu.items.lunch.beefPotato.desc',
      defaultDesc: 'Lean beef, potatoes, salad and olive oil dressing.',
    },
    {
      id: 'salmonRice',
      type: 'lunch',
      ratio: 0.35,
      titleKey: 'nutrition.todayMenu.items.lunch.salmonRice.title',
      defaultTitle: 'Salmon rice plate',
      descKey: 'nutrition.todayMenu.items.lunch.salmonRice.desc',
      defaultDesc: 'Salmon, rice, greens and avocado or healthy fats.',
    },
    {
      id: 'tofuNoodles',
      type: 'lunch',
      ratio: 0.35,
      titleKey: 'nutrition.todayMenu.items.lunch.tofuNoodles.title',
      defaultTitle: 'Tofu noodle bowl',
      descKey: 'nutrition.todayMenu.items.lunch.tofuNoodles.desc',
      defaultDesc: 'Tofu, noodles, vegetables and a light soy-based sauce.',
    },
  ],

  dinner: [
    {
      id: 'fishVeg',
      type: 'dinner',
      ratio: 0.3,
      titleKey: 'nutrition.todayMenu.items.dinner.fishVeg.title',
      defaultTitle: 'Fish with vegetables',
      descKey: 'nutrition.todayMenu.items.dinner.fishVeg.desc',
      defaultDesc: 'Fish, steamed vegetables and a small serving of carbs.',
    },
    {
      id: 'chickenSweetPotato',
      type: 'dinner',
      ratio: 0.3,
      titleKey: 'nutrition.todayMenu.items.dinner.chickenSweetPotato.title',
      defaultTitle: 'Chicken and sweet potato',
      descKey: 'nutrition.todayMenu.items.dinner.chickenSweetPotato.desc',
      defaultDesc: 'Chicken, sweet potato and mixed greens.',
    },
    {
      id: 'eggRice',
      type: 'dinner',
      ratio: 0.3,
      titleKey: 'nutrition.todayMenu.items.dinner.eggRice.title',
      defaultTitle: 'Egg rice and vegetables',
      descKey: 'nutrition.todayMenu.items.dinner.eggRice.desc',
      defaultDesc: 'Eggs, rice, vegetables and a light soup.',
    },
    {
      id: 'turkeyWrap',
      type: 'dinner',
      ratio: 0.3,
      titleKey: 'nutrition.todayMenu.items.dinner.turkeyWrap.title',
      defaultTitle: 'Lean protein wrap',
      descKey: 'nutrition.todayMenu.items.dinner.turkeyWrap.desc',
      defaultDesc: 'Lean protein, wrap, greens and yogurt-based sauce.',
    },
  ],

  snack: [
    {
      id: 'fruitNuts',
      type: 'snack',
      ratio: 0.1,
      titleKey: 'nutrition.todayMenu.items.snack.fruitNuts.title',
      defaultTitle: 'Fruit and nuts',
      descKey: 'nutrition.todayMenu.items.snack.fruitNuts.desc',
      defaultDesc: 'A serving of fruit with a small handful of nuts.',
    },
    {
      id: 'proteinMilk',
      type: 'snack',
      ratio: 0.1,
      titleKey: 'nutrition.todayMenu.items.snack.proteinMilk.title',
      defaultTitle: 'Protein milk',
      descKey: 'nutrition.todayMenu.items.snack.proteinMilk.desc',
      defaultDesc: 'Milk or yogurt with a protein-rich snack.',
    },
    {
      id: 'boiledEggs',
      type: 'snack',
      ratio: 0.1,
      titleKey: 'nutrition.todayMenu.items.snack.boiledEggs.title',
      defaultTitle: 'Boiled eggs and fruit',
      descKey: 'nutrition.todayMenu.items.snack.boiledEggs.desc',
      defaultDesc: 'Boiled eggs with fruit or a light carb source.',
    },
    {
      id: 'cottageCheese',
      type: 'snack',
      ratio: 0.1,
      titleKey: 'nutrition.todayMenu.items.snack.cottageCheese.title',
      defaultTitle: 'Cheese or yogurt snack',
      descKey: 'nutrition.todayMenu.items.snack.cottageCheese.desc',
      defaultDesc: 'Cheese or yogurt with fruit for recovery.',
    },
  ],
};

const mealOrder: TodayMealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

export const buildTodayMenu = (
  targetCalories: number,
  date = new Date(),
): TodayMenuPlan => {
  const dateKey = getDateKey(date);
  const seed = hashText(dateKey);
  const safeCalories = Number.isFinite(targetCalories)
    ? Math.max(800, targetCalories)
    : 2000;

  const meals = mealOrder.map((type, index) => {
    const options = BANK[type];
    const selected = options[(seed + index * 11) % options.length];

    return {
      ...selected,
      calories: roundCalories(safeCalories * selected.ratio),
    };
  });

  const totalCalories = meals.reduce(
    (sum, meal) => sum + meal.calories,
    0,
  );

  return {
    dateKey,
    totalCalories,
    meals,
  };
};