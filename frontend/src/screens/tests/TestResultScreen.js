import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CircularProgress from '../../components/ui/CircularProgress';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function TestResultScreen({ route, navigation }) {
  const { 
    answers = {}, 
    questions = [], 
    testName = 'Live Exam Model',
    resultData = null 
  } = route.params || {};

  // Compute multi-dimensional breakdown map loops requested in SP-8
  const analysis = useMemo(() => {
    // If backend already provided processed results, use them directly
    if (resultData) {
      return {
        score: resultData.final_score,
        correct: resultData.correct,
        wrong: resultData.wrong,
        skipped: resultData.skipped,
        subjects: resultData.subject_breakdown.reduce((acc, s) => {
          acc[s.subject] = {
            correct: s.correct,
            wrong: 0, // Backend breakdown might not split wrong/skipped as explicitly in this view
            total: s.total,
            score: s.score,
            accuracy: s.accuracy_percent
          };
          return acc;
        }, {}),
        rank: resultData.rank_estimate?.estimated_rank,
        percentile: resultData.rank_estimate?.estimated_percentile
      };
    }

    // Local fallback calculation logic
    return questions.reduce((acc, q) => {
      const chosen = answers[q.id];
      const sub = q.subject || 'Physics';

      if (!acc.subjects[sub]) {
        acc.subjects[sub] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
      }

      acc.subjects[sub].total += 1;

      if (chosen == null) {
        acc.skipped += 1;
        acc.subjects[sub].skipped += 1;
      } else if (chosen === q.correct_option) {
        acc.correct += 1;
        acc.score += 4;
        acc.subjects[sub].correct += 1;
      } else {
        acc.wrong += 1;
        acc.score -= 1;
        acc.subjects[sub].wrong += 1;
      }

      return acc;
    }, {
      score: 0,
      correct: 0,
      wrong: 0,
      skipped: 0,
      subjects: {},
    });
  }, [answers, questions]);

  const totalPossibleScore = resultData ? resultData.max_score : questions.length * 4;
  const accuracyPercentage = totalPossibleScore > 0 
    ? Math.max(0, Math.round((analysis.score / totalPossibleScore) * 100))
    : 0;

  // Predict realistic rank maps matching standard scoring curve templates
  const computedRank = analysis.rank || Math.max(
    120, 
    Math.floor(85000 * (1 - Math.max(0, analysis.score) / (totalPossibleScore || 1)))
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Assessment Audit Hash" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Result Banner Card featuring aggregated NTA template stats */}
        <Animated.View entering={FadeInDown} style={styles.heroWrap}>
          <Card style={styles.heroCard}>
            <Text style={styles.testLabel} numberOfLines={1}>{testName}</Text>
            <Text style={styles.scoreTitle}>Secured Score</Text>

            <View style={styles.scoreRow}>
              <Text style={styles.mainScore}>{analysis.score}</Text>
              <Text style={styles.maxScore}>/ {totalPossibleScore}</Text>
            </View>

            {/* Split Metrics Matrix Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: COLORS.success }]}>{analysis.correct}</Text>
                <Text style={styles.metricHint}>Correct (+4)</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: COLORS.danger }]}>{analysis.wrong}</Text>
                <Text style={styles.metricHint}>Wrong (-1)</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: COLORS.textSecondary }]}>{analysis.skipped}</Text>
                <Text style={styles.metricHint}>Skipped (0)</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Predicted AIR rank banner tracking module */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.rankCard}>
            <View style={styles.rankLeft}>
              <Text style={styles.trophy}>🏆</Text>
              <View>
                <Text style={styles.rankLabel}>Predicted All India Rank</Text>
                <Text style={styles.rankVal}>#{computedRank.toLocaleString()}</Text>
              </View>
            </View>
            <CircularProgress
              value={accuracyPercentage}
              size={54}
              strokeWidth={5}
              color={COLORS.warningDark}
              label={`${accuracyPercentage}%`}
            />
          </Card>
        </Animated.View>

        {/* Detailed per-subject drilldowns array maps requested in SP-8 */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.subCol}>
          <Text style={styles.sectionTitle}>Domain Efficiency</Text>

          {Object.entries(analysis.subjects).map(([subName, metrics]) => {
            const subScore = metrics.score != null ? metrics.score : (metrics.correct * 4 - metrics.wrong);
            const subMax = metrics.total * 4;
            const fillRatio = metrics.accuracy != null ? (metrics.accuracy / 100) : (metrics.total > 0 ? metrics.correct / metrics.total : 0);

            return (
              <Animated.View key={subName} entering={FadeIn}>
                <Card style={styles.subCard}>
                  <View style={styles.subTop}>
                    <Text style={styles.subName}>{subName}</Text>
                    <Text style={styles.subScoreText}>
                      {subScore} <Text style={styles.subMaxText}>/ {subMax}</Text>
                    </Text>
                  </View>

                  {/* Visual tracking distribution progress string */}
                  <View style={styles.trackBg}>
                    <View 
                      style={[
                        styles.trackFill, 
                        { width: `${fillRatio * 100}%` },
                        fillRatio < 0.4 && { backgroundColor: COLORS.danger },
                      ]} 
                    />
                  </View>

                  <View style={styles.subBottom}>
                    <Text style={styles.subStatText}>
                      ✓ {metrics.correct} <Text style={styles.subDot}>•</Text> ✕ {metrics.wrong} <Text style={styles.subDot}>•</Text> ◯ {metrics.skipped}
                    </Text>
                    <Text style={styles.subAccText}>
                      {metrics.accuracy != null ? Math.round(metrics.accuracy) : (metrics.total > 0 ? Math.round((metrics.correct / metrics.total) * 100) : 0)}% Acc
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Navigation completion controls loop */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.footerCol}>
          <Button
            label="Return to Dashboard Core"
            variant="primary"
            size="lg"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Tests' })}
          />
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
  scrollContent: {
    padding: SPACING[4],
    gap: SPACING[5],
    paddingBottom: SPACING[12],
  },
  heroWrap: {
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: SPACING[6],
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.bold,
    textTransform: 'uppercase',
    marginBottom: SPACING[2],
  },
  scoreTitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.textMuted,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING[1],
  },
  mainScore: {
    fontSize: TYPOGRAPHY.size['4xl'],
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.primary,
  },
  maxScore: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: SPACING[5],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  metricHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warningLight,
    borderColor: COLORS.warning,
    padding: SPACING[4],
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
  },
  trophy: {
    fontSize: 32,
  },
  rankLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.warningDark,
  },
  rankVal: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.warningDark,
  },
  subCol: {
    gap: SPACING[3],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginBottom: SPACING[1],
  },
  subCard: {
    gap: SPACING[2],
  },
  subTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subName: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  subScoreText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  subMaxText: {
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.normal,
  },
  trackBg: {
    height: 6,
    backgroundColor: COLORS.neutral200,
    borderRadius: 3,
    overflow: 'hidden',
    my: SPACING[1],
  },
  trackFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  subBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subStatText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
  subDot: {
    color: COLORS.textMuted,
  },
  subAccText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primaryDark,
  },
  footerCol: {
    marginTop: SPACING[2],
  },
});
