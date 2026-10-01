import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  top?: number;
  right?: number;
  width?: number;
  height?: number;
  opacity?: number;
};

export const HeroFoodCornerAccent: React.FC<Props> = ({
  top = 0,
  right = -18,
  width = 210,
  height = 182,
  opacity = 0.18,
}) => {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          top,
          right,
          width,
          height,
        },
      ]}
    >
      <Image
        source={require('../assets/calo_home_hero_food.jpg')}
        style={[
          styles.image,
          {
            opacity,
            width,
            height,
          },
        ]}
        resizeMode="cover"
      />
      <View style={styles.tint} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    overflow: 'hidden',
    borderBottomLeftRadius: 96,
    borderTopLeftRadius: 32,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(255, 166, 97, 0.08)',
    zIndex: 0,
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 242, 0.30)',
  },
});

export default HeroFoodCornerAccent;
