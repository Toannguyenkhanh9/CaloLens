// FILE: src/data/foodCatalog.ts

export type FoodCategory =
  | 'vietnamese'
  | 'staples'
  | 'protein'
  | 'fruit'
  | 'vegetables'
  | 'dairy'
  | 'snacks'
  | 'drinks'
  | 'other';

export type PortionOption = {
  id: string;
  label: string;
  grams: number;
};

export type RecipeIngredientSnapshot = {
  foodId: string;
  name: string;
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
};

export type FoodDefinition = {
  id: string;
  name: string;
  aliases?: string[];
  category: FoodCategory;
  source: 'builtin' | 'custom' | 'recipe';
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  defaultPortionGrams: number;
  portions: PortionOption[];
  createdAt?: number;
  recipe?: {
    servings: number;
    totalWeightGrams: number;
    ingredients: RecipeIngredientSnapshot[];
  };
};

const p = (
  id: string,
  label: string,
  grams: number,
): PortionOption => ({
  id,
  label,
  grams,
});

/**
 * Practical nutrition estimates per 100 g.
 * Users can review and edit the serving before saving.
 */
export const BUILT_IN_FOODS: FoodDefinition[] = [
  {
    id: 'rice-white-cooked',
    name: 'Cooked white rice',
    aliases: ['cơm trắng', 'com trang', 'rice'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatsPer100g: 0.3,
    defaultPortionGrams: 180,
    portions: [
      p('small-bowl', 'Small bowl', 130),
      p('bowl', '1 bowl', 180),
      p('large-bowl', 'Large bowl', 250),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'brown-rice-cooked',
    name: 'Cooked brown rice',
    aliases: ['cơm gạo lứt', 'com gao lut'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 123,
    proteinPer100g: 2.7,
    carbsPer100g: 25.6,
    fatsPer100g: 1,
    defaultPortionGrams: 180,
    portions: [
      p('bowl', '1 bowl', 180),
      p('half-bowl', '½ bowl', 90),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'chicken-breast-cooked',
    name: 'Cooked chicken breast',
    aliases: ['ức gà', 'uc ga', 'chicken'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatsPer100g: 3.6,
    defaultPortionGrams: 150,
    portions: [
      p('small', 'Small portion', 100),
      p('portion', '1 portion', 150),
      p('large', 'Large portion', 200),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'chicken-thigh-cooked',
    name: 'Cooked chicken thigh',
    aliases: ['đùi gà', 'dui ga'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 209,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatsPer100g: 10.9,
    defaultPortionGrams: 150,
    portions: [
      p('piece', '1 medium piece', 150),
      p('small', 'Small portion', 100),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'egg-boiled',
    name: 'Boiled egg',
    aliases: ['trứng luộc', 'trung luoc', 'egg'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatsPer100g: 10.6,
    defaultPortionGrams: 50,
    portions: [
      p('one', '1 egg', 50),
      p('two', '2 eggs', 100),
      p('three', '3 eggs', 150),
    ],
  },
  {
    id: 'beef-lean-cooked',
    name: 'Cooked lean beef',
    aliases: ['thịt bò nạc', 'thit bo nac', 'beef'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 217,
    proteinPer100g: 26.1,
    carbsPer100g: 0,
    fatsPer100g: 11.8,
    defaultPortionGrams: 150,
    portions: [
      p('small', 'Small portion', 100),
      p('portion', '1 portion', 150),
      p('large', 'Large portion', 200),
    ],
  },
  {
    id: 'salmon-cooked',
    name: 'Cooked salmon',
    aliases: ['cá hồi', 'ca hoi', 'salmon'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 208,
    proteinPer100g: 20.4,
    carbsPer100g: 0,
    fatsPer100g: 13.4,
    defaultPortionGrams: 150,
    portions: [
      p('fillet', '1 fillet', 150),
      p('small', 'Small fillet', 100),
      p('large', 'Large fillet', 220),
    ],
  },
  {
    id: 'white-fish-cooked',
    name: 'Cooked white fish',
    aliases: ['cá trắng', 'ca trang', 'fish'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 128,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatsPer100g: 2.7,
    defaultPortionGrams: 160,
    portions: [
      p('fillet', '1 fillet', 160),
      p('small', 'Small fillet', 110),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'tofu-firm',
    name: 'Firm tofu',
    aliases: ['đậu hũ', 'đậu phụ', 'dau hu', 'tofu'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 144,
    proteinPer100g: 17.3,
    carbsPer100g: 2.8,
    fatsPer100g: 8.7,
    defaultPortionGrams: 120,
    portions: [
      p('piece', '1 piece', 120),
      p('half', '½ piece', 60),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'pork-lean-cooked',
    name: 'Cooked lean pork',
    aliases: ['thịt heo nạc', 'thịt lợn nạc', 'thit heo nac', 'pork'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 196,
    proteinPer100g: 29,
    carbsPer100g: 0,
    fatsPer100g: 7.9,
    defaultPortionGrams: 150,
    portions: [
      p('portion', '1 portion', 150),
      p('small', 'Small portion', 100),
      p('large', 'Large portion', 200),
    ],
  },
  {
    id: 'sweet-potato-cooked',
    name: 'Cooked sweet potato',
    aliases: ['khoai lang', 'sweet potato'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 90,
    proteinPer100g: 2,
    carbsPer100g: 20.7,
    fatsPer100g: 0.2,
    defaultPortionGrams: 180,
    portions: [
      p('medium', '1 medium', 180),
      p('small', '1 small', 120),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'oats-dry',
    name: 'Rolled oats',
    aliases: ['yến mạch', 'yen mach', 'oatmeal'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 379,
    proteinPer100g: 13.2,
    carbsPer100g: 67.7,
    fatsPer100g: 6.5,
    defaultPortionGrams: 50,
    portions: [
      p('half-cup', '½ cup dry', 40),
      p('portion', '1 portion', 50),
      p('cup', '1 cup dry', 80),
    ],
  },
  {
    id: 'bread-wholegrain',
    name: 'Whole-grain bread',
    aliases: ['bánh mì nguyên cám', 'banh mi nguyen cam'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 247,
    proteinPer100g: 13,
    carbsPer100g: 41,
    fatsPer100g: 4.2,
    defaultPortionGrams: 35,
    portions: [
      p('slice', '1 slice', 35),
      p('two-slices', '2 slices', 70),
      p('three-slices', '3 slices', 105),
    ],
  },
  {
    id: 'banana',
    name: 'Banana',
    aliases: ['chuối', 'chuoi'],
    category: 'fruit',
    source: 'builtin',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatsPer100g: 0.3,
    defaultPortionGrams: 118,
    portions: [
      p('small', '1 small', 90),
      p('medium', '1 medium', 118),
      p('large', '1 large', 140),
    ],
  },
  {
    id: 'apple',
    name: 'Apple',
    aliases: ['táo', 'tao'],
    category: 'fruit',
    source: 'builtin',
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 13.8,
    fatsPer100g: 0.2,
    defaultPortionGrams: 180,
    portions: [
      p('small', '1 small', 140),
      p('medium', '1 medium', 180),
      p('large', '1 large', 220),
    ],
  },
  {
    id: 'orange',
    name: 'Orange',
    aliases: ['cam', 'orange'],
    category: 'fruit',
    source: 'builtin',
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 11.8,
    fatsPer100g: 0.1,
    defaultPortionGrams: 140,
    portions: [
      p('one', '1 orange', 140),
      p('small', '1 small', 100),
      p('large', '1 large', 180),
    ],
  },
  {
    id: 'avocado',
    name: 'Avocado',
    aliases: ['bơ', 'bo'],
    category: 'fruit',
    source: 'builtin',
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 8.5,
    fatsPer100g: 14.7,
    defaultPortionGrams: 75,
    portions: [
      p('quarter', '¼ avocado', 38),
      p('half', '½ avocado', 75),
      p('whole', '1 avocado', 150),
    ],
  },
  {
    id: 'greek-yogurt',
    name: 'Plain Greek yogurt',
    aliases: ['sữa chua hy lạp', 'sua chua hy lap', 'yogurt'],
    category: 'dairy',
    source: 'builtin',
    caloriesPer100g: 73,
    proteinPer100g: 9.9,
    carbsPer100g: 3.9,
    fatsPer100g: 2,
    defaultPortionGrams: 170,
    portions: [
      p('cup', '1 cup', 170),
      p('small', 'Small cup', 100),
      p('large', 'Large cup', 250),
    ],
  },
  {
    id: 'milk-low-fat',
    name: 'Low-fat milk',
    aliases: ['sữa ít béo', 'sua it beo', 'milk'],
    category: 'dairy',
    source: 'builtin',
    caloriesPer100g: 47,
    proteinPer100g: 3.4,
    carbsPer100g: 4.9,
    fatsPer100g: 1.5,
    defaultPortionGrams: 250,
    portions: [
      p('glass', '1 glass', 250),
      p('small-glass', 'Small glass', 180),
      p('bottle', '1 bottle', 330),
    ],
  },
  {
    id: 'whey-protein',
    name: 'Whey protein powder',
    aliases: ['whey', 'bột protein', 'bot protein'],
    category: 'protein',
    source: 'builtin',
    caloriesPer100g: 400,
    proteinPer100g: 80,
    carbsPer100g: 8,
    fatsPer100g: 6,
    defaultPortionGrams: 30,
    portions: [
      p('scoop', '1 scoop', 30),
      p('half-scoop', '½ scoop', 15),
      p('two-scoops', '2 scoops', 60),
    ],
  },
  {
    id: 'peanut-butter',
    name: 'Peanut butter',
    aliases: ['bơ đậu phộng', 'bo dau phong'],
    category: 'snacks',
    source: 'builtin',
    caloriesPer100g: 588,
    proteinPer100g: 25,
    carbsPer100g: 20,
    fatsPer100g: 50,
    defaultPortionGrams: 16,
    portions: [
      p('tablespoon', '1 tbsp', 16),
      p('two-tbsp', '2 tbsp', 32),
      p('teaspoon', '1 tsp', 5),
    ],
  },
  {
    id: 'mixed-nuts',
    name: 'Mixed nuts',
    aliases: ['hạt hỗn hợp', 'hat hon hop', 'nuts'],
    category: 'snacks',
    source: 'builtin',
    caloriesPer100g: 607,
    proteinPer100g: 20,
    carbsPer100g: 21,
    fatsPer100g: 54,
    defaultPortionGrams: 30,
    portions: [
      p('handful', '1 handful', 30),
      p('small', 'Small handful', 15),
      p('large', 'Large handful', 45),
    ],
  },
  {
    id: 'broccoli-cooked',
    name: 'Cooked broccoli',
    aliases: ['bông cải xanh', 'bong cai xanh', 'broccoli'],
    category: 'vegetables',
    source: 'builtin',
    caloriesPer100g: 35,
    proteinPer100g: 2.4,
    carbsPer100g: 7.2,
    fatsPer100g: 0.4,
    defaultPortionGrams: 150,
    portions: [
      p('cup', '1 cup', 150),
      p('half-cup', '½ cup', 75),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'mixed-vegetables-cooked',
    name: 'Cooked mixed vegetables',
    aliases: ['rau củ luộc', 'rau cu luoc', 'vegetables'],
    category: 'vegetables',
    source: 'builtin',
    caloriesPer100g: 55,
    proteinPer100g: 2.5,
    carbsPer100g: 10,
    fatsPer100g: 0.5,
    defaultPortionGrams: 180,
    portions: [
      p('bowl', '1 bowl', 180),
      p('small', 'Small bowl', 120),
      p('100g', '100 g', 100),
    ],
  },
  {
    id: 'pho-beef',
    name: 'Vietnamese beef pho',
    aliases: ['phở bò', 'pho bo', 'phở', 'pho'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 72,
    proteinPer100g: 5.5,
    carbsPer100g: 9.5,
    fatsPer100g: 1.8,
    defaultPortionGrams: 650,
    portions: [
      p('small-bowl', 'Small bowl', 500),
      p('bowl', '1 bowl', 650),
      p('large-bowl', 'Large bowl', 800),
    ],
  },
  {
    id: 'bun-bo-hue',
    name: 'Bun bo Hue',
    aliases: ['bún bò huế', 'bun bo hue'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 85,
    proteinPer100g: 5.4,
    carbsPer100g: 10.5,
    fatsPer100g: 2.5,
    defaultPortionGrams: 650,
    portions: [
      p('small-bowl', 'Small bowl', 500),
      p('bowl', '1 bowl', 650),
      p('large-bowl', 'Large bowl', 800),
    ],
  },
  {
    id: 'com-tam',
    name: 'Vietnamese broken rice plate',
    aliases: ['cơm tấm', 'com tam', 'broken rice'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 190,
    proteinPer100g: 9,
    carbsPer100g: 24,
    fatsPer100g: 6.5,
    defaultPortionGrams: 450,
    portions: [
      p('small-plate', 'Small plate', 350),
      p('plate', '1 plate', 450),
      p('large-plate', 'Large plate', 600),
    ],
  },
  {
    id: 'banh-mi-meat',
    name: 'Vietnamese meat banh mi',
    aliases: ['bánh mì thịt', 'banh mi thit', 'banh mi'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 250,
    proteinPer100g: 10,
    carbsPer100g: 34,
    fatsPer100g: 8,
    defaultPortionGrams: 220,
    portions: [
      p('small', 'Small sandwich', 170),
      p('one', '1 sandwich', 220),
      p('large', 'Large sandwich', 300),
    ],
  },
  {
    id: 'goi-cuon',
    name: 'Vietnamese fresh spring roll',
    aliases: ['gỏi cuốn', 'goi cuon', 'fresh spring roll'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 145,
    proteinPer100g: 7,
    carbsPer100g: 20,
    fatsPer100g: 4,
    defaultPortionGrams: 60,
    portions: [
      p('one', '1 roll', 60),
      p('two', '2 rolls', 120),
      p('four', '4 rolls', 240),
    ],
  },
  {
    id: 'hu-tieu',
    name: 'Vietnamese hu tieu noodle soup',
    aliases: ['hủ tiếu', 'hu tieu'],
    category: 'vietnamese',
    source: 'builtin',
    caloriesPer100g: 78,
    proteinPer100g: 4.8,
    carbsPer100g: 10.8,
    fatsPer100g: 1.8,
    defaultPortionGrams: 650,
    portions: [
      p('small-bowl', 'Small bowl', 500),
      p('bowl', '1 bowl', 650),
      p('large-bowl', 'Large bowl', 800),
    ],
  },
  {
    id: 'instant-noodles-prepared',
    name: 'Prepared instant noodles',
    aliases: ['mì gói', 'mi goi', 'instant noodles'],
    category: 'staples',
    source: 'builtin',
    caloriesPer100g: 145,
    proteinPer100g: 3.5,
    carbsPer100g: 20,
    fatsPer100g: 5.5,
    defaultPortionGrams: 380,
    portions: [
      p('packet', '1 prepared packet', 380),
      p('half', '½ packet', 190),
      p('large', 'Large bowl', 500),
    ],
  },
  {
    id: 'coffee-black',
    name: 'Black coffee',
    aliases: ['cà phê đen', 'ca phe den', 'coffee'],
    category: 'drinks',
    source: 'builtin',
    caloriesPer100g: 2,
    proteinPer100g: 0.1,
    carbsPer100g: 0,
    fatsPer100g: 0,
    defaultPortionGrams: 240,
    portions: [
      p('cup', '1 cup', 240),
      p('small', 'Small cup', 150),
    ],
  },
  {
    id: 'orange-juice',
    name: 'Orange juice',
    aliases: ['nước cam', 'nuoc cam'],
    category: 'drinks',
    source: 'builtin',
    caloriesPer100g: 45,
    proteinPer100g: 0.7,
    carbsPer100g: 10.4,
    fatsPer100g: 0.2,
    defaultPortionGrams: 250,
    portions: [
      p('glass', '1 glass', 250),
      p('small', 'Small glass', 180),
      p('bottle', '1 bottle', 330),
    ],
  },
];
