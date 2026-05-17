import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/ui/Button';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { ApiService } from '../../api/client';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Zustand persistent onboarding state map
  const onboarding = useAuthStore((state) => state.onboarding);
  const setOnboarding = useAuthStore((state) => state.setOnboarding);

  // Local sync values
  const [name, setName] = useState(onboarding.name || '');
  const [phone, setPhone] = useState(onboarding.phone || '');

  // Progress UI indicator dots
  const renderDots = () => {
    return (
      <View style={styles.dotsRow}>
        {[1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              idx === step 
                ? styles.dotActive 
                : idx < step 
                ? styles.dotCompleted 
                : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  // Step 1: Exam Selection
  const renderStep1 = () => (
    <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Which exam are you preparing for?</Text>
      <Text style={styles.subtitle}>We'll personalise your question bank for you.</Text>

      <View style={styles.cardsCol}>
        {/* Card A: NEET */}
        <TouchableOpacity
          style={[
            styles.examCard,
            onboarding.targetExam === 'NEET' && styles.examCardActive,
          ]}
          onPress={() => setOnboarding({ targetExam: 'NEET' })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🩺</Text>
            {onboarding.targetExam === 'NEET' && (
              <View style={styles.checkCircle}><Text style={styles.checkText}>✓</Text></View>
            )}
          </View>
          <Text style={styles.examTitle}>NEET</Text>
          <Text style={styles.examDesc}>Biology + Physics + Chemistry</Text>
        </TouchableOpacity>

        {/* Card B: JEE */}
        <TouchableOpacity
          style={[
            styles.examCard,
            onboarding.targetExam === 'JEE' && styles.examCardActive,
          ]}
          onPress={() => setOnboarding({ targetExam: 'JEE' })}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>⚙️</Text>
            {onboarding.targetExam === 'JEE' && (
              <View style={styles.checkCircle}><Text style={styles.checkText}>✓</Text></View>
            )}
          </View>
          <Text style={styles.examTitle}>JEE Main & Advanced</Text>
          <Text style={styles.examDesc}>Physics + Chemistry + Mathematics</Text>
        </TouchableOpacity>
      </View>

      <Button
        label="Continue"
        disabled={!onboarding.targetExam}
        onPress={() => setStep(2)}
        style={styles.continueBtn}
      />
    </Animated.View>
  );

  // Step 2: Class Selection
  const renderStep2 = () => (
    <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Which class are you in?</Text>
      <Text style={styles.subtitle}>Helps tune adaptive starting difficulty levels.</Text>

      <View style={styles.classGridRow}>
        {['11', '12', 'Dropper'].map((item) => {
          const isSelected = onboarding.class === item;
          return (
            <TouchableOpacity
              key={item}
              style={[styles.classCard, isSelected && styles.classCardActive]}
              onPress={() => setOnboarding({ class: item })}
              activeOpacity={0.8}
            >
              <Text style={[styles.classLabel, isSelected && styles.classLabelActive]}>
                {item === 'Dropper' ? 'Dropper' : `Class ${item}`}
              </Text>
              {isSelected && <View style={styles.miniDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.dropperHint}>💡 Dropper = repeating preparation this academic year</Text>

      <Button
        label="Continue"
        disabled={!onboarding.class}
        onPress={() => setStep(3)}
        style={styles.continueBtn}
      />
    </Animated.View>
  );

  // Step 3: Name + Phone Input triggering OTP trigger
  const renderStep3 = () => (
    <Animated.View entering={SlideInRight} exiting={FadeOut} style={styles.stepContainer}>
      <Text style={styles.title}>Almost done! Tell us about yourself.</Text>
      <Text style={styles.subtitle}>Enter accurate mobile access for secure profile sync.</Text>

      <View style={styles.formCol}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Rohan Sharma"
            placeholderTextColor={COLORS.neutral400}
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setOnboarding({ name: txt });
              if (errorMsg) setErrorMsg('');
            }}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="9876543210"
              placeholderTextColor={COLORS.neutral400}
              value={phone}
              onChangeText={(txt) => {
                // Filter non-numeric
                const cleaned = txt.replace(/[^0-9]/g, '');
                setPhone(cleaned);
                setOnboarding({ phone: cleaned });
                if (errorMsg) setErrorMsg('');
              }}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
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
        disabled={!name.trim() || phone.length !== 10}
        onPress={handleSendOtp}
        style={styles.continueBtn}
      />
    </Animated.View>
  );

  const handleSendOtp = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Trigger API backend request
      await ApiService.sendOtp(phone);
      setLoading(false);
      // Navigate forward passing parameter hints
      navigation.navigate('Otp', { phone });
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to dispatch OTP verification loop.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScreenHeader
        showBack
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            navigation.goBack();
          }
        }}
        rightElement={renderDots()}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING[5],
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[1],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 16, // stretched active state dot
  },
  dotCompleted: {
    backgroundColor: COLORS.primaryMid,
  },
  dotInactive: {
    backgroundColor: COLORS.neutral200,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginTop: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
    marginBottom: SPACING[6],
  },
  cardsCol: {
    gap: SPACING[4],
    marginBottom: 'auto',
  },
  examCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  examCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  emoji: {
    fontSize: 28,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  examTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  examDesc: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING[1],
  },
  continueBtn: {
    marginTop: SPACING[6],
  },
  // Step 2 Class grid
  classGridRow: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[4],
  },
  classCard: {
    flex: 1,
    height: 96,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING[2],
  },
  classCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  classLabel: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  classLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: SPACING[2],
  },
  dropperHint: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING[2],
    marginBottom: 'auto',
  },
  // Step 3 form
  formCol: {
    gap: SPACING[4],
    marginBottom: 'auto',
  },
  inputGroup: {
    gap: SPACING[1],
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.text,
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
  phoneInput: {
    flex: 1,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginTop: SPACING[1],
  },
});
