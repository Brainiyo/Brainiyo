import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch,
  TextInput
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function ProfileScreen({ navigation }) {
  // Pull authenticated user state mappings
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const syncProfile = useAuthStore((state) => state.syncProfile);

  // Preference stores toggles requested in SP-9
  const isDarkMode = useAnalyticsStore((state) => state.isDarkMode);
  const toggleDarkMode = useAnalyticsStore((state) => state.toggleDarkMode);

  // Local interaction trigger state tracking
  const [streakFreezeCount, setStreakFreezeCount] = useState(1); // Standard baseline alloc
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');

  const saveName = () => {
    if (!tempName.trim()) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return;
    }
    syncProfile({ name: tempName.trim() });
    setIsEditingName(false);
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Disconnect Session',
      'Are you sure you wish to log out? Local caches remain intact securely.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => {
            logout();
            // Auth framework routes state automatically back to Welcome entry stack
          }
        },
      ]
    );
  };

  const triggerExamSwitch = () => {
    const nextExam = user?.target_exam === 'NEET' ? 'JEE' : 'NEET';
    Alert.alert(
      'Switch Target Domain',
      `Change syllabus index mappings from ${user?.target_exam || 'NEET'} to ${nextExam}? This recalibrates chapter weights instantly.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Switch', 
          onPress: () => syncProfile({ target_exam: nextExam }) 
        },
      ]
    );
  };

  const triggerClassSwitch = () => {
    const nextClass = user?.target_class === '11' ? '12' : '11';
    Alert.alert(
      'Update Current Standing',
      `Shift academic index standing to Class ${nextClass}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => syncProfile({ class: nextClass }) 
        },
      ]
    );
  };

  const applyStreakFreeze = () => {
    if (streakFreezeCount <= 0) {
      Alert.alert('Freeze Exhausted', 'Monthly allocation slots are currently consumed.');
      return;
    }
    Alert.alert(
      'Activate Streak Shield',
      'Consume 1 monthly allocation token to protect your active string sequence against idle blackout gaps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate Shield',
          onPress: () => {
            setStreakFreezeCount((prev) => prev - 1);
            Alert.alert('Shield Enabled!', 'Active string tracking bypass secure loop active.');
          },
        },
      ]
    );
  };

  const showPrivacyTerms = (title) => {
    Alert.alert(title, 'Standard encrypted compliance indices active across endpoints.');
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Scholar Identity" />

      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {/* Core User identity summary layout requested in SP-9 */}
        <Animated.View entering={FadeIn}>
          <Card style={styles.heroCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </Text>
            </View>

            {isEditingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.nameInput}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                  maxLength={50}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.neutral400}
                />
                <View style={styles.editNameButtons}>
                  <TouchableOpacity style={styles.saveNameBtn} onPress={saveName}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelNameBtn} onPress={() => setIsEditingName(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.nameRow}
                onPress={() => {
                  setTempName(user?.name || '');
                  setIsEditingName(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.userName}>{user?.name || 'Dedicated Student'}</Text>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.phoneText}>{user?.phone || '+91 ••••• •••••'}</Text>

            <View style={styles.chipsMatrix}>
              <TouchableOpacity style={styles.chipTarget} onPress={triggerExamSwitch}>
                <Text style={styles.chipHint}>Target</Text>
                <Text style={styles.chipVal}>{user?.target_exam || 'NEET'} ⇄</Text>
              </TouchableOpacity>

              <View style={styles.verticalRule} />

              <TouchableOpacity style={styles.chipTarget} onPress={triggerClassSwitch}>
                <Text style={styles.chipHint}>Standing</Text>
                <Text style={styles.chipVal}>Class {user?.target_class || '11'} ⇄</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {/* Streak Freeze tracking shield module requested in SP-9 */}
        <Animated.View entering={FadeIn.delay(100)}>
          <Card style={styles.freezeCard}>
            <View style={styles.freezeTop}>
              <View style={styles.freezeLeft}>
                <Text style={styles.shieldEmoji}>🛡️</Text>
                <View>
                  <Text style={styles.freezeTitle}>Streak Shield Allocation</Text>
                  <Text style={styles.freezeSubtitle}>
                    Available token slots: <Text style={styles.boldText}>{streakFreezeCount} / 1</Text>
                  </Text>
                </View>
              </View>

              <Button
                label="Apply"
                variant={streakFreezeCount > 0 ? 'secondary' : 'outline'}
                size="sm"
                disabled={streakFreezeCount <= 0}
                onPress={applyStreakFreeze}
              />
            </View>
            <Text style={styles.freezeHint}>
              Shield prevents sequence resets automatically if offline output conditions missed.
            </Text>
          </Card>
        </Animated.View>

        {/* Settings options toggles */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>Preferences & Hardware</Text>

          <Card style={styles.optionsList}>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>🌙</Text>
                <Text style={styles.optionLabel}>Optimal Ambient View (Dark)</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: COLORS.neutral200, true: COLORS.primaryLight }}
                thumbColor={isDarkMode ? COLORS.primary : COLORS.neutral400}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.optionRowLink}
              onPress={() => showPrivacyTerms('Notification Protocols')}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>🔔</Text>
                <Text style={styles.optionLabel}>Push Intercept Frequency</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.optionRowLink}
              onPress={() => showPrivacyTerms('Storage Management')}
            >
              <View style={styles.optionLeft}>
                <Text style={styles.optionIcon}>💾</Text>
                <Text style={styles.optionLabel}>Manage Local Vault Cache</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Help & Compliance policies */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.sectionGroup}>
          <Text style={styles.sectionHeader}>Support Access</Text>

          <Card style={styles.optionsList}>
            <TouchableOpacity 
              style={styles.optionRowLink}
              onPress={() => showPrivacyTerms('Brainiyo Guidance Helpdesk')}
            >
              <Text style={styles.optionLabel}>Contact Academic Support</Text>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.optionRowLink}
              onPress={() => showPrivacyTerms('Privacy Standards')}
            >
              <Text style={styles.optionLabel}>Privacy Policy Compliance</Text>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        {/* Global Exit Sign out */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.logoutWrap}>
          <Button
            label="Sign Out Session"
            variant="danger"
            size="lg"
            onPress={confirmSignOut}
          />
          <Text style={styles.versionString}>Brainiyo OS v2.0.4-build (Production)</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainScroll: {
    padding: SPACING[4],
    gap: SPACING[5],
    paddingBottom: SPACING[12],
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: SPACING[5],
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[3],
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarInitial: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.primaryDark,
  },
  userName: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  phoneText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING[4],
  },
  chipsMatrix: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    paddingTop: SPACING[3],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  chipTarget: {
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
  },
  chipHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  chipVal: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary,
  },
  verticalRule: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.divider,
  },
  freezeCard: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.secondaryLight,
    borderWidth: 1.5,
    padding: SPACING[4],
  },
  freezeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  freezeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
  },
  shieldEmoji: {
    fontSize: 28,
  },
  freezeTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  freezeSubtitle: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.secondaryDark,
  },
  freezeHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  sectionGroup: {
    gap: SPACING[2],
  },
  sectionHeader: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: SPACING[1],
  },
  optionsList: {
    padding: 0,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
  },
  optionRowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3.5],
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
  },
  optionIcon: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text,
  },
  arrowIcon: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: SPACING[4],
  },
  logoutWrap: {
    marginTop: SPACING[2],
    gap: SPACING[3],
    alignItems: 'center',
  },
  versionString: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
  },
  editNameRow: {
    alignItems: 'center',
    width: '80%',
    gap: SPACING[2],
    marginVertical: SPACING[2],
  },
  nameInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.neutral300,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.text,
    textAlign: 'center',
    backgroundColor: COLORS.neutral50,
  },
  editNameButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  saveNameBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.sm,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  cancelNameBtn: {
    backgroundColor: COLORS.neutral200,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.sm,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
  },
  editIcon: {
    fontSize: 14,
    opacity: 0.6,
  },
});
