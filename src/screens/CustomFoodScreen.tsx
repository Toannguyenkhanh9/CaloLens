// FILE: src/screens/CustomFoodScreen.tsx
import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {saveCustomFood} from '../nutrition/foodLibrary';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';
const BORDER = '#DDE8D9';

const numberValue = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'decimal-pad' | 'number-pad';
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8A948C"
      keyboardType={keyboardType}
      style={styles.input}
    />
  </View>
);

export const CustomFoodScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState(String(route.params?.barcode || ''));
  const [servingLabel, setServingLabel] = useState('1 serving');
  const [servingGrams, setServingGrams] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const grams = numberValue(servingGrams);
    if (!name.trim() || grams <= 0 || calories.trim() === '') {
      Alert.alert(
        t('foodTools.invalidFoodTitle', 'Complete the required fields'),
        t('foodTools.invalidFoodBody', 'Enter a food name, serving weight and calories.'),
      );
      return;
    }

    try {
      setSaving(true);
      const food = await saveCustomFood({
        name,
        barcode,
        servingLabel,
        servingGrams: grams,
        caloriesPerServing: numberValue(calories),
        proteinPerServing: numberValue(protein),
        carbsPerServing: numberValue(carbs),
        fatsPerServing: numberValue(fats),
      });
      navigation.replace('FoodPortion', {food});
    } catch (error) {
      console.log('[CustomFood] save', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('foodTools.saveFoodError', 'Unable to save this food.'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('foodTools.customFoodKicker', 'CUSTOM FOOD')}</Text>
        <Text style={styles.title}>{t('foodTools.customFoodTitle', 'Create a reusable food')}</Text>
        <Text style={styles.subtitle}>{t('foodTools.customFoodSubtitle', 'Enter values from the product label or your own measurement.')}</Text>

        <View style={styles.card}>
          <Field label={t('foodTools.foodName', 'Food name')} value={name} onChangeText={setName} placeholder={t('foodTools.foodNamePlaceholder', 'e.g. Protein yogurt')} />
          <Field label={t('foodTools.barcodeOptional', 'Barcode (optional)')} value={barcode} onChangeText={setBarcode} placeholder="893..." keyboardType="number-pad" />
          <Field label={t('foodTools.servingName', 'Serving name')} value={servingLabel} onChangeText={setServingLabel} placeholder="1 cup" />
          <Field label={t('foodTools.servingWeight', 'Serving weight (g)')} value={servingGrams} onChangeText={setServingGrams} placeholder="100" keyboardType="decimal-pad" />
        </View>

        <Text style={styles.sectionTitle}>{t('foodTools.perServing', 'Nutrition per serving')}</Text>
        <View style={styles.card}>
          <Field label={t('nutrition.calories', 'Calories')} value={calories} onChangeText={setCalories} placeholder="150" keyboardType="decimal-pad" />
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Field label={t('nutrition.protein', 'Protein (g)')} value={protein} onChangeText={setProtein} placeholder="10" keyboardType="decimal-pad" />
            </View>
            <View style={styles.columnLast}>
              <Field label={t('nutrition.carb', 'Carb (g)')} value={carbs} onChangeText={setCarbs} placeholder="20" keyboardType="decimal-pad" />
            </View>
          </View>
          <Field label={t('nutrition.fat', 'Fat (g)')} value={fats} onChangeText={setFats} placeholder="5" keyboardType="decimal-pad" />
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            {t('foodTools.customFoodNotice', 'Use values for the serving above. CaloLens automatically converts them to values per 100 g.')}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.88} style={[styles.saveButton, saving && styles.disabled]} onPress={save} disabled={saving}>
          <Text style={styles.saveText}>{saving ? t('common.saving', 'Saving…') : t('foodTools.saveFood', 'Save food')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  content: {paddingHorizontal: 8, paddingTop: 18, paddingBottom: 140},
  kicker: {color: CYAN, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginHorizontal: 5},
  title: {color: TEXT, fontSize: 30, lineHeight: 36, fontWeight: '900', marginHorizontal: 5, marginTop: 5},
  subtitle: {color: MUTED, fontSize: 13, lineHeight: 20, marginHorizontal: 5, marginTop: 7, marginBottom: 15},
  sectionTitle: {color: TEXT, fontSize: 17, fontWeight: '900', marginHorizontal: 5, marginTop: 4, marginBottom: 9},
  card: {backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 13, marginBottom: 14},
  field: {marginBottom: 11},
  label: {color: TEXT, fontSize: 10, fontWeight: '900', marginBottom: 6},
  input: {minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: '#F5F8F2', color: TEXT, fontSize: 14, fontWeight: '800', paddingHorizontal: 12},
  twoColumn: {flexDirection: 'row'},
  column: {flex: 1, marginRight: 5},
  columnLast: {flex: 1, marginLeft: 5},
  notice: {backgroundColor: '#FFF9E8', borderRadius: 16, borderWidth: 1, borderColor: '#F0DBA2', padding: 12},
  noticeText: {color: '#5C594E', fontSize: 10, lineHeight: 16},
  saveButton: {minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: NEON, borderRadius: 999, marginTop: 15},
  saveText: {color: '#10230F', fontSize: 14, fontWeight: '900'},
  disabled: {opacity: 0.6},
});

export default CustomFoodScreen;
