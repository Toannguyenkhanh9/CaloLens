// FILE: src/i18n/caloLensOnboardingTranslations.ts
import i18n from './index';

const en = {
  caloLensOnboarding: {
    brandCaption: 'AI nutrition companion',
    chooseLanguage: 'Choose language',
    languageSubtitle:
      'The app language changes immediately and is saved for next time.',
    kicker: 'PERSONAL SETUP',
    step1Title: 'About you',
    step1Subtitle:
      'Basic details help personalize your daily nutrition target.',
    step2Title: 'Body measurements',
    step2Subtitle:
      'Height and weight are used to estimate calories and BMI.',
    step3Title: 'Choose your goal',
    step3Subtitle:
      'Your goal changes the calorie and macro guidance shown in CaloLens.',
    namePlaceholder: 'How should we call you?',
    agePlaceholder: 'e.g. 28',
    healthNote: 'Health note',
    optional: 'Optional',
    healthPlaceholder:
      'Anything that may affect your nutrition plan',
    localNote:
      'Your profile is stored locally on this device.',
    measurementTitle:
      'Used for your daily targets',
    measurementBody:
      'CaloLens uses these measurements to estimate calories, macros and BMI.',
    injuryHint:
      'This note helps keep recommendations in context.',
    injuryPlaceholder:
      'Briefly describe the injury',
    tipTitle:
      'You can change this later',
    tipBody:
      'Update your profile or calorie target at any time from Settings.',
    finish: 'Create my plan',
    readyKicker: 'YOUR PLAN IS READY',
    readyTitle: 'Welcome to CaloLens',
    readySubtitle:
      'Your calorie and nutrition guidance can now be calculated from this profile.',
    estimated: 'Estimated',
    startingGuidance:
      'Starting guidance',
    disclaimer:
      'BMI and nutrition targets are estimates for general wellness and are not medical advice.',
    startTracking: 'Start tracking',
    adviceIntro:
      'Your estimated BMI is {{bmi}} ({{label}}).',
    adviceUnder:
      'A gradual calorie surplus with enough protein may support healthy weight gain.',
    adviceNormal:
      'Focus on consistent meals, protein, fiber and hydration.',
    adviceOver:
      'A moderate calorie deficit and regular meal tracking may support fat loss.',
    adviceObese:
      'Start with realistic nutrition changes and consider professional guidance.',
    goalAdviceLose:
      'CaloLens will prioritize a controlled calorie deficit and adequate protein.',
    goalAdviceMuscle:
      'CaloLens will emphasize protein and enough calories to support muscle growth.',
    goalAdviceMaintain:
      'CaloLens will aim for stable calories and balanced macros.',
    goalAdviceRecomp:
      'CaloLens will emphasize protein and a controlled calorie target for body recomposition.',
    goalAdviceEndurance:
      'CaloLens will keep sufficient carbohydrates and hydration in your daily plan.',
    goalAdviceWellness:
      'CaloLens will focus on balanced nutrition that supports recovery and daily movement.',
    adviceInjury:
      'Nutrition guidance does not replace medical advice for an injury.',
  },
};

const vi = {
  caloLensOnboarding: {
    brandCaption: 'Trợ lý dinh dưỡng AI',
    chooseLanguage: 'Chọn ngôn ngữ',
    languageSubtitle:
      'Ngôn ngữ được đổi ngay và lưu lại cho lần mở tiếp theo.',
    kicker: 'THIẾT LẬP CÁ NHÂN',
    step1Title: 'Thông tin của bạn',
    step1Subtitle:
      'Thông tin cơ bản giúp cá nhân hóa mục tiêu dinh dưỡng hằng ngày.',
    step2Title: 'Số đo cơ thể',
    step2Subtitle:
      'Chiều cao và cân nặng được dùng để ước tính calo và BMI.',
    step3Title: 'Chọn mục tiêu',
    step3Subtitle:
      'Mục tiêu sẽ thay đổi hướng dẫn calo và macro trong CaloLens.',
    namePlaceholder: 'Bạn muốn được gọi là gì?',
    agePlaceholder: 'Ví dụ: 28',
    healthNote: 'Ghi chú sức khỏe',
    optional: 'Không bắt buộc',
    healthPlaceholder:
      'Thông tin có thể ảnh hưởng đến kế hoạch dinh dưỡng',
    localNote:
      'Hồ sơ được lưu cục bộ trên thiết bị này.',
    measurementTitle:
      'Dùng để tính mục tiêu hằng ngày',
    measurementBody:
      'CaloLens dùng số đo để ước tính calo, macro và BMI.',
    injuryHint:
      'Ghi chú này giúp đặt lời khuyên trong đúng bối cảnh.',
    injuryPlaceholder:
      'Mô tả ngắn gọn chấn thương',
    tipTitle:
      'Bạn có thể thay đổi sau',
    tipBody:
      'Cập nhật hồ sơ hoặc mục tiêu calo bất kỳ lúc nào trong Cài đặt.',
    finish: 'Tạo kế hoạch',
    readyKicker:
      'KẾ HOẠCH ĐÃ SẴN SÀNG',
    readyTitle:
      'Chào mừng đến CaloLens',
    readySubtitle:
      'CaloLens có thể tính hướng dẫn calo và dinh dưỡng từ hồ sơ này.',
    estimated: 'Ước tính',
    startingGuidance:
      'Hướng dẫn ban đầu',
    disclaimer:
      'BMI và mục tiêu dinh dưỡng chỉ là ước tính tham khảo, không phải tư vấn y tế.',
    startTracking:
      'Bắt đầu theo dõi',
    adviceIntro:
      'BMI ước tính của bạn là {{bmi}} ({{label}}).',
    adviceUnder:
      'Tăng calo từ từ và bổ sung đủ protein có thể hỗ trợ tăng cân lành mạnh.',
    adviceNormal:
      'Ưu tiên bữa ăn đều đặn, đủ protein, chất xơ và nước.',
    adviceOver:
      'Thâm hụt calo vừa phải và ghi bữa ăn đều đặn có thể hỗ trợ giảm mỡ.',
    adviceObese:
      'Bắt đầu với thay đổi dinh dưỡng thực tế và cân nhắc tư vấn chuyên môn.',
    goalAdviceLose:
      'CaloLens sẽ ưu tiên thâm hụt calo có kiểm soát và đủ protein.',
    goalAdviceMuscle:
      'CaloLens sẽ ưu tiên protein và đủ năng lượng để hỗ trợ tăng cơ.',
    goalAdviceMaintain:
      'CaloLens sẽ hướng đến calo ổn định và macro cân bằng.',
    goalAdviceRecomp:
      'CaloLens sẽ ưu tiên protein và mục tiêu calo phù hợp để tái cấu trúc cơ thể.',
    goalAdviceEndurance:
      'CaloLens sẽ duy trì đủ carbohydrate và nước trong kế hoạch hằng ngày.',
    goalAdviceWellness:
      'CaloLens sẽ tập trung vào dinh dưỡng cân bằng để hỗ trợ phục hồi và vận động.',
    adviceInjury:
      'Hướng dẫn dinh dưỡng không thay thế tư vấn y tế cho chấn thương.',
  },
};

