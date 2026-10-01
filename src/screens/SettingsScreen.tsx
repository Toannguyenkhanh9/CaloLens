// FILE: src/screens/SettingsScreen.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Dimensions,
  Modal,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useTranslation,
} from 'react-i18next';
import AsyncStorage
  from '@react-native-async-storage/async-storage';

import i18n, {
  LANG_KEY,
} from '../i18n';
import '../i18n/caloLensSettingsTranslations';

import {
  cancelDailyReminder,
  loadDailyReminderSettings,
  scheduleDailyReminder,
} from '../notifications/reminder';
import {
  useSubscription,
} from '../iap/SubscriptionProvider';
import {
  PREMIUM_ENABLED,
} from '../config/features';

const PROFILE_KEY =
  'user:profile';

const LANGS = [
  {
    code: 'vi',
    label: 'Tiếng Việt',
  },
  {
    code: 'en',
    label: 'English',
  },
  {
    code: 'es',
    label: 'Español',
  },
  {
    code: 'fr',
    label: 'Français',
  },
  {
    code: 'de',
    label: 'Deutsch',
  },
  {
    code: 'zh',
    label: '中文',
  },
  {
    code: 'ja',
    label: '日本語',
  },
  {
    code: 'ko',
    label: '한국어',
  },
  {
    code: 'ru',
    label: 'Русский',
  },
  {
    code: 'ar',
    label: 'العربية',
  },
  {
    code: 'hi',
    label: 'हिन्दी',
  },
  {
    code: 'th',
    label: 'ไทย',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
  },
  {
    code: 'fil',
    label: 'Filipino',
  },
  {
    code: 'pt',
    label: 'Português',
  },
];

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#FFF2E8';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const CYAN = '#F29132';
const YELLOW = '#F5A623';
const BLUE = '#FF9350';
const RED = '#D85E78';

type SettingRowProps = {
  icon: string;
  title: string;
  description?: string;
  value?: string;
  accent?: string;
  onPress: () => void;
  last?: boolean;
};

