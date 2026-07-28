// FILE: src/screens/GuideScreen.tsx
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useTranslation,
} from 'react-i18next';

import '../i18n/caloLensGuideTranslations';

const STEP_IMAGES = {
  step1:
    require(
      '../../assets/images/nutrition_hero.png',
    ),
  step2:
    require(
      '../../assets/images/meal_breakfast.png',
    ),
  step3:
    require(
      '../../assets/images/meal_lunch.png',
    ),
  step4:
    require(
      '../../assets/images/meal_dinner.png',
    ),
};

const BG = '#F5F8F2';
const CARD = '#FFFFFF';
const TEXT = '#17211A';
const MUTED = '#6D786F';
const NEON = '#63C934';
const CYAN = '#18A39B';
const BORDER = '#DDE8D9';

type StepCardProps = {
  step: string;
  title: string;
  desc: string;
  image: any;
};

const StepCard:
React.FC<StepCardProps> = ({
  step,
  title,
  desc,
  image,
}) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>
          {step}
        </Text>
      </View>

      <View style={styles.stepIcon}>
        <Text style={styles.stepIconText}>
          ✓
        </Text>
      </View>
    </View>

    <Text style={styles.cardTitle}>
      {title}
    </Text>

    <Text style={styles.cardText}>
      {desc}
    </Text>

    <View style={styles.imageWrap}>
      <Image
        source={image}
        style={styles.cardImage}
        resizeMode="cover"
      />

      <View style={styles.imageShade} />
    </View>
  </View>
);

export const GuideScreen:
React.FC = () => {
  const {t} =
    useTranslation();

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BG}
      />

      <View
        pointerEvents="none"
        style={styles.glowTop}
      />

      <View
        pointerEvents="none"
        style={styles.glowBottom}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.hero}>
          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>
              {t(
                'caloLensGuide.kicker',
                'GET STARTED',
              )}
            </Text>
          </View>

          <Text style={styles.title}>
            {t(
              'caloLensGuide.title',
              'How to use CaloLens',
            )}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              'caloLensGuide.subtitle',
              'Follow four simple steps to calculate your target, scan meals and track daily nutrition.',
            )}
          </Text>
        </View>

        <StepCard
          step={t(
            'caloLensGuide.step1Badge',
            'STEP 1',
          )}
          title={t(
            'caloLensGuide.step1Title',
            'Complete your body profile',
          )}
          desc={t(
            'caloLensGuide.step1Desc',
            'Enter age, height, weight, activity level and body goal so CaloLens can calculate daily calories and macros.',
          )}
          image={STEP_IMAGES.step1}
        />

        <StepCard
          step={t(
            'caloLensGuide.step2Badge',
            'STEP 2',
          )}
          title={t(
            'caloLensGuide.step2Title',
            'Take one clear meal photo',
          )}
          desc={t(
            'caloLensGuide.step2Desc',
            'Place the full meal in the frame with good lighting, then use Scan to estimate foods, portions and nutrition.',
          )}
          image={STEP_IMAGES.step2}
        />

        <StepCard
          step={t(
            'caloLensGuide.step3Badge',
            'STEP 3',
          )}
          title={t(
            'caloLensGuide.step3Title',
            'Review portions before saving',
          )}
          desc={t(
            'caloLensGuide.step3Desc',
            'Correct food names, grams and nutrition values when needed. Photo analysis is an estimate, not an exact measurement.',
          )}
          image={STEP_IMAGES.step3}
        />

        <StepCard
          step={t(
            'caloLensGuide.step4Badge',
            'STEP 4',
          )}
          title={t(
            'caloLensGuide.step4Title',
            'Follow your daily balance',
          )}
          desc={t(
            'caloLensGuide.step4Desc',
            'Use the Today and Diary tabs to check remaining calories, protein, carbs, fats and your weight trend.',
          )}
          image={STEP_IMAGES.step4}
        />

        <View style={styles.noteBox}>
          <View style={styles.noteIcon}>
            <Text style={styles.noteIconText}>
              💡
            </Text>
          </View>

          <View style={styles.noteBody}>
            <Text style={styles.noteTitle}>
              {t(
                'caloLensGuide.noteTitle',
                'Keep estimates realistic',
              )}
            </Text>

            <Text style={styles.noteText}>
              {t(
                'caloLensGuide.note',
                'Cooking oil, sauces and hidden ingredients can change calories significantly. Adjust the result when you know the actual recipe or portion.',
              )}
            </Text>
          </View>
        </View>
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
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 8,
      paddingTop: 18,
      paddingBottom: 160,
    },
    glowTop: {
      position: 'absolute',
      top: -90,
      right: -90,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
    },
    glowBottom: {
      position: 'absolute',
      bottom: 60,
      left: -110,
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor:
        'rgba(99, 201, 52, 0.08)',
    },
    hero: {
      paddingHorizontal: 5,
      marginBottom: 18,
    },
    kickerPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor:
        'rgba(24, 163, 155, 0.30)',
      backgroundColor:
        'rgba(24, 163, 155, 0.08)',
      marginBottom: 14,
    },
    kickerText: {
      color: CYAN,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    title: {
      color: TEXT,
      fontSize: 34,
      lineHeight: 40,
      fontWeight: '900',
    },
    subtitle: {
      color: MUTED,
      fontSize: 14,
      lineHeight: 21,
      marginTop: 9,
      maxWidth: 360,
    },
    card: {
      backgroundColor: CARD,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: BORDER,
      padding: 15,
      marginBottom: 12,
      shadowColor: '#879487',
      shadowOpacity: 0.08,
      shadowRadius: 11,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },
    stepBadge: {
      backgroundColor:
        'rgba(99, 201, 52, 0.10)',
      borderColor:
        'rgba(99, 201, 52, 0.30)',
      borderWidth: 1,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 12,
    },
    stepBadgeText: {
      color: NEON,
      fontSize: 11,
      fontWeight: '900',
    },
    stepIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: NEON,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIconText: {
      color: '#10230F',
      fontSize: 17,
      fontWeight: '900',
    },
    cardTitle: {
      color: TEXT,
      fontSize: 19,
      fontWeight: '900',
      marginBottom: 7,
    },
    cardText: {
      color: MUTED,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 13,
    },
    imageWrap: {
      width: '100%',
      height: 185,
      borderRadius: 17,
      overflow: 'hidden',
      backgroundColor: '#EEF4EA',
      borderWidth: 1,
      borderColor: BORDER,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    imageShade: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(255, 255, 255, 0.06)',
    },
    noteBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#FFF9E8',
      borderColor: '#F0DBA2',
      borderWidth: 1,
      borderRadius: 20,
      padding: 14,
      marginTop: 3,
    },
    noteIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFF0B8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },
    noteIconText: {
      fontSize: 20,
    },
    noteBody: {
      flex: 1,
    },
    noteTitle: {
      color: '#8B6500',
      fontSize: 16,
      fontWeight: '900',
    },
    noteText: {
      color: '#5C594E',
      fontSize: 13,
      lineHeight: 20,
      marginTop: 5,
    },
  });

export default GuideScreen;