const es = {
  caloLensOnboarding: {
    brandCaption: 'Compañero de nutrición con IA',
    chooseLanguage: 'Elegir idioma',
    languageSubtitle:
      'El idioma de la aplicación cambia de inmediato y se guarda para la próxima vez.',
    kicker: 'CONFIGURACIÓN PERSONAL',
    step1Title: 'Sobre ti',
    step1Subtitle:
      'Los datos básicos ayudan a personalizar tu objetivo nutricional diario.',
    step2Title: 'Medidas corporales',
    step2Subtitle:
      'La altura y el peso se utilizan para estimar las calorías y el IMC.',
    step3Title: 'Elige tu objetivo',
    step3Subtitle:
      'Tu objetivo modifica la orientación sobre calorías y macronutrientes en CaloLens.',
    namePlaceholder: '¿Cómo quieres que te llamemos?',
    agePlaceholder: 'p. ej., 28',
    healthNote: 'Nota de salud',
    optional: 'Opcional',
    healthPlaceholder:
      'Cualquier información que pueda afectar tu plan nutricional',
    localNote:
      'Tu perfil se guarda localmente en este dispositivo.',
    measurementTitle:
      'Se usa para tus objetivos diarios',
    measurementBody:
      'CaloLens utiliza estas medidas para estimar calorías, macronutrientes e IMC.',
    injuryHint:
      'Esta nota ayuda a mantener las recomendaciones en contexto.',
    injuryPlaceholder:
      'Describe brevemente la lesión',
    tipTitle:
      'Puedes cambiarlo más tarde',
    tipBody:
      'Actualiza tu perfil o tu objetivo calórico en cualquier momento desde Ajustes.',
    finish: 'Crear mi plan',
    readyKicker: 'TU PLAN ESTÁ LISTO',
    readyTitle: 'Bienvenido a CaloLens',
    readySubtitle:
      'Ahora podemos calcular tu orientación sobre calorías y nutrición a partir de este perfil.',
    estimated: 'Estimado',
    startingGuidance:
      'Orientación inicial',
    disclaimer:
      'El IMC y los objetivos nutricionales son estimaciones para el bienestar general y no constituyen consejo médico.',
    startTracking: 'Empezar a registrar',
    adviceIntro:
      'Tu IMC estimado es {{bmi}} ({{label}}).',
    adviceUnder:
      'Un aumento gradual de calorías con suficiente proteína puede favorecer un aumento de peso saludable.',
    adviceNormal:
      'Prioriza comidas regulares, proteínas, fibra e hidratación.',
    adviceOver:
      'Un déficit calórico moderado y un registro regular de las comidas pueden favorecer la pérdida de grasa.',
    adviceObese:
      'Empieza con cambios nutricionales realistas y considera orientación profesional.',
    goalAdviceLose:
      'CaloLens priorizará un déficit calórico controlado y suficiente proteína.',
    goalAdviceMuscle:
      'CaloLens priorizará las proteínas y suficientes calorías para favorecer el crecimiento muscular.',
    goalAdviceMaintain:
      'CaloLens buscará mantener calorías estables y macronutrientes equilibrados.',
    goalAdviceRecomp:
      'CaloLens priorizará las proteínas y un objetivo calórico controlado para la recomposición corporal.',
    goalAdviceEndurance:
      'CaloLens mantendrá suficientes carbohidratos e hidratación en tu plan diario.',
    goalAdviceWellness:
      'CaloLens se centrará en una nutrición equilibrada que favorezca la recuperación y el movimiento diario.',
    adviceInjury:
      'La orientación nutricional no sustituye el consejo médico para una lesión.',
  },
};

const fr = {
  caloLensOnboarding: {
    brandCaption: 'Assistant nutrition IA',
    chooseLanguage: 'Choisir la langue',
    languageSubtitle:
      'La langue de l’application change immédiatement et sera conservée pour la prochaine ouverture.',
    kicker: 'CONFIGURATION PERSONNELLE',
    step1Title: 'À propos de vous',
    step1Subtitle:
      'Ces informations de base permettent de personnaliser votre objectif nutritionnel quotidien.',
    step2Title: 'Mesures corporelles',
    step2Subtitle:
      'La taille et le poids servent à estimer les calories et l’IMC.',
    step3Title: 'Choisissez votre objectif',
    step3Subtitle:
      'Votre objectif modifie les recommandations en calories et macronutriments dans CaloLens.',
    namePlaceholder: 'Comment souhaitez-vous être appelé(e) ?',
    agePlaceholder: 'ex. 28',
    healthNote: 'Note de santé',
    optional: 'Facultatif',
    healthPlaceholder:
      'Toute information pouvant influencer votre programme nutritionnel',
    localNote:
      'Votre profil est enregistré localement sur cet appareil.',
    measurementTitle:
      'Utilisé pour vos objectifs quotidiens',
    measurementBody:
      'CaloLens utilise ces mesures pour estimer les calories, les macronutriments et l’IMC.',
    injuryHint:
      'Cette note permet de replacer les recommandations dans leur contexte.',
    injuryPlaceholder:
      'Décrivez brièvement la blessure',
    tipTitle:
      'Vous pourrez modifier cela plus tard',
    tipBody:
      'Mettez à jour votre profil ou votre objectif calorique à tout moment dans les Réglages.',
    finish: 'Créer mon programme',
    readyKicker: 'VOTRE PROGRAMME EST PRÊT',
    readyTitle: 'Bienvenue dans CaloLens',
    readySubtitle:
      'Vos recommandations en calories et nutrition peuvent maintenant être calculées à partir de ce profil.',
    estimated: 'Estimé',
    startingGuidance:
      'Conseils de départ',
    disclaimer:
      'L’IMC et les objectifs nutritionnels sont des estimations destinées au bien-être général et ne constituent pas un avis médical.',
    startTracking: 'Commencer le suivi',
    adviceIntro:
      'Votre IMC estimé est de {{bmi}} ({{label}}).',
    adviceUnder:
      'Une augmentation progressive des calories avec suffisamment de protéines peut favoriser une prise de poids saine.',
    adviceNormal:
      'Privilégiez des repas réguliers, les protéines, les fibres et une bonne hydratation.',
    adviceOver:
      'Un déficit calorique modéré et un suivi régulier des repas peuvent favoriser la perte de graisse.',
    adviceObese:
      'Commencez par des changements nutritionnels réalistes et envisagez un accompagnement professionnel.',
    goalAdviceLose:
      'CaloLens privilégiera un déficit calorique contrôlé et un apport suffisant en protéines.',
    goalAdviceMuscle:
      'CaloLens mettra l’accent sur les protéines et un apport calorique suffisant pour soutenir la croissance musculaire.',
    goalAdviceMaintain:
      'CaloLens visera des calories stables et des macronutriments équilibrés.',
    goalAdviceRecomp:
      'CaloLens mettra l’accent sur les protéines et un objectif calorique contrôlé pour la recomposition corporelle.',
    goalAdviceEndurance:
      'CaloLens maintiendra un apport suffisant en glucides et une bonne hydratation dans votre programme quotidien.',
    goalAdviceWellness:
      'CaloLens se concentrera sur une nutrition équilibrée favorisant la récupération et l’activité quotidienne.',
    adviceInjury:
      'Les conseils nutritionnels ne remplacent pas un avis médical en cas de blessure.',
  },
};

