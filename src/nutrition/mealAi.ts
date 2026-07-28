// FILE: src/nutrition/mealAi.ts
import {
  MEAL_AI_ENDPOINT,
  MEAL_AI_TIMEOUT_MS,
} from '../config/mealAiConfig';

export type AiFoodCandidate = {
  id: string;
  name: string;
  estimatedGrams: number;

  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;

  confidence?: number;
};

export class MealAiNotConfiguredError
  extends Error {
  constructor() {
    super(
      'MEAL_AI_ENDPOINT is not configured.',
    );

    this.name =
      'MealAiNotConfiguredError';
  }
}

const toNumber = (
  value: unknown,
) => {
  const parsed =
    Number.parseFloat(
      String(value ?? '')
        .replace(',', '.'),
    );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

const clamp = (
  value: number,
  min: number,
  max: number,
) => Math.max(
  min,
  Math.min(
    max,
    value,
  ),
);

const normalizeFood = (
  value: any,
  index: number,
): AiFoodCandidate | null => {
  const name =
    String(
      value?.name ||
      value?.foodName ||
      '',
    ).trim();

  if (!name) {
    return null;
  }

  const estimatedGrams =
    clamp(
      toNumber(
        value?.estimatedGrams ??
        value?.grams ??
        value?.servingGrams,
      ) || 100,
      1,
      3000,
    );

  const totalCalories =
    toNumber(
      value?.calories,
    );
  const totalProtein =
    toNumber(
      value?.proteinG ??
      value?.protein,
    );
  const totalCarbs =
    toNumber(
      value?.carbsG ??
      value?.carbs,
    );
  const totalFats =
    toNumber(
      value?.fatsG ??
      value?.fatG ??
      value?.fat,
    );

  const ratio =
    estimatedGrams / 100;

  const caloriesPer100g =
    toNumber(
      value?.caloriesPer100g,
    ) ||
    (
      totalCalories > 0 &&
      ratio > 0
        ? totalCalories / ratio
        : 0
    );

  const proteinPer100g =
    toNumber(
      value?.proteinPer100g,
    ) ||
    (
      totalProtein > 0 &&
      ratio > 0
        ? totalProtein / ratio
        : 0
    );

  const carbsPer100g =
    toNumber(
      value?.carbsPer100g,
    ) ||
    (
      totalCarbs > 0 &&
      ratio > 0
        ? totalCarbs / ratio
        : 0
    );

  const fatsPer100g =
    toNumber(
      value?.fatsPer100g,
    ) ||
    (
      totalFats > 0 &&
      ratio > 0
        ? totalFats / ratio
        : 0
    );

  return {
    id:
      String(
        value?.id ||
        `ai-${Date.now()}-${index}`,
      ),
    name,
    estimatedGrams:
      Math.round(
        estimatedGrams,
      ),
    caloriesPer100g:
      Math.max(
        0,
        Math.round(
          caloriesPer100g,
        ),
      ),
    proteinPer100g:
      Math.max(
        0,
        Math.round(
          proteinPer100g * 10,
        ) / 10,
      ),
    carbsPer100g:
      Math.max(
        0,
        Math.round(
          carbsPer100g * 10,
        ) / 10,
      ),
    fatsPer100g:
      Math.max(
        0,
        Math.round(
          fatsPer100g * 10,
        ) / 10,
      ),
    confidence:
      value?.confidence == null
        ? undefined
        : clamp(
            toNumber(
              value.confidence,
            ),
            0,
            1,
          ),
  };
};

export const analyzeMealPhoto =
  async ({
    uri,
    locale,
  }: {
    uri: string;
    locale?: string;
  }): Promise<AiFoodCandidate[]> => {
    if (
      !MEAL_AI_ENDPOINT ||
      MEAL_AI_ENDPOINT.includes(
        'YOUR_',
      )
    ) {
      throw new MealAiNotConfiguredError();
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        MEAL_AI_TIMEOUT_MS,
      );

    try {
      const form =
        new FormData();

      form.append(
        'image',
        {
          uri,
          type: 'image/jpeg',
          name:
            `meal-${Date.now()}.jpg`,
        } as any,
      );

      form.append(
        'locale',
        locale || 'en',
      );

      const response =
        await fetch(
          MEAL_AI_ENDPOINT,
          {
            method: 'POST',
            body: form,
            signal:
              controller.signal,
            headers: {
              Accept:
                'application/json',
            },
          },
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
          `Meal analysis failed (${response.status}).`,
        );
      }

      const json =
        await response.json();

      const rawFoods =
        Array.isArray(json)
          ? json
          : json?.foods;

      if (
        !Array.isArray(
          rawFoods,
        )
      ) {
        throw new Error(
          'Invalid meal analysis response.',
        );
      }

      const foods =
        rawFoods
          .map(normalizeFood)
          .filter(
            (
              item,
            ): item is AiFoodCandidate =>
              !!item,
          );

      if (!foods.length) {
        throw new Error(
          'No food was recognized in this photo.',
        );
      }

      return foods;
    } finally {
      clearTimeout(timeout);
    }
  };
