// FILE: src/components/WeightPrompt.tsx
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { addWeight, lastEntry, markPromptShown } from '../weight/weightStore';
import { useTranslation } from 'react-i18next';
import { markWeightUpdated } from '../services/gamification';

const BG = '#06111D';
const CARD = 'rgba(11, 22, 36, 0.98)';
const CARD_2 = 'rgba(16, 28, 43, 0.96)';
const TEXT = '#F8FAFC';
const MUTED = '#94A3B8';
const NEON = '#7CFF3A';
const CYAN = '#19E6D2';

export const WeightPrompt: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
}> = ({ visible, onClose, onSaved }) => {
  const [kg, setKg] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      (async () => {
        const last = await lastEntry();
        setKg(last?.kg ? String(last.kg) : '');
        await markPromptShown();
      })();
    }
  }, [visible]);

  const save = async () => {
    const v = parseFloat(kg);

    if (!isNaN(v) && v > 0) {
      await addWeight(+v);
      await markWeightUpdated();
      onSaved?.();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.wrap}
      >
        <View style={s.backdrop} />

        <View style={s.card}>
          <View pointerEvents="none" style={s.glow} />

          <View style={s.iconCircle}>
            <Text style={s.iconText}>⚖️</Text>
          </View>

          <View style={s.kickerPill}>
            <Text style={s.kickerText}>WEIGHT UPDATE</Text>
          </View>

          <Text style={s.title}>
            {t('weight.prompt_title', 'Update your weight')}
          </Text>

          <Text style={s.caption}>
            {t(
              'weight.prompt_desc',
              'Enter your current weight to keep your progress chart accurate.',
            )}
          </Text>

          <View style={s.inputWrap}>
            <TextInput
              value={kg}
              onChangeText={setKg}
              keyboardType="decimal-pad"
              placeholder="VD: 65.5"
              placeholderTextColor="rgba(148, 163, 184, 0.75)"
              style={s.input}
            />

            <Text style={s.unit}>kg</Text>
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.btn, s.btnGhost]}
              onPress={onClose}
              activeOpacity={0.86}
            >
              <Text style={[s.btnTxt, s.btnGhostTxt]}>
                {t('weight.later', 'Later')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.btn,
                s.btnPrimary,
                !kg.trim() && s.btnDisabled,
              ]}
              onPress={save}
              activeOpacity={0.86}
              disabled={!kg.trim()}
            >
              <Text
                style={[
                  s.btnTxt,
                  {
                    color: kg.trim() ? BG : MUTED,
                  },
                ]}
              >
                {t('weight.save', 'Save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.68)',
  },

  card: {
    width: '88%',
    backgroundColor: CARD,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.32)',
    shadowColor: '#00FFD1',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(124, 255, 58, 0.12)',
  },

  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(124, 255, 58, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 58, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconText: {
    fontSize: 30,
  },

  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(25, 230, 210, 0.7)',
    backgroundColor: 'rgba(25, 230, 210, 0.12)',
    marginBottom: 12,
  },
  kickerText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    color: TEXT,
  },
  caption: {
    marginTop: 8,
    color: MUTED,
    fontSize: 14,
    lineHeight: 21,
  },

  inputWrap: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    color: TEXT,
    fontSize: 20,
    fontWeight: '900',
  },
  unit: {
    color: NEON,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: NEON,
    borderColor: NEON,
  },
  btnDisabled: {
    backgroundColor: CARD_2,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  btnGhost: {
    backgroundColor: CARD_2,
    borderColor: 'rgba(25, 230, 210, 0.35)',
  },
  btnTxt: {
    fontWeight: '900',
    fontSize: 14,
  },
  btnGhostTxt: {
    color: CYAN,
  },
});

export default WeightPrompt;