const de = {
  caloLensOnboarding: {
    brandCaption: 'KI-Ernährungsbegleiter',
    chooseLanguage: 'Sprache auswählen',
    languageSubtitle:
      'Die App-Sprache wird sofort geändert und für den nächsten Start gespeichert.',
    kicker: 'PERSÖNLICHE EINRICHTUNG',
    step1Title: 'Über dich',
    step1Subtitle:
      'Grundlegende Angaben helfen, dein tägliches Ernährungsziel zu personalisieren.',
    step2Title: 'Körpermaße',
    step2Subtitle:
      'Größe und Gewicht werden zur Schätzung von Kalorien und BMI verwendet.',
    step3Title: 'Ziel auswählen',
    step3Subtitle:
      'Dein Ziel beeinflusst die Kalorien- und Makronährstoffempfehlungen in CaloLens.',
    namePlaceholder: 'Wie sollen wir dich nennen?',
    agePlaceholder: 'z. B. 28',
    healthNote: 'Gesundheitshinweis',
    optional: 'Optional',
    healthPlaceholder:
      'Alles, was deinen Ernährungsplan beeinflussen könnte',
    localNote:
      'Dein Profil wird lokal auf diesem Gerät gespeichert.',
    measurementTitle:
      'Wird für deine Tagesziele verwendet',
    measurementBody:
      'CaloLens nutzt diese Werte zur Schätzung von Kalorien, Makronährstoffen und BMI.',
    injuryHint:
      'Dieser Hinweis hilft, Empfehlungen im richtigen Zusammenhang zu geben.',
    injuryPlaceholder:
      'Verletzung kurz beschreiben',
    tipTitle:
      'Du kannst dies später ändern',
    tipBody:
      'Aktualisiere dein Profil oder Kalorienziel jederzeit in den Einstellungen.',
    finish: 'Meinen Plan erstellen',
    readyKicker: 'DEIN PLAN IST BEREIT',
    readyTitle: 'Willkommen bei CaloLens',
    readySubtitle:
      'Deine Kalorien- und Ernährungsempfehlungen können jetzt anhand dieses Profils berechnet werden.',
    estimated: 'Geschätzt',
    startingGuidance:
      'Erste Empfehlungen',
    disclaimer:
      'BMI und Ernährungsziele sind Schätzwerte für das allgemeine Wohlbefinden und keine medizinische Beratung.',
    startTracking: 'Tracking starten',
    adviceIntro:
      'Dein geschätzter BMI beträgt {{bmi}} ({{label}}).',
    adviceUnder:
      'Ein schrittweiser Kalorienüberschuss mit ausreichend Protein kann eine gesunde Gewichtszunahme unterstützen.',
    adviceNormal:
      'Achte auf regelmäßige Mahlzeiten, Protein, Ballaststoffe und ausreichende Flüssigkeit.',
    adviceOver:
      'Ein moderates Kaloriendefizit und regelmäßiges Erfassen der Mahlzeiten können den Fettabbau unterstützen.',
    adviceObese:
      'Beginne mit realistischen Ernährungsänderungen und ziehe professionelle Beratung in Betracht.',
    goalAdviceLose:
      'CaloLens priorisiert ein kontrolliertes Kaloriendefizit und ausreichend Protein.',
    goalAdviceMuscle:
      'CaloLens legt den Schwerpunkt auf Protein und genügend Kalorien zur Unterstützung des Muskelaufbaus.',
    goalAdviceMaintain:
      'CaloLens strebt stabile Kalorien und ausgewogene Makronährstoffe an.',
    goalAdviceRecomp:
      'CaloLens legt den Schwerpunkt auf Protein und ein kontrolliertes Kalorienziel für die Körperrekomposition.',
    goalAdviceEndurance:
      'CaloLens sorgt für ausreichend Kohlenhydrate und Flüssigkeit in deinem Tagesplan.',
    goalAdviceWellness:
      'CaloLens konzentriert sich auf ausgewogene Ernährung, die Erholung und tägliche Bewegung unterstützt.',
    adviceInjury:
      'Ernährungsempfehlungen ersetzen bei einer Verletzung keine medizinische Beratung.',
  },
};

const zh = {
  caloLensOnboarding: {
    brandCaption: 'AI 营养助手',
    chooseLanguage: '选择语言',
    languageSubtitle:
      '应用语言会立即更改，并在下次打开时继续使用。',
    kicker: '个性化设置',
    step1Title: '关于你',
    step1Subtitle:
      '基本信息可帮助个性化你的每日营养目标。',
    step2Title: '身体数据',
    step2Subtitle:
      '身高和体重将用于估算热量和 BMI。',
    step3Title: '选择你的目标',
    step3Subtitle:
      '你的目标会影响 CaloLens 中的热量和宏量营养建议。',
    namePlaceholder: '我们该如何称呼你？',
    agePlaceholder: '例如：28',
    healthNote: '健康备注',
    optional: '可选',
    healthPlaceholder:
      '任何可能影响营养计划的信息',
    localNote:
      '你的个人资料仅保存在此设备上。',
    measurementTitle:
      '用于计算每日目标',
    measurementBody:
      'CaloLens 使用这些数据估算热量、宏量营养和 BMI。',
    injuryHint:
      '此备注可帮助我们在正确背景下提供建议。',
    injuryPlaceholder:
      '简要描述伤情',
    tipTitle:
      '稍后可以修改',
    tipBody:
      '你可以随时在“设置”中更新个人资料或热量目标。',
    finish: '创建我的计划',
    readyKicker: '你的计划已准备就绪',
    readyTitle: '欢迎使用 CaloLens',
    readySubtitle:
      '现在可以根据此资料计算你的热量和营养建议。',
    estimated: '估算',
    startingGuidance:
      '初始建议',
    disclaimer:
      'BMI 和营养目标仅为一般健康参考估算，不构成医疗建议。',
    startTracking: '开始记录',
    adviceIntro:
      '你的估算 BMI 为 {{bmi}}（{{label}}）。',
    adviceUnder:
      '逐步增加热量并摄入足够蛋白质，可能有助于健康增重。',
    adviceNormal:
      '保持规律饮食，并注意蛋白质、膳食纤维和水分。',
    adviceOver:
      '适度热量缺口并定期记录饮食，可能有助于减脂。',
    adviceObese:
      '从现实可行的饮食调整开始，并考虑寻求专业指导。',
    goalAdviceLose:
      'CaloLens 将优先提供可控热量缺口和充足蛋白质建议。',
    goalAdviceMuscle:
      'CaloLens 将强调蛋白质和足够热量，以支持肌肉增长。',
    goalAdviceMaintain:
      'CaloLens 将以稳定热量和均衡宏量营养为目标。',
    goalAdviceRecomp:
      'CaloLens 将强调蛋白质和可控热量目标，以支持身体重组。',
    goalAdviceEndurance:
      'CaloLens 将在每日计划中保留充足碳水化合物和水分。',
    goalAdviceWellness:
      'CaloLens 将专注于支持恢复和日常活动的均衡营养。',
    adviceInjury:
      '营养建议不能替代针对伤病的医疗建议。',
  },
};

