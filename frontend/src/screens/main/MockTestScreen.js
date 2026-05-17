import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../../store/useAuthStore';
import { ApiService } from '../../api/client';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function MockTestScreen({ navigation }) {
  const user = useAuthStore((state) => state.user);
  const examType = user?.target_exam || 'NEET';

  // Toggle internal views requested in SP-8
  const [activeTab, setActiveTab] = useState('full'); // 'full' | 'chapter' | 'past'

  // Pre-seed static list definitions map loops
  const fullTests = [
    { id: 'ft1', name: 'NTA Abhyas Complete Model 1', questions: examType === 'NEET' ? 200 : 90, duration: examType === 'NEET' ? 200 : 180, attempts: 1420 },
    { id: 'ft2', name: 'Grand Assessment Phase IV', questions: examType === 'NEET' ? 200 : 90, duration: examType === 'NEET' ? 200 : 180, attempts: 890 },
  ];

  const chapterTests = [
    { id: 'ct1', name: 'Mechanics & Waves Sub-test', subject: 'Physics', duration: 45, questions: 45 },
    { id: 'ct2', name: 'Organic Chemistry Reactions', subject: 'Chemistry', duration: 45, questions: 45 },
    { id: 'ct3', name: 'Human Physiology Deepdive', subject: 'Biology', duration: 60, questions: 50 },
  ];

  const pastTests = [
    { id: 'pt1', name: 'Target Pre-Mock Series 3', date: 'May 8, 2026', score: 624, total: 720, predictedRank: 4210 },
    { id: 'pt2', name: 'Syllabus Sweep Model II', date: 'April 24, 2026', score: 580, total: 720, predictedRank: 6850 },
  ];

  const renderTabs = () => {
    return (
      <View style={styles.tabRow}>
        {[
          { key: 'full', label: 'Full Length' },
          { key: 'chapter', label: 'Mini/Chapter' },
          { key: 'past', label: 'Past Archives' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleStartTest = async (testObj) => {
    // If it's a full-length test, generate a secure ID session from backend
    if (activeTab === 'full') {
      try {
        const res = await ApiService.generateMockTest(examType);
        if (res?.success) {
          const { test_id, questions, duration_minutes } = res.data;
          navigation.navigate('TestInterface', { 
            examType, 
            testId: test_id,
            testName: testObj.name,
            questionsCount: questions.length,
            durationMinutes: duration_minutes,
            initialQuestions: questions, // Pass pre-fetched questions
          });
          return;
        }
      } catch (err) {
        console.error('Failed to generate mock test:', err);
      }
    }

    // Fallback for chapter tests or if generation fails
    navigation.navigate('TestInterface', { 
      examType, 
      testId: testObj.id,
      testName: testObj.name,
      questionsCount: testObj.questions,
      durationMinutes: testObj.duration,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Exam Arena" />

      {/* Hero Banner card featuring primary full mockup target parameters */}
      <View style={styles.heroWrap}>
        <Card style={styles.heroCard}>
          <Badge label="NTA Optimized" variant="success" style={styles.heroBadge} />
          <Text style={styles.heroTitle}>{examType} Live Simulator</Text>
          <Text style={styles.heroSubtitle}>
            Immerse securely matching physical timing formats exactly.
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>⏱ {examType === 'NEET' ? '200 Mins' : '180 Mins'}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>📑 {examType === 'NEET' ? '200 Items' : '90 Items'}</Text>
          </View>
        </Card>
      </View>

      {renderTabs()}

      <ScrollView contentContainerStyle={styles.listScroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'full' && (
          <Animated.View entering={FadeIn} style={styles.listCol}>
            {fullTests.map((t) => (
              <Card key={t.id} style={styles.testCard}>
                <View style={styles.testTop}>
                  <Text style={styles.testName}>{t.name}</Text>
                  <Text style={styles.attemptsHint}>{t.attempts} peers logged</Text>
                </View>
                
                <View style={styles.testBottom}>
                  <Text style={styles.durationHint}>
                    Duration: {t.duration}m • Items: {t.questions}
                  </Text>
                  <Button
                    label="Start Test"
                    variant="primary"
                    size="sm"
                    onPress={() => handleStartTest(t)}
                  />
                </View>
              </Card>
            ))}
          </Animated.View>
        )}

        {activeTab === 'chapter' && (
          <Animated.View entering={FadeIn} style={styles.listCol}>
            {chapterTests.map((t) => (
              <Card key={t.id} style={styles.testCard}>
                <View style={styles.testTop}>
                  <Badge label={t.subject} variant="primary" />
                  <Text style={styles.durationHint}>{t.duration} Mins</Text>
                </View>
                <Text style={styles.testNameSub}>{t.name}</Text>
                
                <Button
                  label="Take Mini Test"
                  variant="outline"
                  size="sm"
                  onPress={() => handleStartTest(t)}
                  style={styles.miniBtn}
                />
              </Card>
            ))}
          </Animated.View>
        )}

        {activeTab === 'past' && (
          <Animated.View entering={FadeIn} style={styles.listCol}>
            {pastTests.map((t) => (
              <Card key={t.id} style={styles.archiveCard}>
                <View style={styles.archiveTop}>
                  <Text style={styles.archiveName}>{t.name}</Text>
                  <Text style={styles.archiveDate}>{t.date}</Text>
                </View>

                <View style={styles.archiveMetrics}>
                  <View>
                    <Text style={styles.scoreLabel}>Final Hash</Text>
                    <Text style={styles.scoreVal}>{t.score} / {t.total}</Text>
                  </View>

                  <View style={styles.rankCol}>
                    <Text style={styles.rankLabel}>Predicted AIR</Text>
                    <Text style={styles.rankVal}>#{t.predictedRank}</Text>
                  </View>
                </View>
              </Card>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroWrap: {
    padding: SPACING[4],
  },
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
    alignItems: 'flex-start',
  },
  heroBadge: {
    marginBottom: SPACING[2],
  },
  heroTitle: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.white,
    marginBottom: SPACING[1],
  },
  heroSubtitle: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.primaryLight,
    marginBottom: SPACING[3],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[2],
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.sm,
  },
  metaText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.white,
  },
  metaDot: {
    color: COLORS.primaryLight,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING[4],
    gap: SPACING[2],
    marginBottom: SPACING[2],
  },
  tabChip: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryMid,
  },
  tabText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  listScroll: {
    padding: SPACING[4],
    paddingBottom: SPACING[12],
  },
  listCol: {
    gap: SPACING[3],
  },
  testCard: {
    gap: SPACING[3],
  },
  testTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testName: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  attemptsHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
  },
  testBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  testNameSub: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginVertical: SPACING[1],
  },
  miniBtn: {
    alignSelf: 'flex-start',
    marginTop: SPACING[1],
  },
  archiveCard: {
    gap: SPACING[3],
  },
  archiveTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archiveName: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  archiveDate: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textMuted,
  },
  archiveMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING[2],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
  scoreVal: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.successDark,
  },
  rankCol: {
    alignItems: 'flex-end',
  },
  rankLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
  rankVal: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.warningDark,
  },
});
