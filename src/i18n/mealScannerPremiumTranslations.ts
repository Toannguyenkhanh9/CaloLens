// FILE: src/i18n/mealScannerPremiumTranslations.ts
// Localized copy used by the animated "AI Scanner Premium" overlay.
// Loaded directly by MealScannerScreen so the scan animation always follows
// the currently selected app language.

import i18n from './index';

type PremiumScannerCopy = {
  aiVisionBadge: string;
  liveScanTitle: string;
  liveScanSubtitle: string;
  liveBadge: string;
  scanStageDetecting: string;
  scanStageEstimating: string;
  scanStageCalculating: string;
};

const copy: Record<string, PremiumScannerCopy> = {
  en: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AI is analyzing your meal',
    liveScanSubtitle: 'Real-time food recognition',
    liveBadge: 'LIVE',
    scanStageDetecting: 'Detecting foods',
    scanStageEstimating: 'Estimating portions',
    scanStageCalculating: 'Calories & nutrition',
  },
  vi: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AI đang phân tích món ăn',
    liveScanSubtitle: 'Nhận diện món ăn theo thời gian thực',
    liveBadge: 'TRỰC TIẾP',
    scanStageDetecting: 'Nhận diện món ăn',
    scanStageEstimating: 'Ước tính khẩu phần',
    scanStageCalculating: 'Calo & dinh dưỡng',
  },
  es: {
    aiVisionBadge: 'VISIÓN IA CALOLENS',
    liveScanTitle: 'La IA está analizando tu comida',
    liveScanSubtitle: 'Reconocimiento de alimentos en tiempo real',
    liveBadge: 'EN VIVO',
    scanStageDetecting: 'Detectando alimentos',
    scanStageEstimating: 'Estimando porciones',
    scanStageCalculating: 'Calorías y nutrición',
  },
  fr: {
    aiVisionBadge: 'VISION IA CALOLENS',
    liveScanTitle: 'L’IA analyse votre repas',
    liveScanSubtitle: 'Reconnaissance des aliments en temps réel',
    liveBadge: 'EN DIRECT',
    scanStageDetecting: 'Détection des aliments',
    scanStageEstimating: 'Estimation des portions',
    scanStageCalculating: 'Calories et nutrition',
  },
  de: {
    aiVisionBadge: 'CALOLENS KI-VISION',
    liveScanTitle: 'KI analysiert deine Mahlzeit',
    liveScanSubtitle: 'Lebensmittelerkennung in Echtzeit',
    liveBadge: 'LIVE',
    scanStageDetecting: 'Lebensmittel erkennen',
    scanStageEstimating: 'Portionen schätzen',
    scanStageCalculating: 'Kalorien & Nährwerte',
  },
  zh: {
    aiVisionBadge: 'CALOLENS AI 视觉',
    liveScanTitle: 'AI 正在分析你的餐食',
    liveScanSubtitle: '实时识别食物',
    liveBadge: '实时',
    scanStageDetecting: '识别食物',
    scanStageEstimating: '估算份量',
    scanStageCalculating: '热量与营养',
  },
  ja: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AIが食事を分析しています',
    liveScanSubtitle: 'リアルタイムで食品を認識中',
    liveBadge: 'ライブ',
    scanStageDetecting: '食品を認識',
    scanStageEstimating: '量を推定',
    scanStageCalculating: 'カロリー・栄養',
  },
  ko: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AI가 식사를 분석하고 있어요',
    liveScanSubtitle: '실시간 음식 인식 중',
    liveBadge: '실시간',
    scanStageDetecting: '음식 인식',
    scanStageEstimating: '양 추정',
    scanStageCalculating: '칼로리·영양',
  },
  ru: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'ИИ анализирует ваше блюдо',
    liveScanSubtitle: 'Распознавание еды в реальном времени',
    liveBadge: 'LIVE',
    scanStageDetecting: 'Распознаём продукты',
    scanStageEstimating: 'Оцениваем порции',
    scanStageCalculating: 'Калории и нутриенты',
  },
  ar: {
    aiVisionBadge: 'رؤية CALOLENS AI',
    liveScanTitle: 'الذكاء الاصطناعي يحلل وجبتك',
    liveScanSubtitle: 'تعرّف فوري على الطعام',
    liveBadge: 'مباشر',
    scanStageDetecting: 'التعرّف على الطعام',
    scanStageEstimating: 'تقدير الحصص',
    scanStageCalculating: 'السعرات والتغذية',
  },
  hi: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AI आपके भोजन का विश्लेषण कर रहा है',
    liveScanSubtitle: 'रियल-टाइम भोजन पहचान',
    liveBadge: 'लाइव',
    scanStageDetecting: 'भोजन पहचान',
    scanStageEstimating: 'मात्रा का अनुमान',
    scanStageCalculating: 'कैलोरी और पोषण',
  },
  th: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'AI กำลังวิเคราะห์มื้ออาหาร',
    liveScanSubtitle: 'ตรวจจับอาหารแบบเรียลไทม์',
    liveBadge: 'สด',
    scanStageDetecting: 'ตรวจจับอาหาร',
    scanStageEstimating: 'ประเมินปริมาณ',
    scanStageCalculating: 'แคลอรีและโภชนาการ',
  },
  id: {
    aiVisionBadge: 'VISI AI CALOLENS',
    liveScanTitle: 'AI sedang menganalisis makanan',
    liveScanSubtitle: 'Pengenalan makanan secara real-time',
    liveBadge: 'LIVE',
    scanStageDetecting: 'Mendeteksi makanan',
    scanStageEstimating: 'Memperkirakan porsi',
    scanStageCalculating: 'Kalori & nutrisi',
  },
  ms: {
    aiVisionBadge: 'VISI AI CALOLENS',
    liveScanTitle: 'AI sedang menganalisis hidangan',
    liveScanSubtitle: 'Pengecaman makanan masa nyata',
    liveBadge: 'LANGSUNG',
    scanStageDetecting: 'Mengesan makanan',
    scanStageEstimating: 'Menganggar hidangan',
    scanStageCalculating: 'Kalori & nutrisi',
  },
  fil: {
    aiVisionBadge: 'CALOLENS AI VISION',
    liveScanTitle: 'Sinusuri ng AI ang iyong pagkain',
    liveScanSubtitle: 'Real-time na pagkilala ng pagkain',
    liveBadge: 'LIVE',
    scanStageDetecting: 'Kinikilala ang pagkain',
    scanStageEstimating: 'Tinatantiya ang serving',
    scanStageCalculating: 'Calories at nutrisyon',
  },
  pt: {
    aiVisionBadge: 'VISÃO IA CALOLENS',
    liveScanTitle: 'A IA está analisando sua refeição',
    liveScanSubtitle: 'Reconhecimento de alimentos em tempo real',
    liveBadge: 'AO VIVO',
    scanStageDetecting: 'Detectando alimentos',
    scanStageEstimating: 'Estimando porções',
    scanStageCalculating: 'Calorias e nutrição',
  },
};

Object.entries(copy).forEach(([language, mealScan]) => {
  i18n.addResourceBundle(
    language,
    'translation',
    {mealScan},
    true,
    true,
  );
});

export default copy;
