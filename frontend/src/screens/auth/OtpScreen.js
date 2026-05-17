import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import Button from '../../components/ui/Button';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { ApiService } from '../../api/client';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function OtpScreen({ route, navigation }) {
  // Extract passed phone verification parameters
  const phone = route?.params?.phone || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Input array references mapping fast keyboard jumping
  const inputRefs = useRef([]);

  // Store trigger actions
  const setAuth = useAuthStore((state) => state.setAuth);
  const onboarding = useAuthStore((state) => state.onboarding);
  const setCompletedOnboarding = useAppStore((state) => state.setCompletedOnboarding);

  // Animated triggers driving UI box errors
  const shakeVal = useSharedValue(0);

  // Countdown clock loop
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle shake trigger on error
  const triggerShake = () => {
    shakeVal.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeVal.value }],
  }));

  const handleChange = (text, index) => {
    // Only accept numeric inputs
    const value = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = value.charAt(0);
    setOtp(newOtp);
    if (errorMsg) setErrorMsg('');

    // Advance input focus pointer automatically
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Pop cursor backward on empty backspaces
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      // Clear previous box contents
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    setErrorMsg('');

    try {
      // Trigger full backend payload confirmation
      const res = await ApiService.verifyOtp(phone, code, onboarding);
      
      setLoading(false);
      
      // Update global application session state
      if (res?.token) {
        setAuth(res.user || { phone, name: onboarding.name }, res.token);
        setCompletedOnboarding(true);
        // Root stack routes automatically adjust based on global authentication state variables
      } else {
        throw new Error('Authentication validation structure failed to expose valid token maps.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Verification token failed alignment.');
      triggerShake();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErrorMsg('');
    setTimer(60);
    try {
      await ApiService.sendOtp(phone);
    } catch (err) {
      setErrorMsg('Failed to resend confirmation loops.');
    }
  };

  const isComplete = otp.every((v) => v.length === 1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScreenHeader showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.textCol}>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            We've dispatched a 6-digit access hash to{'\n'}
            <Text style={styles.phoneText}>+91 {phone}</Text>
          </Text>
        </View>

        {/* Dynamic Animated input boxes */}
        <Animated.View style={[styles.boxesContainer, shakeStyle]}>
          {otp.map((digit, idx) => {
            const isFocused = focusedIndex === idx;
            return (
              <TextInput
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                style={[
                  styles.box,
                  isFocused && styles.boxFocused,
                  errorMsg ? styles.boxError : null,
                ]}
                value={digit}
                onChangeText={(txt) => handleChange(txt, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                onFocus={() => setFocusedIndex(idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            );
          })}
        </Animated.View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        {/* Resend actions loop */}
        <View style={styles.resendRow}>
          <Text style={styles.resendHint}>Didn't receive code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0}
            activeOpacity={0.6}
          >
            <Text style={[styles.resendLink, timer > 0 && styles.resendDisabled]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          label="Verify Code"
          loading={loading}
          disabled={!isComplete}
          onPress={handleVerify}
          style={styles.verifyBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING[5],
    justifyContent: 'center',
  },
  textCol: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  title: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING[1],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING[2],
    marginBottom: SPACING[6],
  },
  box: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  boxFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  boxError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: -SPACING[3],
    marginBottom: SPACING[4],
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  resendHint: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.sm,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
  resendDisabled: {
    color: COLORS.neutral400,
  },
  verifyBtn: {
    marginTop: 'auto',
  },
});