const SettingRow:
React.FC<SettingRowProps> = ({
  icon,
  title,
  description,
  value,
  accent = NEON,
  onPress,
  last = false,
}) => (
  <TouchableOpacity
    activeOpacity={0.86}
    style={[
      styles.row,
      !last &&
        styles.rowDivider,
    ]}
    onPress={onPress}
  >
    <View
      style={[
        styles.rowIcon,
        {
          borderColor:
            `${accent}55`,
          backgroundColor:
            `${accent}14`,
        },
      ]}
    >
      <Text style={styles.rowIconText}>
        {icon}
      </Text>
    </View>

    <View style={styles.rowBody}>
      <Text style={styles.rowTitle}>
        {title}
      </Text>

      {description ? (
        <Text
          style={styles.rowDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      ) : null}
    </View>

    {value ? (
      <View style={styles.valuePill}>
        <Text
          style={styles.valueText}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    ) : null}

    <Text
      style={[
        styles.chevron,
        {
          color: accent,
        },
      ]}
    >
      ›
    </Text>
  </TouchableOpacity>
);

const SectionHeader:
React.FC<{
  kicker: string;
  title: string;
}> = ({
  kicker,
  title,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionKicker}>
      {kicker}
    </Text>

    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  </View>
);

const ReminderTimeModal:
React.FC<{
  visible: boolean;
  hour: number;
  minute: number;
  enabled: boolean;
  onChangeHour: (
    value: number,
  ) => void;
  onChangeMinute: (
    value: number,
  ) => void;
  onClose: () => void;
  onSave: () => void;
  onDisable: () => void;
}> = ({
  visible,
  hour,
  minute,
  enabled,
  onChangeHour,
  onChangeMinute,
  onClose,
  onSave,
  onDisable,
}) => {
  const {t} =
    useTranslation();

  const incHour =
    () =>
      onChangeHour(
        hour >= 23
          ? 0
          : hour + 1,
      );

  const decHour =
    () =>
      onChangeHour(
        hour <= 0
          ? 23
          : hour - 1,
      );

  const incMinute =
    () =>
      onChangeMinute(
        minute >= 55
          ? 0
          : minute + 5,
      );

  const decMinute =
    () =>
      onChangeMinute(
        minute <= 0
          ? 55
          : minute - 5,
      );

  const quickTimes = [
    {
      h: 7,
      m: 0,
      icon: '☀️',
    },
    {
      h: 12,
      m: 0,
      icon: '🍱',
    },
    {
      h: 18,
      m: 0,
      icon: '🍽️',
    },
    {
      h: 20,
      m: 0,
      icon: '🌙',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.reminderOverlay}
        onPress={onClose}
      >
        <Pressable
          style={styles.reminderCard}
          onPress={() => {}}
        >
          <View style={styles.modalIcon}>
            <Text style={styles.modalIconText}>
              🔔
            </Text>
          </View>

          <Text style={styles.reminderKicker}>
            {t(
              'caloLensSettings.reminderKicker',
              'MEAL LOG REMINDER',
            )}
          </Text>

          <Text style={styles.reminderTitle}>
            {t(
              'caloLensSettings.chooseReminder',
              'Choose reminder time',
            )}
          </Text>

          <Text style={styles.reminderDescription}>
            {t(
              'caloLensSettings.reminderDescription',
              'CaloLens will remind you to record meals and review your daily calorie target.',
            )}
          </Text>

          <View style={styles.timePickerRow}>
            <View style={styles.timePickerBox}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.timeButton}
                onPress={incHour}
              >
                <Text style={styles.timeButtonText}>
                  ＋
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeValue}>
                {String(hour).padStart(
                  2,
                  '0',
                )}
              </Text>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.timeButton}
                onPress={decHour}
              >
                <Text style={styles.timeButtonText}>
                  －
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeLabel}>
                {t(
                  'settings.hour',
                  'Hour',
                )}
              </Text>
            </View>

            <Text style={styles.timeColon}>
              :
            </Text>

            <View style={styles.timePickerBox}>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.timeButton}
                onPress={incMinute}
              >
                <Text style={styles.timeButtonText}>
                  ＋
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeValue}>
                {String(
                  minute,
                ).padStart(
                  2,
                  '0',
                )}
              </Text>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.timeButton}
                onPress={decMinute}
              >
                <Text style={styles.timeButtonText}>
                  －
                </Text>
              </TouchableOpacity>

              <Text style={styles.timeLabel}>
                {t(
                  'settings.minute',
                  'Minute',
                )}
              </Text>
            </View>
          </View>

          <View style={styles.quickTimeRow}>
            {quickTimes.map(
              item => {
                const active =
                  item.h === hour &&
                  item.m === minute;

                return (
                  <TouchableOpacity
                    key={`${item.h}:${item.m}`}
                    activeOpacity={0.84}
                    style={[
                      styles.quickTimeButton,
                      active &&
                        styles.quickTimeButtonActive,
                    ]}
                    onPress={() => {
                      onChangeHour(
                        item.h,
                      );
                      onChangeMinute(
                        item.m,
                      );
                    }}
                  >
                    <Text style={styles.quickTimeIcon}>
                      {item.icon}
                    </Text>

                    <Text
                      style={[
                        styles.quickTimeText,
                        active &&
                          styles.quickTimeTextActive,
                      ]}
                    >
                      {String(
                        item.h,
                      ).padStart(
                        2,
                        '0',
                      )}
                      :
                      {String(
                        item.m,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>

          <View style={styles.reminderActions}>
            <TouchableOpacity
              activeOpacity={0.84}
              style={[
                styles.reminderAction,
                styles.reminderCancel,
              ]}
              onPress={onClose}
            >
              <Text style={styles.reminderCancelText}>
                {t(
                  'common.cancel',
                  'Cancel',
                )}
              </Text>
            </TouchableOpacity>

            {enabled ? (
              <TouchableOpacity
                activeOpacity={0.84}
                style={[
                  styles.reminderAction,
                  styles.reminderDisable,
                ]}
                onPress={onDisable}
              >
                <Text style={styles.reminderDisableText}>
                  {t(
                    'settings.disableReminder',
                    'Disable',
                  )}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.84}
              style={[
                styles.reminderAction,
                styles.reminderSave,
              ]}
              onPress={onSave}
            >
              <Text style={styles.reminderSaveText}>
                {t(
                  'settings.saveReminder',
                  'Save',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export const SettingsScreen:
React.FC = () => {
  const {t} =
    useTranslation();

  const navigation =
    useNavigation<any>();

  const insets =
    useSafeAreaInsets();

  const {
    isPremium,
  } =
    useSubscription();

  const rawLanguage =
    i18n.resolvedLanguage ||
    i18n.language ||
    'en';

  const currentLanguage =
    LANGS.find(
      language =>
        rawLanguage ===
          language.code ||
        rawLanguage.startsWith(
          `${language.code}-`,
        ),
    )?.code ||
    'en';

  const [
    profileName,
    setProfileName,
  ] =
    useState('');

  const [
    showLanguagePicker,
    setShowLanguagePicker,
  ] =
    useState(false);

  const [
    reminderEnabled,
    setReminderEnabled,
  ] =
    useState(false);

  const [
    reminderTime,
    setReminderTime,
  ] =
    useState({
      h: 20,
      m: 0,
    });

  const [
    showReminderPicker,
    setShowReminderPicker,
  ] =
    useState(false);

  const [
    draftHour,
    setDraftHour,
  ] =
    useState(20);

  const [
    draftMinute,
    setDraftMinute,
  ] =
    useState(0);

  const screenHeight =
    Dimensions
      .get('window')
      .height;

  const languageSheetHeight =
    Math.max(
      380,
      Math.min(
        screenHeight * 0.84,
        620,
      ),
    );

  const currentLanguageLabel =
    useMemo(
      () =>
        LANGS.find(
          language =>
            language.code ===
            currentLanguage,
        )?.label ||
        currentLanguage,
      [currentLanguage],
    );

  const loadProfile =
    useCallback(
      async () => {
        try {
          const raw =
            await AsyncStorage.getItem(
              PROFILE_KEY,
            );

          if (!raw) {
            setProfileName('');
            return;
          }

          const parsed =
            JSON.parse(raw);

          setProfileName(
            parsed?.name ||
            parsed?.fullName ||
            '',
          );
        } catch {
          setProfileName('');
        }
      },
      [],
    );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  useEffect(() => {
    (async () => {
      try {
        const saved =
          await loadDailyReminderSettings();

        setReminderEnabled(
          saved.enabled,
        );

        setReminderTime({
          h: saved.hour,
          m: saved.minute,
        });

        setDraftHour(
          saved.hour,
        );

        setDraftMinute(
          saved.minute,
        );
      } catch (error) {
        console.log(
          '[CaloLensSettings] reminder load error',
          error,
        );
      }
    })();
  }, []);

  const changeLanguage =
    async (
      code: string,
    ) => {
      await AsyncStorage.setItem(
        LANG_KEY,
        code,
      );

      await i18n.changeLanguage(
        code,
      );

      setShowLanguagePicker(
        false,
      );
    };

  const openReminderPicker =
    () => {
      setDraftHour(
        reminderTime.h,
      );

      setDraftMinute(
        reminderTime.m,
      );

      setShowReminderPicker(
        true,
      );
    };

  const saveReminder =
    async () => {
      const ok =
        await scheduleDailyReminder(
          draftHour,
          draftMinute,
          {
            title: t(
              'caloLensSettings.notificationTitle',
              'Time to log your meals 🍽️',
            ),
            body: t(
              'caloLensSettings.notificationBody',
              'Open CaloLens, update today’s meals and review your remaining calories.',
            ),
          },
        );

      if (!ok) {
        return;
      }

      setReminderEnabled(
        true,
      );

      setReminderTime({
        h: draftHour,
        m: draftMinute,
      });

      setShowReminderPicker(
        false,
      );
    };

  const disableReminder =
    async () => {
      await cancelDailyReminder();

      setReminderEnabled(
        false,
      );

      setShowReminderPicker(
        false,
      );
    };

  const reminderValue =
    reminderEnabled
      ? `${String(
          reminderTime.h,
        ).padStart(
          2,
          '0',
        )}:${String(
          reminderTime.m,
        ).padStart(
          2,
          '0',
        )}`
      : t(
          'caloLensSettings.off',
          'Off',
        );

  const accountTitle =
    profileName ||
    t(
      'caloLensSettings.yourProfile',
      'Your profile',
    );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <View
        pointerEvents="none"
        style={styles.glowTop}
      />

      <View
        pointerEvents="none"
        style={styles.glowMiddle}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Math.max(
                insets.top,
                14,
              ),
            paddingBottom:
              160 +
              insets.bottom,
          },
        ]}
      >
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brand}>
                Calo
                <Text style={styles.brandAccent}>
                  Lens
                </Text>
              </Text>

              <Text style={styles.brandTag}>
                {t(
                  'caloLensSettings.brandTag',
                  'MEAL SCANNER & CALORIE TRACKER',
                )}
              </Text>
            </View>

            <View
              style={[
                styles.planBadge,
                isPremium &&
                  styles.planBadgePremium,
              ]}
            >
              <Text
                style={[
                  styles.planBadgeText,
                  isPremium &&
                    styles.planBadgeTextPremium,
                ]}
              >
                {isPremium
                  ? t(
                      'caloLensSettings.premium',
                      'PREMIUM',
                    )
                  : t(
                      'caloLensSettings.free',
                      'FREE',
                    )}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            {t(
              'caloLensSettings.title',
              'Settings',
            )}
          </Text>

          <Text style={styles.heroSubtitle}>
            {t(
              'caloLensSettings.subtitle',
              'Personalize your targets, reminders, progress and CaloLens experience.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.accountCard}
          onPress={() =>
            navigation.navigate(
              'UserProfile',
            )
          }
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileName
                ? profileName
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                : '◎'}
            </Text>
          </View>

          <View style={styles.accountBody}>
            <Text style={styles.accountTitle}>
              {accountTitle}
            </Text>

            <Text style={styles.accountSubtitle}>
              {t(
                'caloLensSettings.profileSummary',
                'Body information, activity level and nutrition goal',
              )}
            </Text>
          </View>

          <View style={styles.accountArrow}>
            <Text style={styles.accountArrowText}>
              ›
            </Text>
          </View>
        </TouchableOpacity>

        <SectionHeader
          kicker={t(
            'caloLensSettings.nutritionKicker',
            'NUTRITION',
          )}
          title={t(
            'caloLensSettings.nutritionTitle',
            'Goals & progress',
          )}
        />

        <View style={styles.sectionCard}>
          <SettingRow
            icon="◎"
            title={t(
              'caloLensSettings.dailyPlan',
              'Daily nutrition plan',
            )}
            description={t(
              'caloLensSettings.dailyPlanDescription',
              'Calories, macros, water and meal suggestions',
            )}
            accent={NEON}
            onPress={() =>
              navigation.navigate(
                'NutritionPlan',
              )
            }
          />

          <SettingRow
            icon="👤"
            title={t(
              'caloLensSettings.bodyProfile',
              'Body profile',
            )}
            description={t(
              'caloLensSettings.bodyProfileDescription',
              'Age, height, weight, activity and body goal',
            )}
            accent={CYAN}
            onPress={() =>
              navigation.navigate(
                'UserProfile',
              )
            }
          />

          <SettingRow
            icon="📈"
            title={t(
              'caloLensSettings.weightProgress',
              'Weight progress',
            )}
            description={t(
              'caloLensSettings.weightProgressDescription',
              'Track changes and review your weight trend',
            )}
            accent={BLUE}
            last
            onPress={() =>
              navigation.navigate(
                'WeightChart',
              )
            }
          />
        </View>

        <SectionHeader
          kicker={t(
            'caloLensSettings.preferenceKicker',
            'PREFERENCES',
          )}
          title={t(
            'caloLensSettings.preferenceTitle',
            'App experience',
          )}
        />

        <View style={styles.sectionCard}>
          <SettingRow
            icon="🌐"
            title={t(
              'settings.language',
              'Language',
            )}
            description={t(
              'caloLensSettings.languageDescription',
              'Choose the language used throughout the app',
            )}
            value={
              currentLanguageLabel
            }
            accent={CYAN}
            onPress={() =>
              setShowLanguagePicker(
                true,
              )
            }
          />

          <SettingRow
            icon="🔔"
            title={t(
              'caloLensSettings.mealReminder',
              'Meal log reminder',
            )}
            description={t(
              'caloLensSettings.mealReminderDescription',
              'Receive a daily reminder to update meals and calories',
            )}
            value={reminderValue}
            accent={YELLOW}
            last
            onPress={
              openReminderPicker
            }
          />
        </View>

        {PREMIUM_ENABLED ? (
          <>
            <SectionHeader
              kicker={t(
                'caloLensSettings.membershipKicker',
                'MEMBERSHIP',
              )}
              title={t(
                'caloLensSettings.membershipTitle',
                'CaloLens plan',
              )}
            />

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.premiumCard,
                isPremium &&
                  styles.premiumCardActive,
              ]}
              onPress={() =>
                navigation.navigate(
                  'Premium',
                )
              }
            >
              <View style={styles.premiumTopRow}>
                <View style={styles.premiumIcon}>
                  <Text style={styles.premiumIconText}>
                    ✦
                  </Text>
                </View>

                <View style={styles.premiumBody}>
                  <Text style={styles.premiumTitle}>
                    {isPremium
                      ? t(
                          'caloLensSettings.premiumActive',
                          'CaloLens Premium is active',
                        )
                      : t(
                          'caloLensSettings.unlockPremium',
                          'Unlock CaloLens Premium',
                        )}
                  </Text>

                  <Text style={styles.premiumDescription}>
                    {isPremium
                      ? t(
                          'caloLensSettings.premiumActiveDescription',
                          'Enjoy more AI scans, no ads and advanced nutrition tools.',
                        )
                      : t(
                          'caloLensSettings.unlockPremiumDescription',
                          'Get more AI meal scans, remove ads and unlock advanced insights.',
                        )}
                  </Text>
                </View>
              </View>

              <View style={styles.premiumFooter}>
                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>
                    ✓
                  </Text>

                  <Text style={styles.premiumFeatureText}>
                    {t(
                      'caloLensSettings.moreScans',
                      '15 AI scans/day',
                    )}
                  </Text>
                </View>

                <View style={styles.premiumFeature}>
                  <Text style={styles.premiumFeatureIcon}>
                    ✓
                  </Text>

                  <Text style={styles.premiumFeatureText}>
                    {t(
                      'caloLensSettings.noAds',
                      'No ads',
                    )}
                  </Text>
                </View>

                <Text style={styles.premiumArrow}>
                  ›
                </Text>
              </View>
            </TouchableOpacity>
          </>
        ) : null}

        <SectionHeader
          kicker={t(
            'caloLensSettings.supportKicker',
            'SUPPORT',
          )}
          title={t(
            'caloLensSettings.supportTitle',
            'Help & information',
          )}
        />
 
        <View style={styles.sectionCard}>
          <SettingRow
            icon="?"
            title={t(
              'tabs.guide',
              'Guide',
            )}
            description={t(
              'caloLensSettings.guideDescription',
              'Learn how calorie targets and meal scanning work',
            )}
            accent={CYAN}
            last
            onPress={() =>
              navigation.navigate(
                'Guide',
              )
            }
          />
        </View> 

        <View style={styles.footerCard}>
          <View style={styles.footerLogo}>
            <Text style={styles.footerLogoText}>
              C
            </Text>
          </View>

          <View style={styles.footerBody}>
            <Text style={styles.footerTitle}>
              CaloLens: Meal Scanner
            </Text>

            <Text style={styles.footerText}>
              {t(
                'caloLensSettings.footer',
                'Smarter meal tracking for your personal nutrition goal.',
              )}
            </Text>
          </View>
        </View>

        <ImageBackground
          source={require('../assets/calo_guidance_food.jpg')}
          style={styles.mealFooterCard}
          imageStyle={styles.mealFooterImage}
        >
          <View style={styles.mealFooterOverlay} />
          <View style={styles.mealFooterContent}>
            <Text style={styles.mealFooterKicker}>
              {t('caloLensSettings.mealFooterKicker', 'HEALTHY HABITS')}
            </Text>
            <Text style={styles.mealFooterTitle}>
              {t('caloLensSettings.mealFooterTitle', 'Keep CaloLens fresh, warm and motivating')}
            </Text>
            <Text style={styles.mealFooterText}>
              {t(
                'caloLensSettings.mealFooterText',
                'A brighter food-first design helps your nutrition app feel more inviting every day.',
              )}
            </Text>
          </View>
        </ImageBackground>
      </ScrollView>

      <Modal
        visible={
          showLanguagePicker
        }
        animationType="fade"
        transparent
        onRequestClose={() =>
          setShowLanguagePicker(
            false,
          )
        }
      >
        <Pressable
          style={styles.languageOverlay}
          onPress={() =>
            setShowLanguagePicker(
              false,
            )
          }
        >
          <Pressable
            style={[
              styles.languageSheet,
              {
                height:
                  languageSheetHeight,
                paddingBottom:
                  insets.bottom + 8,
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetKicker}>
              {t(
                'caloLensSettings.languageKicker',
                'APP LANGUAGE',
              )}
            </Text>

            <Text style={styles.sheetTitle}>
              {t(
                'settings.chooseLanguage',
                'Choose your app language',
              )}
            </Text>

            <Text style={styles.sheetDescription}>
              {t(
                'caloLensSettings.languageSheetDescription',
                'Menus, guidance and nutrition labels will use the selected language.',
              )}
            </Text>

            <ScrollView
              style={styles.languageList}
              contentContainerStyle={
                styles.languageListContent
              }
              nestedScrollEnabled
              showsVerticalScrollIndicator={
                false
              }
            >
              {LANGS.map(
                language => {
                  const selected =
                    language.code ===
                    currentLanguage;

                  return (
                    <TouchableOpacity
                      key={
                        language.code
                      }
                      activeOpacity={0.84}
                      style={[
                        styles.languageItem,
                        selected &&
                          styles.languageItemActive,
                      ]}
                      onPress={() =>
                        changeLanguage(
                          language.code,
                        )
                      }
                    >
                      <View
                        style={[
                          styles.languageCode,
                          selected &&
                            styles.languageCodeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.languageCodeText,
                            selected &&
                              styles.languageCodeTextActive,
                          ]}
                        >
                          {language.code
                            .toUpperCase()}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.languageName,
                          selected &&
                            styles.languageNameActive,
                        ]}
                        numberOfLines={1}
                      >
                        {language.label}
                      </Text>

                      {selected ? (
                        <View style={styles.languageCheck}>
                          <Text style={styles.languageCheckText}>
                            ✓
                          </Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.languageCancel}
              onPress={() =>
                setShowLanguagePicker(
                  false,
                )
              }
            >
              <Text style={styles.languageCancelText}>
                {t(
                  'common.cancel',
                  'Cancel',
                )}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <ReminderTimeModal
        visible={
          showReminderPicker
        }
        hour={draftHour}
        minute={draftMinute}
        enabled={
          reminderEnabled
        }
        onChangeHour={
          setDraftHour
        }
        onChangeMinute={
          setDraftMinute
        }
        onClose={() =>
          setShowReminderPicker(
            false,
          )
        }
        onSave={
          saveReminder
        }
        onDisable={
          disableReminder
        }
      />
    </View>
  );
};

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: BG,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 8,
    },
    glowTop: {
      position: 'absolute',
      top: -120,
      right: -100,
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor:
        'rgba(242, 145, 50, 0.12)',
    },
    glowMiddle: {
      position: 'absolute',
      top: 420,
      left: -130,
      width: 300,
      height: 300,
      borderRadius: 150,
      backgroundColor:
        'rgba(255, 106, 33, 0.08)',
    },
    hero: {
      paddingHorizontal: 6,
      paddingTop: 6,
      marginBottom: 16,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 24,
    },
    brand: {
      color: TEXT,
      fontSize: 25,
      fontWeight: '900',
      letterSpacing: -0.8,
    },
    brandAccent: {
      color: NEON,
    },
    brandTag: {
      color: CYAN,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.9,
      marginTop: 2,
    },
    planBadge: {
      minWidth: 62,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      alignItems: 'center',
      backgroundColor:
        'rgba(120, 105, 95, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.24)',
    },
    planBadgePremium: {
      backgroundColor:
        'rgba(255, 106, 33, 0.11)',
      borderColor:
        'rgba(255, 106, 33, 0.34)',
    },
    planBadgeText: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    planBadgeTextPremium: {
      color: NEON,
    },
    heroTitle: {
      color: TEXT,
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
      letterSpacing: -0.7,
    },
    heroSubtitle: {
      color: '#6E5F55',
      fontSize: 14,
      lineHeight: 21,
      marginTop: 8,
      maxWidth: 355,
    },
    accountCard: {
      minHeight: 92,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#FFFFFF',
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.25)',
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: 22,
    },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 106, 33, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.34)',
      marginRight: 12,
    },
    avatarText: {
      color: NEON,
      fontSize: 22,
      fontWeight: '900',
    },
    accountBody: {
      flex: 1,
    },
    accountTitle: {
      color: TEXT,
      fontSize: 17,
      fontWeight: '900',
    },
    accountSubtitle: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 5,
    },
    accountArrow: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 106, 33, 0.10)',
      marginLeft: 10,
    },
    accountArrowText: {
      color: NEON,
      fontSize: 27,
      lineHeight: 29,
    },
    sectionHeader: {
      paddingHorizontal: 5,
      marginBottom: 10,
    },
    sectionKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.05,
    },
    sectionTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 3,
    },
    sectionCard: {
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(148, 163, 184, 0.13)',
      paddingHorizontal: 12,
      marginBottom: 22,
      overflow: 'hidden',
    },
    row: {
      minHeight: 80,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    rowDivider: {
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      borderBottomColor:
        'rgba(120, 105, 95, 0.18)',
    },
    rowIcon: {
      width: 44,
      height: 44,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    rowIconText: {
      fontSize: 19,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      color: TEXT,
      fontSize: 14,
      fontWeight: '900',
    },
    rowDescription: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    valuePill: {
      maxWidth: 96,
      backgroundColor:
        'rgba(148, 163, 184, 0.09)',
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.17)',
      paddingHorizontal: 9,
      paddingVertical: 5,
      marginLeft: 8,
    },
    valueText: {
      color: '#6E5F55',
      fontSize: 10,
      fontWeight: '900',
    },
    chevron: {
      fontSize: 25,
      lineHeight: 27,
      marginLeft: 7,
    },
    premiumCard: {
      backgroundColor:
        '#FFF9E8',
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.26)',
      padding: 14,
      marginBottom: 22,
    },
    premiumCardActive: {
      backgroundColor:
        'rgba(255, 106, 33, 0.08)',
      borderColor:
        'rgba(255, 106, 33, 0.30)',
    },
    premiumTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    premiumIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(217, 154, 0, 0.14)',
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.34)',
      marginRight: 12,
    },
    premiumIconText: {
      color: YELLOW,
      fontSize: 22,
      fontWeight: '900',
    },
    premiumBody: {
      flex: 1,
    },
    premiumTitle: {
      color: TEXT,
      fontSize: 16,
      fontWeight: '900',
    },
    premiumDescription: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    premiumFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        'rgba(217, 154, 0, 0.22)',
    },
    premiumFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 14,
    },
    premiumFeatureIcon: {
      color: NEON,
      fontSize: 12,
      fontWeight: '900',
      marginRight: 5,
    },
    premiumFeatureText: {
      color: '#5F544D',
      fontSize: 10,
      fontWeight: '800',
    },
    premiumArrow: {
      flex: 1,
      color: YELLOW,
      fontSize: 27,
      lineHeight: 29,
      textAlign: 'right',
    },
    footerCard: {
      minHeight: 76,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(240, 245, 237, 0.92)',
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.14)',
      padding: 12,
      marginBottom: 8,
    },
    footerLogo: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      marginRight: 11,
    },
    footerLogoText: {
      color: '#FFFFFF',
      fontSize: 21,
      fontWeight: '900',
    },
    footerBody: {
      flex: 1,
    },
    footerTitle: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    footerText: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 4,
    },
    mealFooterCard: {
      minHeight: 186,
      borderRadius: 24,
      overflow: 'hidden',
      marginTop: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 106, 33, 0.16)',
      justifyContent: 'flex-end',
    },
    mealFooterImage: {
      resizeMode: 'cover',
    },
    mealFooterOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 248, 242, 0.22)',
    },
    mealFooterContent: {
      margin: 14,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.78)',
      paddingHorizontal: 18,
      paddingVertical: 18,
    },
    mealFooterKicker: {
      color: CYAN,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    mealFooterTitle: {
      color: TEXT,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 6,
    },
    mealFooterText: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 8,
    },
    languageOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.66)',
      justifyContent:
        'flex-end',
    },
    languageSheet: {
      backgroundColor: BG,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      borderTopWidth: 1,
      borderTopColor:
        'rgba(255, 106, 33, 0.28)',
      paddingTop: 10,
      paddingHorizontal: 12,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor:
        'rgba(120, 105, 95, 0.42)',
      marginBottom: 14,
    },
    sheetKicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    sheetTitle: {
      color: TEXT,
      fontSize: 21,
      fontWeight: '900',
      marginTop: 3,
    },
    sheetDescription: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
      marginBottom: 12,
    },
    languageList: {
      flex: 1,
    },
    languageListContent: {
      paddingBottom: 8,
    },
    languageItem: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CARD,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        'rgba(148, 163, 184, 0.13)',
      paddingHorizontal: 11,
      marginBottom: 7,
    },
    languageItemActive: {
      backgroundColor:
        'rgba(255, 106, 33, 0.08)',
      borderColor:
        'rgba(255, 106, 33, 0.38)',
    },
    languageCode: {
      width: 39,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(148, 163, 184, 0.09)',
      marginRight: 11,
    },
    languageCodeActive: {
      backgroundColor: NEON,
    },
    languageCodeText: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '900',
    },
    languageCodeTextActive: {
      color: '#10230F',
    },
    languageName: {
      flex: 1,
      color: '#5F544D',
      fontSize: 13,
      fontWeight: '800',
    },
    languageNameActive: {
      color: NEON,
      fontWeight: '900',
    },
    languageCheck: {
      width: 25,
      height: 25,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      marginLeft: 8,
    },
    languageCheckText: {
      color: '#10230F',
      fontSize: 14,
      fontWeight: '900',
    },
    languageCancel: {
      minHeight: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CARD_2,
      borderWidth: 1,
      borderColor:
        'rgba(148, 163, 184, 0.17)',
      marginTop: 4,
    },
    languageCancelText: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '900',
    },
    reminderOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.68)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    reminderCard: {
      width: '100%',
      backgroundColor: CARD,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.29)',
      padding: 16,
      shadowColor: YELLOW,
      shadowOpacity: 0.10,
      shadowRadius: 18,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      elevation: 8,
    },
    modalIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(217, 154, 0, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(217, 154, 0, 0.29)',
      marginBottom: 12,
    },
    modalIconText: {
      fontSize: 20,
    },
    reminderKicker: {
      color: YELLOW,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    reminderTitle: {
      color: TEXT,
      fontSize: 22,
      fontWeight: '900',
      marginTop: 4,
    },
    reminderDescription: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 7,
      marginBottom: 16,
    },
    timePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timePickerBox: {
      width: 112,
      backgroundColor: CARD_2,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        'rgba(120, 105, 95, 0.18)',
      padding: 10,
      alignItems: 'center',
    },
    timeButton: {
      width: 42,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 106, 33, 0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.26)',
    },
    timeButtonText: {
      color: NEON,
      fontSize: 19,
      fontWeight: '900',
    },
    timeValue: {
      color: TEXT,
      fontSize: 35,
      fontWeight: '900',
      marginVertical: 9,
    },
    timeLabel: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '800',
    },
    timeColon: {
      color: NEON,
      fontSize: 32,
      fontWeight: '900',
      marginHorizontal: 8,
    },
    quickTimeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 14,
    },
    quickTimeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: CARD_2,
      borderWidth: 1,
      borderColor:
        'rgba(148, 163, 184, 0.17)',
      marginRight: 7,
      marginBottom: 7,
    },
    quickTimeButtonActive: {
      backgroundColor: NEON,
      borderColor: NEON,
    },
    quickTimeIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    quickTimeText: {
      color: '#6E5F55',
      fontSize: 11,
      fontWeight: '900',
    },
    quickTimeTextActive: {
      color: '#10230F',
    },
    reminderActions: {
      flexDirection: 'row',
      marginTop: 10,
    },
    reminderAction: {
      flex: 1,
      minHeight: 45,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 3,
    },
    reminderCancel: {
      backgroundColor: CARD_2,
      borderColor:
        'rgba(120, 105, 95, 0.22)',
    },
    reminderDisable: {
      backgroundColor:
        'rgba(251, 113, 133, 0.09)',
      borderColor:
        'rgba(251, 113, 133, 0.28)',
    },
    reminderSave: {
      backgroundColor: NEON,
      borderColor: NEON,
    },
    reminderCancelText: {
      color: '#5F544D',
      fontSize: 11,
      fontWeight: '900',
    },
    reminderDisableText: {
      color: RED,
      fontSize: 11,
      fontWeight: '900',
    },
    reminderSaveText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '900',
    },
  });

export default SettingsScreen;
