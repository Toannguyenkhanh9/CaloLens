// FILE: src/nutrition/mealScanQuota.ts
import AsyncStorage
  from '@react-native-async-storage/async-storage';

export const FREE_DAILY_AI_SCAN_LIMIT =
  3;

export const PREMIUM_DAILY_AI_SCAN_LIMIT =
  15;

const AI_SCAN_USAGE_KEY_PREFIX =
  'nutrition:aiMealScans:v2';

export type MealScanQuota = {
  dateKey: string;
  used: number;
  remaining: number;
  limit: number;
};

const getLocalDateKey = (
  date = new Date(),
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      date.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getStorageKey = (
  dateKey: string,
) =>
  `${AI_SCAN_USAGE_KEY_PREFIX}:${dateKey}`;

const getLimit = (
  isPremium: boolean,
) =>
  isPremium
    ? PREMIUM_DAILY_AI_SCAN_LIMIT
    : FREE_DAILY_AI_SCAN_LIMIT;

const normalizeUsed = (
  value: unknown,
) => {
  const parsed =
    Number.parseInt(
      String(value ?? '0'),
      10,
    );

  if (
    !Number.isFinite(parsed) ||
    parsed < 0
  ) {
    return 0;
  }

  /**
   * Không giới hạn theo gói tại đây.
   * Một người dùng đã dùng 8 lượt Premium rồi mất Premium
   * thì gói Free phải được xem là đã hết 3 lượt.
   */
  return Math.min(
    parsed,
    PREMIUM_DAILY_AI_SCAN_LIMIT,
  );
};

export const loadTodayMealScanQuota =
  async (
    isPremium: boolean,
  ): Promise<MealScanQuota> => {
    const dateKey =
      getLocalDateKey();

    const limit =
      getLimit(isPremium);

    try {
      const raw =
        await AsyncStorage.getItem(
          getStorageKey(dateKey),
        );

      const used =
        normalizeUsed(raw);

      return {
        dateKey,
        used,
        remaining:
          Math.max(
            0,
            limit - used,
          ),
        limit,
      };
    } catch (error) {
      console.log(
        '[mealScanQuota] load error',
        error,
      );

      return {
        dateKey,
        used: 0,
        remaining: limit,
        limit,
      };
    }
  };

/**
 * Trừ 1 lượt ngay trước khi gửi ảnh lên AI.
 *
 * Free:
 * - tối đa 3 lượt/ngày;
 * - rewarded đóng hoặc chưa sẵn sàng thì không gọi hàm này.
 *
 * Premium:
 * - tối đa 15 lượt/ngày;
 * - không cần rewarded.
 *
 * Request AI đã bắt đầu thì tính là 1 lượt,
 * kể cả mạng hoặc API lỗi.
 */
export const consumeTodayMealScan =
  async (
    isPremium: boolean,
  ): Promise<{
    allowed: boolean;
    quota: MealScanQuota;
  }> => {
    const current =
      await loadTodayMealScanQuota(
        isPremium,
      );

    if (
      current.used >=
      current.limit
    ) {
      return {
        allowed: false,
        quota: current,
      };
    }

    const used =
      current.used + 1;

    const next:
      MealScanQuota = {
      ...current,
      used,
      remaining:
        Math.max(
          0,
          current.limit - used,
        ),
    };

    await AsyncStorage.setItem(
      getStorageKey(
        current.dateKey,
      ),
      String(used),
    );

    return {
      allowed: true,
      quota: next,
    };
  };

/**
 * Chỉ dùng khi test.
 */
export const resetTodayMealScanQuota =
  async () => {
    const dateKey =
      getLocalDateKey();

    await AsyncStorage.removeItem(
      getStorageKey(dateKey),
    );
  };
