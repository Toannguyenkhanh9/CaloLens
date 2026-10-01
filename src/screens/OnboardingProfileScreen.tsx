// FILE: src/screens/OnboardingProfileScreen.tsx
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  NativeModules,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import AsyncStorage
  from '@react-native-async-storage/async-storage';
import {
  useTranslation,
} from 'react-i18next';

import i18n, {
  LANG_KEY,
} from '../i18n';
import '../i18n/caloLensOnboardingTranslations';
import {
  markOnboardingCompleted,
  USER_PROFILE_KEY,
} from '../store/onboarding';

type Gender =
  | 'male'
  | 'female'
  | 'other';

type Goal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain'
  | 'recomp'
  | 'endurance'
  | 'flexibility';

type BmiCategory =
  | 'under'
  | 'normal'
  | 'over'
  | 'obese'
  | '';

type LanguageCode =
  | 'en'
  | 'vi'
  | 'es'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'ar'
  | 'hi'
  | 'th'
  | 'id'
  | 'ms'
  | 'fil'
  | 'pt';

type LanguageOption = {
  code: LanguageCode;
  label: string;
  flag: string;
};

export type UserProfile = {
  name: string;
  gender?: Gender;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  healthNote?: string;
  injured?: boolean;
  injuryNote?: string;
  goal?: Goal;
};

const STORAGE_KEY =
  USER_PROFILE_KEY;
const BMI_KEY =
  'user:bmi';
const RECO_KEY =
  'user:recommendation';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const SOFT = '#FFF2E8';
const TEXT = '#21170F';
const MUTED = '#78695F';
const GREEN = '#FF6A21';
const TEAL = '#F29132';
const BORDER = '#F1D9C8';
const WARNING = '#F5A623';

const SUPPORTED_LANGUAGES:
LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    flag: '🇻🇳',
  },
  {
    code: 'es',
    label: 'Español',
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    label: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: '🇩🇪',
  },
  {
    code: 'zh',
    label: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'ja',
    label: '日本語',
    flag: '🇯🇵',
  },
  {
    code: 'ko',
    label: '한국어',
    flag: '🇰🇷',
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: '🇷🇺',
  },
  {
    code: 'ar',
    label: 'العربية',
    flag: '🇸🇦',
  },
  {
    code: 'hi',
    label: 'हिन्दी',
    flag: '🇮🇳',
  },
  {
    code: 'th',
    label: 'ไทย',
    flag: '🇹🇭',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    flag: '🇮🇩',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    flag: '🇲🇾',
  },
  {
    code: 'fil',
    label: 'Filipino',
    flag: '🇵🇭',
  },
  {
    code: 'pt',
    label: 'Português',
    flag: '🇵🇹',
  },
];

const goalIcons:
Record<Goal, string> = {
  lose_weight: '↓',
  build_muscle: '💪',
  maintain: '⚖️',
  recomp: '◐',
  endurance: '⚡',
  flexibility: '🧘',
};

const parseNumber = (
  value: string,
) => {
  const parsed =
    Number(
      value
        .replace(',', '.')
        .replace(
          /[^0-9.]/g,
          '',
        ),
    );

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : undefined;
};

const normalizeLanguage = (
  rawLanguage?: string | null,
): LanguageCode => {
  const normalized =
    String(
      rawLanguage || '',
    )
      .trim()
      .toLowerCase()
      .replace('_', '-');

  const base =
    normalized
      .split('-')[0];

  if (
    base === 'tl' ||
    base === 'fil'
  ) {
    return 'fil';
  }

  const supported =
    SUPPORTED_LANGUAGES
      .some(
        item =>
          item.code === base,
      );

  return supported
    ? base as LanguageCode
    : 'en';
};

const getDeviceLanguage =
  (): LanguageCode => {
    try {
      const iosSettings =
        NativeModules
          .SettingsManager
          ?.settings;

      const iosLanguage =
        iosSettings
          ?.AppleLanguages
          ?.[0] ||
        iosSettings
          ?.AppleLocale;

      const androidLanguage =
        NativeModules
          .I18nManager
          ?.localeIdentifier;

      const intlLanguage =
        Intl
          .DateTimeFormat()
          .resolvedOptions()
          .locale;

      return normalizeLanguage(
        Platform.OS === 'ios'
          ? iosLanguage ||
            intlLanguage
          : androidLanguage ||
            intlLanguage,
      );
    } catch (error) {
      console.log(
        '[CaloLens] detect device language error',
        error,
      );

      return 'en';
    }
  };

