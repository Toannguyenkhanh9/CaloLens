// FILE: src/screens/RecipeBuilderScreen.tsx
import FoodAccentCard from '../components/FoodAccentCard';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import type {
  FoodDefinition,
  RecipeIngredientSnapshot,
} from '../data/foodCatalog';
import {
  calculateFoodNutrition,
  loadAllFoods,
  saveRecipeFood,
} from '../nutrition/foodLibrary';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const CYAN = '#F29132';
const RED = '#D85E78';
const BORDER = '#F1D9C8';

type RecipeIngredient = {
  id: string;
  food: FoodDefinition;
  grams: string;
};

const numberValue = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const RecipeBuilderScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [servings, setServings] = useState('4');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [foods, setFoods] = useState<FoodDefinition[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    loadAllFoods().then(setFoods);
  }, []));

  const filteredFoods = useMemo(() => {
    const needle = normalize(search.trim());
    return foods
      .filter(food => !needle || normalize([food.name, ...(food.aliases || [])].join(' ')).includes(needle))
      .slice(0, 50);
  }, [foods, search]);

  const totals = useMemo(() => ingredients.reduce((result, item) => {
    const grams = numberValue(item.grams);
    const value = calculateFoodNutrition(item.food, grams);
    result.weight += grams;
    result.calories += value.calories;
    result.protein += value.proteinG;
    result.carbs += value.carbsG;
    result.fats += value.fatsG;
    return result;
  }, {weight: 0, calories: 0, protein: 0, carbs: 0, fats: 0}), [ingredients]);

  const servingCount = Math.max(1, Math.round(numberValue(servings)));
  const perServing = {
    calories: Math.round(totals.calories / servingCount),
    protein: Math.round(totals.protein * 10 / servingCount) / 10,
    carbs: Math.round(totals.carbs * 10 / servingCount) / 10,
    fats: Math.round(totals.fats * 10 / servingCount) / 10,
  };

  const addIngredient = (food: FoodDefinition) => {
    setIngredients(current => [...current, {
      id: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      food,
      grams: String(food.defaultPortionGrams),
    }]);
    setPickerVisible(false);
    setSearch('');
  };

  const updateIngredient = (id: string, grams: string) => {
    setIngredients(current => current.map(item => item.id === id ? {...item, grams} : item));
  };

  const save = async () => {
    const valid = ingredients.filter(item => numberValue(item.grams) > 0);
    if (!name.trim() || !valid.length) {
      Alert.alert(
        t('foodTools.recipeMissingTitle', 'Complete the recipe'),
        t('foodTools.recipeMissingBody', 'Enter a recipe name and add at least one ingredient.'),
      );
      return;
    }

    const snapshots: RecipeIngredientSnapshot[] = valid.map(item => ({
      foodId: item.food.id,
      name: item.food.name,
      grams: numberValue(item.grams),
      caloriesPer100g: item.food.caloriesPer100g,
      proteinPer100g: item.food.proteinPer100g,
      carbsPer100g: item.food.carbsPer100g,
      fatsPer100g: item.food.fatsPer100g,
    }));

    try {
      setSaving(true);
      const recipe = await saveRecipeFood({
        name,
        servings: servingCount,
        ingredients: snapshots,
      });
      navigation.replace('FoodPortion', {food: recipe});
    } catch (error) {
      console.log('[RecipeBuilder] save', error);
      Alert.alert(
        t('common.error', 'Error'),
        t('foodTools.saveRecipeError', 'Unable to save this recipe.'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <HeroFoodCornerAccent />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{t('foodTools.recipeKicker', 'RECIPE BUILDER')}</Text>
        <Text style={styles.title}>{t('foodTools.recipeTitle', 'Calculate a recipe per serving')}</Text>
        <Text style={styles.subtitle}>{t('foodTools.recipeSubtitle', 'Add ingredients, set the number of servings and save the recipe for quick logging.')}</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>{t('foodTools.recipeName', 'Recipe name')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('foodTools.recipeNamePlaceholder', 'e.g. Chicken vegetable stir-fry')}
            placeholderTextColor="#8A948C"
            style={styles.input}
          />
          <Text style={styles.label}>{t('foodTools.servings', 'Number of servings')}</Text>
          <TextInput
            value={servings}
            onChangeText={setServings}
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor="#8A948C"
            style={styles.input}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('foodTools.ingredients', 'Ingredients')}</Text>
          <TouchableOpacity style={styles.addIngredientButton} onPress={() => setPickerVisible(true)}>
            <Text style={styles.addIngredientText}>＋ {t('foodTools.addIngredient', 'Add ingredient')}</Text>
          </TouchableOpacity>
        </View>

        {ingredients.length ? ingredients.map(item => {
          const value = calculateFoodNutrition(item.food, numberValue(item.grams));
          return (
            <View key={item.id} style={styles.ingredientCard}>
              <View style={styles.ingredientHeader}>
                <View style={styles.ingredientBody}>
                  <Text style={styles.ingredientName} numberOfLines={1}>{item.food.name}</Text>
                  <Text style={styles.ingredientMeta}>{value.calories} kcal  •  {value.proteinG}g P</Text>
                </View>
                <TouchableOpacity onPress={() => setIngredients(current => current.filter(entry => entry.id !== item.id))}>
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.gramRow}>
                <TextInput
                  value={item.grams}
                  onChangeText={valueText => updateIngredient(item.id, valueText)}
                  keyboardType="decimal-pad"
                  style={styles.gramInput}
                />
                <Text style={styles.gramUnit}>g</Text>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🥣</Text>
            <Text style={styles.emptyTitle}>{t('foodTools.noIngredients', 'No ingredients yet')}</Text>
            <Text style={styles.emptyText}>{t('foodTools.noIngredientsBody', 'Add foods from the library to calculate the complete recipe.')}</Text>
          </View>
        )}

        <View style={styles.totalCard}>
          <Text style={styles.totalKicker}>{t('foodTools.perServingShort', 'PER SERVING')}</Text>
          <Text style={styles.totalCalories}>{perServing.calories} kcal</Text>
          <Text style={styles.totalMacros}>{perServing.protein}g P  •  {perServing.carbs}g C  •  {perServing.fats}g F</Text>
          <Text style={styles.totalMeta}>
            {Math.round(totals.weight)}g {t('foodTools.totalRecipeWeight', 'total recipe weight')}  •  {servingCount} {t('foodTools.servingsLower', 'servings')}
          </Text>
        </View>

        <TouchableOpacity style={[styles.saveButton, saving && styles.disabled]} onPress={save} disabled={saving}>
          <Text style={styles.saveText}>{saving ? t('common.saving', 'Saving…') : t('foodTools.saveRecipe', 'Save recipe')}</Text>
        </TouchableOpacity>

        <FoodAccentCard variant="hero" height={150} compact />
      </ScrollView>

      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{t('foodTools.chooseIngredient', 'Choose ingredient')}</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('foodTools.searchIngredient', 'Search food…')}
              placeholderTextColor="#8A948C"
              style={styles.sheetSearch}
            />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {filteredFoods.map(food => (
                <TouchableOpacity key={food.id} style={styles.pickerRow} onPress={() => addIngredient(food)}>
                  <View style={styles.pickerBody}>
                    <Text style={styles.pickerName}>{food.name}</Text>
                    <Text style={styles.pickerMeta}>{food.caloriesPer100g} kcal / 100g</Text>
                  </View>
                  <Text style={styles.pickerAdd}>＋</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  content: {paddingHorizontal: 8, paddingTop: 18, paddingBottom: 140},
  kicker: {color: CYAN, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginHorizontal: 5},
  title: {color: TEXT, fontSize: 30, lineHeight: 36, fontWeight: '900', marginHorizontal: 5, marginTop: 5},
  subtitle: {color: MUTED, fontSize: 13, lineHeight: 20, marginHorizontal: 5, marginTop: 7, marginBottom: 15},
  formCard: {backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: BORDER, padding: 13, marginBottom: 15},
  label: {color: TEXT, fontSize: 10, fontWeight: '900', marginBottom: 6},
  input: {minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: BG, color: TEXT, paddingHorizontal: 12, marginBottom: 11},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 9},
  sectionTitle: {color: TEXT, fontSize: 18, fontWeight: '900'},
  addIngredientButton: {paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,106,33,0.11)', borderWidth: 1, borderColor: 'rgba(255,106,33,0.27)'},
  addIngredientText: {color: '#E85A18', fontSize: 10, fontWeight: '900'},
  ingredientCard: {backgroundColor: CARD, borderRadius: 17, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8},
  ingredientHeader: {flexDirection: 'row', alignItems: 'center'},
  ingredientBody: {flex: 1},
  ingredientName: {color: TEXT, fontSize: 12, fontWeight: '900'},
  ingredientMeta: {color: CYAN, fontSize: 9, fontWeight: '800', marginTop: 3},
  deleteText: {color: RED, fontSize: 24, lineHeight: 25, marginLeft: 8},
  gramRow: {minHeight: 42, flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 10, marginTop: 9},
  gramInput: {flex: 1, color: TEXT, fontSize: 14, fontWeight: '900', paddingVertical: 0},
  gramUnit: {color: CYAN, fontSize: 11, fontWeight: '900'},
  emptyCard: {backgroundColor: CARD, borderRadius: 19, borderWidth: 1, borderColor: 'rgba(255,106,33,0.22)', padding: 20, alignItems: 'center', marginBottom: 12},
  emptyIcon: {fontSize: 35},
  emptyTitle: {color: TEXT, fontSize: 16, fontWeight: '900', marginTop: 8},
  emptyText: {color: MUTED, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 5},
  totalCard: {backgroundColor: 'rgba(255,106,33,0.10)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,106,33,0.27)', padding: 15, marginTop: 5},
  totalKicker: {color: CYAN, fontSize: 9, fontWeight: '900', letterSpacing: 0.9},
  totalCalories: {color: NEON, fontSize: 31, fontWeight: '900', marginTop: 4},
  totalMacros: {color: TEXT, fontSize: 11, fontWeight: '900', marginTop: 4},
  totalMeta: {color: MUTED, fontSize: 9, marginTop: 5},
  saveButton: {minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: NEON, borderRadius: 999, marginTop: 15},
  saveText: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
  disabled: {opacity: 0.6},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(73, 39, 21, 0.34)'},
  sheet: {height: '82%', backgroundColor: BG, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderTopWidth: 1, borderColor: 'rgba(255,106,33,0.25)', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20},
  handle: {width: 44, height: 5, borderRadius: 999, backgroundColor: 'rgba(120,105,95,0.40)', alignSelf: 'center', marginBottom: 14},
  sheetTitle: {color: TEXT, fontSize: 21, fontWeight: '900', marginBottom: 10},
  sheetSearch: {minHeight: 48, borderRadius: 14, backgroundColor: CARD, borderWidth: 1, borderColor: 'rgba(242,145,50,0.24)', color: TEXT, paddingHorizontal: 12, marginBottom: 10},
  pickerRow: {minHeight: 62, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 15, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 12, marginBottom: 7},
  pickerBody: {flex: 1},
  pickerName: {color: TEXT, fontSize: 12, fontWeight: '900'},
  pickerMeta: {color: MUTED, fontSize: 9, marginTop: 3},
  pickerAdd: {color: NEON, fontSize: 22, fontWeight: '900', marginLeft: 8},
});

export default RecipeBuilderScreen;
