// FILE: src/AppNavigator.tsx
import React, {
  useEffect,
  useState,
} from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {
  useTranslation,
} from 'react-i18next';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import './i18n/caloLensHomeTranslations';
import './i18n/mealScannerTranslations';
import './i18n/mealScanAccessTranslations';
import './i18n/caloLensInsightsTranslations';
import './i18n/caloLensFoodToolsTranslations';

import CaloLensHomeScreen
  from './screens/CaloLensHomeScreen';
import {
  NutritionScreen,
} from './screens/NutritionScreen';
import {
  AdvancedMealPlanScreen,
} from './screens/AdvancedMealPlanScreen';
import MealScannerScreen
  from './screens/MealScannerScreen';
import MealReviewScreen
  from './screens/MealReviewScreen';
import MealLogScreen
  from './screens/MealLogScreen';
import PdfViewerScreen
  from './screens/PdfViewerScreen';
import WeeklyInsightsScreen
  from './screens/WeeklyInsightsScreen';
import FavoriteMealsScreen
  from './screens/FavoriteMealsScreen';
import QuickAddScreen
  from './screens/QuickAddScreen';
import FoodSearchScreen
  from './screens/FoodSearchScreen';
import FoodPortionScreen
  from './screens/FoodPortionScreen';
import BarcodeScannerScreen
  from './screens/BarcodeScannerScreen';
import CustomFoodScreen
  from './screens/CustomFoodScreen';
import RecipeBuilderScreen
  from './screens/RecipeBuilderScreen';

import {
  SettingsScreen,
} from './screens/SettingsScreen';
import {
  UserProfileScreen,
} from './screens/UserProfileScreen';
import {
  GuideScreen,
} from './screens/GuideScreen';
import {
  WeightChartScreen,
} from './screens/WeightChartScreen';
import {
  PremiumScreen,
} from './screens/PremiumScreen';

import {
  AdBanner,
} from './components/AdBanner';
import {
  useSubscription,
} from './iap/SubscriptionProvider';
import {
  PREMIUM_ENABLED,
} from './config/features';

const Tab =
  createBottomTabNavigator();

const Stack =
  createNativeStackNavigator();

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#788279';
const NEON = '#63C934';
const CYAN = '#18A39B';

const screenHeaderOptions = {
  headerStyle: {
    backgroundColor: BG,
  },
  headerTintColor: TEXT,
  headerTitleStyle: {
    color: TEXT,
    fontWeight:
      '900' as const,
    fontSize: 17,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: BG,
  },
};

