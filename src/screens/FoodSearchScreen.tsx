// FILE: src/screens/FoodSearchScreen.tsx
import FoodAccentCard from '../components/FoodAccentCard';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import React, {useCallback, useMemo, useState} from 'react';
import {
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

import type {FoodCategory, FoodDefinition} from '../data/foodCatalog';
import {loadRecentFoods, searchFoodLibrary} from '../nutrition/foodLibrary';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const CYAN = '#F29132';
const BORDER = '#F1D9C8';

type SourceFilter = 'all' | 'recent' | 'custom' | 'recipe';

const CATEGORIES: Array<{value: 'all' | FoodCategory; fallback: string}> = [
  {value: 'all', fallback: 'All'},
  {value: 'vietnamese', fallback: 'Vietnamese'},
  {value: 'protein', fallback: 'Protein'},
  {value: 'staples', fallback: 'Staples'},
  {value: 'fruit', fallback: 'Fruit'},
  {value: 'dairy', fallback: 'Dairy'},
  {value: 'drinks', fallback: 'Drinks'},
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const FoodSearchScreen: React.FC = () => {
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | FoodCategory>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [foods, setFoods] = useState<FoodDefinition[]>([]);
  const [recent, setRecent] = useState<FoodDefinition[]>([]);

  const reload = useCallback(async () => {
    const [allFoods, recentFoods] = await Promise.all([
      searchFoodLibrary({query: ''}),
      loadRecentFoods(),
    ]);
    setFoods(allFoods);
    setRecent(recentFoods);
  }, []);

  useFocusEffect(useCallback(() => {
    reload();
  }, [reload]));

  const filtered = useMemo(() => {
    const needle = normalize(query);
    const base = source === 'recent'
      ? recent
      : foods.filter(food => source === 'all' || food.source === source);

    return base.filter(food => {
      if (category !== 'all' && food.category !== category) return false;
      if (!needle) return true;
      return normalize([
        food.name,
        ...(food.aliases || []),
        food.barcode || '',
      ].join(' ')).includes(needle);
    });
  }, [category, foods, query, recent, source]);

  const sources: Array<{value: SourceFilter; label: string}> = [
    {value: 'all', label: t('foodTools.allFoods', 'All foods')},
    {value: 'recent', label: t('foodTools.recent', 'Recent')},
    {value: 'custom', label: t('foodTools.custom', 'Custom')},
    {value: 'recipe', label: t('foodTools.recipes', 'Recipes')},
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <HeroFoodCornerAccent />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>{t('foodTools.libraryKicker', 'FOOD LIBRARY')}</Text>
          <Text style={styles.title}>{t('foodTools.searchTitle', 'Search food')}</Text>
          <Text style={styles.subtitle}>
            {t('foodTools.searchSubtitle', 'Choose a food, then adjust its serving or grams before adding it.')}
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('foodTools.searchPlaceholder', 'Search rice, chicken, pho…')}
            placeholderTextColor="#8A948C"
            autoCorrect={false}
            style={styles.searchInput}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clear}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {sources.map(item => {
            const active = source === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.sourceChip, active && styles.sourceChipActive]}
                onPress={() => setSource(item.value)}>
                <Text style={[styles.sourceText, active && styles.sourceTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map(item => {
            const active = category === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.categoryChip, active && styles.categoryChipActive]}
                onPress={() => setCategory(item.value)}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                  {t(`foodTools.category.${item.value}`, item.fallback)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.createRow}>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CustomFood')}>
            <Text style={styles.createText}>＋ {t('foodTools.createFood', 'Create custom food')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.recipeButton} onPress={() => navigation.navigate('RecipeBuilder')}>
            <Text style={styles.recipeText}>🥣 {t('foodTools.recipe', 'Recipe')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{t('foodTools.results', 'Results')}</Text>
          <Text style={styles.resultCount}>{filtered.length}</Text>
        </View>

        {filtered.length ? filtered.map(food => (
          <TouchableOpacity
            key={food.id}
            activeOpacity={0.86}
            style={styles.foodRow}
            onPress={() => navigation.navigate('FoodPortion', {food})}>
            <View style={styles.foodIcon}>
              <Text style={styles.foodIconText}>
                {food.source === 'recipe' ? '🥣' : food.source === 'custom' ? '✎' : food.category === 'vietnamese' ? '🍜' : '🥗'}
              </Text>
            </View>
            <View style={styles.foodBody}>
              <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
              <Text style={styles.foodMeta}>
                {food.caloriesPer100g} kcal / 100 g  •  {food.proteinPer100g}g P
              </Text>
              <Text style={styles.foodPortion}>
                {food.portions[0]?.label || '1 serving'}  •  {food.defaultPortionGrams}g
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>{t('foodTools.noFoodTitle', 'No matching food')}</Text>
            <Text style={styles.emptyText}>{t('foodTools.noFoodBody', 'Try another keyword or create this food yourself.')}</Text>
          </View>
        )}

        <FoodAccentCard variant="guidance" height={145} compact />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  content: {paddingHorizontal: 8, paddingTop: 18, paddingBottom: 150},
  hero: {paddingHorizontal: 5, marginBottom: 15},
  kicker: {color: CYAN, fontSize: 10, fontWeight: '900', letterSpacing: 1},
  title: {color: TEXT, fontSize: 32, lineHeight: 38, fontWeight: '900', marginTop: 5},
  subtitle: {color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 7},
  searchBox: {minHeight: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(242,145,50,0.25)', paddingHorizontal: 13, marginBottom: 11},
  searchIcon: {color: CYAN, fontSize: 22, marginRight: 8},
  searchInput: {flex: 1, color: TEXT, fontSize: 14, fontWeight: '700', paddingVertical: 0},
  clear: {color: MUTED, fontSize: 24, lineHeight: 25, marginLeft: 8},
  chipRow: {paddingBottom: 8},
  sourceChip: {borderRadius: 999, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, paddingHorizontal: 12, paddingVertical: 8, marginRight: 7},
  sourceChipActive: {backgroundColor: NEON, borderColor: NEON},
  sourceText: {color: MUTED, fontSize: 10, fontWeight: '900'},
  sourceTextActive: {color: '#FFFFFF'},
  categoryRow: {paddingBottom: 11},
  categoryChip: {borderRadius: 999, backgroundColor: '#FFF2E8', paddingHorizontal: 11, paddingVertical: 7, marginRight: 7},
  categoryChipActive: {backgroundColor: 'rgba(242,145,50,0.13)', borderWidth: 1, borderColor: 'rgba(242,145,50,0.28)'},
  categoryText: {color: MUTED, fontSize: 9, fontWeight: '800'},
  categoryTextActive: {color: CYAN, fontWeight: '900'},
  createRow: {flexDirection: 'row', marginHorizontal: -4, marginBottom: 15},
  createButton: {flex: 1.4, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: 'rgba(255,106,33,0.11)', borderWidth: 1, borderColor: 'rgba(255,106,33,0.28)', marginHorizontal: 4},
  createText: {color: '#E85A18', fontSize: 10, fontWeight: '900'},
  recipeButton: {flex: 1, minHeight: 43, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: 'rgba(242,145,50,0.09)', borderWidth: 1, borderColor: 'rgba(242,145,50,0.25)', marginHorizontal: 4},
  recipeText: {color: CYAN, fontSize: 10, fontWeight: '900'},
  resultHeader: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginBottom: 8},
  resultTitle: {color: TEXT, fontSize: 18, fontWeight: '900'},
  resultCount: {color: MUTED, fontSize: 11, fontWeight: '900'},
  foodRow: {minHeight: 82, flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 19, borderWidth: 1, borderColor: BORDER, padding: 12, marginBottom: 8},
  foodIcon: {width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,106,33,0.09)', marginRight: 10},
  foodIconText: {fontSize: 20},
  foodBody: {flex: 1},
  foodName: {color: TEXT, fontSize: 13, fontWeight: '900'},
  foodMeta: {color: CYAN, fontSize: 9, fontWeight: '900', marginTop: 4},
  foodPortion: {color: MUTED, fontSize: 9, marginTop: 3},
  arrow: {color: NEON, fontSize: 28, marginLeft: 8},
  emptyCard: {backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,106,33,0.22)', padding: 22, alignItems: 'center'},
  emptyIcon: {color: CYAN, fontSize: 36},
  emptyTitle: {color: TEXT, fontSize: 17, fontWeight: '900', marginTop: 8},
  emptyText: {color: MUTED, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 5},
});

export default FoodSearchScreen;
