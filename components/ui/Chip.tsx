import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/designSystem';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'default' | 'primary' | 'outline';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  style,
  textStyle,
  variant = 'default',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceLight;
    if (selected) return colors.primary;
    if (variant === 'primary') return colors.primary;
    if (variant === 'outline') return 'transparent';
    return colors.surface;
  };

  const getBorderColor = () => {
    if (variant === 'outline' || selected) return colors.primary;
    return colors.border;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (selected || variant === 'primary') return colors.white;
    if (variant === 'outline') return colors.primary;
    return colors.textPrimary;
  };

  const ChipComponent = onPress ? TouchableOpacity : View;

  return (
    <ChipComponent
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </ChipComponent>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
