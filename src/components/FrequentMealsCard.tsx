// FILE: src/components/FrequentMealsCard.tsx
import React, {
  useCallback,
  useState,
} from 'react';
import {
  Alert,
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
  useTranslation,
} from 'react-i18next';

import {
  copyMealToDate,
  getFrequentMeals,
  getMealCalories,
  getMealDisplayTitle,
  type FrequentMeal,
} from '../nutrition/mealFavorites';

const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

export const FrequentMealsCard:
React.FC = () => {
  const {t} =
    useTranslation();

  const navigation =
    useNavigation<any>();

  const [items, setItems] =
    useState<FrequentMeal[]>([]);

  useFocusEffect(
    useCallback(() => {
      getFrequentMeals().then(
        setItems,
      );
    }, []),
  );

  const addAgain = async (
    item: FrequentMeal,
  ) => {
    await copyMealToDate(
      item.meal,
    );

    Alert.alert(
      t(
        'caloLensInsights.addedTitle',
        'Added to today',
      ),
      t(
        'caloLensInsights.addedBody',
        'The meal was copied to today’s food log.',
      ),
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>
            {t(
              'caloLensInsights.frequentKicker',
              'QUICK LOG',
            )}
          </Text>

          <Text style={styles.title}>
            {t(
              'caloLensInsights.frequentMeals',
              'Meals you often eat',
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() =>
            navigation.navigate(
              'FavoriteMeals',
            )
          }
        >
          <Text style={styles.viewAll}>
            {t(
              'caloLensInsights.favorites',
              'Favorites',
            )}
          </Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            ☆
          </Text>

          <Text style={styles.emptyText}>
            {t(
              'caloLensInsights.noFrequentMeals',
              'Log a few meals and your common choices will appear here.',
            )}
          </Text>
        </View>
      ) : (
        items.map(item => (
          <View
            key={item.signature}
            style={styles.row}
          >
            <View style={styles.rowIcon}>
              <Text style={styles.rowIconText}>
                🍱
              </Text>
            </View>

            <View style={styles.rowBody}>
              <Text
                style={styles.rowTitle}
                numberOfLines={1}
              >
                {getMealDisplayTitle(
                  item.meal,
                )}
              </Text>

              <Text style={styles.rowMeta}>
                {getMealCalories(
                  item.meal,
                )}{' kcal  •  '}
                {item.count}{'×'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.84}
              style={styles.addButton}
              onPress={() =>
                addAgain(item)
              }
            >
              <Text style={styles.addText}>
                {t(
                  'caloLensInsights.addAgain',
                  'Add',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const styles =
  StyleSheet.create({
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.17)',
      padding: 14,
      marginBottom: 13,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 8,
    },
    kicker: {
      color: CYAN,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    title: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
      marginTop: 3,
    },
    viewAll: {
      color: NEON,
      fontSize: 11,
      fontWeight: '900',
    },
    empty: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F4F8F1',
      borderRadius: 15,
      padding: 12,
      marginTop: 6,
    },
    emptyIcon: {
      color: NEON,
      fontSize: 21,
      marginRight: 9,
    },
    emptyText: {
      flex: 1,
      color: MUTED,
      fontSize: 11,
      lineHeight: 16,
    },
    row: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#E8EEE5',
      paddingVertical: 9,
    },
    rowIcon: {
      width: 39,
      height: 39,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99, 201, 52, 0.09)',
      marginRight: 9,
    },
    rowIconText: {
      fontSize: 17,
    },
    rowBody: {
      flex: 1,
    },
    rowTitle: {
      color: TEXT,
      fontSize: 12,
      fontWeight: '900',
    },
    rowMeta: {
      color: MUTED,
      fontSize: 9,
      marginTop: 3,
    },
    addButton: {
      minWidth: 52,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 999,
      alignItems: 'center',
      backgroundColor:
        'rgba(99, 201, 52, 0.12)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.28)',
      marginLeft: 8,
    },
    addText: {
      color: '#4F9E2A',
      fontSize: 10,
      fontWeight: '900',
    },
  });

export default FrequentMealsCard;
