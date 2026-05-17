import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing 
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import Button from '../../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export default function WelcomeScreen({ navigation }) {
  // Animation triggers
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(40);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo fade + slide up
    logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    logoTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });
    
    // Staggered taglines + trigger button reveal
    contentOpacity.value = withDelay(
      600, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background with geometric shapes */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Circle cx="90%" cy="-5%" r="250" fill={COLORS.primaryMid} opacity="0.15" />
          <Circle cx="-10%" cy="60%" r="300" fill={COLORS.secondary} opacity="0.1" />
          <Path 
            d="M0,400 Q200,300 400,500 T800,450" 
            fill="none" 
            stroke={COLORS.white} 
            strokeWidth="1.5" 
            opacity="0.05" 
          />
        </Svg>
      </View>

      {/* Main Brand Column */}
      <View style={styles.centerCol}>
        <Animated.View style={[styles.brandBox, logoAnimatedStyle]}>
          {/* Simulated brain graphic icon using SVG paths */}
          <View style={styles.iconCircle}>
            <Svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <Path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </Svg>
          </View>
          <Text style={styles.appName}>Brainiyo</Text>
        </Animated.View>

        <Animated.View style={[styles.subBox, contentAnimatedStyle]}>
          <Text style={styles.tagline}>Master every concept.{'\n'}Crack NEET & JEE.</Text>
        </Animated.View>
      </View>

      {/* Trigger Bottom CTA Panel */}
      <Animated.View style={[styles.bottomCol, contentAnimatedStyle]}>
        <Button
          label="Get Started"
          onPress={() => navigation.navigate('Onboarding')}
          variant="outline"
          size="lg"
          style={styles.btn}
          textStyle={styles.btnText}
        />
        
        {/* Navigation link bypass for returning accounts */}
        <Text style={styles.loginHint}>
          Already have an account?{' '}
          <Text 
            style={styles.loginLink} 
            onPress={() => navigation.navigate('Login')}
          >
            Log in
          </Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
  },
  centerCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  brandBox: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[4],
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  appName: {
    fontSize: TYPOGRAPHY.size['3xl'] + 6,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subBox: {
    marginTop: SPACING[3],
  },
  tagline: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.primaryLight,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  bottomCol: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[10],
  },
  btn: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
    elevation: 4,
  },
  btnText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  loginHint: {
    marginTop: SPACING[4],
    textAlign: 'center',
    color: COLORS.primaryLight,
    fontSize: TYPOGRAPHY.size.sm,
  },
  loginLink: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weight.bold,
    textDecorationLine: 'underline',
  },
});
