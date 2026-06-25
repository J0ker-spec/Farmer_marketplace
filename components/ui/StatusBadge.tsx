import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../constants/designSystem';

export type StatusType = 
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'active'
  | 'inactive'
  | 'out_of_stock'
  | 'draft'
  | 'approved'
  | 'rejected';

export interface StatusBadgeProps {
  status: StatusType;
  style?: ViewStyle;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
  size = 'medium',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          backgroundColor: colors.warning,
          text: 'Pending',
        };
      case 'confirmed':
        return {
          backgroundColor: colors.primary,
          text: 'Confirmed',
        };
      case 'packed':
        return {
          backgroundColor: colors.primaryLight,
          text: 'Packed',
        };
      case 'shipped':
        return {
          backgroundColor: colors.escrowBlue,
          text: 'Shipped',
        };
      case 'delivered':
        return {
          backgroundColor: colors.success,
          text: 'Delivered',
        };
      case 'cancelled':
      case 'rejected':
        return {
          backgroundColor: colors.error,
          text: status === 'cancelled' ? 'Cancelled' : 'Rejected',
        };
      case 'active':
      case 'approved':
        return {
          backgroundColor: colors.success,
          text: status === 'active' ? 'Active' : 'Approved',
        };
      case 'inactive':
        return {
          backgroundColor: colors.textSecondary,
          text: 'Inactive',
        };
      case 'out_of_stock':
        return {
          backgroundColor: colors.sold,
          text: 'Out of Stock',
        };
      case 'draft':
        return {
          backgroundColor: colors.textMuted,
          text: 'Draft',
        };
      default:
        return {
          backgroundColor: colors.textSecondary,
          text: status,
        };
    }
  };

  const config = getStatusConfig();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? spacing.xs : spacing.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: isSmall ? typography.fontSize.caption : typography.fontSize.label,
          },
        ]}
      >
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});
