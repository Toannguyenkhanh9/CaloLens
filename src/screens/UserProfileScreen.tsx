// FILE: src/screens/UserProfileScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

type Gender = 'male' | 'female' | 'other';

type UserProfile = {
  name: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  healthNote?: string;
  injured?: boolean;
  injuryNote?: string;
};

const STORAGE_KEY = 'user:profile';
const RECO_KEY = 'user:recommendation';
const BMI_KEY = 'user:bmi';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const CARD_2 = '#F0F5ED';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

const enUserProfile = {
  UserProfile: {
    title: 'User Profile',
    subtitle: 'Enter your information to calculate personalized calorie and nutrition targets',

    name_label: 'Full name *',
    name_ph: 'e.g., John Doe',

    age_label: 'Age',
    age_ph: 'e.g., 28',

    gender_label: 'Gender',
    gender_male: 'Male',
    gender_female: 'Female',
    gender_other: 'Other',

    height_label: 'Height (cm)',
    height_ph: 'e.g., 170',

    weight_label: 'Weight (kg)',
    weight_ph: 'e.g., 65',

    bmi: 'BMI',
    bmi_label_under: 'Underweight',
    bmi_label_normal: 'Normal',
    bmi_label_over: 'Overweight',
    bmi_label_obese: 'Obese',

    health_label: 'Health status',
    health_ph:
      'e.g., Blood pressure stable, sleeping well, just returning to training…',

    injured_q: 'Any injuries?',
    injury_label: 'Injury details',
    injury_ph:
      'e.g., Left knee pain, avoid deep squats; shoulder pain when pressing…',

    hint_fill_hw: 'Enter height & weight to get suggestions.',
    rec_injured:
      'Nutrition guidance: prioritize balanced meals, adequate protein and recovery-friendly calories.',
    rec_overweight:
      'Nutrition guidance: use a moderate calorie deficit, high protein and consistent meal tracking.',
    rec_general:
      'Nutrition guidance: maintain balanced calories, protein, fiber and hydration.',

    loading: 'Loading…',
    save_success_title: 'Saved',
    save_error_title: 'Error',
    save_error_msg: "Couldn't save your data. Please try again.",

    btn_delete: 'Delete',
    btn_save: 'Save',
  },
};

try {
  i18n.addResourceBundle('en', 'translation', enUserProfile, true, true);
} catch {
  // no-op
}