const ja = {
  caloLensOnboarding: {
    brandCaption: 'AI栄養アシスタント',
    chooseLanguage: '言語を選択',
    languageSubtitle:
      'アプリの言語はすぐに変更され、次回以降も保存されます。',
    kicker: 'パーソナル設定',
    step1Title: 'あなたについて',
    step1Subtitle:
      '基本情報をもとに、毎日の栄養目標を個別に調整します。',
    step2Title: '身体測定',
    step2Subtitle:
      '身長と体重は、カロリーとBMIの推定に使用されます。',
    step3Title: '目標を選択',
    step3Subtitle:
      '選択した目標に応じて、CaloLensのカロリーとマクロ栄養素の案内が変わります。',
    namePlaceholder: 'お名前または呼び名を入力してください',
    agePlaceholder: '例：28',
    healthNote: '健康メモ',
    optional: '任意',
    healthPlaceholder:
      '栄養プランに影響する可能性のある情報',
    localNote:
      'プロフィールはこの端末内に保存されます。',
    measurementTitle:
      '毎日の目標計算に使用',
    measurementBody:
      'CaloLensはこれらの数値から、カロリー・マクロ栄養素・BMIを推定します。',
    injuryHint:
      'このメモは、状況に合った提案を行うために使用されます。',
    injuryPlaceholder:
      'けがの内容を簡単に入力してください',
    tipTitle:
      '後から変更できます',
    tipBody:
      'プロフィールやカロリー目標は、設定からいつでも変更できます。',
    finish: 'プランを作成',
    readyKicker: 'プランの準備ができました',
    readyTitle: 'CaloLensへようこそ',
    readySubtitle:
      'このプロフィールをもとに、カロリーと栄養の案内を計算できます。',
    estimated: '推定',
    startingGuidance:
      '最初のガイダンス',
    disclaimer:
      'BMIと栄養目標は一般的な健康管理のための推定値であり、医療上の助言ではありません。',
    startTracking: '記録を開始',
    adviceIntro:
      '推定BMIは{{bmi}}（{{label}}）です。',
    adviceUnder:
      '十分なタンパク質と段階的なカロリー増加は、健康的な体重増加に役立つ可能性があります。',
    adviceNormal:
      '規則的な食事、タンパク質、食物繊維、水分補給を意識しましょう。',
    adviceOver:
      '適度なカロリー不足と継続的な食事記録は、脂肪減少を支える可能性があります。',
    adviceObese:
      '無理のない食生活の改善から始め、必要に応じて専門家への相談を検討してください。',
    goalAdviceLose:
      'CaloLensは、管理されたカロリー不足と十分なタンパク質を重視します。',
    goalAdviceMuscle:
      'CaloLensは、筋肉の成長を支えるためにタンパク質と十分なカロリーを重視します。',
    goalAdviceMaintain:
      'CaloLensは、安定したカロリーとバランスの取れたマクロ栄養素を目指します。',
    goalAdviceRecomp:
      'CaloLensは、ボディリコンポジションのためにタンパク質と管理されたカロリー目標を重視します。',
    goalAdviceEndurance:
      'CaloLensは、毎日のプランで十分な炭水化物と水分補給を確保します。',
    goalAdviceWellness:
      'CaloLensは、回復と日々の活動を支えるバランスの良い栄養を重視します。',
    adviceInjury:
      '栄養に関する案内は、けがに対する医療上の助言の代わりにはなりません。',
  },
};

const ko = {
  caloLensOnboarding: {
    brandCaption: 'AI 영양 도우미',
    chooseLanguage: '언어 선택',
    languageSubtitle:
      '앱 언어가 즉시 변경되며 다음 실행 시에도 유지됩니다.',
    kicker: '개인 설정',
    step1Title: '기본 정보',
    step1Subtitle:
      '기본 정보를 바탕으로 일일 영양 목표를 맞춤 설정합니다.',
    step2Title: '신체 측정',
    step2Subtitle:
      '키와 체중은 칼로리와 BMI 추정에 사용됩니다.',
    step3Title: '목표 선택',
    step3Subtitle:
      '선택한 목표에 따라 CaloLens의 칼로리 및 영양소 안내가 달라집니다.',
    namePlaceholder: '어떻게 불러드릴까요?',
    agePlaceholder: '예: 28',
    healthNote: '건강 메모',
    optional: '선택 사항',
    healthPlaceholder:
      '영양 계획에 영향을 줄 수 있는 정보',
    localNote:
      '프로필은 이 기기에만 저장됩니다.',
    measurementTitle:
      '일일 목표 계산에 사용',
    measurementBody:
      'CaloLens는 이 정보를 사용해 칼로리, 영양소 및 BMI를 추정합니다.',
    injuryHint:
      '이 메모는 상황에 맞는 권장 사항을 제공하는 데 도움이 됩니다.',
    injuryPlaceholder:
      '부상 내용을 간단히 입력하세요',
    tipTitle:
      '나중에 변경할 수 있어요',
    tipBody:
      '설정에서 언제든지 프로필이나 칼로리 목표를 수정할 수 있습니다.',
    finish: '내 계획 만들기',
    readyKicker: '계획이 준비되었습니다',
    readyTitle: 'CaloLens에 오신 것을 환영합니다',
    readySubtitle:
      '이 프로필을 바탕으로 칼로리와 영양 안내를 계산할 수 있습니다.',
    estimated: '추정값',
    startingGuidance:
      '시작 가이드',
    disclaimer:
      'BMI와 영양 목표는 일반적인 건강 관리를 위한 추정치이며 의학적 조언이 아닙니다.',
    startTracking: '기록 시작',
    adviceIntro:
      '예상 BMI는 {{bmi}} ({{label}})입니다.',
    adviceUnder:
      '충분한 단백질과 점진적인 칼로리 증가는 건강한 체중 증가에 도움이 될 수 있습니다.',
    adviceNormal:
      '규칙적인 식사, 단백질, 식이섬유와 수분 섭취에 집중하세요.',
    adviceOver:
      '적당한 칼로리 적자와 꾸준한 식사 기록은 체지방 감소에 도움이 될 수 있습니다.',
    adviceObese:
      '현실적인 식습관 변화부터 시작하고 전문가의 도움을 고려하세요.',
    goalAdviceLose:
      'CaloLens는 조절된 칼로리 적자와 충분한 단백질을 우선합니다.',
    goalAdviceMuscle:
      'CaloLens는 근육 성장을 돕기 위해 단백질과 충분한 칼로리를 강조합니다.',
    goalAdviceMaintain:
      'CaloLens는 안정적인 칼로리와 균형 잡힌 영양소 비율을 목표로 합니다.',
    goalAdviceRecomp:
      'CaloLens는 체성분 개선을 위해 단백질과 조절된 칼로리 목표를 강조합니다.',
    goalAdviceEndurance:
      'CaloLens는 일일 계획에 충분한 탄수화물과 수분을 포함합니다.',
    goalAdviceWellness:
      'CaloLens는 회복과 일상 활동을 지원하는 균형 잡힌 영양에 집중합니다.',
    adviceInjury:
      '영양 안내는 부상에 대한 의학적 조언을 대체하지 않습니다.',
  },
};

const ru = {
  caloLensOnboarding: {
    brandCaption: 'ИИ-помощник по питанию',
    chooseLanguage: 'Выберите язык',
    languageSubtitle:
      'Язык приложения изменится сразу и будет сохранён для следующего запуска.',
    kicker: 'ЛИЧНАЯ НАСТРОЙКА',
    step1Title: 'О вас',
    step1Subtitle:
      'Основные данные помогают персонализировать ежедневную цель по питанию.',
    step2Title: 'Параметры тела',
    step2Subtitle:
      'Рост и вес используются для оценки калорийности и ИМТ.',
    step3Title: 'Выберите цель',
    step3Subtitle:
      'Ваша цель влияет на рекомендации по калориям и макронутриентам в CaloLens.',
    namePlaceholder: 'Как к вам обращаться?',
    agePlaceholder: 'например, 28',
    healthNote: 'Примечание о здоровье',
    optional: 'Необязательно',
    healthPlaceholder:
      'Информация, которая может повлиять на ваш план питания',
    localNote:
      'Ваш профиль хранится локально на этом устройстве.',
    measurementTitle:
      'Используется для ежедневных целей',
    measurementBody:
      'CaloLens использует эти данные для оценки калорий, макронутриентов и ИМТ.',
    injuryHint:
      'Это примечание помогает учитывать контекст при рекомендациях.',
    injuryPlaceholder:
      'Кратко опишите травму',
    tipTitle:
      'Это можно изменить позже',
    tipBody:
      'Профиль и цель по калориям можно изменить в любое время в Настройках.',
    finish: 'Создать мой план',
    readyKicker: 'ВАШ ПЛАН ГОТОВ',
    readyTitle: 'Добро пожаловать в CaloLens',
    readySubtitle:
      'Теперь рекомендации по калориям и питанию можно рассчитать на основе этого профиля.',
    estimated: 'Оценка',
    startingGuidance:
      'Начальные рекомендации',
    disclaimer:
      'ИМТ и цели по питанию являются приблизительными значениями для общего самочувствия и не заменяют медицинскую консультацию.',
    startTracking: 'Начать отслеживание',
    adviceIntro:
      'Ваш предполагаемый ИМТ: {{bmi}} ({{label}}).',
    adviceUnder:
      'Постепенное увеличение калорийности и достаточное количество белка могут помочь здоровому набору веса.',
    adviceNormal:
      'Сосредоточьтесь на регулярном питании, белке, клетчатке и достаточном количестве воды.',
    adviceOver:
      'Умеренный дефицит калорий и регулярный учёт питания могут помочь снижению жировой массы.',
    adviceObese:
      'Начните с реалистичных изменений в питании и рассмотрите возможность консультации специалиста.',
    goalAdviceLose:
      'CaloLens будет отдавать приоритет контролируемому дефициту калорий и достаточному количеству белка.',
    goalAdviceMuscle:
      'CaloLens сосредоточится на белке и достаточном количестве калорий для роста мышц.',
    goalAdviceMaintain:
      'CaloLens будет стремиться к стабильной калорийности и сбалансированным макронутриентам.',
    goalAdviceRecomp:
      'CaloLens будет уделять внимание белку и контролируемой калорийности для изменения состава тела.',
    goalAdviceEndurance:
      'CaloLens обеспечит достаточное количество углеводов и воды в вашем ежедневном плане.',
    goalAdviceWellness:
      'CaloLens сосредоточится на сбалансированном питании для восстановления и ежедневной активности.',
    adviceInjury:
      'Рекомендации по питанию не заменяют медицинскую консультацию при травме.',
  },
};

