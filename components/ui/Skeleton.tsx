import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors } from '../../constants/designSystem';

export interface SkeletonProps {
  style?: ViewStyle;
  width?: number | `${number}%`;
  height?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  style,
  width,
  height = 20,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Skeleton style={styles.image} height={160} />
    <View style={styles.content}>
      <Skeleton style={styles.title} height={20} width="70%" />
      <Skeleton style={styles.subtitle} height={16} width="40%" />
      <Skeleton style={styles.description} height={14} width="90%" />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ count?: number; style?: ViewStyle }> = ({ 
  count = 3, 
  style 
}) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} style={styles.cardItem} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 8,
  },
  cardItem: {
    marginBottom: 16,
  },
});