export const UserProfileScreen: React.FC<any> = ({ navigation }) => {
  const { t } = useTranslation();

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: undefined,
    gender: undefined,
    heightCm: undefined,
    weightKg: undefined,
    healthNote: '',
    injured: false,
    injuryNote: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);

        if (json) {
          setProfile(JSON.parse(json));
        }
      } catch {}

      setLoading(false);
    })();
  }, []);

  const setField = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    setProfile((p) => ({
      ...p,
      [k]: v,
    }));

  const bmi = useMemo(() => {
    if (!profile.heightCm || !profile.weightKg) return undefined;

    const h = profile.heightCm / 100;
    if (h <= 0) return undefined;

    return +(profile.weightKg / (h * h)).toFixed(1);
  }, [profile.heightCm, profile.weightKg]);

  const bmiLabel = useMemo(() => {
    if (bmi === undefined) return '';

    if (bmi < 18.5) return t('UserProfile.bmi_label_under');
    if (bmi < 25) return t('UserProfile.bmi_label_normal');
    if (bmi < 30) return t('UserProfile.bmi_label_over');

    return t('UserProfile.bmi_label_obese');
  }, [bmi, t]);

  const recommendation = useMemo(() => {
    if (profile.injured) {
      return t('UserProfile.rec_injured');
    }

    if (bmi === undefined) {
      return t('UserProfile.hint_fill_hw');
    }

    if (bmi >= 25) {
      return t('UserProfile.rec_overweight');
    }

    return t('UserProfile.rec_general');
  }, [bmi, profile.injured, t]);

  const valid = useMemo(() => {
    return profile.name.trim().length >= 2;
  }, [profile.name]);

  const save = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      await AsyncStorage.setItem(RECO_KEY, recommendation);

      if (bmi !== undefined) {
        await AsyncStorage.setItem(BMI_KEY, String(bmi));
      } else {
        await AsyncStorage.removeItem(BMI_KEY);
      }

      Alert.alert(t('UserProfile.save_success_title'), recommendation);
      navigation.goBack?.();
    } catch {
      Alert.alert(
        t('UserProfile.save_error_title'),
        t('UserProfile.save_error_msg'),
      );
    }
  };

  const clear = async () => {
    setProfile({
      name: '',
      age: undefined,
      gender: undefined,
      heightCm: undefined,
      weightKg: undefined,
      healthNote: '',
      injured: false,
      injuryNote: '',
    });

    await AsyncStorage.multiRemove([STORAGE_KEY, RECO_KEY, BMI_KEY]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.loadingWrap]}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <Text style={styles.loadingText}>{t('UserProfile.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.kickerPill}>
              <Text style={styles.kickerText}>PROFILE</Text>
            </View>

            <Text style={styles.title}>{t('UserProfile.title')}</Text>
            <Text style={styles.caption}>{t('UserProfile.subtitle')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('UserProfile.personalInfo', 'Personal information')}
            </Text>

            <Label>{t('UserProfile.name_label')}</Label>
            <Input
              placeholder={t('UserProfile.name_ph')}
              value={profile.name}
              onChangeText={(v) => setField('name', v)}
              returnKeyType="next"
            />

            <Row>
              <Col>
                <Label>{t('UserProfile.age_label')}</Label>
                <Input
                  placeholder={t('UserProfile.age_ph')}
                  keyboardType="number-pad"
                  value={profile.age?.toString() ?? ''}
                  onChangeText={(v) =>
                    setField(
                      'age',
                      v ? parseInt(v, 10) || undefined : undefined,
                    )
                  }
                />
              </Col>

              <Col>
                <Label>{t('UserProfile.gender_label')}</Label>
                <Segment
                  value={profile.gender}
                  options={[
                    { key: 'male', label: t('UserProfile.gender_male') },
                    { key: 'female', label: t('UserProfile.gender_female') },
                    { key: 'other', label: t('UserProfile.gender_other') },
                  ]}
                  onChange={(g) => setField('gender', g as Gender)}
                />
              </Col>
            </Row>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('UserProfile.bodyMetrics', 'Body metrics')}
            </Text>

            <Row>
              <Col>
                <Label>{t('UserProfile.height_label')}</Label>
                <Input
                  placeholder={t('UserProfile.height_ph')}
                  keyboardType="number-pad"
                  value={profile.heightCm?.toString() ?? ''}
                  onChangeText={(v) =>
                    setField(
                      'heightCm',
                      v ? parseFloat(v) || undefined : undefined,
                    )
                  }
                />
              </Col>

              <Col>
                <Label>{t('UserProfile.weight_label')}</Label>
                <Input
                  placeholder={t('UserProfile.weight_ph')}
                  keyboardType="decimal-pad"
                  value={profile.weightKg?.toString() ?? ''}
                  onChangeText={(v) =>
                    setField(
                      'weightKg',
                      v ? parseFloat(v) || undefined : undefined,
                    )
                  }
                />
              </Col>
            </Row>

            <InfoBox icon="📊" title={t('UserProfile.bmi')}>
              <Text style={styles.infoText}>
                {bmi ?? '—'} {bmi ? `(${bmiLabel})` : ''}
              </Text>
            </InfoBox>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {t('UserProfile.healthSection', 'Health status')}
            </Text>

            <Label>{t('UserProfile.health_label')}</Label>
            <Input
              placeholder={t('UserProfile.health_ph')}
              value={profile.healthNote}
              onChangeText={(v) => setField('healthNote', v)}
              multiline
              style={{ height: 90, textAlignVertical: 'top' }}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t('UserProfile.injured_q')}</Text>
                <Text style={styles.smallHint}>
                  {t(
                    'UserProfile.injured_hint',
                    'Turn this on if you need lighter recommendations.',
                  )}
                </Text>
              </View>

              <Switch
                value={!!profile.injured}
                onValueChange={(v) => setField('injured', v)}
                trackColor={{
                  false: 'rgba(109, 120, 111, 0.30)',
                  true: 'rgba(99, 201, 52, 0.36)',
                }}
                thumbColor={profile.injured ? NEON : '#526057'}
                style={{ marginLeft: 8 }}
              />
            </View>

            {profile.injured ? (
              <>
                <Label>{t('UserProfile.injury_label')}</Label>
                <Input
                  placeholder={t('UserProfile.injury_ph')}
                  value={profile.injuryNote}
                  onChangeText={(v) => setField('injuryNote', v)}
                  multiline
                  style={{ height: 90, textAlignVertical: 'top' }}
                />
              </>
            ) : null}
          </View>

          <InfoBox icon="💡" title={t('UserProfile.recommendation', 'Recommendation')}>
            <Text style={styles.infoText}>{recommendation}</Text>
          </InfoBox>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={clear}
              activeOpacity={0.86}
            >
              <Text style={[styles.btnText, styles.btnGhostText]}>
                {t('UserProfile.btn_delete')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, valid ? styles.btnPrimary : styles.btnDisabled]}
              onPress={save}
              disabled={!valid}
              activeOpacity={0.86}
            >
              <Text
                style={[
                  styles.btnText,
                  {
                    color: valid ? BG : MUTED,
                  },
                ]}
              >
                {t('UserProfile.btn_save')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);

