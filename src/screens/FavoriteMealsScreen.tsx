// FILE: src/screens/FavoriteMealsScreen.tsx
import React, {
  useCallback,
  useState,
} from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
} from '@react-navigation/native';
import {
  useTranslation,
} from 'react-i18next';

import {
  addFavoriteToToday,
  deleteFavoriteMeal,
  getMealCalories,
  loadFavoriteMeals,
  type FavoriteMeal,
} from '../nutrition/mealFavorites';

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';

export const FavoriteMealsScreen:
React.FC = () => {
  const {t} =
    useTranslation();

  const [items, setItems] =
    useState<FavoriteMeal[]>([]);

  const reload =
    useCallback(async () => {
      setItems(
        await loadFavoriteMeals(),
      );
    }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const addToday = async (
    item: FavoriteMeal,
  ) => {
    await addFavoriteToToday(
      item,
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

  const remove = (
    item: FavoriteMeal,
  ) => {
    Alert.alert(
      t(
        'caloLensInsights.removeFavoriteTitle',
        'Remove favorite?',
      ),
      item.title,
      [
        {
          text: t(
            'common.cancel',
            'Cancel',
          ),
          style: 'cancel',
        },
        {
          text: t(
            'common.delete',
            'Delete',
          ),
          style: 'destructive',
          onPress: async () => {
            setItems(
              await deleteFavoriteMeal(
                item.id,
              ),
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>
              {t(
                'caloLensInsights.quickLogKicker',
                'QUICK LOG',
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            {t(
              'caloLensInsights.favoriteMealsTitle',
              'Favorite meals',
            )}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'caloLensInsights.favoriteMealsSubtitle',
              'Save meals you eat often and add them to today with one tap.',
            )}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              ☆
            </Text>

            <Text style={styles.emptyTitle}>
              {t(
                'caloLensInsights.noFavoritesTitle',
                'No favorite meals yet',
              )}
            </Text>

            <Text style={styles.emptyText}>
              {t(
                'caloLensInsights.noFavoritesBody',
                'Open your food log and save any meal as a favorite.',
              )}
            </Text>
          </View>
        ) : (
          items.map(item => {
            const fakeMeal: any = {
              foods: item.foods,
            };

            return (
              <View
                key={item.id}
                style={styles.card}
              >
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>
                    🍱
                  </Text>
                </View>

                <View style={styles.cardBody}>
                  <Text
                    style={styles.cardTitle}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text style={styles.cardMeta}>
                    {getMealCalories(
                      fakeMeal,
                    )}{' kcal  •  '}
                    {item.foods.length}{' '}
                    {t(
                      'caloLensInsights.foods',
                      'foods',
                    )}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      activeOpacity={0.84}
                      style={styles.addButton}
                      onPress={() =>
                        addToday(item)
                      }
                    >
                      <Text style={styles.addText}>
                        +{' '}
                        {t(
                          'caloLensInsights.addToday',
                          'Add today',
                        )}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.84}
                      style={styles.deleteButton}
                      onPress={() =>
                        remove(item)
                      }
                    >
                      <Text style={styles.deleteText}>
                        {t(
                          'common.delete',
                          'Delete',
                        )}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: BG,
    },
    content: {
      paddingHorizontal: 8,
      paddingTop: 18,
      paddingBottom: 150,
    },
    hero: {
      paddingHorizontal: 5,
      marginBottom: 17,
    },
    kickerPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.28)',
      marginBottom: 13,
    },
    kickerText: {
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
    card: {
      flexDirection: 'row',
      backgroundColor: CARD,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        'rgba(109, 120, 111, 0.17)',
      padding: 13,
      marginBottom: 10,
    },
    cardIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      marginRight: 11,
    },
    cardIconText: {
      fontSize: 21,
    },
    cardBody: {
      flex: 1,
    },
    cardTitle: {
      color: TEXT,
      fontSize: 14,
      fontWeight: '900',
    },
    cardMeta: {
      color: MUTED,
      fontSize: 10,
      marginTop: 4,
    },
    actions: {
      flexDirection: 'row',
      marginTop: 10,
    },
    addButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: NEON,
      marginRight: 5,
    },
    addText: {
      color: '#10230F',
      fontSize: 11,
      fontWeight: '900',
    },
    deleteButton: {
      minWidth: 72,
      minHeight: 38,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(216, 94, 120, 0.08)',
      borderWidth: 1,
      borderColor:
        'rgba(216, 94, 120, 0.25)',
      marginLeft: 5,
    },
    deleteText: {
      color: '#D85E78',
      fontSize: 11,
      fontWeight: '900',
    },
    emptyCard: {
      backgroundColor: CARD,
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.22)',
      padding: 22,
      alignItems: 'center',
    },
    emptyIcon: {
      color: NEON,
      fontSize: 42,
      fontWeight: '900',
    },
    emptyTitle: {
      color: TEXT,
      fontSize: 18,
      fontWeight: '900',
      marginTop: 9,
    },
    emptyText: {
      color: MUTED,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 6,
    },
  });

export default FavoriteMealsScreen;
