import i18n from './index';
const resources: Record<string, any> = {
  "en": { caloLensDiscover: { title: "Discover meals", body: "Get meal ideas, local food and nearby places that fit your taste.", badge: 'AI DISCOVER' } },
  "vi": { caloLensDiscover: { title: "Khám phá món ăn", body: "Gợi ý món ăn, đặc sản địa phương và địa điểm gần bạn theo khẩu vị.", badge: 'AI DISCOVER' } },
  "es": { caloLensDiscover: { title: "Descubrir comidas", body: "Ideas de comidas, sabores locales y lugares cercanos según tus gustos.", badge: 'AI DISCOVER' } },
  "fr": { caloLensDiscover: { title: "Découvrir des repas", body: "Des idées de repas, spécialités locales et adresses proches selon vos goûts.", badge: 'AI DISCOVER' } },
  "de": { caloLensDiscover: { title: "Essen entdecken", body: "Essensideen, lokale Spezialitäten und passende Orte in deiner Nähe.", badge: 'AI DISCOVER' } },
  "zh": { caloLensDiscover: { title: "发现美食", body: "按你的口味推荐餐食、当地特色和附近餐厅。", badge: 'AI DISCOVER' } },
  "ja": { caloLensDiscover: { title: "食事を見つける", body: "好みに合う食事、現地グルメ、近くのお店を提案します。", badge: 'AI DISCOVER' } },
  "ko": { caloLensDiscover: { title: "음식 둘러보기", body: "취향에 맞는 식사, 현지 음식, 주변 맛집을 추천해요.", badge: 'AI DISCOVER' } },
  "ru": { caloLensDiscover: { title: "Подобрать еду", body: "Идеи блюд, местная кухня и места рядом с учетом ваших вкусов.", badge: 'AI DISCOVER' } },
  "ar": { caloLensDiscover: { title: "اكتشف وجبتك", body: "اقتراحات وجبات وأطباق محلية وأماكن قريبة تناسب ذوقك.", badge: 'AI DISCOVER' } },
  "hi": { caloLensDiscover: { title: "खाना खोजें", body: "आपकी पसंद के अनुसार भोजन, स्थानीय व्यंजन और पास की जगहें खोजें।", badge: 'AI DISCOVER' } },
  "th": { caloLensDiscover: { title: "ค้นหาเมนู", body: "แนะนำเมนู อาหารท้องถิ่น และร้านใกล้คุณตามรสนิยม", badge: 'AI DISCOVER' } },
  "id": { caloLensDiscover: { title: "Jelajahi makanan", body: "Ide makanan, kuliner lokal, dan tempat terdekat sesuai selera Anda.", badge: 'AI DISCOVER' } },
  "ms": { caloLensDiscover: { title: "Teroka makanan", body: "Idea hidangan, makanan tempatan dan tempat berdekatan mengikut citarasa anda.", badge: 'AI DISCOVER' } },
  "fil": { caloLensDiscover: { title: "Tuklasin ang pagkain", body: "Mga ideya sa pagkain, lokal na putahe at kalapit na lugar ayon sa panlasa mo.", badge: 'AI DISCOVER' } },
  "pt": { caloLensDiscover: { title: "Descobrir refeições", body: "Ideias de refeições, sabores locais e locais próximos de acordo com seu gosto.", badge: 'AI DISCOVER' } },
};

Object.entries(resources).forEach(([language, value]) => {
  i18n.addResourceBundle(language, 'translation', value, true, true);
});

export default resources;
