import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Clean, soft layered background for better readability */
export function GradientBackground({ children, style }: GradientBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.base} />
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.gradientMid,
  },
  topWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: 'rgba(82, 183, 136, 0.18)',
  },
  bottomWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: 'rgba(244, 162, 97, 0.10)',
  },
});