export default function OnboardingProfileScreen({
  onDone,
}: {
  onDone?: () => void;
}) {
  const {t} =
    useTranslation();

  const [
    languageReady,
    setLanguageReady,
  ] =
    useState(false);

  const [
    selectedLanguage,
    setSelectedLanguage,
  ] =
    useState<LanguageCode>(
      'en',
    );

  const [
    showLanguagePicker,
    setShowLanguagePicker,
  ] =
    useState(false);

  const [
    step,
    setStep,
  ] =
    useState<1 | 2 | 3>(
      1,
    );

  const [
    data,
    setData,
  ] =
    useState<UserProfile>({
      name: '',
      injured: false,
    });

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    showResult,
    setShowResult,
  ] =
    useState(false);

  const [
    bmiValue,
    setBmiValue,
  ] =
    useState<number | null>(
      null,
    );

  const [
    bmiLabel,
    setBmiLabel,
  ] =
    useState('');

  const [
    advice,
    setAdvice,
  ] =
    useState('');

  useEffect(() => {
    let mounted = true;

    const restoreLanguage =
      async () => {
        try {
          const saved =
            await AsyncStorage
              .getItem(
                LANG_KEY,
              );

          const language =
            saved
              ? normalizeLanguage(
                  saved,
                )
              : getDeviceLanguage();

          setSelectedLanguage(
            language,
          );

          if (!saved) {
            await AsyncStorage
              .setItem(
                LANG_KEY,
                language,
              );
          }

          if (
            normalizeLanguage(
              i18n.resolvedLanguage ||
              i18n.language,
            ) !== language
          ) {
            await i18n
              .changeLanguage(
                language,
              );
          }

          console.log(
            '[CaloLens] onboarding language',
            i18n.resolvedLanguage ||
              i18n.language,
          );
        } catch (error) {
          console.log(
            '[CaloLens] restore language error',
            error,
          );
        } finally {
          if (mounted) {
            setLanguageReady(
              true,
            );
          }
        }
      };

    restoreLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  const setField = <
    K extends keyof UserProfile,
  >(
    key: K,
    value: UserProfile[K],
  ) => {
    setData(current => ({
      ...current,
      [key]: value,
    }));
  };

  const currentLanguage =
    SUPPORTED_LANGUAGES
      .find(
        item =>
          item.code ===
          selectedLanguage,
      ) ||
    SUPPORTED_LANGUAGES[0];

  const changeLanguage =
    async (
      language: LanguageCode,
    ) => {
      try {
        setSelectedLanguage(
          language,
        );

        await AsyncStorage
          .setItem(
            LANG_KEY,
            language,
          );

        await i18n
          .changeLanguage(
            language,
          );

        setShowLanguagePicker(
          false,
        );

        console.log(
          '[CaloLens] language changed',
          language,
        );
      } catch (error) {
        console.log(
          '[CaloLens] change language error',
          error,
        );
      }
    };

  const basicOk =
    data.name
      .trim()
      .length >= 2 &&
    Boolean(data.gender) &&
    Boolean(
      data.age &&
      data.age >= 13 &&
      data.age <= 100,
    );

  const metricOk =
    Boolean(
      data.heightCm &&
      data.heightCm >= 100 &&
      data.heightCm <= 250,
    ) &&
    Boolean(
      data.weightKg &&
      data.weightKg >= 25 &&
      data.weightKg <= 400,
    );

  const allOk =
    basicOk &&
    metricOk &&
    Boolean(data.goal);

  const stepMeta =
    useMemo(() => {
      if (step === 1) {
        return {
          icon: '👤',
          title: t(
            'caloLensOnboarding.step1Title',
            'About you',
          ),
          subtitle: t(
            'caloLensOnboarding.step1Subtitle',
            'Basic details help personalize your daily nutrition target.',
          ),
        };
      }

      if (step === 2) {
        return {
          icon: '📏',
          title: t(
            'caloLensOnboarding.step2Title',
            'Body measurements',
          ),
          subtitle: t(
            'caloLensOnboarding.step2Subtitle',
            'Height and weight are used to estimate calories and BMI.',
          ),
        };
      }

      return {
        icon: '🎯',
        title: t(
          'caloLensOnboarding.step3Title',
          'Choose your goal',
        ),
        subtitle: t(
          'caloLensOnboarding.step3Subtitle',
          'Your goal changes the calorie and macro guidance shown in CaloLens.',
        ),
      };
    }, [
      step,
      t,
    ]);

  const bmiCategory = (
    heightCm?: number,
    weightKg?: number,
  ) => {
    if (
      !heightCm ||
      !weightKg
    ) {
      return {
        bmi:
          null as number | null,
        key:
          '' as BmiCategory,
      };
    }

    const height =
      heightCm / 100;

    const bmi =
      +(
        weightKg /
        (
          height *
          height
        )
      ).toFixed(1);

    let key:
      Exclude<
        BmiCategory,
        ''
      > = 'normal';

    if (bmi < 18.5) {
      key = 'under';
    } else if (bmi < 25) {
      key = 'normal';
    } else if (bmi < 30) {
      key = 'over';
    } else {
      key = 'obese';
    }

    return {
      bmi,
      key,
    };
  };

  const getBmiLabel = (
    category: BmiCategory,
  ) => {
    if (!category) {
      return '';
    }

    const labels = {
      under: t(
        'onboard.bmi_label_under',
        'Underweight',
      ),
      normal: t(
        'onboard.bmi_label_normal',
        'Healthy range',
      ),
      over: t(
        'onboard.bmi_label_over',
        'Overweight',
      ),
      obese: t(
        'onboard.bmi_label_obese',
        'High BMI',
      ),
    };

    return labels[category];
  };

  const buildAdvice = (
    bmi: number | null,
    category: BmiCategory,
    profile: UserProfile,
  ) => {
    const lines: string[] = [];

    if (bmi !== null) {
      lines.push(
        t(
          'caloLensOnboarding.adviceIntro',
          {
            bmi,
            label:
              getBmiLabel(
                category,
              ),
            defaultValue:
              'Your estimated BMI is {{bmi}} ({{label}}).',
          },
        ),
      );
    }

    const bmiAdvice:
      Partial<
        Record<
          Exclude<
            BmiCategory,
            ''
          >,
          string
        >
      > = {
      under: t(
        'caloLensOnboarding.adviceUnder',
        'A gradual calorie surplus with enough protein may support healthy weight gain.',
      ),
      normal: t(
        'caloLensOnboarding.adviceNormal',
        'Focus on consistent meals, protein, fiber and hydration.',
      ),
      over: t(
        'caloLensOnboarding.adviceOver',
        'A moderate calorie deficit and regular meal tracking may support fat loss.',
      ),
      obese: t(
        'caloLensOnboarding.adviceObese',
        'Start with realistic nutrition changes and consider professional guidance.',
      ),
    };

    if (category) {
      lines.push(
        bmiAdvice[
          category
        ] || '',
      );
    }

    if (profile.goal) {
      const goalAdvice:
        Record<
          Goal,
          string
        > = {
        lose_weight: t(
          'caloLensOnboarding.goalAdviceLose',
          'CaloLens will prioritize a controlled calorie deficit and adequate protein.',
        ),
        build_muscle: t(
          'caloLensOnboarding.goalAdviceMuscle',
          'CaloLens will emphasize protein and enough calories to support muscle growth.',
        ),
        maintain: t(
          'caloLensOnboarding.goalAdviceMaintain',
          'CaloLens will aim for stable calories and balanced macros.',
        ),
        recomp: t(
          'caloLensOnboarding.goalAdviceRecomp',
          'CaloLens will emphasize protein and a controlled calorie target for body recomposition.',
        ),
        endurance: t(
          'caloLensOnboarding.goalAdviceEndurance',
          'CaloLens will keep sufficient carbohydrates and hydration in your daily plan.',
        ),
        flexibility: t(
          'caloLensOnboarding.goalAdviceWellness',
          'CaloLens will focus on balanced nutrition that supports recovery and daily movement.',
        ),
      };

      lines.push(
        goalAdvice[
          profile.goal
        ],
      );
    }

    if (profile.injured) {
      lines.push(
        t(
          'caloLensOnboarding.adviceInjury',
          'Nutrition guidance does not replace medical advice for an injury.',
        ),
      );
    }

    return lines
      .filter(Boolean)
      .join('\n\n');
  };

  const save =
    async () => {
      if (
        !allOk ||
        saving
      ) {
        return;
      }

      try {
        setSaving(true);

        await AsyncStorage
          .setItem(
            STORAGE_KEY,
            JSON.stringify(data),
          );

        const {
          bmi,
          key,
        } =
          bmiCategory(
            data.heightCm,
            data.weightKg,
          );

        const recommendation =
          buildAdvice(
            bmi,
            key,
            data,
          );

        setBmiValue(bmi);
        setBmiLabel(
          getBmiLabel(key),
        );
        setAdvice(
          recommendation,
        );

        if (bmi !== null) {
          await AsyncStorage
            .setItem(
              BMI_KEY,
              String(bmi),
            );
        }

        await AsyncStorage
          .setItem(
            RECO_KEY,
            recommendation,
          );

        await markOnboardingCompleted();

        console.log(
          '[CaloLens] onboarding saved',
          {
            completed: true,
          },
        );

        setShowResult(true);
      } catch (error) {
        console.log(
          '[CaloLens] onboarding save error',
          error,
        );
      } finally {
        setSaving(false);
      }
    };

  const finishAndEnterApp =
    () => {
      setShowResult(false);
      onDone?.();

      void markOnboardingCompleted()
        .catch(error => {
          console.log(
            '[CaloLens] finish onboarding error',
            error,
          );
        });
    };

  if (!languageReady) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BG}
        />

      <HeroFoodCornerAccent />

        <View style={styles.loading}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>
              ◉
            </Text>
          </View>

          <ActivityIndicator
            size="large"
            color={GREEN}
          />

          <Text style={styles.loadingText}>
            {t(
              'UserProfile.loading',
              'Loading…',
            )}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
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
        style={styles.glowBottom}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoMarkSmall}>
              <Text style={styles.logoMarkSmallText}>
                ◉
              </Text>
            </View>

            <View style={styles.brandText}>
              <Text style={styles.brandName}>
                CaloLens
              </Text>

              <Text style={styles.brandCaption}>
                {t(
                  'caloLensOnboarding.brandCaption',
                  'AI nutrition companion',
                )}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.84}
                style={styles.languageButton}
                onPress={() =>
                  setShowLanguagePicker(
                    true,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={t(
                  'caloLensOnboarding.chooseLanguage',
                  'Choose language',
                )}
              >
                <Text style={styles.languageButtonFlag}>
                  {currentLanguage.flag}
                </Text>

                <Text style={styles.languageButtonCode}>
                  {currentLanguage.code
                    .toUpperCase()}
                </Text>

                <Text style={styles.languageButtonChevron}>
                  ▾
                </Text>
              </TouchableOpacity>

              <View style={styles.stepPill}>
                <Text style={styles.stepPillText}>
                  {step}/3
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${step / 3 * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>
                {stepMeta.icon}
              </Text>
            </View>

            <View style={styles.heroText}>
              <Text style={styles.kicker}>
                {t(
                  'caloLensOnboarding.kicker',
                  'PERSONAL SETUP',
                )}
              </Text>

              <Text style={styles.title}>
                {stepMeta.title}
              </Text>

              <Text style={styles.subtitle}>
                {stepMeta.subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {step === 1 ? (
              <>
                <Label>
                  {t(
                    'onboard.name',
                    'Name',
                  )}
                </Label>

                <Input
                  value={data.name}
                  onChangeText={value =>
                    setField(
                      'name',
                      value,
                    )
                  }
                  placeholder={t(
                    'caloLensOnboarding.namePlaceholder',
                    'How should we call you?',
                  )}
                  autoCapitalize="words"
                />

                <Label>
                  {t(
                    'onboard.gender',
                    'Gender',
                  )}
                </Label>

                <Segment
                  value={data.gender}
                  options={[
                    {
                      key: 'male',
                      label: t(
                        'onboard.gender_male',
                        'Male',
                      ),
                    },
                    {
                      key: 'female',
                      label: t(
                        'onboard.gender_female',
                        'Female',
                      ),
                    },
                    {
                      key: 'other',
                      label: t(
                        'onboard.gender_other',
                        'Other',
                      ),
                    },
                  ]}
                  onChange={value =>
                    setField(
                      'gender',
                      value as Gender,
                    )
                  }
                />

                <Label>
                  {t(
                    'onboard.age',
                    'Age',
                  )}
                </Label>

                <Input
                  value={
                    data.age
                      ? String(
                          data.age,
                        )
                      : ''
                  }
                  onChangeText={value =>
                    setField(
                      'age',
                      value
                        ? Math.round(
                            parseNumber(
                              value,
                            ) || 0,
                          ) ||
                          undefined
                        : undefined,
                    )
                  }
                  placeholder={t(
                    'caloLensOnboarding.agePlaceholder',
                    'e.g. 28',
                  )}
                  keyboardType="number-pad"
                />

                <View style={styles.optionalRow}>
                  <Label noMargin>
                    {t(
                      'caloLensOnboarding.healthNote',
                      'Health note',
                    )}
                  </Label>

                  <Text style={styles.optionalText}>
                    {t(
                      'caloLensOnboarding.optional',
                      'Optional',
                    )}
                  </Text>
                </View>

                <Input
                  value={
                    data.healthNote ||
                    ''
                  }
                  onChangeText={value =>
                    setField(
                      'healthNote',
                      value,
                    )
                  }
                  placeholder={t(
                    'caloLensOnboarding.healthPlaceholder',
                    'Anything that may affect your nutrition plan',
                  )}
                  multiline
                  style={styles.multiline}
                />

                <View style={styles.privacyCard}>
                  <Text style={styles.privacyIcon}>
                    🔒
                  </Text>

                  <Text style={styles.privacyText}>
                    {t(
                      'caloLensOnboarding.localNote',
                      'Your profile is stored locally on this device.',
                    )}
                  </Text>
                </View>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <View style={styles.metricRow}>
                  <View style={styles.metricCol}>
                    <Label>
                      {t(
                        'UserProfile.height_label',
                        'Height (cm)',
                      )}
                    </Label>

                    <Input
                      value={
                        data.heightCm
                          ? String(
                              data.heightCm,
                            )
                          : ''
                      }
                      onChangeText={value =>
                        setField(
                          'heightCm',
                          value
                            ? parseNumber(
                                value,
                              )
                            : undefined,
                        )
                      }
                      placeholder="170"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View style={styles.metricGap} />

                  <View style={styles.metricCol}>
                    <Label>
                      {t(
                        'UserProfile.weight_label',
                        'Weight (kg)',
                      )}
                    </Label>

                    <Input
                      value={
                        data.weightKg
                          ? String(
                              data.weightKg,
                            )
                          : ''
                      }
                      onChangeText={value =>
                        setField(
                          'weightKg',
                          value
                            ? parseNumber(
                                value,
                              )
                            : undefined,
                        )
                      }
                      placeholder="65.5"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.infoIconText}>
                      ✦
                    </Text>
                  </View>

                  <View style={styles.infoText}>
                    <Text style={styles.infoTitle}>
                      {t(
                        'caloLensOnboarding.measurementTitle',
                        'Used for your daily targets',
                      )}
                    </Text>

                    <Text style={styles.infoBody}>
                      {t(
                        'caloLensOnboarding.measurementBody',
                        'CaloLens uses these measurements to estimate calories, macros and BMI.',
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchText}>
                    <Text style={styles.switchTitle}>
                      {t(
                        'onboard.injured_q',
                        'Do you have an injury?',
                      )}
                    </Text>

                    <Text style={styles.switchHint}>
                      {t(
                        'caloLensOnboarding.injuryHint',
                        'This note helps keep recommendations in context.',
                      )}
                    </Text>
                  </View>

                  <SwitchLike
                    value={
                      Boolean(
                        data.injured,
                      )
                    }
                    onToggle={value =>
                      setField(
                        'injured',
                        value,
                      )
                    }
                  />
                </View>

                {data.injured ? (
                  <>
                    <Label>
                      {t(
                        'onboard.injury_note',
                        'Injury note',
                      )}
                    </Label>

                    <Input
                      value={
                        data.injuryNote ||
                        ''
                      }
                      onChangeText={value =>
                        setField(
                          'injuryNote',
                          value,
                        )
                      }
                      placeholder={t(
                        'caloLensOnboarding.injuryPlaceholder',
                        'Briefly describe the injury',
                      )}
                      multiline
                      style={styles.multiline}
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <GoalGrid
                  value={data.goal}
                  onChange={value =>
                    setField(
                      'goal',
                      value,
                    )
                  }
                  options={[
                    {
                      key:
                        'lose_weight',
                      icon:
                        goalIcons
                          .lose_weight,
                      label: t(
                        'onboard.goals.lose_weight',
                        'Lose weight',
                      ),
                    },
                    {
                      key:
                        'build_muscle',
                      icon:
                        goalIcons
                          .build_muscle,
                      label: t(
                        'onboard.goals.build_muscle',
                        'Build muscle',
                      ),
                    },
                    {
                      key:
                        'maintain',
                      icon:
                        goalIcons
                          .maintain,
                      label: t(
                        'onboard.goals.maintain',
                        'Maintain',
                      ),
                    },
                    {
                      key:
                        'recomp',
                      icon:
                        goalIcons
                          .recomp,
                      label: t(
                        'onboard.goals.recomp',
                        'Body recomposition',
                      ),
                    },
                    {
                      key:
                        'endurance',
                      icon:
                        goalIcons
                          .endurance,
                      label: t(
                        'onboard.goals.endurance',
                        'Endurance',
                      ),
                    },
                    {
                      key:
                        'flexibility',
                      icon:
                        goalIcons
                          .flexibility,
                      label: t(
                        'onboard.goals.flexibility',
                        'General wellness',
                      ),
                    },
                  ]}
                />

                <View style={styles.tipCard}>
                  <View style={styles.tipIcon}>
                    <Text style={styles.tipIconText}>
                      ✦
                    </Text>
                  </View>

                  <View style={styles.tipText}>
                    <Text style={styles.tipTitle}>
                      {t(
                        'caloLensOnboarding.tipTitle',
                        'You can change this later',
                      )}
                    </Text>

                    <Text style={styles.tipBody}>
                      {t(
                        'caloLensOnboarding.tipBody',
                        'Update your profile or calorie target at any time from Settings.',
                      )}
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[
                styles.footerButton,
                styles.backButton,
              ]}
              onPress={() =>
                setStep(current =>
                  current === 3
                    ? 2
                    : 1,
                )
              }
            >
              <Text style={styles.backButtonText}>
                {t(
                  'onboard.back',
                  'Back',
                )}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footerPlaceholder} />
          )}

          {step < 3 ? (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[
                styles.footerButton,
                (
                  step === 1
                    ? basicOk
                    : metricOk
                )
                  ? styles.nextButton
                  : styles.disabledButton,
              ]}
              disabled={
                step === 1
                  ? !basicOk
                  : !metricOk
              }
              onPress={() =>
                setStep(current =>
                  current === 1
                    ? 2
                    : 3,
                )
              }
            >
              <Text
                style={[
                  styles.nextButtonText,
                  !(
                    step === 1
                      ? basicOk
                      : metricOk
                  ) &&
                    styles.disabledText,
                ]}
              >
                {t(
                  'onboard.next',
                  'Next',
                )}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.86}
              style={[
                styles.footerButton,
                allOk
                  ? styles.nextButton
                  : styles.disabledButton,
              ]}
              disabled={
                !allOk ||
                saving
              }
              onPress={save}
            >
              {saving ? (
                <ActivityIndicator
                  color="#10230F"
                />
              ) : (
                <Text
                  style={[
                    styles.nextButtonText,
                    !allOk &&
                      styles.disabledText,
                  ]}
                >
                  {t(
                    'caloLensOnboarding.finish',
                    'Create my plan',
                  )}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={
          showLanguagePicker
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowLanguagePicker(
            false,
          )
        }
      >
        <View style={styles.languageModalWrap}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.languageBackdrop}
            onPress={() =>
              setShowLanguagePicker(
                false,
              )
            }
          />

          <View style={styles.languageModalCard}>
            <View style={styles.languageModalHeader}>
              <View style={styles.languageModalTitleWrap}>
                <Text style={styles.languageModalTitle}>
                  {t(
                    'caloLensOnboarding.chooseLanguage',
                    'Choose language',
                  )}
                </Text>

                <Text style={styles.languageModalSubtitle}>
                  {t(
                    'caloLensOnboarding.languageSubtitle',
                    'The app language changes immediately and is saved for next time.',
                  )}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.languageCloseButton}
                onPress={() =>
                  setShowLanguagePicker(
                    false,
                  )
                }
              >
                <Text style={styles.languageCloseText}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.languageList}
              contentContainerStyle={
                styles.languageListContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {SUPPORTED_LANGUAGES
                .map(item => {
                  const active =
                    item.code ===
                    selectedLanguage;

                  return (
                    <TouchableOpacity
                      key={item.code}
                      activeOpacity={0.84}
                      style={[
                        styles.languageItem,
                        active &&
                          styles.languageItemActive,
                      ]}
                      onPress={() =>
                        void changeLanguage(
                          item.code,
                        )
                      }
                    >
                      <Text style={styles.languageItemFlag}>
                        {item.flag}
                      </Text>

                      <View style={styles.languageItemBody}>
                        <Text
                          style={[
                            styles.languageItemLabel,
                            active &&
                              styles.languageItemLabelActive,
                          ]}
                        >
                          {item.label}
                        </Text>

                        <Text style={styles.languageItemCode}>
                          {item.code
                            .toUpperCase()}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.languageCheck,
                          active &&
                            styles.languageCheckActive,
                        ]}
                      >
                        <Text style={styles.languageCheckText}>
                          {active
                            ? '✓'
                            : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalWrap}>
          <View style={styles.backdrop} />

          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Text style={styles.resultIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.resultKicker}>
              {t(
                'caloLensOnboarding.readyKicker',
                'YOUR PLAN IS READY',
              )}
            </Text>

            <Text style={styles.resultTitle}>
              {t(
                'caloLensOnboarding.readyTitle',
                'Welcome to CaloLens',
              )}
            </Text>

            <Text style={styles.resultSubtitle}>
              {t(
                'caloLensOnboarding.readySubtitle',
                'Your calorie and nutrition guidance can now be calculated from this profile.',
              )}
            </Text>

            <View style={styles.bmiCard}>
              <View>
                <Text style={styles.bmiCaption}>
                  {t(
                    'onboard.bmi',
                    'BMI',
                  )}
                </Text>

                <Text style={styles.bmiNumber}>
                  {bmiValue ??
                    '—'}
                </Text>
              </View>

              <View style={styles.bmiPill}>
                <Text style={styles.bmiPillText}>
                  {bmiLabel ||
                    t(
                      'caloLensOnboarding.estimated',
                      'Estimated',
                    )}
                </Text>
              </View>
            </View>

            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>
                {t(
                  'caloLensOnboarding.startingGuidance',
                  'Starting guidance',
                )}
              </Text>

              <ScrollView
                style={styles.adviceScroll}
                showsVerticalScrollIndicator={
                  false
                }
              >
                <Text style={styles.adviceText}>
                  {advice}
                </Text>
              </ScrollView>
            </View>

            <Text style={styles.disclaimer}>
              {t(
                'caloLensOnboarding.disclaimer',
                'BMI and nutrition targets are estimates for general wellness and are not medical advice.',
              )}
            </Text>

            <TouchableOpacity
              activeOpacity={0.86}
              style={styles.startButton}
              onPress={
                finishAndEnterApp
              }
            >
              <Text style={styles.startButtonText}>
                {t(
                  'caloLensOnboarding.startTracking',
                  'Start tracking',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const Label:
React.FC<{
  children:
    React.ReactNode;
  noMargin?: boolean;
}> = ({
  children,
  noMargin = false,
}) => (
  <Text
    style={[
      styles.label,
      noMargin &&
        styles.labelNoMargin,
    ]}
  >
    {children}
  </Text>
);

const Input:
React.FC<
  React.ComponentProps<
    typeof TextInput
  >
> = props => (
  <TextInput
    {...props}
    placeholderTextColor="#8A948C"
    style={[
      styles.input,
      props.style,
    ]}
  />
);

const Segment:
React.FC<{
  value?: string;
  options:
    Array<{
      key: string;
      label: string;
    }>;
  onChange: (
    value: string,
  ) => void;
}> = ({
  value,
  options,
  onChange,
}) => (
  <View style={styles.segment}>
    {options.map(option => {
      const active =
        value === option.key;

      return (
        <TouchableOpacity
          key={option.key}
          activeOpacity={0.86}
          style={[
            styles.segmentItem,
            active &&
              styles.segmentItemActive,
          ]}
          onPress={() =>
            onChange(
              option.key,
            )
          }
        >
          <Text
            style={[
              styles.segmentText,
              active &&
                styles.segmentTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const GoalGrid:
React.FC<{
  value?: Goal;
  options:
    Array<{
      key: Goal;
      icon: string;
      label: string;
    }>;
  onChange: (
    value: Goal,
  ) => void;
}> = ({
  value,
  options,
  onChange,
}) => (
  <View style={styles.goalGrid}>
    {options.map(option => {
      const active =
        value === option.key;

      return (
        <TouchableOpacity
          key={option.key}
          activeOpacity={0.86}
          style={[
            styles.goalCard,
            active &&
              styles.goalCardActive,
          ]}
          onPress={() =>
            onChange(
              option.key,
            )
          }
        >
          <View
            style={[
              styles.goalIcon,
              active &&
                styles.goalIconActive,
            ]}
          >
            <Text style={styles.goalIconText}>
              {option.icon}
            </Text>
          </View>

          <Text
            style={[
              styles.goalText,
              active &&
                styles.goalTextActive,
            ]}
          >
            {option.label}
          </Text>

          <View
            style={[
              styles.goalCheck,
              active &&
                styles.goalCheckActive,
            ]}
          >
            <Text style={styles.goalCheckText}>
              {active
                ? '✓'
                : ''}
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const SwitchLike:
React.FC<{
  value: boolean;
  onToggle: (
    value: boolean,
  ) => void;
}> = ({
  value,
  onToggle,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={[
      styles.switch,
      value &&
        styles.switchOn,
    ]}
    onPress={() =>
      onToggle(!value)
    }
  >
    <View
      style={[
        styles.switchDot,
        value &&
          styles.switchDotOn,
      ]}
    />
  </TouchableOpacity>
);

const styles =
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    safe: {
      flex: 1,
      backgroundColor: BG,
    },
    glowTop: {
      position: 'absolute',
      top: -100,
      right: -95,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor:
        'rgba(242, 145, 50, 0.08)',
    },
    glowBottom: {
      position: 'absolute',
      bottom: 60,
      left: -125,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor:
        'rgba(255, 106, 33, 0.08)',
    },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoMark: {
      width: 64,
      height: 64,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 106, 33, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.30)',
      marginBottom: 18,
    },
    logoMarkText: {
      color: TEAL,
      fontSize: 32,
      fontWeight: '900',
    },
    loadingText: {
      color: MUTED,
      fontSize: 13,
      fontWeight: '800',
      marginTop: 11,
    },
    header: {
      paddingHorizontal: 13,
      paddingTop: 9,
      paddingBottom: 9,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoMarkSmall: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GREEN,
      shadowColor: GREEN,
      shadowOpacity: 0.18,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 3,
    },
    logoMarkSmallText: {
      color: '#10230F',
      fontSize: 23,
      fontWeight: '900',
    },
    brandText: {
      flex: 1,
      marginLeft: 10,
    },
    brandName: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
    },
    brandCaption: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '800',
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    languageButton: {
      minHeight: 37,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 9,
      borderRadius: 999,
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor: BORDER,
      marginRight: 6,
    },
    languageButtonFlag: {
      fontSize: 15,
      marginRight: 5,
    },
    languageButtonCode: {
      color: TEXT,
      fontSize: 10,
      fontWeight: '900',
    },
    languageButtonChevron: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '900',
      marginLeft: 4,
      marginTop: -2,
    },
    stepPill: {
      minWidth: 48,
      paddingHorizontal: 10,
      paddingVertical: 7,
      alignItems: 'center',
      borderRadius: 999,
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor: BORDER,
    },
    stepPillText: {
      color: TEAL,
      fontSize: 11,
      fontWeight: '900',
    },
    progressTrack: {
      height: 6,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: '#F6E8DC',
      marginTop: 10,
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: GREEN,
    },
    content: {
      paddingHorizontal: 8,
      paddingTop: 6,
      paddingBottom: 28,
    },
    heroCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255, 255, 255, 0.88)',
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        'rgba(242, 145, 50, 0.18)',
      padding: 14,
      marginBottom: 11,
    },
    heroIcon: {
      width: 55,
      height: 55,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255, 106, 33, 0.11)',
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.25)',
      marginRight: 12,
    },
    heroIconText: {
      fontSize: 25,
    },
    heroText: {
      flex: 1,
    },
    kicker: {
      color: TEAL,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: TEXT,
      fontSize: 24,
      lineHeight: 29,
      fontWeight: '900',
      marginTop: 3,
    },
    subtitle: {
      color: MUTED,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    card: {
      backgroundColor: CARD,
      borderRadius: 23,
      padding: 15,
      borderWidth: 1,
      borderColor: BORDER,
      shadowColor: '#C28A66',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    label: {
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
      marginBottom: 7,
    },
    labelNoMargin: {
      marginBottom: 0,
    },
    optionalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 7,
    },
    optionalText: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '800',
    },
    input: {
      minHeight: 49,
      backgroundColor: '#FFFBF7',
      borderRadius: 15,
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: TEXT,
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 12,
    },
    multiline: {
      height: 88,
      textAlignVertical: 'top',
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: '#FFFBF7',
      borderRadius: 15,
      padding: 3,
      borderWidth: 1,
      borderColor: BORDER,
      marginBottom: 12,
    },
    segmentItem: {
      flex: 1,
      minHeight: 39,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    segmentItemActive: {
      backgroundColor: GREEN,
      shadowColor: GREEN,
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 2,
    },
    segmentText: {
      color: MUTED,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
    },
    segmentTextActive: {
      color: '#10230F',
      fontWeight: '900',
    },
    privacyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(242, 145, 50, 0.07)',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        'rgba(242, 145, 50, 0.18)',
      padding: 10,
    },
    privacyIcon: {
      fontSize: 14,
      marginRight: 7,
    },
    privacyText: {
      flex: 1,
      color: MUTED,
      fontSize: 9,
      lineHeight: 14,
    },
    metricRow: {
      flexDirection: 'row',
    },
    metricCol: {
      flex: 1,
    },
    metricGap: {
      width: 10,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(242, 145, 50, 0.07)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        'rgba(242, 145, 50, 0.20)',
      padding: 11,
      marginBottom: 12,
    },
    infoIcon: {
      width: 37,
      height: 37,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(242, 145, 50, 0.11)',
      marginRight: 9,
    },
    infoIconText: {
      color: TEAL,
      fontSize: 17,
      fontWeight: '900',
    },
    infoText: {
      flex: 1,
    },
    infoTitle: {
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
    },
    infoBody: {
      color: MUTED,
      fontSize: 9,
      lineHeight: 14,
      marginTop: 3,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBF7',
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: BORDER,
      marginBottom: 12,
    },
    switchText: {
      flex: 1,
      paddingRight: 10,
    },
    switchTitle: {
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
    },
    switchHint: {
      color: MUTED,
      fontSize: 9,
      lineHeight: 14,
      marginTop: 3,
    },
    switch: {
      width: 52,
      height: 31,
      borderRadius: 999,
      backgroundColor: '#F0D7C5',
      padding: 3,
      justifyContent: 'center',
    },
    switchOn: {
      backgroundColor:
        'rgba(255, 106, 33, 0.40)',
    },
    switchDot: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor: CARD,
      shadowColor: '#69736B',
      shadowOpacity: 0.16,
      shadowRadius: 3,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
      transform: [
        {
          translateX: 0,
        },
      ],
    },
    switchDotOn: {
      backgroundColor: GREEN,
      transform: [
        {
          translateX: 21,
        },
      ],
    },
    goalGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4,
    },
    goalCard: {
      width: '47.8%',
      minHeight: 105,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: BORDER,
      backgroundColor: '#FFFBF7',
      padding: 11,
      marginHorizontal: 4,
      marginBottom: 8,
    },
    goalCardActive: {
      backgroundColor:
        'rgba(255, 106, 33, 0.11)',
      borderColor:
        'rgba(255, 106, 33, 0.42)',
    },
    goalIcon: {
      width: 37,
      height: 37,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CARD,
      borderWidth: 1,
      borderColor: BORDER,
    },
    goalIconActive: {
      backgroundColor: GREEN,
      borderColor: GREEN,
    },
    goalIconText: {
      fontSize: 17,
      fontWeight: '900',
    },
    goalText: {
      color: TEXT,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '900',
      marginTop: 9,
      paddingRight: 18,
    },
    goalTextActive: {
      color: '#E85A18',
    },
    goalCheck: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#CDD8CA',
      backgroundColor: CARD,
    },
    goalCheckActive: {
      borderColor: GREEN,
      backgroundColor: GREEN,
    },
    goalCheckText: {
      color: '#10230F',
      fontSize: 11,
      fontWeight: '900',
    },
    tipCard: {
      flexDirection: 'row',
      marginTop: 7,
      backgroundColor: '#FFF9E8',
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#F0DBA2',
      padding: 12,
    },
    tipIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF0B8',
      marginRight: 9,
    },
    tipIconText: {
      color: WARNING,
      fontSize: 17,
      fontWeight: '900',
    },
    tipText: {
      flex: 1,
    },
    tipTitle: {
      color: '#8B6500',
      fontSize: 11,
      fontWeight: '900',
    },
    tipBody: {
      color: '#5C594E',
      fontSize: 9,
      lineHeight: 15,
      marginTop: 4,
    },
    footer: {
      flexDirection: 'row',
      paddingHorizontal: 13,
      paddingTop: 10,
      paddingBottom: 11,
      backgroundColor:
        'rgba(255, 255, 255, 0.97)',
      borderTopWidth: 1,
      borderTopColor: BORDER,
    },
    footerButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    footerPlaceholder: {
      flex: 1,
    },
    backButton: {
      backgroundColor: CARD,
      borderColor: BORDER,
      marginRight: 5,
    },
    backButtonText: {
      color: TEAL,
      fontSize: 13,
      fontWeight: '900',
    },
    nextButton: {
      backgroundColor: GREEN,
      borderColor: GREEN,
      marginLeft: 5,
      shadowColor: GREEN,
      shadowOpacity: 0.16,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 3,
    },
    nextButtonText: {
      color: '#10230F',
      fontSize: 13,
      fontWeight: '900',
    },
    disabledButton: {
      backgroundColor: '#F6E9DE',
      borderColor: '#DCE4D9',
      marginLeft: 5,
    },
    disabledText: {
      color: '#929C94',
    },
    languageModalWrap: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    languageBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(27, 37, 29, 0.36)',
    },
    languageModalCard: {
      maxHeight: '78%',
      backgroundColor: CARD,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: BORDER,
      paddingTop: 17,
      paddingHorizontal: 14,
      paddingBottom:
        Platform.OS === 'ios'
          ? 27
          : 17,
      shadowColor: '#536056',
      shadowOpacity: 0.20,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: -8,
      },
      elevation: 14,
    },
    languageModalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    languageModalTitleWrap: {
      flex: 1,
      paddingRight: 12,
    },
    languageModalTitle: {
      color: TEXT,
      fontSize: 21,
      lineHeight: 27,
      fontWeight: '900',
    },
    languageModalSubtitle: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 4,
    },
    languageCloseButton: {
      width: 37,
      height: 37,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: SOFT,
      borderWidth: 1,
      borderColor: BORDER,
    },
    languageCloseText: {
      color: TEXT,
      fontSize: 23,
      lineHeight: 25,
      fontWeight: '600',
      marginTop: -2,
    },
    languageList: {
      flexGrow: 0,
    },
    languageListContent: {
      paddingBottom: 3,
    },
    languageItem: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFBF7',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    languageItemActive: {
      backgroundColor:
        'rgba(255, 106, 33, 0.11)',
      borderColor:
        'rgba(255, 106, 33, 0.45)',
    },
    languageItemFlag: {
      width: 32,
      fontSize: 22,
    },
    languageItemBody: {
      flex: 1,
      paddingHorizontal: 8,
    },
    languageItemLabel: {
      color: TEXT,
      fontSize: 13,
      fontWeight: '800',
    },
    languageItemLabelActive: {
      color: '#E85A18',
      fontWeight: '900',
    },
    languageItemCode: {
      color: MUTED,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.8,
      marginTop: 2,
    },
    languageCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#CDD8CA',
      backgroundColor: CARD,
    },
    languageCheckActive: {
      borderColor: GREEN,
      backgroundColor: GREEN,
    },
    languageCheckText: {
      color: '#10230F',
      fontSize: 12,
      fontWeight: '900',
    },
    modalWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(27, 37, 29, 0.34)',
    },
    resultCard: {
      width: '100%',
      maxWidth: 430,
      backgroundColor: CARD,
      borderRadius: 25,
      padding: 18,
      borderWidth: 1,
      borderColor:
        'rgba(255, 106, 33, 0.32)',
      shadowColor: '#536056',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      elevation: 10,
    },
    resultIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GREEN,
      marginBottom: 12,
    },
    resultIconText: {
      color: '#10230F',
      fontSize: 27,
      fontWeight: '900',
    },
    resultKicker: {
      color: TEAL,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1,
    },
    resultTitle: {
      color: TEXT,
      fontSize: 23,
      lineHeight: 28,
      fontWeight: '900',
      marginTop: 4,
    },
    resultSubtitle: {
      color: MUTED,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 6,
    },
    bmiCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: SOFT,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 12,
      marginTop: 13,
    },
    bmiCaption: {
      color: MUTED,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
    },
    bmiNumber: {
      color: GREEN,
      fontSize: 28,
      fontWeight: '900',
      marginTop: 2,
    },
    bmiPill: {
      maxWidth: '58%',
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      backgroundColor:
        'rgba(242, 145, 50, 0.09)',
      borderWidth: 1,
      borderColor:
        'rgba(242, 145, 50, 0.24)',
    },
    bmiPillText: {
      color: TEAL,
      fontSize: 9,
      fontWeight: '900',
      textAlign: 'center',
    },
    adviceCard: {
      marginTop: 11,
      backgroundColor: '#FFFBF7',
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: BORDER,
    },
    adviceTitle: {
      color: TEXT,
      fontSize: 11,
      fontWeight: '900',
      marginBottom: 6,
    },
    adviceScroll: {
      maxHeight: 170,
    },
    adviceText: {
      color: '#5F544D',
      fontSize: 10,
      lineHeight: 16,
    },
    disclaimer: {
      color: MUTED,
      fontSize: 8,
      lineHeight: 13,
      marginTop: 9,
    },
    startButton: {
      minHeight: 51,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: GREEN,
      borderRadius: 999,
      marginTop: 13,
    },
    startButtonText: {
      color: '#10230F',
      fontSize: 14,
      fontWeight: '900',
    },
  });
