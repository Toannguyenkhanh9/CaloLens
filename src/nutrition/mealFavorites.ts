// FILE: src/nutrition/mealFavorites.ts
import AsyncStorage
  from '@react-native-async-storage/async-storage';

import {
  addMealLog,
  calculateDailyNutrition,
  getNutritionDateKey,
  loadMealLogs,
  type FoodLogItem,
  type LoggedMealType,
  type MealLog,
} from './mealLog';
import {
  getPastDateKeys,
} from './caloLensInsights';

const FAVORITES_KEY =
  'nutrition:favoriteMeals:v1';

export type FavoriteMeal = {
  id: string;
  title: string;
  mealType: LoggedMealType;
  createdAt: number;
  foods: FoodLogItem[];
};

export type FrequentMeal = {
  signature: string;
  count: number;
  meal: MealLog;
};

const cloneFoods = (
  foods: FoodLogItem[],
): FoodLogItem[] =>
  foods.map(food => ({
    ...food,
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
  }));

const mealTitle = (
  meal: MealLog,
) =>
  meal.foods
    .slice(0, 2)
    .map(food =>
      food.name.trim(),
    )
    .filter(Boolean)
    .join(' + ') ||
  'Favorite meal';

const signatureForMeal = (
  meal: MealLog,
) =>
  meal.foods
    .map(food =>
      food.name
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)
    .sort()
    .join('|');

export const loadFavoriteMeals =
  async (): Promise<FavoriteMeal[]> => {
    try {
      const raw =
        await AsyncStorage.getItem(
          FAVORITES_KEY,
        );

      if (!raw) {
        return [];
      }

      const parsed =
        JSON.parse(raw);

      return Array.isArray(parsed)
        ? parsed
            .filter(
              item =>
                Array.isArray(
                  item?.foods,
                ),
            )
            .sort(
              (a, b) =>
                Number(
                  b.createdAt,
                ) -
                Number(
                  a.createdAt,
                ),
            )
        : [];
    } catch {
      return [];
    }
  };

const saveFavoriteMeals = async (
  items: FavoriteMeal[],
) => {
  await AsyncStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(items),
  );
};

export const saveMealAsFavorite =
  async (
    meal: MealLog,
  ): Promise<FavoriteMeal[]> => {
    const current =
      await loadFavoriteMeals();

    const signature =
      signatureForMeal(meal);

    const nextItem:
      FavoriteMeal = {
      id:
        `favorite-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      title:
        mealTitle(meal),
      mealType:
        meal.mealType,
      createdAt:
        Date.now(),
      foods:
        cloneFoods(
          meal.foods,
        ),
    };

    const withoutDuplicate =
      current.filter(item => {
        const compareMeal:
          MealLog = {
          id: item.id,
          dateKey:
            getNutritionDateKey(),
          mealType:
            item.mealType,
          createdAt:
            item.createdAt,
          foods:
            item.foods,
        };

        return (
          signatureForMeal(
            compareMeal,
          ) !== signature
        );
      });

    const next = [
      nextItem,
      ...withoutDuplicate,
    ].slice(0, 30);

    await saveFavoriteMeals(
      next,
    );

    return next;
  };

export const deleteFavoriteMeal =
  async (
    favoriteId: string,
  ) => {
    const current =
      await loadFavoriteMeals();

    const next =
      current.filter(
        item =>
          item.id !==
          favoriteId,
      );

    await saveFavoriteMeals(
      next,
    );

    return next;
  };

export const addFavoriteToToday =
  async (
    favorite: FavoriteMeal,
  ) =>
    addMealLog({
      mealType:
        favorite.mealType,
      foods:
        cloneFoods(
          favorite.foods,
        ),
    });

export const copyMealToDate =
  async (
    meal: MealLog,
    dateKey =
      getNutritionDateKey(),
  ) =>
    addMealLog({
      dateKey,
      mealType:
        meal.mealType,
      photoUri:
        meal.photoUri,
      foods:
        cloneFoods(
          meal.foods,
        ),
    });

export const loadRecentMeals =
  async (
    days = 14,
  ): Promise<MealLog[]> => {
    const dateKeys =
      getPastDateKeys(days);

    const groups =
      await Promise.all(
        dateKeys.map(
          dateKey =>
            loadMealLogs(
              dateKey,
            ),
        ),
      );

    return groups
      .flat()
      .sort(
        (a, b) =>
          b.createdAt -
          a.createdAt,
      );
  };

export const getFrequentMeals =
  async (
    days = 21,
    limit = 3,
  ): Promise<FrequentMeal[]> => {
    const recent =
      await loadRecentMeals(
        days,
      );

    const map =
      new Map<
        string,
        FrequentMeal
      >();

    recent.forEach(meal => {
      const signature =
        signatureForMeal(meal);

      if (!signature) {
        return;
      }

      const current =
        map.get(signature);

      if (current) {
        current.count += 1;
        return;
      }

      map.set(signature, {
        signature,
        count: 1,
        meal,
      });
    });

    return Array.from(
      map.values(),
    )
      .sort((a, b) => {
        if (
          b.count !== a.count
        ) {
          return (
            b.count - a.count
          );
        }

        return (
          b.meal.createdAt -
          a.meal.createdAt
        );
      })
      .slice(0, limit);
  };

export const getMealDisplayTitle = (
  meal: MealLog,
) =>
  mealTitle(meal);

export const getMealCalories = (
  meal: MealLog,
) =>
  calculateDailyNutrition(
    [meal],
  ).calories;
