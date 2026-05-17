import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SIZES } from '../../constants/theme';

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  // Determine styles based on variant
  let bgColor = COLORS.primary;
  let borderColor = 'transparent';
  let textColor = COLORS.white;

  switch (variant) {
    case 'secondary':
      bgColor = COLORS.secondary;
      textColor = COLORS.white;
      break;
    case 'outline':
      bgColor = 'transparent';
      borderColor = COLORS.border;
      textColor = COLORS.text;
      break;
    case 'ghost':
      bgColor = 'transparent';
      textColor = COLORS.primary;
      break;
    case 'danger':
      bgColor = COLORS.danger;
      textColor = COLORS.white;
      break;
    default: // primary
      bgColor = COLORS.primary;
      textColor = COLORS.white;
      break;
  }

  // Determine size padding
  let py = SPACING[3];
  let px = SPACING[4];
  let fontSize = TYPOGRAPHY.size.base;

  if (size === 'sm') {
    py = SPACING[2];
    px = SPACING[3];
    fontSize = TYPOGRAPHY.size.sm;
  } else if (size === 'lg') {
    py = SPACING[4];
    px = SPACING[6];
    fontSize = TYPOGRAPHY.size.lg;
  }

  const isOutlineOrGhost = variant === 'outline' || variant === 'ghost';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? (isOutlineOrGhost ? 'transparent' : COLORS.neutral300) : bgColor,
          borderColor: disabled && variant === 'outline' ? COLORS.neutral300 : borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: py,
          paddingHorizontal: px,
          minHeight: SIZES.touchTarget, // accessible touch target
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutlineOrGhost ? COLORS.primary : COLORS.white} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              {
                color: disabled ? COLORS.neutral400 : textColor,
                fontSize,
                fontWeight: TYPOGRAPHY.weight.semibold,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: SPACING[2],
  },
});
