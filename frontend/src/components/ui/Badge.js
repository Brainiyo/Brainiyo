import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export default function Badge({ label, variant = 'neutral', style, textStyle }) {
  let bgColor = COLORS.neutral100;
  let textColor = COLORS.textSecondary;

  switch (variant) {
    case 'success':
      bgColor = COLORS.successLight;
      textColor = COLORS.successDark;
      break;
    case 'danger':
      bgColor = COLORS.dangerLight;
      textColor = COLORS.dangerDark;
      break;
    case 'warning':
      bgColor = COLORS.warningLight;
      textColor = COLORS.warningDark;
      break;
    case 'info':
      bgColor = COLORS.infoLight;
      textColor = COLORS.info;
      break;
    case 'primary':
      bgColor = COLORS.primaryLight;
      textColor = COLORS.primary;
      break;
    default:
      bgColor = COLORS.neutral100;
      textColor = COLORS.textSecondary;
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1] - 2, // very tight padding for badges
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
});
