// FILE: src/i18n/caloLensGuideTranslations.ts
import i18n from './index';

const resources = {
  en: {
    caloLensGuide: {
      kicker: 'GET STARTED',
      title: 'How to use CaloLens',
      subtitle:
        'Follow four simple steps to calculate your target, scan meals and track daily nutrition.',
      step1Badge: 'STEP 1',
      step1Title: 'Complete your body profile',
      step1Desc:
        'Enter age, height, weight, activity level and body goal so CaloLens can calculate daily calories and macros.',
      step2Badge: 'STEP 2',
      step2Title: 'Take one clear meal photo',
      step2Desc:
        'Place the full meal in the frame with good lighting, then use Scan to estimate foods, portions and nutrition.',
      step3Badge: 'STEP 3',
      step3Title: 'Review portions before saving',
      step3Desc:
        'Correct food names, grams and nutrition values when needed. Photo analysis is an estimate, not an exact measurement.',
      step4Badge: 'STEP 4',
      step4Title: 'Follow your daily balance',
      step4Desc:
        'Use the Today and Diary tabs to check remaining calories, protein, carbs, fats and your weight trend.',
      noteTitle: 'Keep estimates realistic',
      note:
        'Cooking oil, sauces and hidden ingredients can change calories significantly. Adjust the result when you know the actual recipe or portion.',
    },
  },
  vi: {
    caloLensGuide: {
      kicker: 'BẮT ĐẦU',
      title: 'Cách sử dụng CaloLens',
      subtitle:
        'Làm theo bốn bước đơn giản để tính mục tiêu, quét bữa ăn và theo dõi dinh dưỡng hằng ngày.',
      step1Badge: 'BƯỚC 1',
      step1Title: 'Hoàn thành hồ sơ cơ thể',
      step1Desc:
        'Nhập tuổi, chiều cao, cân nặng, mức vận động và mục tiêu để CaloLens tính calo và macro hằng ngày.',
      step2Badge: 'BƯỚC 2',
      step2Title: 'Chụp một ảnh bữa ăn rõ ràng',
      step2Desc:
        'Đặt toàn bộ bữa ăn trong khung hình, đủ ánh sáng, rồi dùng Quét để ước tính món, khẩu phần và dinh dưỡng.',
      step3Badge: 'BƯỚC 3',
      step3Title: 'Kiểm tra khẩu phần trước khi lưu',
      step3Desc:
        'Chỉnh tên món, số gram và thông tin dinh dưỡng khi cần. Kết quả từ ảnh chỉ là ước tính.',
      step4Badge: 'BƯỚC 4',
      step4Title: 'Theo dõi cân bằng trong ngày',
      step4Desc:
        'Dùng tab Hôm nay và Nhật ký để xem calo còn lại, protein, carb, fat và xu hướng cân nặng.',
      noteTitle: 'Giữ kết quả ước tính thực tế',
      note:
        'Dầu ăn, nước sốt và nguyên liệu ẩn có thể làm thay đổi nhiều calo. Hãy chỉnh kết quả khi bạn biết công thức hoặc khẩu phần thật.',
    },
  },
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
