// FILE: src/screens/FoodPortionScreen.tsx
import React, {useMemo, useState} from 'react';
import {
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

import type {FoodDefinition} from '../data/foodCatalog';
import {
  calculateFoodNutrition,
  foodToAiCandidate,
  rememberFood,
} from '../nutrition/foodLibrary';

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

export const FoodPortionScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const food = route.params?.food as FoodDefinition;
  const [grams, setGrams] = useState(String(food?.defaultPortionGrams || 100));
  const selectedGrams = Math.max(1, numberValue(grams));
  const nutrition = useMemo(
    () => calculateFoodNutrition(food, selectedGrams),
    [food, selectedGrams],
  );

  const setMultiplier = (multiplier: number) => {
    setGrams(String(Math.round(food.defaultPortionGrams * multiplier * 10) / 10));
  };

  const continueToReview = async () => {
    await rememberFood(food.id);
    navigation.navigate('MealReview', {
      source: 'manual',
      foods: [foodToAiCandidate(food, selectedGrams)],
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>{food.source === 'recipe' ? '🥣' : food.category === 'vietnamese' ? '🍜' : '🥗'}</Text>
        </View>
        <Text style={styles.kicker}>{t('foodTools.portionKicker', 'PORTION')}</Text>
        <Text style={styles.title}>{food.name}</Text>
        <Text style={styles.subtitle}>{t('foodTools.portionSubtitle', 'Choose a common serving or enter the actual grams.')}</Text>

        <View style={styles.nutritionCard}>
          <Text style={styles.calories}>{nutrition.calories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
          <View style={styles.macroRow}>
            {[
              [nutrition.proteinG, t('nutrition.protein', 'Protein')],
              [nutrition.carbsG, t('nutrition.carb', 'Carb')],
              [nutrition.fatsG, t('nutrition.fat', 'Fat')],
            ].map(([value, label]) => (
              <View key={String(label)} style={styles.macroItem}>
                <Text style={styles.macroValue}>{value}g</Text>
                <Text style={styles.macroLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('foodTools.quickPortion', 'Quick portion')}</Text>
        <View style={styles.multiplierRow}>
          {[0.5, 1, 1.5, 2].map(multiplier => {
            const active = Math.abs(selectedGrams - food.defaultPortionGrams * multiplier) < 0.2;
            return (
              <TouchableOpacity
                key={multiplier}
                style={[styles.multiplier, active && styles.multiplierActive]}
                onPress={() => setMultiplier(multiplier)}>
                <Text style={[styles.multiplierText, active && styles.multiplierTextActive]}>{multiplier}×</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portionRow}>
          {food.portions.map(portion => {
            const active = Math.abs(selectedGrams - portion.grams) < 0.2;
            return (
              <TouchableOpacity
                key={portion.id}
                style={[styles.portionChip, active && styles.portionChipActive]}
                onPress={() => setGrams(String(portion.grams))}>
                <Text style={[styles.portionText, active && styles.portionTextActive]}>{portion.label}</Text>
                <Text style={[styles.portionGram, active && styles.portionTextActive]}>{portion.grams}g</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.inputLabel}>{t('foodTools.actualGrams', 'Actual grams')}</Text>
        <View style={styles.gramInputWrap}>
          <TextInput
            value={grams}
            onChangeText={setGrams}
            keyboardType="decimal-pad"
            placeholder="100"
            placeholderTextColor="#8A948C"
            style={styles.gramInput}
          />
          <Text style={styles.gramUnit}>g</Text>
        </View>

        <View style={styles.per100Card}>
          <Text style={styles.per100Title}>{t('foodTools.per100', 'Per 100 g')}</Text>
          <Text style={styles.per100Text}>
            {food.caloriesPer100g} kcal  •  {food.proteinPer100g}g P  •  {food.carbsPer100g}g C  •  {food.fatsPer100g}g F
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} activeOpacity={0.88} onPress={continueToReview}>
          <Text style={styles.continueText}>{t('foodTools.continueReview', 'Continue to review')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  content: {paddingHorizontal: 8, paddingTop: 18, paddingBottom: 140},
  heroIcon: {width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(99,201,52,0.11)', borderWidth: 1, borderColor: 'rgba(99,201,52,0.28)', marginLeft: 5, marginBottom: 13},
  heroIconText: {fontSize: 27},
  kicker: {color: CYAN, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginHorizontal: 5},
  title: {color: TEXT, fontSize: 30, lineHeight: 36, fontWeight: '900', marginHorizontal: 5, marginTop: 5},
  subtitle: {color: MUTED, fontSize: 13, lineHeight: 20, marginHorizontal: 5, marginTop: 7, marginBottom: 15},
  nutritionCard: {backgroundColor: CARD, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(99,201,52,0.27)', padding: 16, marginBottom: 17},
  calories: {color: NEON, fontSize: 40, lineHeight: 43, fontWeight: '900'},
  calorieUnit: {color: MUTED, fontSize: 12, fontWeight: '800'},
  macroRow: {flexDirection: 'row', marginTop: 15, marginHorizontal: -4},
  macroItem: {flex: 1, backgroundColor: '#F4F8F1', borderRadius: 14, paddingVertical: 10, alignItems: 'center', marginHorizontal: 4},
  macroValue: {color: TEXT, fontSize: 14, fontWeight: '900'},
  macroLabel: {color: MUTED, fontSize: 9, fontWeight: '800', marginTop: 2},
  sectionTitle: {color: TEXT, fontSize: 17, fontWeight: '900', marginHorizontal: 5, marginBottom: 9},
  multiplierRow: {flexDirection: 'row', marginHorizontal: -4, marginBottom: 12},
  multiplier: {flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: BORDER, marginHorizontal: 4},
  multiplierActive: {backgroundColor: NEON, borderColor: NEON},
  multiplierText: {color: MUTED, fontSize: 12, fontWeight: '900'},
  multiplierTextActive: {color: '#10230F'},
  portionRow: {paddingBottom: 14},
  portionChip: {minWidth: 105, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 11, paddingVertical: 10, marginRight: 8},
  portionChipActive: {backgroundColor: 'rgba(24,163,155,0.10)', borderColor: 'rgba(24,163,155,0.32)'},
  portionText: {color: TEXT, fontSize: 10, fontWeight: '900'},
  portionGram: {color: MUTED, fontSize: 9, marginTop: 3},
  portionTextActive: {color: CYAN},
  inputLabel: {color: TEXT, fontSize: 12, fontWeight: '900', marginHorizontal: 5, marginBottom: 7},
  gramInputWrap: {minHeight: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(24,163,155,0.25)', paddingHorizontal: 13},
  gramInput: {flex: 1, color: TEXT, fontSize: 18, fontWeight: '900', paddingVertical: 0},
  gramUnit: {color: CYAN, fontSize: 14, fontWeight: '900'},
  per100Card: {backgroundColor: '#F0F5ED', borderRadius: 15, padding: 12, marginTop: 12},
  per100Title: {color: TEXT, fontSize: 11, fontWeight: '900'},
  per100Text: {color: MUTED, fontSize: 9, lineHeight: 15, marginTop: 4},
  continueButton: {minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: NEON, borderRadius: 999, marginTop: 16},
  continueText: {color: '#10230F', fontSize: 14, fontWeight: '900'},
});

export default FoodPortionScreen;