const ar = {
  caloLensOnboarding: {
    brandCaption: 'مساعد تغذية بالذكاء الاصطناعي',
    chooseLanguage: 'اختر اللغة',
    languageSubtitle:
      'ستتغير لغة التطبيق فورًا وسيتم حفظها للاستخدام في المرة القادمة.',
    kicker: 'الإعداد الشخصي',
    step1Title: 'معلوماتك',
    step1Subtitle:
      'تساعد المعلومات الأساسية في تخصيص هدفك الغذائي اليومي.',
    step2Title: 'قياسات الجسم',
    step2Subtitle:
      'يتم استخدام الطول والوزن لتقدير السعرات الحرارية ومؤشر كتلة الجسم.',
    step3Title: 'اختر هدفك',
    step3Subtitle:
      'يؤثر هدفك في إرشادات السعرات والمغذيات الكبرى داخل CaloLens.',
    namePlaceholder: 'بماذا نود أن نناديك؟',
    agePlaceholder: 'مثال: 28',
    healthNote: 'ملاحظة صحية',
    optional: 'اختياري',
    healthPlaceholder:
      'أي معلومات قد تؤثر في خطتك الغذائية',
    localNote:
      'يتم حفظ ملفك محليًا على هذا الجهاز.',
    measurementTitle:
      'تُستخدم لأهدافك اليومية',
    measurementBody:
      'يستخدم CaloLens هذه القياسات لتقدير السعرات والمغذيات الكبرى ومؤشر كتلة الجسم.',
    injuryHint:
      'تساعد هذه الملاحظة في وضع التوصيات ضمن السياق المناسب.',
    injuryPlaceholder:
      'صف الإصابة باختصار',
    tipTitle:
      'يمكنك تغيير ذلك لاحقًا',
    tipBody:
      'يمكنك تحديث ملفك أو هدف السعرات في أي وقت من الإعدادات.',
    finish: 'إنشاء خطتي',
    readyKicker: 'خطتك جاهزة',
    readyTitle: 'مرحبًا بك في CaloLens',
    readySubtitle:
      'يمكن الآن حساب إرشادات السعرات والتغذية استنادًا إلى هذا الملف.',
    estimated: 'تقديري',
    startingGuidance:
      'إرشادات البداية',
    disclaimer:
      'مؤشر كتلة الجسم والأهداف الغذائية تقديرات للعافية العامة وليست نصيحة طبية.',
    startTracking: 'بدء التتبع',
    adviceIntro:
      'مؤشر كتلة الجسم التقديري لديك هو {{bmi}} ({{label}}).',
    adviceUnder:
      'قد تساعد زيادة السعرات تدريجيًا مع تناول بروتين كافٍ على زيادة الوزن بشكل صحي.',
    adviceNormal:
      'ركز على وجبات منتظمة وبروتين وألياف وشرب كمية كافية من الماء.',
    adviceOver:
      'قد يساعد عجز معتدل في السعرات وتسجيل الوجبات بانتظام على خفض الدهون.',
    adviceObese:
      'ابدأ بتغييرات غذائية واقعية وفكّر في الاستعانة بإرشاد متخصص.',
    goalAdviceLose:
      'سيعطي CaloLens الأولوية لعجز سعرات مضبوط وكمية كافية من البروتين.',
    goalAdviceMuscle:
      'سيركز CaloLens على البروتين والسعرات الكافية لدعم نمو العضلات.',
    goalAdviceMaintain:
      'سيهدف CaloLens إلى سعرات مستقرة ومغذيات كبرى متوازنة.',
    goalAdviceRecomp:
      'سيركز CaloLens على البروتين وهدف سعرات مضبوط لإعادة تشكيل الجسم.',
    goalAdviceEndurance:
      'سيحافظ CaloLens على كمية كافية من الكربوهيدرات والسوائل في خطتك اليومية.',
    goalAdviceWellness:
      'سيركز CaloLens على تغذية متوازنة تدعم التعافي والحركة اليومية.',
    adviceInjury:
      'لا تغني إرشادات التغذية عن الاستشارة الطبية عند وجود إصابة.',
  },
};

