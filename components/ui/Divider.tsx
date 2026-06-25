import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants/designSystem';

export interface DividerProps {
  style?: ViewStyle;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const Divider: React.FC<DividerProps> = ({
  style,
  spacing: dividerSpacing = 'md',
}) => {
  const getMarginVertical = () => {
    switch (dividerSpacing) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.sm;
      case 'lg':
        return spacing.lg;
      default:
        return spacing.md;
    }
  };

  return (
    <View
      style={[
        styles.divider,
        {
          marginVertical: getMarginVertical(),
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
});