const Input: React.FC<React.ComponentProps<typeof TextInput>> = (props) => (
  <TextInput
    {...props}
    placeholderTextColor="rgba(109, 120, 111, 0.68)"
    style={[styles.input, props.style]}
  />
);

const Row: React.FC<{ children: React.ReactNode; style?: any }> = ({
  children,
  style,
}) => <View style={[styles.row, style]}>{children}</View>;

const Col: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.col}>{children}</View>
);

const Segment: React.FC<{
  value?: string;
  options: { key: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <View style={styles.segmentWrap}>
    {options.map((o) => {
      const active = value === o.key;

      return (
        <TouchableOpacity
          key={o.key}
          onPress={() => onChange(o.key)}
          style={[styles.segmentItem, active && styles.segmentActive]}
          activeOpacity={0.86}
        >
          <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const InfoBox: React.FC<{
  children: React.ReactNode;
  icon?: string;
  title?: string;
}> = ({ children, icon, title }) => (
  <View style={styles.infoBox}>
    {icon ? (
      <View style={styles.infoIcon}>
        <Text style={styles.infoIconText}>{icon}</Text>
      </View>
    ) : null}

    <View style={{ flex: 1 }}>
      {title ? <Text style={styles.infoTitle}>{title}</Text> : null}
      {children}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: MUTED,
    fontWeight: '800',
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(24, 163, 155, 0.10)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 60,
    left: -110,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 201, 52, 0.10)',
  },
  container: {
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 160,
  },
  hero: {
    marginBottom: 18,
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
  },
  caption: {
    color: '#455047',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 201, 52, 0.24)',
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 18,
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
    lineHeight: 17,
    marginTop: 2,
  },
  input: {
    backgroundColor: CARD_2,
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
    backgroundColor: CARD_2,
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
    backgroundColor: CARD_2,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: 'rgba(109, 120, 111, 0.18)',
    marginBottom: 12,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.22)',
    padding: 14,
    marginBottom: 14,
  },
  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(24, 163, 155, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(24, 163, 155, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  infoIconText: {
    fontSize: 20,
  },
  infoTitle: {
    color: CYAN,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.6,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  infoText: {
    color: '#455047',
    lineHeight: 21,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  btnDisabled: {
    backgroundColor: CARD_2,
    borderColor: 'rgba(109, 120, 111, 0.18)',
  },
  btnGhost: {
    backgroundColor: CARD_2,
    borderColor: 'rgba(24, 163, 155, 0.30)',
  },
  btnText: {
    fontWeight: '900',
    fontSize: 14,
  },
  btnGhostText: {
    color: CYAN,
  },
});

export default UserProfileScreen;