const hi = {
  caloLensOnboarding: {
    brandCaption: 'AI पोषण साथी',
    chooseLanguage: 'भाषा चुनें',
    languageSubtitle:
      'ऐप की भाषा तुरंत बदल जाएगी और अगली बार के लिए सहेजी जाएगी।',
    kicker: 'व्यक्तिगत सेटअप',
    step1Title: 'आपके बारे में',
    step1Subtitle:
      'मूल जानकारी आपके दैनिक पोषण लक्ष्य को व्यक्तिगत बनाने में मदद करती है।',
    step2Title: 'शारीरिक माप',
    step2Subtitle:
      'ऊँचाई और वजन का उपयोग कैलोरी और BMI का अनुमान लगाने के लिए किया जाता है।',
    step3Title: 'अपना लक्ष्य चुनें',
    step3Subtitle:
      'आपका लक्ष्य CaloLens में कैलोरी और मैक्रो मार्गदर्शन को बदलता है।',
    namePlaceholder: 'हम आपको किस नाम से बुलाएँ?',
    agePlaceholder: 'जैसे: 28',
    healthNote: 'स्वास्थ्य नोट',
    optional: 'वैकल्पिक',
    healthPlaceholder:
      'कोई भी जानकारी जो आपकी पोषण योजना को प्रभावित कर सकती है',
    localNote:
      'आपकी प्रोफ़ाइल इस डिवाइस पर स्थानीय रूप से सहेजी जाती है।',
    measurementTitle:
      'दैनिक लक्ष्यों के लिए उपयोग किया जाता है',
    measurementBody:
      'CaloLens इन मापों से कैलोरी, मैक्रो और BMI का अनुमान लगाता है।',
    injuryHint:
      'यह नोट सुझावों को सही संदर्भ में रखने में मदद करता है।',
    injuryPlaceholder:
      'चोट का संक्षिप्त विवरण दें',
    tipTitle:
      'आप इसे बाद में बदल सकते हैं',
    tipBody:
      'सेटिंग्स से किसी भी समय अपनी प्रोफ़ाइल या कैलोरी लक्ष्य अपडेट करें।',
    finish: 'मेरी योजना बनाएँ',
    readyKicker: 'आपकी योजना तैयार है',
    readyTitle: 'CaloLens में आपका स्वागत है',
    readySubtitle:
      'अब इस प्रोफ़ाइल के आधार पर आपकी कैलोरी और पोषण मार्गदर्शिका तैयार की जा सकती है।',
    estimated: 'अनुमानित',
    startingGuidance:
      'प्रारंभिक मार्गदर्शन',
    disclaimer:
      'BMI और पोषण लक्ष्य सामान्य स्वास्थ्य के लिए अनुमान हैं और चिकित्सा सलाह नहीं हैं।',
    startTracking: 'ट्रैकिंग शुरू करें',
    adviceIntro:
      'आपका अनुमानित BMI {{bmi}} ({{label}}) है।',
    adviceUnder:
      'पर्याप्त प्रोटीन के साथ धीरे-धीरे कैलोरी बढ़ाना स्वस्थ वजन बढ़ाने में मदद कर सकता है।',
    adviceNormal:
      'नियमित भोजन, प्रोटीन, फाइबर और पर्याप्त पानी पर ध्यान दें।',
    adviceOver:
      'मध्यम कैलोरी कमी और नियमित भोजन रिकॉर्डिंग वसा घटाने में मदद कर सकती है।',
    adviceObese:
      'व्यावहारिक पोषण बदलावों से शुरुआत करें और विशेषज्ञ मार्गदर्शन पर विचार करें।',
    goalAdviceLose:
      'CaloLens नियंत्रित कैलोरी कमी और पर्याप्त प्रोटीन को प्राथमिकता देगा।',
    goalAdviceMuscle:
      'CaloLens मांसपेशियों की वृद्धि के लिए प्रोटीन और पर्याप्त कैलोरी पर जोर देगा।',
    goalAdviceMaintain:
      'CaloLens स्थिर कैलोरी और संतुलित मैक्रो का लक्ष्य रखेगा।',
    goalAdviceRecomp:
      'CaloLens शरीर संरचना सुधार के लिए प्रोटीन और नियंत्रित कैलोरी लक्ष्य पर जोर देगा।',
    goalAdviceEndurance:
      'CaloLens आपकी दैनिक योजना में पर्याप्त कार्बोहाइड्रेट और पानी बनाए रखेगा।',
    goalAdviceWellness:
      'CaloLens रिकवरी और दैनिक गतिविधि को सहारा देने वाले संतुलित पोषण पर ध्यान देगा।',
    adviceInjury:
      'पोषण मार्गदर्शन चोट के लिए चिकित्सा सलाह का स्थान नहीं लेता।',
  },
};

const th = {
  caloLensOnboarding: {
    brandCaption: 'ผู้ช่วยโภชนาการ AI',
    chooseLanguage: 'เลือกภาษา',
    languageSubtitle:
      'ภาษาของแอปจะเปลี่ยนทันทีและบันทึกไว้สำหรับครั้งถัดไป',
    kicker: 'ตั้งค่าส่วนบุคคล',
    step1Title: 'เกี่ยวกับคุณ',
    step1Subtitle:
      'ข้อมูลพื้นฐานช่วยปรับเป้าหมายโภชนาการรายวันให้เหมาะกับคุณ',
    step2Title: 'ข้อมูลร่างกาย',
    step2Subtitle:
      'ส่วนสูงและน้ำหนักใช้สำหรับประเมินแคลอรีและ BMI',
    step3Title: 'เลือกเป้าหมาย',
    step3Subtitle:
      'เป้าหมายของคุณจะเปลี่ยนคำแนะนำด้านแคลอรีและสารอาหารหลักใน CaloLens',
    namePlaceholder: 'ต้องการให้เราเรียกคุณว่าอะไร?',
    agePlaceholder: 'เช่น 28',
    healthNote: 'บันทึกสุขภาพ',
    optional: 'ไม่บังคับ',
    healthPlaceholder:
      'ข้อมูลที่อาจมีผลต่อแผนโภชนาการของคุณ',
    localNote:
      'โปรไฟล์ของคุณถูกบันทึกไว้ในอุปกรณ์นี้เท่านั้น',
    measurementTitle:
      'ใช้สำหรับคำนวณเป้าหมายรายวัน',
    measurementBody:
      'CaloLens ใช้ข้อมูลเหล่านี้เพื่อประเมินแคลอรี สารอาหารหลัก และ BMI',
    injuryHint:
      'บันทึกนี้ช่วยให้คำแนะนำสอดคล้องกับบริบทของคุณ',
    injuryPlaceholder:
      'อธิบายอาการบาดเจ็บแบบสั้น ๆ',
    tipTitle:
      'คุณสามารถเปลี่ยนภายหลังได้',
    tipBody:
      'อัปเดตโปรไฟล์หรือเป้าหมายแคลอรีได้ทุกเมื่อจากการตั้งค่า',
    finish: 'สร้างแผนของฉัน',
    readyKicker: 'แผนของคุณพร้อมแล้ว',
    readyTitle: 'ยินดีต้อนรับสู่ CaloLens',
    readySubtitle:
      'ตอนนี้สามารถคำนวณคำแนะนำด้านแคลอรีและโภชนาการจากโปรไฟล์นี้ได้แล้ว',
    estimated: 'ค่าประมาณ',
    startingGuidance:
      'คำแนะนำเริ่มต้น',
    disclaimer:
      'BMI และเป้าหมายโภชนาการเป็นเพียงค่าประมาณเพื่อสุขภาพทั่วไป ไม่ใช่คำแนะนำทางการแพทย์',
    startTracking: 'เริ่มติดตาม',
    adviceIntro:
      'BMI โดยประมาณของคุณคือ {{bmi}} ({{label}})',
    adviceUnder:
      'การเพิ่มแคลอรีอย่างค่อยเป็นค่อยไปพร้อมโปรตีนที่เพียงพออาจช่วยให้น้ำหนักเพิ่มอย่างเหมาะสม',
    adviceNormal:
      'เน้นมื้ออาหารสม่ำเสมอ โปรตีน ใยอาหาร และการดื่มน้ำให้เพียงพอ',
    adviceOver:
      'การลดแคลอรีในระดับพอเหมาะและบันทึกอาหารสม่ำเสมออาจช่วยลดไขมัน',
    adviceObese:
      'เริ่มจากการปรับโภชนาการที่ทำได้จริงและพิจารณาคำแนะนำจากผู้เชี่ยวชาญ',
    goalAdviceLose:
      'CaloLens จะให้ความสำคัญกับการลดแคลอรีแบบควบคุมและโปรตีนที่เพียงพอ',
    goalAdviceMuscle:
      'CaloLens จะเน้นโปรตีนและแคลอรีที่เพียงพอเพื่อสนับสนุนการเพิ่มกล้ามเนื้อ',
    goalAdviceMaintain:
      'CaloLens จะมุ่งรักษาแคลอรีให้คงที่และสารอาหารหลักให้สมดุล',
    goalAdviceRecomp:
      'CaloLens จะเน้นโปรตีนและเป้าหมายแคลอรีแบบควบคุมเพื่อปรับสัดส่วนร่างกาย',
    goalAdviceEndurance:
      'CaloLens จะคงคาร์โบไฮเดรตและน้ำให้เพียงพอในแผนรายวัน',
    goalAdviceWellness:
      'CaloLens จะเน้นโภชนาการที่สมดุลเพื่อสนับสนุนการฟื้นตัวและการเคลื่อนไหวประจำวัน',
    adviceInjury:
      'คำแนะนำด้านโภชนาการไม่สามารถแทนคำแนะนำทางการแพทย์สำหรับอาการบาดเจ็บได้',
  },
};

