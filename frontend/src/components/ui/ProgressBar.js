import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function ProgressBar({
  value = 0, // 0 to 100
  color = COLORS.primary,
  height = 8,
  showLabel = false,
  style,
}) {
  // Clamp value smoothly
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  // Shared value for driving smooth animation updates
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(safeValue, { damping: 20, stiffness: 90 });
  }, [safeValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, borderRadius: height / 2 },
            animatedStyle,
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{`${Math.round(safeValue)}%`}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.neutral200,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  label: {
    marginLeft: SPACING[2],
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});
