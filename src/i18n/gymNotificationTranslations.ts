// FILE: src/i18n/gymNotificationTranslations.ts
import i18n from './index';

const resources: Record<string, Record<string, unknown>> = {
  en: {
    notifications: {
      channelName: 'GymForge reminders',
      dailyTitle: 'Time to train 💪',
      dailyBody: 'Open GymForge and complete today’s workout.',
      smartTitle: 'Today: {{day}} 💪',
      smartBody:
        '{{duration}} min • {{exercises}} exercises. Tap to start.',
      inactiveTitle: 'We miss you 💪',
      inactiveBody:
        'You have not trained for 3 days. Return to GymForge and keep your momentum.',
      weeklyGoalTitle: 'Your weekly goal is waiting 🔥',
      weeklyGoalBody:
        'You still have {{count}} workouts left to complete this week.',
    },
  },
  vi: {
    notifications: {
      channelName: 'Nhắc lịch GymForge',
      dailyTitle: 'Đến giờ tập rồi 💪',
      dailyBody: 'Mở GymForge và hoàn thành buổi tập hôm nay.',
      smartTitle: 'Hôm nay: {{day}} 💪',
      smartBody:
        '{{duration}} phút • {{exercises}} bài. Nhấn để bắt đầu.',
      inactiveTitle: 'GymForge nhớ bạn 💪',
      inactiveBody:
        'Bạn đã 3 ngày chưa tập. Hãy quay lại và tiếp tục duy trì tiến độ.',
      weeklyGoalTitle: 'Mục tiêu tuần đang chờ bạn 🔥',
      weeklyGoalBody:
        'Bạn còn {{count}} buổi tập để hoàn thành mục tiêu tuần này.',
    },
  },
  es: {
    notifications: {
      channelName: 'Recordatorios de GymForge',
      dailyTitle: 'Hora de entrenar 💪',
      dailyBody: 'Abre GymForge y completa el entrenamiento de hoy.',
      smartTitle: 'Hoy: {{day}} 💪',
      smartBody:
        '{{duration}} min • {{exercises}} ejercicios. Toca para comenzar.',
      inactiveTitle: 'Te extrañamos 💪',
      inactiveBody:
        'No has entrenado durante 3 días. Vuelve a GymForge y continúa.',
      weeklyGoalTitle: 'Tu meta semanal te espera 🔥',
      weeklyGoalBody:
        'Te quedan {{count}} entrenamientos esta semana.',
    },
  },
  fr: {
    notifications: {
      channelName: 'Rappels GymForge',
      dailyTitle: 'C’est l’heure de s’entraîner 💪',
      dailyBody: 'Ouvrez GymForge et terminez la séance du jour.',
      smartTitle: 'Aujourd’hui : {{day}} 💪',
      smartBody:
        '{{duration}} min • {{exercises}} exercices. Touchez pour commencer.',
      inactiveTitle: 'Vous nous manquez 💪',
      inactiveBody:
        'Vous ne vous êtes pas entraîné depuis 3 jours. Revenez sur GymForge.',
      weeklyGoalTitle: 'Votre objectif hebdomadaire vous attend 🔥',
      weeklyGoalBody:
        'Il vous reste {{count}} séances cette semaine.',
    },
  },
  de: {
    notifications: {
      channelName: 'GymForge-Erinnerungen',
      dailyTitle: 'Zeit fürs Training 💪',
      dailyBody: 'Öffne GymForge und absolviere das heutige Training.',
      smartTitle: 'Heute: {{day}} 💪',
      smartBody:
        '{{duration}} Min. • {{exercises}} Übungen. Tippen zum Starten.',
      inactiveTitle: 'Wir vermissen dich 💪',
      inactiveBody:
        'Du hast seit 3 Tagen nicht trainiert. Kehre zu GymForge zurück.',
      weeklyGoalTitle: 'Dein Wochenziel wartet 🔥',
      weeklyGoalBody:
        'Dir fehlen noch {{count}} Trainings in dieser Woche.',
    },
  },
  zh: {
    notifications: {
      channelName: 'GymForge 提醒',
      dailyTitle: '该训练了 💪',
      dailyBody: '打开 GymForge，完成今天的训练。',
      smartTitle: '今天：{{day}} 💪',
      smartBody:
        '{{duration}} 分钟 • {{exercises}} 个动作。点击开始。',
      inactiveTitle: '我们想你了 💪',
      inactiveBody:
        '你已经 3 天没有训练了。回到 GymForge 继续坚持吧。',
      weeklyGoalTitle: '本周目标还在等你 🔥',
      weeklyGoalBody:
        '本周还剩 {{count}} 次训练。',
    },
  },
  ja: {
    notifications: {
      channelName: 'GymForge リマインダー',
      dailyTitle: 'トレーニングの時間です 💪',
      dailyBody: 'GymForgeを開いて今日のワークアウトを完了しましょう。',
      smartTitle: '今日：{{day}} 💪',
      smartBody:
        '{{duration}}分 • {{exercises}}種目。タップして開始。',
      inactiveTitle: 'お待ちしています 💪',
      inactiveBody:
        '3日間トレーニングしていません。GymForgeに戻りましょう。',
      weeklyGoalTitle: '週間目標が待っています 🔥',
      weeklyGoalBody:
        '今週あと{{count}}回のワークアウトが必要です。',
    },
  },
  ko: {
    notifications: {
      channelName: 'GymForge 알림',
      dailyTitle: '운동할 시간입니다 💪',
      dailyBody: 'GymForge를 열고 오늘의 운동을 완료하세요.',
      smartTitle: '오늘: {{day}} 💪',
      smartBody:
        '{{duration}}분 • {{exercises}}개 운동. 눌러서 시작하세요.',
      inactiveTitle: '다시 만나요 💪',
      inactiveBody:
        '3일 동안 운동하지 않았습니다. GymForge로 돌아오세요.',
      weeklyGoalTitle: '주간 목표가 기다리고 있어요 🔥',
      weeklyGoalBody:
        '이번 주에 {{count}}회 운동이 남았습니다.',
    },
  },
  ru: {
    notifications: {
      channelName: 'Напоминания GymForge',
      dailyTitle: 'Время тренироваться 💪',
      dailyBody: 'Откройте GymForge и выполните сегодняшнюю тренировку.',
      smartTitle: 'Сегодня: {{day}} 💪',
      smartBody:
        '{{duration}} мин • {{exercises}} упражнений. Нажмите, чтобы начать.',
      inactiveTitle: 'Мы скучаем 💪',
      inactiveBody:
        'Вы не тренировались 3 дня. Вернитесь в GymForge.',
      weeklyGoalTitle: 'Цель недели ждёт вас 🔥',
      weeklyGoalBody:
        'Осталось тренировок на этой неделе: {{count}}.',
    },
  },
  ar: {
    notifications: {
      channelName: 'تذكيرات GymForge',
      dailyTitle: 'حان وقت التمرين 💪',
      dailyBody: 'افتح GymForge وأكمل تمرين اليوم.',
      smartTitle: 'اليوم: {{day}} 💪',
      smartBody:
        '{{duration}} دقيقة • {{exercises}} تمارين. اضغط للبدء.',
      inactiveTitle: 'نفتقدك 💪',
      inactiveBody:
        'لم تتمرن منذ 3 أيام. عد إلى GymForge واستمر.',
      weeklyGoalTitle: 'هدفك الأسبوعي بانتظارك 🔥',
      weeklyGoalBody:
        'تبقى لك {{count}} تمارين هذا الأسبوع.',
    },
  },
  hi: {
    notifications: {
      channelName: 'GymForge रिमाइंडर',
      dailyTitle: 'वर्कआउट का समय है 💪',
      dailyBody: 'GymForge खोलें और आज का वर्कआउट पूरा करें।',
      smartTitle: 'आज: {{day}} 💪',
      smartBody:
        '{{duration}} मिनट • {{exercises}} एक्सरसाइज़। शुरू करने के लिए टैप करें।',
      inactiveTitle: 'हम आपको याद कर रहे हैं 💪',
      inactiveBody:
        'आपने 3 दिनों से वर्कआउट नहीं किया। GymForge पर वापस आएँ।',
      weeklyGoalTitle: 'आपका साप्ताहिक लक्ष्य बाकी है 🔥',
      weeklyGoalBody:
        'इस सप्ताह {{count}} वर्कआउट बाकी हैं।',
    },
  },
  th: {
    notifications: {
      channelName: 'การแจ้งเตือน GymForge',
      dailyTitle: 'ถึงเวลาออกกำลังกายแล้ว 💪',
      dailyBody: 'เปิด GymForge และทำการฝึกของวันนี้ให้เสร็จ',
      smartTitle: 'วันนี้: {{day}} 💪',
      smartBody:
        '{{duration}} นาที • {{exercises}} ท่า แตะเพื่อเริ่ม',
      inactiveTitle: 'เราคิดถึงคุณ 💪',
      inactiveBody:
        'คุณไม่ได้ออกกำลังกายมา 3 วันแล้ว กลับมาที่ GymForge กันเถอะ',
      weeklyGoalTitle: 'เป้าหมายสัปดาห์กำลังรอคุณ 🔥',
      weeklyGoalBody:
        'สัปดาห์นี้เหลืออีก {{count}} ครั้ง',
    },
  },
  id: {
    notifications: {
      channelName: 'Pengingat GymForge',
      dailyTitle: 'Waktunya latihan 💪',
      dailyBody: 'Buka GymForge dan selesaikan latihan hari ini.',
      smartTitle: 'Hari ini: {{day}} 💪',
      smartBody:
        '{{duration}} menit • {{exercises}} latihan. Ketuk untuk mulai.',
      inactiveTitle: 'Kami merindukan Anda 💪',
      inactiveBody:
        'Anda belum berlatih selama 3 hari. Kembali ke GymForge.',
      weeklyGoalTitle: 'Target mingguan menunggu 🔥',
      weeklyGoalBody:
        'Masih tersisa {{count}} latihan minggu ini.',
    },
  },
  ms: {
    notifications: {
      channelName: 'Peringatan GymForge',
      dailyTitle: 'Masa untuk bersenam 💪',
      dailyBody: 'Buka GymForge dan lengkapkan senaman hari ini.',
      smartTitle: 'Hari ini: {{day}} 💪',
      smartBody:
        '{{duration}} minit • {{exercises}} latihan. Tekan untuk mula.',
      inactiveTitle: 'Kami merindui anda 💪',
      inactiveBody:
        'Anda belum bersenam selama 3 hari. Kembali ke GymForge.',
      weeklyGoalTitle: 'Sasaran mingguan menanti 🔥',
      weeklyGoalBody:
        'Baki {{count}} senaman minggu ini.',
    },
  },
  fil: {
    notifications: {
      channelName: 'Mga paalala ng GymForge',
      dailyTitle: 'Oras na para mag-workout 💪',
      dailyBody: 'Buksan ang GymForge at tapusin ang workout ngayon.',
      smartTitle: 'Ngayon: {{day}} 💪',
      smartBody:
        '{{duration}} minuto • {{exercises}} ehersisyo. I-tap para magsimula.',
      inactiveTitle: 'Miss ka na namin 💪',
      inactiveBody:
        'Tatlong araw ka nang hindi nagwo-workout. Bumalik sa GymForge.',
      weeklyGoalTitle: 'Naghihintay ang weekly goal mo 🔥',
      weeklyGoalBody:
        'May {{count}} workout ka pang natitira ngayong linggo.',
    },
  },
  pt: {
    notifications: {
      channelName: 'Lembretes GymForge',
      dailyTitle: 'Hora de treinar 💪',
      dailyBody: 'Abra o GymForge e conclua o treino de hoje.',
      smartTitle: 'Hoje: {{day}} 💪',
      smartBody:
        '{{duration}} min • {{exercises}} exercícios. Toque para começar.',
      inactiveTitle: 'Sentimos sua falta 💪',
      inactiveBody:
        'Você não treina há 3 dias. Volte ao GymForge.',
      weeklyGoalTitle: 'Sua meta semanal está esperando 🔥',
      weeklyGoalBody:
        'Faltam {{count}} treinos nesta semana.',
    },
  },
};

Object.entries(resources).forEach(([language, notifications]) => {
  i18n.addResourceBundle(
    language,
    'translation',
    notifications,
    true,
    true,
  );
});

export default resources;
