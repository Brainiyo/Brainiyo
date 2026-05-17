import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

// Wrap native Circle element into an animated component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgress({
  value = 0, // 0 to 100
  size = 64,
  strokeWidth = 6,
  color = COLORS.primary,
  label,
  sublabel,
  style,
}) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(safeValue, { duration: 800 });
  }, [safeValue]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          stroke={COLORS.neutral100}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Animated main loop arc */}
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      
      {/* Center overlays */}
      <View style={styles.content}>
        {label ? (
          <Text style={[styles.label, { fontSize: size * 0.25 }]} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
        {sublabel ? (
          <Text style={[styles.sublabel, { fontSize: size * 0.12 }]} numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  sublabel: {
    color: COLORS.textMuted,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});
