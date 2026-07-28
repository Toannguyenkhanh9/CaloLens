// FILE: src/nutrition/foodLibrary.ts
import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  BUILT_IN_FOODS,
  type FoodDefinition,
  type RecipeIngredientSnapshot,
} from '../data/foodCatalog';

const CUSTOM_FOODS_KEY =
  'nutrition:customFoods:v1';

const RECENT_FOODS_KEY =
  'nutrition:recentFoodIds:v1';

const MAX_RECENT_FOODS = 20;

const makeId = (
  prefix: string,
) =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const round1 = (
  value: number,
) =>
  Math.round(value * 10) / 10;

const safeNumber = (
  value: unknown,
) => {
  const parsed = Number(
    String(value ?? '')
      .replace(',', '.'),
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

export const normalizeFoodSearch = (
  value: string,
) =>
  value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim();

const normalizeFood = (
  value: any,
): FoodDefinition | null => {
  if (
    !value ||
    !value.id ||
    !value.name
  ) {
    return null;
  }

  const defaultPortionGrams =
    Math.max(
      1,
      safeNumber(
        value.defaultPortionGrams,
      ) || 100,
    );

  return {
    id: String(value.id),
    name: String(value.name),
    aliases: Array.isArray(
      value.aliases,
    )
      ? value.aliases.map(String)
      : [],
    category:
      value.category || 'other',
    source:
      value.source === 'recipe'
        ? 'recipe'
        : value.source === 'builtin'
        ? 'builtin'
        : 'custom',
    barcode: value.barcode
      ? String(value.barcode)
      : undefined,
    caloriesPer100g:
      Math.max(
        0,
        safeNumber(
          value.caloriesPer100g,
        ),
      ),
    proteinPer100g:
      Math.max(
        0,
        safeNumber(
          value.proteinPer100g,
        ),
      ),
    carbsPer100g:
      Math.max(
        0,
        safeNumber(
          value.carbsPer100g,
        ),
      ),
    fatsPer100g:
      Math.max(
        0,
        safeNumber(
          value.fatsPer100g,
        ),
      ),
    defaultPortionGrams,
    portions:
      Array.isArray(
        value.portions,
      ) && value.portions.length
        ? value.portions.map(
            (portion: any) => ({
              id: String(
                portion.id ||
                makeId('portion'),
              ),
              label: String(
                portion.label ||
                '1 serving',
              ),
              grams: Math.max(
                1,
                safeNumber(
                  portion.grams,
                ) ||
                defaultPortionGrams,
              ),
            }),
          )
        : [
            {
              id: 'serving',
              label: '1 serving',
              grams:
                defaultPortionGrams,
            },
            {
              id: '100g',
              label: '100 g',
              grams: 100,
            },
          ],
    createdAt:
      safeNumber(
        value.createdAt,
      ) || Date.now(),
    recipe: value.recipe,
  };
};

export const loadCustomFoods =
  async (): Promise<
    FoodDefinition[]
  > => {
    try {
      const raw =
        await AsyncStorage.getItem(
          CUSTOM_FOODS_KEY,
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(normalizeFood)
        .filter(Boolean) as
        FoodDefinition[];
    } catch (error) {
      console.log(
        '[foodLibrary] load custom foods',
        error,
      );

      return [];
    }
  };

const writeCustomFoods = async (
  foods: FoodDefinition[],
) => {
  await AsyncStorage.setItem(
    CUSTOM_FOODS_KEY,
    JSON.stringify(foods),
  );
};

export const loadAllFoods =
  async (): Promise<
    FoodDefinition[]
  > => {
    const custom =
      await loadCustomFoods();

    const map = new Map<
      string,
      FoodDefinition
    >();

    BUILT_IN_FOODS.forEach(
      food => {
        map.set(food.id, food);
      },
    );

    custom.forEach(food => {
      map.set(food.id, food);
    });

    return Array.from(
      map.values(),
    );
  };

export const findFoodById =
  async (
    foodId: string,
  ) => {
    const foods =
      await loadAllFoods();

    return (
      foods.find(
        food =>
          food.id === foodId,
      ) || null
    );
  };

export const findFoodByBarcode =
  async (
    barcode: string,
  ) => {
    const normalized =
      barcode.replace(/\s/g, '');

    if (!normalized) {
      return null;
    }

    const foods =
      await loadAllFoods();

    return (
      foods.find(
        food =>
          food.barcode === normalized,
      ) || null
    );
  };

export const searchFoodLibrary =
  async ({
    query = '',
    category = 'all',
    source = 'all',
  }: {
    query?: string;
    category?:
      | 'all'
      | FoodDefinition['category'];
    source?:
      | 'all'
      | FoodDefinition['source'];
  }): Promise<FoodDefinition[]> => {
    const foods =
      await loadAllFoods();

    const normalized =
      normalizeFoodSearch(query);

    return foods
      .filter(food => {
        if (
          category !== 'all' &&
          food.category !== category
        ) {
          return false;
        }

        if (
          source !== 'all' &&
          food.source !== source
        ) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        const haystack =
          normalizeFoodSearch(
            [
              food.name,
              ...(food.aliases || []),
              food.barcode || '',
            ].join(' '),
          );

        return haystack.includes(
          normalized,
        );
      })
      .sort((a, b) => {
        if (a.source !== b.source) {
          if (
            a.source === 'custom' ||
            a.source === 'recipe'
          ) {
            return -1;
          }

          if (
            b.source === 'custom' ||
            b.source === 'recipe'
          ) {
            return 1;
          }
        }

        return a.name.localeCompare(
          b.name,
        );
      });
  };

export const rememberFood =
  async (
    foodId: string,
  ) => {
    try {
      const raw =
        await AsyncStorage.getItem(
          RECENT_FOODS_KEY,
        );

      const current = raw
        ? JSON.parse(raw)
        : [];

      const next = [
        foodId,
        ...(Array.isArray(current)
          ? current
          : []
        ).filter(
          item => item !== foodId,
        ),
      ].slice(
        0,
        MAX_RECENT_FOODS,
      );

      await AsyncStorage.setItem(
        RECENT_FOODS_KEY,
        JSON.stringify(next),
      );
    } catch (error) {
      console.log(
        '[foodLibrary] remember food',
        error,
      );
    }
  };

export const loadRecentFoods =
  async (): Promise<
    FoodDefinition[]
  > => {
    try {
      const [raw, foods] =
        await Promise.all([
          AsyncStorage.getItem(
            RECENT_FOODS_KEY,
          ),
          loadAllFoods(),
        ]);

      if (!raw) {
        return [];
      }

      const ids = JSON.parse(raw);

      if (!Array.isArray(ids)) {
        return [];
      }

      const map = new Map(
        foods.map(food => [
          food.id,
          food,
        ]),
      );

      return ids
        .map(id => map.get(id))
        .filter(Boolean) as
        FoodDefinition[];
    } catch {
      return [];
    }
  };

export const saveCustomFood =
  async ({
    name,
    barcode,
    servingLabel,
    servingGrams,
    caloriesPerServing,
    proteinPerServing,
    carbsPerServing,
    fatsPerServing,
  }: {
    name: string;
    barcode?: string;
    servingLabel: string;
    servingGrams: number;
    caloriesPerServing: number;
    proteinPerServing: number;
    carbsPerServing: number;
    fatsPerServing: number;
  }) => {
    const grams = Math.max(
      1,
      servingGrams,
    );

    const per100 = (
      value: number,
    ) =>
      round1(
        Math.max(0, value) *
          100 /
          grams,
      );

    const item: FoodDefinition = {
      id: makeId('custom'),
      name: name.trim(),
      aliases: [],
      category: 'other',
      source: 'custom',
      barcode:
        barcode
          ?.trim()
          .replace(/\s/g, '') ||
        undefined,
      caloriesPer100g:
        per100(
          caloriesPerServing,
        ),
      proteinPer100g:
        per100(
          proteinPerServing,
        ),
      carbsPer100g:
        per100(
          carbsPerServing,
        ),
      fatsPer100g:
        per100(
          fatsPerServing,
        ),
      defaultPortionGrams: grams,
      portions: [
        {
          id: 'serving',
          label:
            servingLabel.trim() ||
            '1 serving',
          grams,
        },
        {
          id: 'half',
          label: '½ serving',
          grams: round1(
            grams / 2,
          ),
        },
        {
          id: '100g',
          label: '100 g',
          grams: 100,
        },
      ],
      createdAt: Date.now(),
    };

    const current =
      await loadCustomFoods();

    const withoutBarcodeConflict =
      item.barcode
        ? current.filter(
            food =>
              food.barcode !==
              item.barcode,
          )
        : current;

    await writeCustomFoods([
      item,
      ...withoutBarcodeConflict,
    ]);

    return item;
  };

export const saveRecipeFood =
  async ({
    name,
    servings,
    ingredients,
  }: {
    name: string;
    servings: number;
    ingredients:
      RecipeIngredientSnapshot[];
  }) => {
    const safeServings =
      Math.max(
        1,
        Math.round(servings),
      );

    const totalWeightGrams =
      ingredients.reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            item.grams,
          ),
        0,
      );

    const total = ingredients.reduce(
      (result, ingredient) => {
        const factor =
          ingredient.grams / 100;

        result.calories +=
          ingredient
            .caloriesPer100g *
          factor;

        result.protein +=
          ingredient
            .proteinPer100g *
          factor;

        result.carbs +=
          ingredient
            .carbsPer100g *
          factor;

        result.fats +=
          ingredient
            .fatsPer100g *
          factor;

        return result;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      },
    );

    const per100Factor =
      totalWeightGrams > 0
        ? 100 / totalWeightGrams
        : 0;

    const servingGrams =
      totalWeightGrams /
      safeServings;

    const item: FoodDefinition = {
      id: makeId('recipe'),
      name: name.trim(),
      aliases: [],
      category: 'other',
      source: 'recipe',
      caloriesPer100g:
        round1(
          total.calories *
          per100Factor,
        ),
      proteinPer100g:
        round1(
          total.protein *
          per100Factor,
        ),
      carbsPer100g:
        round1(
          total.carbs *
          per100Factor,
        ),
      fatsPer100g:
        round1(
          total.fats *
          per100Factor,
        ),
      defaultPortionGrams:
        round1(servingGrams),
      portions: [
        {
          id: 'serving',
          label: '1 serving',
          grams:
            round1(servingGrams),
        },
        {
          id: 'half',
          label: '½ serving',
          grams:
            round1(
              servingGrams / 2,
            ),
        },
        {
          id: 'double',
          label: '2 servings',
          grams:
            round1(
              servingGrams * 2,
            ),
        },
        {
          id: '100g',
          label: '100 g',
          grams: 100,
        },
      ],
      createdAt: Date.now(),
      recipe: {
        servings: safeServings,
        totalWeightGrams:
          round1(
            totalWeightGrams,
          ),
        ingredients,
      },
    };

    const current =
      await loadCustomFoods();

    await writeCustomFoods([
      item,
      ...current,
    ]);

    return item;
  };

export const deleteCustomFood =
  async (
    foodId: string,
  ) => {
    const current =
      await loadCustomFoods();

    const next = current.filter(
      item => item.id !== foodId,
    );

    await writeCustomFoods(next);

    return next;
  };

export const calculateFoodNutrition = (
  food: FoodDefinition,
  grams: number,
) => {
  const factor =
    Math.max(0, grams) / 100;

  return {
    calories: Math.round(
      food.caloriesPer100g *
      factor,
    ),
    proteinG: round1(
      food.proteinPer100g *
      factor,
    ),
    carbsG: round1(
      food.carbsPer100g *
      factor,
    ),
    fatsG: round1(
      food.fatsPer100g *
      factor,
    ),
  };
};

export const foodToAiCandidate = (
  food: FoodDefinition,
  grams: number,
) => ({
  id: `${food.id}-${Date.now()}`,
  name: food.name,
  estimatedGrams:
    Math.max(
      1,
      round1(grams),
    ),
  caloriesPer100g:
    food.caloriesPer100g,
  proteinPer100g:
    food.proteinPer100g,
  carbsPer100g:
    food.carbsPer100g,
  fatsPer100g:
    food.fatsPer100g,
  confidence: 1,
});
