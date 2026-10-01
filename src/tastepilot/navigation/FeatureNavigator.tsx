import React, {useEffect} from 'react';
import {Pressable, Text, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {AppProvider} from '../context/AppContext';
import {ProductionErrorBoundary} from '../components/ProductionErrorBoundary';
import {HomeScreen} from '../screens/HomeScreen';
import {SavedScreen} from '../screens/SavedScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {DailyMealScreen} from '../screens/DailyMealScreen';
import {TravelFoodScreen} from '../screens/TravelFoodScreen';
import {MealResultsScreen} from '../screens/MealResultsScreen';
import {RestaurantsScreen} from '../screens/RestaurantsScreen';
import {RestaurantDetailScreen} from '../screens/RestaurantDetailScreen';
import {GroupModeScreen} from '../screens/GroupModeScreen';
import {WeeklyPlannerScreen} from '../screens/WeeklyPlannerScreen';
import {SurpriseMeScreen} from '../screens/SurpriseMeScreen';
import {FoodSearchScreen} from '../screens/FoodSearchScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function PremiumBridgeScreen() {
  const navigation = useNavigation<any>();
  const {t} = useTranslation('tastePilot');

  useEffect(() => {
    const parent = navigation.getParent();
    if (parent?.navigate) {
      parent.navigate('Premium');
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff9f1'}}>
      <Text style={{fontSize: 15, color: '#6c5a50', textAlign: 'center'}}>{t('premiumTitle')}</Text>
    </View>
  );
}

function FeatureStack() {
  const navigation = useNavigation<any>();
  const {t} = useTranslation('tastePilot');

  return (
    <ProductionErrorBoundary
      title={t('productionErrorTitle')}
      message={t('productionErrorMessage')}
      retry={t('productionErrorRetry')}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerBackTitle: t('common.back'),
          headerShadowVisible: false,
          headerStyle: {backgroundColor: '#fff9f1'},
          headerTintColor: '#35231c',
          headerTitleStyle: {fontWeight: '800'},
          contentStyle: {backgroundColor: '#fff9f1'},
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'CaloLens Discover',
            headerLeft: () => (
              <Pressable
                onPress={() => navigation.goBack()}
                hitSlop={12}
                style={{paddingRight: 14, paddingVertical: 6}}>
                <Text style={{fontSize: 24, color: '#35231c'}}>‹</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen name="Saved" component={SavedScreen} options={{title: t('tabs.saved')}} />
        <Stack.Screen name="History" component={HistoryScreen} options={{title: t('tabs.history')}} />
        <Stack.Screen name="DiscoverProfile" component={ProfileScreen} options={{title: t('tabs.profile')}} />
        <Stack.Screen name="DailyMeal" component={DailyMealScreen} options={{title: t('screens.dailyMeal')}} />
        <Stack.Screen name="TravelFood" component={TravelFoodScreen} options={{title: t('screens.travelFood')}} />
        <Stack.Screen name="GroupMode" component={GroupModeScreen} options={{title: t('groupTitle')}} />
        <Stack.Screen name="WeeklyPlanner" component={WeeklyPlannerScreen} options={{title: t('plannerTitle')}} />
        <Stack.Screen name="SurpriseMe" component={SurpriseMeScreen} options={{title: t('surpriseTitle')}} />
        <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{title: t('foodSearch.title')}} />
        <Stack.Screen name="Premium" component={PremiumBridgeScreen} options={{title: t('premiumTitle')}} />
        <Stack.Screen name="MealResults" component={MealResultsScreen} options={{title: t('screens.suggestions')}} />
        <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{title: t('screens.nearbyPlaces')}} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: t('screens.restaurant')}} />
      </Stack.Navigator>
    </ProductionErrorBoundary>
  );
}

export function TastePilotFeatureNavigator() {
  return (
    <AppProvider>
      <FeatureStack />
    </AppProvider>
  );
}

export default TastePilotFeatureNavigator;