const SharedNutritionScreens =
  ({
    t,
  }: {
    t: any;
  }) => (
    <>
      <Stack.Screen
        name="MealScanner"
        component={
          MealScannerScreen
        }
        options={{
          title: t(
            'mealScan.scannerTitle',
            'Scan your meal',
          ),
        }}
      />

      <Stack.Screen
        name="MealReview"
        component={
          MealReviewScreen
        }
        options={{
          title: t(
            'mealScan.reviewTitle',
            'Review meal',
          ),
        }}
      />

      <Stack.Screen
        name="MealLog"
        component={
          MealLogScreen
        }
        options={{
          title: t(
            'mealScan.logTitle',
            'Food log',
          ),
        }}
      />

      <Stack.Screen
        name="NutritionPlan"
        component={
          NutritionScreen
        }
        options={{
          title: t(
            'caloLens.fullPlan',
            'Nutrition plan',
          ),
        }}
      />

      <Stack.Screen
        name="AdvancedMealPlan"
        component={
          AdvancedMealPlanScreen
        }
        options={{
          title: t(
            'nutrition.advancedMealPlan',
            'Advanced meal plan',
          ),
        }}
      />

      <Stack.Screen
        name="PdfViewer"
        component={
          PdfViewerScreen
        }
        options={{
          title: t(
            'nutrition.pdfTitle',
            'Nutrition PDF',
          ),
        }}
      />

      <Stack.Screen
        name="WeeklyInsights"
        component={
          WeeklyInsightsScreen
        }
        options={{
          title: t(
            'caloLensInsights.weeklyTitle',
            'Weekly nutrition report',
          ),
        }}
      />

      <Stack.Screen
        name="FavoriteMeals"
        component={
          FavoriteMealsScreen
        }
        options={{
          title: t(
            'caloLensInsights.favoriteMealsTitle',
            'Favorite meals',
          ),
        }}
      />

      <Stack.Screen
        name="QuickAdd"
        component={
          QuickAddScreen
        }
        options={{
          title: t(
            'foodTools.addTab',
            'Add food',
          ),
        }}
      />

      <Stack.Screen
        name="FoodSearch"
        component={
          FoodSearchScreen
        }
        options={{
          title: t(
            'foodTools.searchFood',
            'Search food',
          ),
        }}
      />

      <Stack.Screen
        name="FoodPortion"
        component={
          FoodPortionScreen
        }
        options={{
          title: t(
            'foodTools.quickPortion',
            'Portion',
          ),
        }}
      />

      <Stack.Screen
        name="BarcodeScanner"
        component={
          BarcodeScannerScreen
        }
        options={{
          title: t(
            'foodTools.scanBarcode',
            'Scan barcode',
          ),
        }}
      />

      <Stack.Screen
        name="CustomFood"
        component={
          CustomFoodScreen
        }
        options={{
          title: t(
            'foodTools.createFood',
            'Create custom food',
          ),
        }}
      />

      <Stack.Screen
        name="RecipeBuilder"
        component={
          RecipeBuilderScreen
        }
        options={{
          title: t(
            'foodTools.recipeBuilder',
            'Recipe builder',
          ),
        }}
      />

      <Stack.Screen
        name="UserProfile"
        component={
          UserProfileScreen
        }
        options={{
          title: t(
            'tabs.profile',
            'User Profile',
          ),
        }}
      />

      {PREMIUM_ENABLED ? (
        <Stack.Screen
          name="Premium"
          component={
            PremiumScreen
          }
          options={{
            title: t(
              'tabs.premium',
              'Premium',
            ),
          }}
        />
      ) : null}
    </>
  );

const TodayStack:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <Stack.Navigator
      screenOptions={
        screenHeaderOptions
      }
    >
      <Stack.Screen
        name="CaloLensHome"
        component={
          CaloLensHomeScreen
        }
        options={{
          headerShown: false,
        }}
      />

      {SharedNutritionScreens({
        t,
      })}
    </Stack.Navigator>
  );
};

const DiaryStack:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <Stack.Navigator
      screenOptions={
        screenHeaderOptions
      }
    >
      <Stack.Screen
        name="DiaryHome"
        component={
          MealLogScreen
        }
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MealScanner"
        component={
          MealScannerScreen
        }
        options={{
          title: t(
            'mealScan.scannerTitle',
            'Scan your meal',
          ),
        }}
      />

      <Stack.Screen
        name="MealReview"
        component={
          MealReviewScreen
        }
        options={{
          title: t(
            'mealScan.reviewTitle',
            'Review meal',
          ),
        }}
      />

      <Stack.Screen
        name="FavoriteMeals"
        component={
          FavoriteMealsScreen
        }
        options={{
          title: t(
            'caloLensInsights.favoriteMealsTitle',
            'Favorite meals',
          ),
        }}
      />

      <Stack.Screen
        name="WeeklyInsights"
        component={
          WeeklyInsightsScreen
        }
        options={{
          title: t(
            'caloLensInsights.weeklyTitle',
            'Weekly nutrition report',
          ),
        }}
      />

      {PREMIUM_ENABLED ? (
        <Stack.Screen
          name="Premium"
          component={
            PremiumScreen
          }
          options={{
            title: t(
              'tabs.premium',
              'Premium',
            ),
          }}
        />
      ) : null}
    </Stack.Navigator>
  );
};

