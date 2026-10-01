// FILE: src/screens/QuickAddScreen.tsx
import FoodAccentCard from '../components/FoodAccentCard';
import HeroFoodCornerAccent from '../components/HeroFoodCornerAccent';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useNavigation,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import '../i18n/caloLensFoodToolsTranslations';

const BG = '#FFF8F2';
const CARD = '#FFFFFF';
const TEXT = '#21170F';
const MUTED = '#78695F';
const NEON = '#FF6A21';
const CYAN = '#F29132';
const BLUE = '#FF9350';
const YELLOW = '#F5A623';
const BORDER = '#F1D9C8';

type ActionCardProps = {
  icon: string;
  title: string;
  description: string;
  accent: string;
  onPress: () => void;
  primary?: boolean;
};

const ActionCard:
React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  accent,
  onPress,
  primary = false,
}) => (
  <TouchableOpacity
    activeOpacity={0.87}
    style={[
      styles.actionCard,
      primary &&
        styles.actionCardPrimary,
    ]}
    onPress={onPress}
  >
    <View
      style={[
        styles.actionIcon,
        {
          backgroundColor:
            `${accent}18`,
          borderColor:
            `${accent}44`,
        },
      ]}
    >
      <Text style={styles.actionIconText}>
        {icon}
      </Text>
    </View>

    <View style={styles.actionBody}>
      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Text style={styles.actionDescription}>
        {description}
      </Text>
    </View>

    <Text
      style={[
        styles.actionArrow,
        {
          color: accent,
        },
      ]}
    >
      ›
    </Text>
  </TouchableOpacity>
);

export const QuickAddScreen:
React.FC = () => {
  const {t} = useTranslation();
  const navigation =
    useNavigation<any>();

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <HeroFoodCornerAccent />

      <View
        pointerEvents="none"
        style={styles.glowTop}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kicker}>
              {t(
                'foodTools.moreWaysKicker',
                'MORE OPTIONS',
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            {t(
              'foodTools.moreWaysTitle',
              'More ways to add food',
            )}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'foodTools.moreWaysSubtitle',
              'Use search, barcode, manual entry, custom foods, recipes or saved meals.',
            )}
          </Text>
        </View>

        <ActionCard
          icon="⌕"
          title={t(
            'foodTools.searchFood',
            'Search food',
          )}
          description={t(
            'foodTools.searchFoodBody',
            'Find common foods, Vietnamese meals, recent items and custom foods.',
          )}
          accent={CYAN}
          primary
          onPress={() =>
            navigation.navigate(
              'FoodSearch',
            )
          }
        />

        <ActionCard
          icon="▦"
          title={t(
            'foodTools.scanBarcode',
            'Scan barcode',
          )}
          description={t(
            'foodTools.scanBarcodeBody',
            'Scan packaged food or enter the barcode manually.',
          )}
          accent={BLUE}
          onPress={() =>
            navigation.navigate(
              'BarcodeScanner',
            )
          }
        />

        <ActionCard
          icon="✎"
          title={t(
            'foodTools.manualEntry',
            'Enter food manually',
          )}
          description={t(
            'foodTools.manualEntryBody',
            'Add a food name, portion, calories and macros yourself.',
          )}
          accent={YELLOW}
          onPress={() =>
            navigation.navigate(
              'MealReview',
              {
                foods: [],
                source: 'manual',
              },
            )
          }
        />

        <ActionCard
          icon="＋"
          title={t(
            'foodTools.createFood',
            'Create custom food',
          )}
          description={t(
            'foodTools.createFoodBody',
            'Save a packaged product or personal food for future use.',
          )}
          accent={CYAN}
          onPress={() =>
            navigation.navigate(
              'CustomFood',
            )
          }
        />

        <ActionCard
          icon="🥣"
          title={t(
            'foodTools.recipeBuilder',
            'Recipe builder',
          )}
          description={t(
            'foodTools.recipeBuilderBody',
            'Combine ingredients, choose servings and calculate nutrition per serving.',
          )}
          accent={NEON}
          onPress={() =>
            navigation.navigate(
              'RecipeBuilder',
            )
          }
        />

        <ActionCard
          icon="☆"
          title={t(
            'caloLensInsights.favoriteMealsTitle',
            'Favorite meals',
          )}
          description={t(
            'foodTools.favoriteMealsBody',
            'Add one of your saved meals to today with one tap.',
          )}
          accent={YELLOW}
          onPress={() =>
            navigation.navigate(
              'FavoriteMeals',
            )
          }
        />

        <View style={styles.note}>
          <Text style={styles.noteIcon}>
            i
          </Text>

          <Text style={styles.noteText}>
            {t(
              'foodTools.estimateNotice',
              'Nutrition values are estimates. Review portions and product labels before saving.',
            )}
          </Text>
        </View>

        <FoodAccentCard variant="hero" height={170} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 18,
    paddingBottom: 160,
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor:
      'rgba(255, 106, 33, 0.10)',
  },
  hero: {
    paddingHorizontal: 5,
    marginBottom: 18,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor:
      'rgba(242, 145, 50, 0.08)',
    borderWidth: 1,
    borderColor:
      'rgba(242, 145, 50, 0.28)',
    marginBottom: 13,
  },
  kicker: {
    color: CYAN,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    color: TEXT,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 355,
  },
  actionCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 9,
    shadowColor: '#C28A66',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },
  actionCardPrimary: {
    borderColor:
      'rgba(255, 106, 33, 0.34)',
    shadowColor: NEON,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 11,
  },
  actionIconText: {
    fontSize: 21,
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: '900',
  },
  actionDescription: {
    color: MUTED,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  actionArrow: {
    fontSize: 28,
    lineHeight: 30,
    marginLeft: 8,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E8',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F0DBA2',
    padding: 12,
    marginTop: 4,
  },
  noteIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: '#8B6500',
    backgroundColor: '#FFF0B8',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '900',
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    color: '#5C594E',
    fontSize: 10,
    lineHeight: 16,
  },
});

export default QuickAddScreen;
