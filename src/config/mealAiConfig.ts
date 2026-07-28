// FILE: src/config/mealAiConfig.ts

/**
 * URL backend của bạn.
 *
 * Không đặt Gemini/OpenAI API key trực tiếp trong ứng dụng.
 * Backend nhận ảnh, gọi AI và trả JSON đã chuẩn hóa.
 */
export const MEAL_AI_ENDPOINT =
  'https://analyzemeal-r2fpduvsba-as.a.run.app';

export const MEAL_AI_TIMEOUT_MS =
  45_000;