const ScanStack:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <Stack.Navigator
      screenOptions={
        screenHeaderOptions
      }
    >
      <Stack.Screen
        name="ScanHome"
        component={
          MealScannerScreen
        }
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="QuickAdd"
        component={
          QuickAddScreen
        }
        options={{
          title: t(
            'foodTools.addTab',
            'Add food',
          ),
        }}
      />

      <Stack.Screen
        name="FoodSearch"
        component={
          FoodSearchScreen
        }
        options={{
          title: t(
            'foodTools.searchFood',
            'Search food',
          ),
        }}
      />

      <Stack.Screen
        name="FoodPortion"
        component={
          FoodPortionScreen
        }
        options={{
          title: t(
            'foodTools.quickPortion',
            'Portion',
          ),
        }}
      />

      <Stack.Screen
        name="BarcodeScanner"
        component={
          BarcodeScannerScreen
        }
        options={{
          title: t(
            'foodTools.scanBarcode',
            'Scan barcode',
          ),
        }}
      />

      <Stack.Screen
        name="CustomFood"
        component={
          CustomFoodScreen
        }
        options={{
          title: t(
            'foodTools.createFood',
            'Create custom food',
          ),
        }}
      />

      <Stack.Screen
        name="RecipeBuilder"
        component={
          RecipeBuilderScreen
        }
        options={{
          title: t(
            'foodTools.recipeBuilder',
            'Recipe builder',
          ),
        }}
      />

      <Stack.Screen
        name="FavoriteMeals"
        component={
          FavoriteMealsScreen
        }
        options={{
          title: t(
            'caloLensInsights.favoriteMealsTitle',
            'Favorite meals',
          ),
        }}
      />


      <Stack.Screen
        name="MealReview"
        component={
          MealReviewScreen
        }
        options={{
          title: t(
            'mealScan.reviewTitle',
            'Review meal',
          ),
        }}
      />

      <Stack.Screen
        name="MealLog"
        component={
          MealLogScreen
        }
        options={{
          title: t(
            'mealScan.logTitle',
            'Food log',
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const ProgressStack:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <Stack.Navigator
      screenOptions={
        screenHeaderOptions
      }
    >
      <Stack.Screen
        name="ProgressHome"
        component={
          WeightChartScreen
        }
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="WeeklyInsights"
        component={
          WeeklyInsightsScreen
        }
        options={{
          title: t(
            'caloLensInsights.weeklyTitle',
            'Weekly nutrition report',
          ),
        }}
      />

      <Stack.Screen
        name="UserProfile"
        component={
          UserProfileScreen
        }
        options={{
          title: t(
            'tabs.profile',
            'User Profile',
          ),
        }}
      />

      <Stack.Screen
        name="MealLog"
        component={
          MealLogScreen
        }
        options={{
          title: t(
            'mealScan.logTitle',
            'Food log',
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <Stack.Navigator
      screenOptions={
        screenHeaderOptions
      }
    >
      <Stack.Screen
        name="MoreHome"
        component={
          SettingsScreen
        }
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="UserProfile"
        component={
          UserProfileScreen
        }
        options={{
          title: t(
            'tabs.profile',
            'User Profile',
          ),
        }}
      />

      <Stack.Screen
        name="Guide"
        component={
          GuideScreen
        }
        options={{
          title: t(
            'tabs.guide',
            'Guide',
          ),
        }}
      />

      <Stack.Screen
        name="WeightChart"
        component={
          WeightChartScreen
        }
        options={{
          title: t(
            'tabs.weightChart',
            'Weight Tracking',
          ),
        }}
      />

      <Stack.Screen
        name="NutritionPlan"
        component={
          NutritionScreen
        }
        options={{
          title: t(
            'caloLens.fullPlan',
            'Nutrition plan',
          ),
        }}
      />

      {PREMIUM_ENABLED ? (
        <Stack.Screen
          name="Premium"
          component={
            PremiumScreen
          }
          options={{
            title: t(
              'tabs.premium',
              'Premium',
            ),
          }}
        />
      ) : null}
    </Stack.Navigator>
  );
};

const StandardTabIcon:
React.FC<{
  icon: string;
  color: string;
  focused: boolean;
}> = ({
  icon,
  color,
  focused,
}) => (
  <View
    style={[
      styles.tabIconWrap,
      focused &&
        styles.tabIconWrapActive,
    ]}
  >
    <Text
      style={[
        styles.tabIcon,
        {
          color,
        },
      ]}
    >
      {icon}
    </Text>
  </View>
);

const ScanTabIcon:
React.FC<{
  focused: boolean;
}> = ({
  focused,
}) => (
  <View
    style={[
      styles.scanIconWrap,
      focused &&
        styles.scanIconWrapActive,
    ]}
  >
    <Text style={styles.scanIcon}>
      📷
    </Text>
  </View>
);

export const AppNavigator:
React.FC = () => {
  const {t} =
    useTranslation();

  const insets =
    useSafeAreaInsets();

  const {
    isPremium,
  } =
    useSubscription();

  const [
    keyboardVisible,
    setKeyboardVisible,
  ] =
    useState(false);

  useEffect(() => {
    const showSub =
      Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(
            true,
          );
        },
      );

    const hideSub =
      Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(
            false,
          );
        },
      );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const extraBottom =
    Platform.OS === 'android'
      ? Math.max(
          insets.bottom,
          8,
        )
      : Math.max(
          insets.bottom,
          8,
        );

  const tabButtonHeight =
    60 + extraBottom;

  const bannerHeight =
    isPremium
      ? 0
      : 68;

  const totalBottomHeight =
    tabButtonHeight +
    bannerHeight;

  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="Today"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor:
              CARD,
            borderTopColor:
              'rgba(99, 201, 52, 0.20)',
            borderTopWidth: 1,
            height:
              totalBottomHeight,
            paddingTop:
              bannerHeight + 6,
            paddingBottom:
              extraBottom,
            shadowColor:
              '#7A897D',
            shadowOpacity:
              0.12,
            shadowRadius: 12,
            shadowOffset: {
              width: 0,
              height: -4,
            },
            elevation: 16,
          },
          tabBarActiveTintColor:
            NEON,
          tabBarInactiveTintColor:
            MUTED,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '900',
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          tabBarHideOnKeyboard:
            true,
        }}
      >
        <Tab.Screen
          name="Today"
          component={
            TodayStack
          }
          options={{
            tabBarLabel: t(
              'caloLens.tabs.today',
              'Today',
            ),
            tabBarIcon: ({
              color,
              focused,
            }) => (
              <StandardTabIcon
                icon="⌂"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Diary"
          component={
            DiaryStack
          }
          options={{
            tabBarLabel: t(
              'caloLens.tabs.diary',
              'Diary',
            ),
            tabBarIcon: ({
              color,
              focused,
            }) => (
              <StandardTabIcon
                icon="▤"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Scan"
          component={
            ScanStack
          }
          options={{
            tabBarLabel: t(
              'caloLens.tabs.scan',
              'Scan',
            ),
            tabBarIcon: ({
              focused,
            }) => (
              <ScanTabIcon
                focused={focused}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Progress"
          component={
            ProgressStack
          }
          options={{
            tabBarLabel: t(
              'caloLens.tabs.progress',
              'Progress',
            ),
            tabBarIcon: ({
              color,
              focused,
            }) => (
              <StandardTabIcon
                icon="⌁"
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={
            SettingsStack
          }
          options={{
            tabBarLabel: t(
              'caloLens.tabs.more',
              'More',
            ),
            tabBarIcon: ({
              color,
              focused,
            }) => (
              <StandardTabIcon
                icon="⚙"
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tab.Navigator>

      {!keyboardVisible &&
      !isPremium ? (
        <View
          style={[
            styles.bannerAboveTab,
            {
              bottom:
                tabButtonHeight,
              height:
                bannerHeight,
            },
          ]}
        >
          <AdBanner />
        </View>
      ) : null}
    </View>
  );
};

const styles =
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: BG,
    },
    tabIconWrap: {
      minWidth: 34,
      height: 27,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent:
        'center',
    },
    tabIconWrapActive: {
      backgroundColor:
        'rgba(99, 201, 52, 0.13)',
      borderWidth: 1,
      borderColor:
        'rgba(99, 201, 52, 0.30)',
    },
    tabIcon: {
      fontSize: 19,
      fontWeight: '900',
    },
    scanIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor: NEON,
      borderWidth: 4,
      borderColor: CARD,
      transform: [
        {
          translateY: -9,
        },
      ],
      shadowColor: NEON,
      shadowOpacity: 0.28,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 8,
    },
    scanIconWrapActive: {
      backgroundColor: CYAN,
      transform: [
        {
          translateY: -11,
        },
        {
          scale: 1.04,
        },
      ],
    },
    scanIcon: {
      fontSize: 23,
      lineHeight: 27,
    },
    bannerAboveTab: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 999,
      elevation: 999,
      backgroundColor: CARD,
      borderTopWidth:
        StyleSheet.hairlineWidth,
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      borderTopColor:
        'rgba(99, 201, 52, 0.20)',
      borderBottomColor:
        'rgba(109, 120, 111, 0.14)',
      paddingTop: 4,
      paddingBottom: 4,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent:
        'center',
    },
  });

export default AppNavigator;
