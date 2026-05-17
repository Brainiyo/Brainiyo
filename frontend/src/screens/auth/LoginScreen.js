import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Button from '../../components/ui/Button';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { ApiService } from '../../api/client';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setErrorMsg('');

    try {
      // Dispatch API loop request
      await ApiService.sendOtp(phone);
      setLoading(false);
      // Navigate forward passing target phone parameters
      navigation.navigate('Otp', { phone });
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed dispatching returning authentication gateway token mapping.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScreenHeader showBack onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.headerCol}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your synchronized mobile number</Text>
        </View>

        <View style={styles.formCol}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={COLORS.neutral400}
              value={phone}
              onChangeText={(txt) => {
                const cleaned = txt.replace(/[^0-9]/g, '');
                setPhone(cleaned);
                if (errorMsg) setErrorMsg('');
              }}
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
            />
          </View>

          {errorMsg ? (
            <Animated.Text entering={FadeIn} style={styles.errorText}>
              {errorMsg}
            </Animated.Text>
          ) : null}
        </View>

        <Button
          label="Send OTP"
          loading={loading}
          disabled={phone.length !== 10}
          onPress={handleSendOtp}
          style={styles.btn}
        />

        <TouchableOpacity 
          style={styles.linkRow} 
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkHint}>New here? </Text>
          <Text style={styles.linkText}>Create account</Text>
        </TouchableOpacity>
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
  headerCol: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[3],
  },
  logoText: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.primary,
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
  },
  formCol: {
    marginBottom: SPACING[6],
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING[1],
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  prefixBox: {
    width: 60,
    height: 52,
    backgroundColor: COLORS.neutral100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: SPACING[2],
  },
  btn: {
    marginBottom: SPACING[6],
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[2],
  },
  linkHint: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.sm,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
});