const id = {
  caloLensOnboarding: {
    brandCaption: 'Pendamping nutrisi AI',
    chooseLanguage: 'Pilih bahasa',
    languageSubtitle:
      'Bahasa aplikasi akan langsung berubah dan disimpan untuk penggunaan berikutnya.',
    kicker: 'PENGATURAN PRIBADI',
    step1Title: 'Tentang Anda',
    step1Subtitle:
      'Informasi dasar membantu menyesuaikan target nutrisi harian Anda.',
    step2Title: 'Ukuran tubuh',
    step2Subtitle:
      'Tinggi dan berat badan digunakan untuk memperkirakan kalori dan BMI.',
    step3Title: 'Pilih tujuan Anda',
    step3Subtitle:
      'Tujuan Anda akan mengubah panduan kalori dan makro di CaloLens.',
    namePlaceholder: 'Kami harus memanggil Anda apa?',
    agePlaceholder: 'mis. 28',
    healthNote: 'Catatan kesehatan',
    optional: 'Opsional',
    healthPlaceholder:
      'Informasi yang mungkin memengaruhi rencana nutrisi Anda',
    localNote:
      'Profil Anda disimpan secara lokal di perangkat ini.',
    measurementTitle:
      'Digunakan untuk target harian Anda',
    measurementBody:
      'CaloLens menggunakan ukuran ini untuk memperkirakan kalori, makro, dan BMI.',
    injuryHint:
      'Catatan ini membantu menjaga rekomendasi tetap sesuai konteks.',
    injuryPlaceholder:
      'Jelaskan cedera secara singkat',
    tipTitle:
      'Anda dapat mengubahnya nanti',
    tipBody:
      'Perbarui profil atau target kalori kapan saja melalui Pengaturan.',
    finish: 'Buat rencana saya',
    readyKicker: 'RENCANA ANDA SIAP',
    readyTitle: 'Selamat datang di CaloLens',
    readySubtitle:
      'Panduan kalori dan nutrisi kini dapat dihitung dari profil ini.',
    estimated: 'Perkiraan',
    startingGuidance:
      'Panduan awal',
    disclaimer:
      'BMI dan target nutrisi merupakan perkiraan untuk kesehatan umum dan bukan saran medis.',
    startTracking: 'Mulai melacak',
    adviceIntro:
      'Perkiraan BMI Anda adalah {{bmi}} ({{label}}).',
    adviceUnder:
      'Surplus kalori secara bertahap dengan protein yang cukup dapat membantu kenaikan berat badan yang sehat.',
    adviceNormal:
      'Fokus pada pola makan teratur, protein, serat, dan hidrasi.',
    adviceOver:
      'Defisit kalori moderat dan pencatatan makanan rutin dapat membantu menurunkan lemak.',
    adviceObese:
      'Mulailah dengan perubahan nutrisi yang realistis dan pertimbangkan bimbingan profesional.',
    goalAdviceLose:
      'CaloLens akan memprioritaskan defisit kalori terkontrol dan protein yang cukup.',
    goalAdviceMuscle:
      'CaloLens akan menekankan protein dan kalori yang cukup untuk mendukung pertumbuhan otot.',
    goalAdviceMaintain:
      'CaloLens akan menargetkan kalori stabil dan makro yang seimbang.',
    goalAdviceRecomp:
      'CaloLens akan menekankan protein dan target kalori terkontrol untuk rekomposisi tubuh.',
    goalAdviceEndurance:
      'CaloLens akan menjaga asupan karbohidrat dan hidrasi yang cukup dalam rencana harian Anda.',
    goalAdviceWellness:
      'CaloLens akan berfokus pada nutrisi seimbang yang mendukung pemulihan dan aktivitas harian.',
    adviceInjury:
      'Panduan nutrisi tidak menggantikan saran medis untuk cedera.',
  },
};

const ms = {
  caloLensOnboarding: {
    brandCaption: 'Pembantu pemakanan AI',
    chooseLanguage: 'Pilih bahasa',
    languageSubtitle:
      'Bahasa aplikasi akan berubah serta-merta dan disimpan untuk penggunaan seterusnya.',
    kicker: 'TETAPAN PERIBADI',
    step1Title: 'Tentang anda',
    step1Subtitle:
      'Maklumat asas membantu memperibadikan sasaran pemakanan harian anda.',
    step2Title: 'Ukuran badan',
    step2Subtitle:
      'Ketinggian dan berat digunakan untuk menganggarkan kalori dan BMI.',
    step3Title: 'Pilih matlamat anda',
    step3Subtitle:
      'Matlamat anda akan mengubah panduan kalori dan makro dalam CaloLens.',
    namePlaceholder: 'Apakah nama panggilan anda?',
    agePlaceholder: 'cth. 28',
    healthNote: 'Catatan kesihatan',
    optional: 'Pilihan',
    healthPlaceholder:
      'Maklumat yang mungkin mempengaruhi pelan pemakanan anda',
    localNote:
      'Profil anda disimpan secara setempat pada peranti ini.',
    measurementTitle:
      'Digunakan untuk sasaran harian anda',
    measurementBody:
      'CaloLens menggunakan ukuran ini untuk menganggarkan kalori, makro dan BMI.',
    injuryHint:
      'Catatan ini membantu memastikan cadangan diberikan dalam konteks yang sesuai.',
    injuryPlaceholder:
      'Terangkan kecederaan secara ringkas',
    tipTitle:
      'Anda boleh mengubahnya kemudian',
    tipBody:
      'Kemas kini profil atau sasaran kalori pada bila-bila masa melalui Tetapan.',
    finish: 'Cipta pelan saya',
    readyKicker: 'PELAN ANDA SUDAH SEDIA',
    readyTitle: 'Selamat datang ke CaloLens',
    readySubtitle:
      'Panduan kalori dan pemakanan kini boleh dikira daripada profil ini.',
    estimated: 'Anggaran',
    startingGuidance:
      'Panduan permulaan',
    disclaimer:
      'BMI dan sasaran pemakanan ialah anggaran untuk kesejahteraan umum dan bukan nasihat perubatan.',
    startTracking: 'Mula menjejak',
    adviceIntro:
      'Anggaran BMI anda ialah {{bmi}} ({{label}}).',
    adviceUnder:
      'Lebihan kalori secara beransur-ansur dengan protein yang mencukupi boleh menyokong peningkatan berat badan yang sihat.',
    adviceNormal:
      'Fokus pada waktu makan yang konsisten, protein, serat dan hidrasi.',
    adviceOver:
      'Defisit kalori sederhana dan catatan makanan secara tetap boleh membantu mengurangkan lemak.',
    adviceObese:
      'Mulakan dengan perubahan pemakanan yang realistik dan pertimbangkan bimbingan profesional.',
    goalAdviceLose:
      'CaloLens akan mengutamakan defisit kalori terkawal dan protein yang mencukupi.',
    goalAdviceMuscle:
      'CaloLens akan menekankan protein dan kalori yang mencukupi untuk menyokong pertumbuhan otot.',
    goalAdviceMaintain:
      'CaloLens akan menyasarkan kalori yang stabil dan makro yang seimbang.',
    goalAdviceRecomp:
      'CaloLens akan menekankan protein dan sasaran kalori terkawal untuk komposisi semula badan.',
    goalAdviceEndurance:
      'CaloLens akan mengekalkan karbohidrat dan hidrasi yang mencukupi dalam pelan harian anda.',
    goalAdviceWellness:
      'CaloLens akan memberi tumpuan kepada pemakanan seimbang yang menyokong pemulihan dan pergerakan harian.',
    adviceInjury:
      'Panduan pemakanan tidak menggantikan nasihat perubatan untuk kecederaan.',
  },
};

