import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  variant?: 'guidance' | 'hero';
  height?: number;
  compact?: boolean;
};

export const FoodAccentCard: React.FC<Props> = ({
  variant = 'guidance',
  height = 154,
  compact = false,
}) => {
  const source =
    variant === 'hero'
      ? require('../assets/calo_home_hero_food.jpg')
      : require('../assets/calo_guidance_food.jpg');

  return (
    <View
      pointerEvents="none"
      style={[
        styles.shell,
        {height},
        compact && styles.shellCompact,
      ]}
    >
      <ImageBackground
        source={source}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.glowA} />
        <View style={styles.glowB} />
        <View style={styles.bottomFade} />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 33, 0.16)',
    backgroundColor: '#FFF2E8',
    marginTop: 16,
    shadowColor: '#C8733B',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 7},
    elevation: 3,
  },
  shellCompact: {
    borderRadius: 20,
    marginTop: 12,
  },
  image: {
    flex: 1,
    overflow: 'hidden',
  },
  imageRadius: {
    borderRadius: 24,
  },
  glowA: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -58,
    top: -54,
    backgroundColor: 'rgba(255, 153, 74, 0.16)',
  },
  glowB: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderRadius: 58,
    right: -28,
    bottom: -50,
    backgroundColor: 'rgba(255, 106, 33, 0.17)',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 34,
    backgroundColor: 'rgba(255, 248, 242, 0.20)',
  },
});

export default FoodAccentCard;
