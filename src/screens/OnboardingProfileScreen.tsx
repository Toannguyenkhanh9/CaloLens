import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import i18n, { LANG_KEY } from '../i18n';

type Gender = 'male' | 'female' | 'other';

type Goal =
  | 'lose_weight'
  | 'build_muscle'
  | 'maintain'
  | 'recomp'
  | 'endurance'
  | 'flexibility';

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

const STORAGE_KEY = 'user:profile';
const ONBOARD_DONE = 'gymforge:onboarding:done';
const BMI_KEY = 'user:bmi';
const RECO_KEY = 'user:recommendation';

const BG = '#F5F8F2';
const CARD = 'rgba(255, 255, 255, 0.96)';
const CARD_2 = 'rgba(240, 245, 237, 0.96)';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

const ONBOARDING_BACKGROUND = require(
  '../../assets/images/nutrition_hero.png',
);

export default function OnboardingProfileScreen({
  onDone,
}: {
  onDone?: () => void;
}) {
  const { t } = useTranslation();

  const [languageReady, setLanguageReady] =
    useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState<UserProfile>({
    name: '',
    injured: false,
  });
  const [saving, setSaving] = useState(false);

  const [showResult, setShowResult] = useState(false);
  const [bmiValue, setBmiValue] = useState<number | null>(null);
  const [bmiLabel, setBmiLabel] = useState<string>('');
  const [advice, setAdvice] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const restoreLanguage = async () => {
      try {
        const savedLanguage =
          await AsyncStorage.getItem(LANG_KEY);

        if (
          savedLanguage &&
          i18n.language !== savedLanguage
        ) {
          await i18n.changeLanguage(
            savedLanguage,
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
          setLanguageReady(true);
        }
      }
    };

    restoreLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  const setField = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setData((p) => ({
      ...p,
      [k]: v,
    }));

  const basicOk = data.name.trim().length >= 2 && !!data.gender && !!data.age;
  const metricOk = !!data.heightCm && !!data.weightKg;
  const allOk = basicOk && metricOk && !!data.goal;

  function bmiCategory(heightCm?: number, weightKg?: number) {
    if (!heightCm || !weightKg) {
      return {
        bmi: null as number | null,
        key: '' as 'under' | 'normal' | 'over' | 'obese' | '',
      };
    }

    const h = heightCm / 100;
    const bmi = +(weightKg / (h * h)).toFixed(1);

    let key: 'under' | 'normal' | 'over' | 'obese' = 'normal';

    if (bmi < 18.5) key = 'under';
    else if (bmi < 25) key = 'normal';
    else if (bmi < 30) key = 'over';
    else key = 'obese';

    return { bmi, key };
  }

  function buildAdvice(
    bmi: number | null,
    catKey: 'under' | 'normal' | 'over' | 'obese' | '',
    p: UserProfile,
  ) {
    const lines: string[] = [];

    const labelMap: Record<string, string> = {
      under: t('onboard.bmi_label_under'),
      normal: t('onboard.bmi_label_normal'),
      over: t('onboard.bmi_label_over'),
      obese: t('onboard.bmi_label_obese'),
    };

    const label = catKey ? labelMap[catKey] : '';

    if (bmi !== null) {
      lines.push(t('onboard.advice_intro', { bmi, label }));
    }

    if (catKey === 'under') lines.push(t('onboard.advice_bmi_under'));
    if (catKey === 'normal') lines.push(t('onboard.advice_bmi_normal'));
    if (catKey === 'over') lines.push(t('onboard.advice_bmi_over'));
    if (catKey === 'obese') lines.push(t('onboard.advice_bmi_obese'));

    if (p.goal) {
      const mapGoal: Record<string, string> = {
        lose_weight: t('onboard.advice_goal_lose_weight'),
        build_muscle: t('onboard.advice_goal_build_muscle'),
        maintain: t('onboard.advice_goal_maintain'),
        recomp: t('onboard.advice_goal_recomp'),
        endurance: t('onboard.advice_goal_endurance'),
        flexibility: t('onboard.advice_goal_flexibility'),
      };

      lines.push(mapGoal[p.goal]);
    }

    if (p.injured) {
      lines.push(t('onboard.advice_injured'));
    }

    if (p.healthNote?.trim()) {
      lines.push(t('onboard.advice_healthnote'));
    }

    return lines.join('\n');
  }

  const save = async () => {
    if (!allOk || saving) return;

    try {
      setSaving(true);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      const { bmi, key } = bmiCategory(data.heightCm, data.weightKg);
      const adv = buildAdvice(bmi, key, data);

      setBmiValue(bmi);
      setBmiLabel(
        key
          ? {
              under: t('onboard.bmi_label_under'),
              normal: t('onboard.bmi_label_normal'),
              over: t('onboard.bmi_label_over'),
              obese: t('onboard.bmi_label_obese'),
            }[key]
          : '',
      );

      setAdvice(adv);

      if (bmi !== null) {
        await AsyncStorage.setItem(BMI_KEY, String(bmi));
      }

      await AsyncStorage.setItem(RECO_KEY, adv);

      setShowResult(true);
    } finally {
      setSaving(false);
    }
  };

  const finishAndEnterApp = async () => {
    await AsyncStorage.setItem(ONBOARD_DONE, '1');
    onDone?.();
  };

  if (!languageReady) {
    return (
      <SafeAreaView style={s.safe}>
        <ImageBackground
          source={ONBOARDING_BACKGROUND}
          resizeMode="cover"
          style={s.background}
          imageStyle={s.backgroundImage}
        >
          <View
            pointerEvents="none"
            style={s.backgroundOverlay}
          />

          <View style={s.languageLoading}>
            <ActivityIndicator
              size="large"
              color={NEON}
            />

            <Text style={s.languageLoadingText}>
              {t(
                'UserProfile.loading',
                'Loading…',
              )}
            </Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ImageBackground
        source={ONBOARDING_BACKGROUND}
        resizeMode="cover"
        style={s.background}
        imageStyle={s.backgroundImage}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BG}
        />

        <View
          pointerEvents="none"
          style={s.backgroundOverlay}
        />

        <View pointerEvents="none" style={s.glowTop} />
        <View pointerEvents="none" style={s.glowBottom} />

        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={s.header}>
          <View style={s.kickerPill}>
            <Text style={s.kickerText}>
              {t(
                'UserProfile.title',
                'User Profile',
              ).toUpperCase()}
            </Text>
          </View>

          <Text style={s.title}>
            {t('onboard.title', 'Create your profile')}
          </Text>

          <Text style={s.subtitle}>
            {t(
              'onboard.subtitle',
              'Tell us a little about yourself to personalize your workout plan.',
            )}
          </Text>

          <View style={s.steps}>
            <Dot active={step >= 1} />
            <Dot active={step >= 2} />
            <Dot active={step >= 3} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.formCard}>
            {step === 1 ? (
              <View>
                <Text style={s.stepTitle}>
                  {t(
                    'UserProfile.title',
                    'User Profile',
                  )}
                </Text>

                <Label>{t('onboard.name')}</Label>
                <Input
                  placeholder=""
                  value={data.name}
                  onChangeText={(v) => setField('name', v)}
                />

                <View style={s.row}>
                  <View style={s.col}>
                    <Label>{t('onboard.age')}</Label>
                    <Input
                      placeholder=""
                      keyboardType="number-pad"
                      value={data.age ? String(data.age) : ''}
                      onChangeText={(v) =>
                        setField(
                          'age',
                          v ? parseInt(v, 10) || undefined : undefined,
                        )
                      }
                    />
                  </View>

                  <View style={s.col}>
                    <Label>{t('onboard.gender')}</Label>
                    <Segment
                      value={data.gender}
                      options={[
                        { key: 'male', label: t('onboard.gender_male') },
                        { key: 'female', label: t('onboard.gender_female') },
                        { key: 'other', label: t('onboard.gender_other') },
                      ]}
                      onChange={(g) => setField('gender', g as Gender)}
                    />
                  </View>
                </View>

                <Label>{t('onboard.health')}</Label>
                <Input
                  placeholder=""
                  value={data.healthNote || ''}
                  onChangeText={(v) => setField('healthNote', v)}
                  multiline
                  style={{ height: 96, textAlignVertical: 'top' }}
                />
              </View>
            ) : null}

            {step === 2 ? (
              <View>
                <Text style={s.stepTitle}>
                  {`${t(
                    'UserProfile.height_label',
                    'Height (cm)',
                  )} • ${t(
                    'UserProfile.weight_label',
                    'Weight (kg)',
                  )}`}
                </Text>

                <View style={s.row}>
                  <View style={s.col}>
                    <Label>{t('onboard.height')}</Label>
                    <Input
                      placeholder={t(
                        'UserProfile.height_ph',
                        'e.g. 170',
                      )}
                      keyboardType="number-pad"
                      value={data.heightCm ? String(data.heightCm) : ''}
                      onChangeText={(v) =>
                        setField(
                          'heightCm',
                          v ? parseFloat(v) || undefined : undefined,
                        )
                      }
                    />
                  </View>

                  <View style={s.col}>
                    <Label>{t('onboard.weight')}</Label>
                    <Input
                      placeholder={t(
                        'UserProfile.weight_ph',
                        'e.g. 65.5',
                      )}
                      keyboardType="decimal-pad"
                      value={data.weightKg ? String(data.weightKg) : ''}
                      onChangeText={(v) =>
                        setField(
                          'weightKg',
                          v ? parseFloat(v) || undefined : undefined,
                        )
                      }
                    />
                  </View>
                </View>

                <View style={s.switchRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.label}>{t('onboard.injured_q')}</Text>
                    <Text style={s.smallHint}>
                      {t(
                        'onboard.injuredHint',
                        'We will adjust recommendations if you have injuries.',
                      )}
                    </Text>
                  </View>

                  <SwitchLike
                    value={!!data.injured}
                    onToggle={(v) => setField('injured', v)}
                  />
                </View>

                {data.injured ? (
                  <>
                    <Label>{t('onboard.injury_note')}</Label>
                    <Input
                      placeholder=""
                      value={data.injuryNote || ''}
                      onChangeText={(v) => setField('injuryNote', v)}
                      multiline
                      style={{ height: 96, textAlignVertical: 'top' }}
                    />
                  </>
                ) : null}
              </View>
            ) : null}

            {step === 3 ? (
              <View>
                <Text style={s.stepTitle}>
                  {t(
                    'onboard.goal',
                    'Current goal',
                  )}
                </Text>

                <Label>{t('onboard.goal')}</Label>

                <ChipGroup
                  value={data.goal}
                  onChange={(g) => setField('goal', g as Goal)}
                  options={[
                    {
                      key: 'lose_weight',
                      label: t('onboard.goals.lose_weight'),
                    },
                    {
                      key: 'build_muscle',
                      label: t('onboard.goals.build_muscle'),
                    },
                    {
                      key: 'maintain',
                      label: t('onboard.goals.maintain'),
                    },
                    {
                      key: 'recomp',
                      label: t('onboard.goals.recomp'),
                    },
                    {
                      key: 'endurance',
                      label: t('onboard.goals.endurance'),
                    },
                    {
                      key: 'flexibility',
                      label: t('onboard.goals.flexibility'),
                    },
                  ]}
                />

                <TipCard />
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={s.footer}>
          {step > 1 ? (
            <TouchableOpacity
              style={[s.footBtn, s.ghost]}
              onPress={() => setStep((x) => (x === 3 ? 2 : 1))}
              activeOpacity={0.86}
            >
              <Text style={[s.footTxt, s.ghostTxt]}>
                {t('onboard.back')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {step < 3 ? (
            <TouchableOpacity
              style={[
                s.footBtn,
                (step === 1 && basicOk) || (step === 2 && metricOk)
                  ? s.primary
                  : s.disabled,
              ]}
              onPress={() => setStep((x) => (x === 1 ? 2 : 3))}
              disabled={(step === 1 && !basicOk) || (step === 2 && !metricOk)}
              activeOpacity={0.86}
            >
              <Text
                style={[
                  s.footTxt,
                  {
                    color:
                      (step === 1 && basicOk) || (step === 2 && metricOk)
                        ? BG
                        : MUTED,
                  },
                ]}
              >
                {t('onboard.next')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.footBtn, allOk ? s.primary : s.disabled]}
              onPress={save}
              disabled={!allOk || saving}
              activeOpacity={0.86}
            >
              <Text
                style={[
                  s.footTxt,
                  {
                    color: allOk ? BG : MUTED,
                  },
                ]}
              >
                {saving ? t('onboard.saving') : t('onboard.finish')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showResult}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResult(false)}
      >
        <View style={s.modalWrap}>
          <View style={s.backdrop} />

          <View style={s.resultCard}>
            <View style={s.resultIcon}>
              <Text style={s.resultIconText}>📊</Text>
            </View>

            <Text style={s.resultTitle}>
              {t('onboard.bmi_result_title')}
            </Text>

            <Text style={s.resultBMI}>
              {t('onboard.bmi', 'BMI')}: {bmiValue ?? '—'} {bmiLabel ? `(${bmiLabel})` : ''}
            </Text>

            <View style={s.adviceBox}>
              <Text style={s.adviceText}>{advice}</Text>
            </View>

            <TouchableOpacity
              style={s.modalBtn}
              onPress={finishAndEnterApp}
              activeOpacity={0.86}
            >
              <Text style={s.modalBtnText}>
                {t('onboard.start_training', 'Start training')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={s.label}>{children}</Text>
);

const Input: React.FC<React.ComponentProps<typeof TextInput>> = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="rgba(109, 120, 111, 0.68)"
    style={[s.input, props.style]}
  />
);

const Segment: React.FC<{
  value?: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <View style={s.segmentWrap}>
    {options.map((o) => {
      const active = value === o.key;

      return (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[s.segmentItem, active && s.segmentActive]}
          activeOpacity={0.86}
        >
          <Text style={[s.segmentText, active && s.segmentTextActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const ChipGroup: React.FC<{
  value?: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <View style={s.chips}>
    {options.map((o) => {
      const active = value === o.key;

      return (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[s.chip, active && s.chipActive]}
          activeOpacity={0.86}
        >
          <Text style={[s.chipTxt, active && s.chipTxtActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const SwitchLike: React.FC<{
  value: boolean;
  onToggle: (v: boolean) => void;
}> = ({ value, onToggle }) => (
  <TouchableOpacity
    onPress={() => onToggle(!value)}
    style={[s.switch, value && s.switchOn]}
    activeOpacity={0.85}
  >
    <View style={[s.switchDot, value && s.switchDotOn]} />
  </TouchableOpacity>
);

const TipCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={s.tip}>
      <View style={s.tipIcon}>
        <Text style={s.tipIconText}>💡</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.tipTitle}>{t('onboard.tip_title')}</Text>
        <Text style={s.tipTxt}>{t('onboard.tip_1')}</Text>
        <Text style={s.tipTxt}>{t('onboard.tip_2')}</Text>
      </View>
    </View>
  );
};

function Dot({ active }: { active: boolean }) {
  return <View style={[s.dot, active && s.dotActive]} />;
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.88,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 251, 246, 0.66)',
  },
  languageLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageLoadingText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(24, 163, 155, 0.11)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 201, 52, 0.08)',
  },

  header: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 8,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.45)',
    backgroundColor: 'rgba(24, 163, 155, 0.10)',
    marginBottom: 14,
  },
  kickerText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: TEXT,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    color: '#455047',
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  steps: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 16,
  },
  dot: {
    width: 30,
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(109, 120, 111, 0.26)',
  },
  dotActive: {
    backgroundColor: NEON,
  },

  body: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 26,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.26)',
    shadowColor: '#18A39B',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  stepTitle: {
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },

  label: {
    color: '#526057',
    fontWeight: '900',
    marginBottom: 7,
    fontSize: 13,
  },
  smallHint: {
    color: MUTED,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.20)',
    paddingHorizontal: 13,
    paddingVertical: 11,
    color: TEXT,
    fontSize: 14,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },

  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 15,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.20)',
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: NEON,
  },
  segmentText: {
    color: MUTED,
    fontWeight: '800',
    fontSize: 12,
  },
  segmentTextActive: {
    color: '#10230F',
    fontWeight: '900',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.18)',
    marginBottom: 12,
    marginTop: 4,
  },

  switch: {
    width: 54,
    height: 32,
    borderRadius: 999,
    backgroundColor: 'rgba(109, 120, 111, 0.26)',
    padding: 3,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: 'rgba(99, 201, 52, 0.36)',
  },
  switchDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#455047',
    transform: [{ translateX: 0 }],
  },
  switchDotOn: {
    backgroundColor: NEON,
    transform: [{ translateX: 22 }],
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.20)',
  },
  chipActive: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  chipTxt: {
    color: '#526057',
    fontWeight: '800',
  },
  chipTxtActive: {
    color: '#10230F',
    fontWeight: '900',
  },

  tip: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'rgba(24, 163, 155, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.24)',
    padding: 13,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24, 163, 155, 0.11)',
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.30)',
    marginRight: 11,
  },
  tipIconText: {
    fontSize: 21,
  },
  tipTitle: {
    color: TEXT,
    fontWeight: '900',
    marginBottom: 6,
  },
  tipTxt: {
    color: MUTED,
    marginTop: 3,
    lineHeight: 19,
  },

  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(24, 163, 155, 0.11)',
  },
  footBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  disabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(109, 120, 111, 0.18)',
  },
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: 'rgba(24, 163, 155, 0.30)',
  },
  footTxt: {
    fontWeight: '900',
    fontSize: 14,
  },
  ghostTxt: {
    color: CYAN,
  },

  modalWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },
  resultCard: {
    width: '88%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.34)',
  },
  resultIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(99, 201, 52, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resultIconText: {
    fontSize: 28,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT,
  },
  resultBMI: {
    marginTop: 7,
    color: NEON,
    fontWeight: '900',
  },
  adviceBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.18)',
  },
  adviceText: {
    color: '#455047',
    lineHeight: 21,
  },
  modalBtn: {
    marginTop: 14,
    alignSelf: 'stretch',
    backgroundColor: NEON,
    borderColor: NEON,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 13,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#10230F',
    fontWeight: '900',
    fontSize: 15,
  },
});