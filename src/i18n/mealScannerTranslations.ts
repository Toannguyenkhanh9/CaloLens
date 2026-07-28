// FILE: src/i18n/mealScannerTranslations.ts
import i18n from './index';
import remainingMealScannerTranslations
  from './mealScannerTranslations.remaining';
const en = {
  mealScan: {
    todayKicker: 'TODAY',
    dailyIntake: 'Daily intake',
    viewLog: 'View log',
    consumedKcal: 'kcal consumed',
    remainingKcal: '{{count}} kcal left',
    overKcal: '{{count}} kcal over',
    scanFood: 'Scan food',
    manual: 'Manual',
    adviceTitle: 'Today’s advice',
    noMeals: 'No food has been logged today.',
    mealsLogged: '{{count}} meals logged today',

    adviceLowCalories:
      'You still have about {{count}} kcal available today. Prioritize a balanced meal.',
    adviceOnTrack:
      'Your calorie intake is currently on track for today.',
    adviceNearTarget:
      'You are close to your calorie target. Choose the remaining meals carefully.',
    adviceOverTarget:
      'You are about {{count}} kcal above today’s target. Prefer lighter meals for the rest of the day.',
    adviceProteinLow:
      'You still need about {{count}} g protein. Consider lean meat, fish, eggs, yogurt or whey.',
    adviceFatHigh:
      'Fat intake is already high. Limit fried foods, creamy sauces and added oil.',
    adviceBalanced:
      'Calories and protein are well balanced so far. Keep portions consistent.',

    aiKicker: 'AI MEAL SCANNER',
    scannerTitle: 'Scan your meal',
    scannerSubtitle:
      'Take one clear photo of the full meal. You can confirm each food and portion before saving.',
    takePhoto: 'Take photo',
    choosePhoto: 'Choose photo',
    analyze: 'Analyze with AI',
    analyzing: 'Analyzing meal…',
    enterManually: 'Enter food manually',
    photoGuideTitle: 'Place the full meal inside the frame',
    photoGuideBody:
      'Good lighting and a top or 45° angle help the AI recognize portions.',
    estimateDisclaimer:
      'Calories and nutrients are estimates. Results vary by ingredients, cooking method and actual portion size.',
    cameraPermissionTitle: 'Camera permission',
    cameraPermissionBody:
      'GymNova needs camera access to scan your meal.',
    permissionBlockedTitle: 'Camera permission blocked',
    permissionBlockedBody:
      'Open Settings and allow Camera access for GymNova.',
    photoError: 'Unable to open the camera or photo library.',
    endpointTitle: 'AI backend is not configured',
    endpointBody:
      'Set MEAL_AI_ENDPOINT in src/config/mealAiConfig.ts. API keys must stay on your backend.',
    analysisFailedTitle: 'Unable to analyze meal',
    analysisFailedBody: 'Check your connection and try again.',

    reviewTitle: 'Review meal',
    reviewSubtitle:
      'Confirm the food names and portions before adding them to today’s intake.',
    mealType: 'Meal type',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    foodNumber: 'Food {{count}}',
    foodName: 'Food name',
    foodNamePlaceholder: 'e.g. Grilled chicken',
    grams: 'Grams',
    caloriesPer100g: 'kcal / 100g',
    addFood: 'Add food',
    mealTotal: 'Meal total',
    saveMeal: 'Add to today',
    saving: 'Saving…',
    missingFoodTitle: 'Add at least one food',
    missingFoodBody:
      'Enter the food name, portion and calories before saving.',
    saveError: 'Unable to save this meal.',

    logTitle: 'Food log',
    deleteMealTitle: 'Delete meal?',
    deleteMealBody:
      'This meal will be removed from the daily total.',
  },
};