const fil = {
  caloLensOnboarding: {
    brandCaption: 'AI nutrition companion',
    chooseLanguage: 'Piliin ang wika',
    languageSubtitle:
      'Agad magbabago ang wika ng app at mase-save ito para sa susunod na paggamit.',
    kicker: 'PERSONAL NA SETUP',
    step1Title: 'Tungkol sa iyo',
    step1Subtitle:
      'Nakakatulong ang pangunahing impormasyon para ma-personalize ang araw-araw mong nutrition target.',
    step2Title: 'Mga sukat ng katawan',
    step2Subtitle:
      'Ginagamit ang taas at timbang para tantiyahin ang calories at BMI.',
    step3Title: 'Piliin ang iyong goal',
    step3Subtitle:
      'Binabago ng iyong goal ang calorie at macro guidance na ipinapakita sa CaloLens.',
    namePlaceholder: 'Ano ang gusto mong itawag namin sa iyo?',
    agePlaceholder: 'hal. 28',
    healthNote: 'Health note',
    optional: 'Opsyonal',
    healthPlaceholder:
      'Anumang impormasyon na maaaring makaapekto sa iyong nutrition plan',
    localNote:
      'Lokal na naka-save sa device na ito ang iyong profile.',
    measurementTitle:
      'Ginagamit para sa araw-araw mong target',
    measurementBody:
      'Ginagamit ng CaloLens ang mga sukat na ito para tantiyahin ang calories, macros at BMI.',
    injuryHint:
      'Tinutulungan ng note na ito na ilagay sa tamang konteksto ang mga rekomendasyon.',
    injuryPlaceholder:
      'Ilarawan nang maikli ang injury',
    tipTitle:
      'Maaari mo itong baguhin sa ibang pagkakataon',
    tipBody:
      'I-update ang profile o calorie target anumang oras mula sa Settings.',
    finish: 'Gumawa ng plan ko',
    readyKicker: 'HANDA NA ANG PLAN MO',
    readyTitle: 'Welcome sa CaloLens',
    readySubtitle:
      'Maaari nang kalkulahin ang calorie at nutrition guidance mula sa profile na ito.',
    estimated: 'Tantiya',
    startingGuidance:
      'Panimulang gabay',
    disclaimer:
      'Ang BMI at nutrition targets ay mga tantiya para sa pangkalahatang wellness at hindi medical advice.',
    startTracking: 'Simulan ang tracking',
    adviceIntro:
      'Ang tinatayang BMI mo ay {{bmi}} ({{label}}).',
    adviceUnder:
      'Ang unti-unting calorie surplus na may sapat na protein ay maaaring makatulong sa healthy weight gain.',
    adviceNormal:
      'Mag-focus sa regular na pagkain, protein, fiber at hydration.',
    adviceOver:
      'Ang katamtamang calorie deficit at regular na meal tracking ay maaaring makatulong sa fat loss.',
    adviceObese:
      'Magsimula sa praktikal na pagbabago sa pagkain at isaalang-alang ang propesyonal na gabay.',
    goalAdviceLose:
      'Uunahin ng CaloLens ang controlled calorie deficit at sapat na protein.',
    goalAdviceMuscle:
      'Bibigyang-diin ng CaloLens ang protein at sapat na calories para suportahan ang muscle growth.',
    goalAdviceMaintain:
      'Layon ng CaloLens ang stable na calories at balanced macros.',
    goalAdviceRecomp:
      'Bibigyang-diin ng CaloLens ang protein at controlled calorie target para sa body recomposition.',
    goalAdviceEndurance:
      'Pananatilihin ng CaloLens ang sapat na carbohydrates at hydration sa araw-araw mong plan.',
    goalAdviceWellness:
      'Magpo-focus ang CaloLens sa balanced nutrition para suportahan ang recovery at araw-araw na galaw.',
    adviceInjury:
      'Hindi kapalit ng medical advice para sa injury ang nutrition guidance.',
  },
};

const pt = {
  caloLensOnboarding: {
    brandCaption: 'Assistente de nutrição com IA',
    chooseLanguage: 'Escolher idioma',
    languageSubtitle:
      'O idioma do aplicativo muda imediatamente e fica salvo para a próxima vez.',
    kicker: 'CONFIGURAÇÃO PESSOAL',
    step1Title: 'Sobre você',
    step1Subtitle:
      'Informações básicas ajudam a personalizar sua meta diária de nutrição.',
    step2Title: 'Medidas corporais',
    step2Subtitle:
      'Altura e peso são usados para estimar calorias e IMC.',
    step3Title: 'Escolha seu objetivo',
    step3Subtitle:
      'Seu objetivo altera as orientações de calorias e macronutrientes exibidas no CaloLens.',
    namePlaceholder: 'Como devemos chamar você?',
    agePlaceholder: 'ex.: 28',
    healthNote: 'Observação de saúde',
    optional: 'Opcional',
    healthPlaceholder:
      'Qualquer informação que possa afetar seu plano nutricional',
    localNote:
      'Seu perfil é armazenado localmente neste dispositivo.',
    measurementTitle:
      'Usado para suas metas diárias',
    measurementBody:
      'O CaloLens usa essas medidas para estimar calorias, macronutrientes e IMC.',
    injuryHint:
      'Esta observação ajuda a manter as recomendações dentro do contexto correto.',
    injuryPlaceholder:
      'Descreva brevemente a lesão',
    tipTitle:
      'Você poderá alterar isso depois',
    tipBody:
      'Atualize seu perfil ou meta de calorias a qualquer momento em Ajustes.',
    finish: 'Criar meu plano',
    readyKicker: 'SEU PLANO ESTÁ PRONTO',
    readyTitle: 'Bem-vindo ao CaloLens',
    readySubtitle:
      'Suas orientações de calorias e nutrição agora podem ser calculadas com base neste perfil.',
    estimated: 'Estimado',
    startingGuidance:
      'Orientação inicial',
    disclaimer:
      'O IMC e as metas nutricionais são estimativas para o bem-estar geral e não constituem orientação médica.',
    startTracking: 'Começar a acompanhar',
    adviceIntro:
      'Seu IMC estimado é {{bmi}} ({{label}}).',
    adviceUnder:
      'Um aumento gradual de calorias com proteína suficiente pode ajudar no ganho de peso saudável.',
    adviceNormal:
      'Priorize refeições regulares, proteínas, fibras e hidratação.',
    adviceOver:
      'Um déficit calórico moderado e o registro regular das refeições podem ajudar na perda de gordura.',
    adviceObese:
      'Comece com mudanças nutricionais realistas e considere orientação profissional.',
    goalAdviceLose:
      'O CaloLens priorizará um déficit calórico controlado e proteína suficiente.',
    goalAdviceMuscle:
      'O CaloLens dará ênfase à proteína e a calorias suficientes para apoiar o ganho muscular.',
    goalAdviceMaintain:
      'O CaloLens buscará manter calorias estáveis e macronutrientes equilibrados.',
    goalAdviceRecomp:
      'O CaloLens dará ênfase à proteína e a uma meta calórica controlada para a recomposição corporal.',
    goalAdviceEndurance:
      'O CaloLens manterá carboidratos e hidratação suficientes no seu plano diário.',
    goalAdviceWellness:
      'O CaloLens se concentrará em uma nutrição equilibrada que apoie a recuperação e o movimento diário.',
    adviceInjury:
      'A orientação nutricional não substitui aconselhamento médico para uma lesão.',
  },
};

const resources = {
  en,
  vi,
  es,
  fr,
  de,
  zh,
  ja,
  ko,
  ru,
  ar,
  hi,
  th,
  id,
  ms,
  fil,
  pt,
};

Object.entries(
  resources,
).forEach(
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