const vi = {
  mealScan: {
    todayKicker: 'HÔM NAY',
    dailyIntake: 'Lượng đã hấp thụ',
    viewLog: 'Xem nhật ký',
    consumedKcal: 'kcal đã dùng',
    remainingKcal: 'Còn {{count}} kcal',
    overKcal: 'Vượt {{count}} kcal',
    scanFood: 'Quét món ăn',
    manual: 'Nhập tay',
    adviceTitle: 'Lời khuyên hôm nay',
    noMeals: 'Hôm nay chưa ghi nhận món ăn nào.',
    mealsLogged: 'Đã ghi {{count}} bữa hôm nay',

    adviceLowCalories:
      'Bạn còn khoảng {{count}} kcal trong ngày. Hãy ưu tiên một bữa ăn cân bằng.',
    adviceOnTrack:
      'Lượng calo hiện tại đang phù hợp với mục tiêu hôm nay.',
    adviceNearTarget:
      'Bạn đang gần đạt mục tiêu calo. Hãy lựa chọn kỹ các bữa còn lại.',
    adviceOverTarget:
      'Bạn đã vượt khoảng {{count}} kcal. Nên chọn món nhẹ hơn trong phần còn lại của ngày.',
    adviceProteinLow:
      'Bạn còn thiếu khoảng {{count}} g protein. Có thể bổ sung thịt nạc, cá, trứng, sữa chua hoặc whey.',
    adviceFatHigh:
      'Lượng chất béo đã cao. Hạn chế món chiên, sốt béo và dầu thêm vào.',
    adviceBalanced:
      'Calo và protein hiện đang cân đối. Hãy tiếp tục giữ khẩu phần ổn định.',

    aiKicker: 'QUÉT BỮA ĂN BẰNG AI',
    scannerTitle: 'Quét phần ăn',
    scannerSubtitle:
      'Chụp rõ toàn bộ phần ăn. Bạn có thể kiểm tra từng món và khẩu phần trước khi lưu.',
    takePhoto: 'Chụp ảnh',
    choosePhoto: 'Chọn ảnh',
    analyze: 'Phân tích bằng AI',
    analyzing: 'Đang phân tích…',
    enterManually: 'Nhập món thủ công',
    photoGuideTitle: 'Đặt toàn bộ phần ăn trong khung',
    photoGuideBody:
      'Ánh sáng tốt và góc chụp từ trên hoặc khoảng 45° giúp AI ước tính tốt hơn.',
    estimateDisclaimer:
      'Calo và dinh dưỡng chỉ là ước tính, có thể thay đổi theo nguyên liệu, cách chế biến và khẩu phần thực tế.',
    cameraPermissionTitle: 'Quyền Camera',
    cameraPermissionBody:
      'GymNova cần quyền Camera để quét phần ăn.',
    permissionBlockedTitle: 'Quyền Camera đang bị chặn',
    permissionBlockedBody:
      'Mở Cài đặt và cấp quyền Camera cho GymNova.',
    photoError: 'Không thể mở Camera hoặc thư viện ảnh.',
    endpointTitle: 'Chưa cấu hình backend AI',
    endpointBody:
      'Hãy đặt MEAL_AI_ENDPOINT trong src/config/mealAiConfig.ts. Không đặt API key trực tiếp trong ứng dụng.',
    analysisFailedTitle: 'Không thể phân tích phần ăn',
    analysisFailedBody: 'Kiểm tra kết nối rồi thử lại.',

    reviewTitle: 'Kiểm tra phần ăn',
    reviewSubtitle:
      'Xác nhận tên món và khẩu phần trước khi thêm vào lượng đã ăn hôm nay.',
    mealType: 'Loại bữa ăn',
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
    foodNumber: 'Món {{count}}',
    foodName: 'Tên món',
    foodNamePlaceholder: 'Ví dụ: Ức gà nướng',
    grams: 'Khối lượng (g)',
    caloriesPer100g: 'kcal / 100g',
    addFood: 'Thêm món',
    mealTotal: 'Tổng bữa ăn',
    saveMeal: 'Thêm vào hôm nay',
    saving: 'Đang lưu…',
    missingFoodTitle: 'Hãy thêm ít nhất một món',
    missingFoodBody:
      'Nhập tên món, khẩu phần và calo trước khi lưu.',
    saveError: 'Không thể lưu bữa ăn.',

    logTitle: 'Nhật ký ăn uống',
    deleteMealTitle: 'Xóa bữa ăn?',
    deleteMealBody:
      'Bữa ăn này sẽ bị trừ khỏi tổng dinh dưỡng trong ngày.',
  },
};


const resources = {
  en,
  vi,
  ...remainingMealScannerTranslations,
};

Object.entries(resources).forEach(
  ([language, value]) => {
    i18n.addResourceBundle(
      language,
      'translation',
      value,
      true,
      true,
    );
  },
);

export default resources;
