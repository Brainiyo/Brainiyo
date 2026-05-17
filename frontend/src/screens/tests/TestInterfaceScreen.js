import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Alert,
  BackHandler 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  FadeIn 
} from 'react-native-reanimated';
import MathJax from 'react-native-mathjax';
import { ApiService } from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Status enumerations maps mapping custom palette colors requested in SP-8
const STATUS = {
  NOT_VISITED: 'not_visited',
  ANSWERED: 'answered',
  NOT_ANSWERED: 'not_answered',
  MARKED: 'marked',
  MARKED_ANSWERED: 'marked_answered',
};

export default function TestInterfaceScreen({ route, navigation }) {
  const { 
    examType = 'NEET',
    testId = 'custom-mock',
    testName = 'Live Exam Model',
    questionsCount = 180,
    durationMinutes = 200,
    initialQuestions = null
  } = route.params || {};

  // Internal test operational parameters
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { id: option }
  const [statusMap, setStatusMap] = useState({}); // { id: STATUS }
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [activeSubject, setActiveSubject] = useState('Physics');

  // Drawer slider animation flags
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const drawerX = useSharedValue(width);

  // Generate target simulated test payload structures mapping NTA syllabus layouts
  const questions = useMemo(() => {
    if (initialQuestions) return initialQuestions;

    const total = questionsCount;
    return Array.from({ length: total }).map((_, idx) => {
      let sub = 'Physics';
      if (idx >= total / 3) sub = 'Chemistry';
      if (idx >= (2 * total) / 3) sub = examType === 'NEET' ? 'Biology' : 'Mathematics';

      return {
        id: `tq-${idx}`,
        subject: sub,
        body: `**Question ${idx + 1}**: Evaluate structural continuity bounds mapping optimal stability equations precisely:$\\frac{d}{dx}\\left(\\int_{0}^{x} t^2 dt\\right) + \\cos(\\pi)$`,
        option_a: '$x^2 - 1$',
        option_b: '$2x + 1$',
        option_c: '$x^2 + 1$',
        option_d: '$0$',
        correct_option: idx % 4 === 0 ? 'A' : idx % 4 === 1 ? 'B' : idx % 4 === 2 ? 'C' : 'D',
      };
    });
  }, [examType, questionsCount, initialQuestions]);

  const currentQuestion = questions[currentIdx];

  // Intercept physical BackButton sequences locking accidental exits
  useEffect(() => {
    const handleBack = () => {
      confirmExit();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBack);
  }, []);

  // System runtime tick clock tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerAutoSubmit = useCallback(() => {
    Alert.alert(
      'Time Expired!',
      'Duration complete. Submitting attempt outputs dynamically.',
      [{ text: 'View Results', onPress: () => finalizeSubmission() }]
    );
  }, [answers, questions]);

  const finalizeSubmission = async () => {
    setLoading(true);
    try {
      // Transform local answers map into server-compatible array
      const answersArray = Object.entries(answers).map(([id, opt]) => ({
        questionId: id,
        selectedOption: opt,
      }));

      // Submit to backend for NTA scoring logic
      const res = await ApiService.submitMockTest(testId, answersArray);
      
      if (res?.success) {
        navigation.replace('TestResult', { 
          resultData: res.data, 
          testName 
        });
      } else {
        throw new Error('Submission response invalid');
      }
    } catch (err) {
      console.error('Mock submission failed:', err);
      // Local fallback if API fails
      navigation.replace('TestResult', { answers, questions, testName });
    } finally {
      setLoading(false);
    }
  };

  const confirmExit = () => {
    Alert.alert(
      'Leave Assessment?',
      'Progress mapped inside runtime caches will be abandoned permanently.',
      [
        { text: 'Resume', style: 'cancel' },
        { 
          text: 'Exit Test', 
          style: 'destructive', 
          onPress: () => navigation.navigate('MainTabs', { screen: 'Tests' }) 
        },
      ]
    );
  };

  const handleSubmitRequest = () => {
    // Prompt validation verification check requested in SP-8
    const answeredCount = Object.keys(answers).length;
    Alert.alert(
      'Confirm Final Hash',
      `You have answered ${answeredCount} out of ${questions.length} total questions. Lock submissions permanently?`,
      [
        { text: 'Review Options', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: () => finalizeSubmission() },
      ]
    );
  };

  const formatTimerString = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePaletteDrawer = () => {
    const target = isPaletteOpen ? width : 0;
    drawerX.value = withSpring(target, { damping: 20, stiffness: 120 });
    setIsPaletteOpen(!isPaletteOpen);
  };

  const selectOption = (opt) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opt }));
  };

  const saveAndNext = () => {
    const hasAnswer = answers[currentQuestion.id] != null;
    setStatusMap((prev) => ({
      ...prev,
      [currentQuestion.id]: hasAnswer ? STATUS.ANSWERED : STATUS.NOT_ANSWERED,
    }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      syncSubjectTab(currentIdx + 1);
    }
  };

  const markReview = () => {
    const hasAnswer = answers[currentQuestion.id] != null;
    setStatusMap((prev) => ({
      ...prev,
      [currentQuestion.id]: hasAnswer ? STATUS.MARKED_ANSWERED : STATUS.MARKED,
    }));
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      syncSubjectTab(currentIdx + 1);
    }
  };

  const clearSelection = () => {
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
    setStatusMap((prev) => ({ ...prev, [currentQuestion.id]: STATUS.NOT_ANSWERED }));
  };

  const syncSubjectTab = (targetIndex) => {
    const sub = questions[targetIndex]?.subject;
    if (sub && sub !== activeSubject) setActiveSubject(sub);
  };

  const getStatusBgColor = (idTarget) => {
    const s = statusMap[idTarget] || STATUS.NOT_VISITED;
    switch (s) {
      case STATUS.ANSWERED: return COLORS.success;
      case STATUS.NOT_ANSWERED: return COLORS.danger;
      case STATUS.MARKED: return COLORS.warningDark; // Purple/violet substitute map
      case STATUS.MARKED_ANSWERED: return COLORS.warningDark;
      default: return COLORS.neutral200;
    }
  };

  const mathOptions = {
    messageStyle: 'none',
    extensions: ['tex2jax.js'],
    jax: ['input/TeX', 'output/HTML-CSS'],
    tex2jax: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
    },
  };

  const drawerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerX.value }],
  }));

  const subjectsList = ['Physics', 'Chemistry', examType === 'NEET' ? 'Biology' : 'Mathematics'];

  return (
    <View style={styles.container}>
      {/* Top Secure Live Test Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={confirmExit} disabled={loading}>
          <Text style={styles.exitIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.centerMeta}>
          <Text style={styles.headerLabel} numberOfLines={1}>{testName}</Text>
          <Text style={[styles.timerString, timeLeft < 300 && styles.redTimer]}>
            ⏱ {formatTimerString(timeLeft)}
          </Text>
        </View>

        <Button
          label={loading ? "..." : "Submit"}
          variant="danger"
          size="sm"
          onPress={handleSubmitRequest}
          style={styles.submitBtn}
          disabled={loading}
        />
      </View>

      {/* Subject Routing Segmented Layout */}
      <View style={styles.subjectRow}>
        {subjectsList.map((sub) => {
          const isActive = activeSubject === sub;
          return (
            <TouchableOpacity
              key={sub}
              style={[styles.subTab, isActive && styles.subTabActive]}
              onPress={() => {
                setActiveSubject(sub);
                const matchIndex = questions.findIndex((q) => q.subject === sub);
                if (matchIndex !== -1) setCurrentIdx(matchIndex);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.subText, isActive && styles.subTextActive]}>{sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Target Navigation Trackers */}
      <View style={styles.navRow}>
        <Text style={styles.qIndexText}>Question {currentIdx + 1}</Text>
        
        <TouchableOpacity 
          style={styles.paletteTrigger}
          onPress={togglePaletteDrawer}
          activeOpacity={0.7}
        >
          <Text style={styles.paletteIcon}>▦</Text>
          <Text style={styles.paletteLabel}>Palette</Text>
        </TouchableOpacity>
      </View>

      {/* Question Content Scroll Container */}
      <ScrollView contentContainerStyle={styles.qScroll} showsVerticalScrollIndicator={false}>
        <Animated.View key={currentQuestion.id} entering={FadeIn}>
          <View style={styles.qCard}>
            <MathJax
              mathJaxOptions={mathOptions}
              html={`<div style="font-size: 16px; color: ${COLORS.text}; font-family: sans-serif; line-height: 1.5;">${currentQuestion.body}</div>`}
            />
          </View>

          <View style={styles.optionsMatrix}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optRow,
                    isSelected && styles.optRowSelected,
                  ]}
                  onPress={() => selectOption(opt)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optMark, isSelected && styles.optMarkSelected]}>
                    <Text style={[styles.optMarkText, isSelected && styles.optMarkTextSelected]}>
                      {opt}
                    </Text>
                  </View>
                  <View style={styles.optContent}>
                    <MathJax
                      mathJaxOptions={mathOptions}
                      html={`<div style="font-size: 15px; color: ${COLORS.text}; font-family: sans-serif;">${currentQuestion[`option_${opt.toLowerCase()}`]}</div>`}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Interactive Sticky Footer actions controls requested in SP-8 */}
      <View style={styles.footerControls}>
        <View style={styles.btnSplit}>
          <Button
            label="Review Mark"
            variant="outline"
            size="md"
            onPress={markReview}
            style={styles.actionBtn}
          />
          <Button
            label="Clear"
            variant="outline"
            size="md"
            onPress={clearSelection}
            style={styles.actionBtn}
          />
        </View>

        <Button
          label={currentIdx < questions.length - 1 ? 'Save & Next' : 'Save Final'}
          variant="primary"
          size="lg"
          onPress={saveAndNext}
        />
      </View>

      {/* Side Custom Palette sliding drawer layout */}
      <Animated.View style={[styles.drawerOverlay, drawerAnimStyle, SHADOWS.xl]}>
        <View style={styles.drawerTop}>
          <Text style={styles.drawerTitle}>Navigation Core</Text>
          <TouchableOpacity onPress={togglePaletteDrawer} style={styles.closeDrawer}>
            <Text style={styles.closeDrawerIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.gridMap} showsVerticalScrollIndicator={false}>
          {questions.map((q, idx) => {
            const isTargeted = currentIdx === idx;
            const bgTarget = getStatusBgColor(q.id);
            const isMarkedAnswered = statusMap[q.id] === STATUS.MARKED_ANSWERED;

            return (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.gridItem,
                  { backgroundColor: bgTarget },
                  isTargeted && styles.gridItemActive,
                ]}
                onPress={() => {
                  setCurrentIdx(idx);
                  syncSubjectTab(idx);
                  togglePaletteDrawer();
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.gridItemText,
                  bgTarget !== COLORS.neutral200 && styles.gridItemTextLight,
                ]}>
                  {idx + 1}
                </Text>
                
                {/* Dot feedback marker identifying double states */}
                {isMarkedAnswered ? <View style={styles.answeredBadgeDot} /> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status color-code map indicators */}
        <View style={styles.legendArea}>
          <View style={styles.legendSplitRow}>
            <View style={styles.legendPair}><View style={[styles.legendBox, { backgroundColor: COLORS.success }]} /><Text style={styles.legendText}>Answered</Text></View>
            <View style={styles.legendPair}><View style={[styles.legendBox, { backgroundColor: COLORS.danger }]} /><Text style={styles.legendText}>Skipped</Text></View>
          </View>
          <View style={styles.legendSplitRow}>
            <View style={styles.legendPair}><View style={[styles.legendBox, { backgroundColor: COLORS.warningDark }]} /><Text style={styles.legendText}>Review</Text></View>
            <View style={styles.legendPair}><View style={[styles.legendBox, { backgroundColor: COLORS.neutral200 }]} /><Text style={styles.legendText}>Pending</Text></View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
  },
  exitBtn: {
    padding: SPACING[1],
  },
  exitIcon: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  centerMeta: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING[3],
  },
  headerLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  timerString: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: COLORS.text,
  },
  redTimer: {
    color: COLORS.danger,
  },
  submitBtn: {
    paddingHorizontal: SPACING[3],
  },
  subjectRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  subText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.textSecondary,
  },
  subTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    backgroundColor: COLORS.background,
  },
  qIndexText: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  paletteTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1.5],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  paletteIcon: {
    fontSize: 16,
    color: COLORS.primaryDark,
  },
  paletteLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primaryDark,
  },
  qScroll: {
    padding: SPACING[4],
    paddingBottom: SPACING[6],
  },
  qCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[4],
    minHeight: 100,
  },
  optionsMatrix: {
    gap: SPACING[3],
  },
  optRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING[3],
    minHeight: 64,
  },
  optRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  optMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  optMarkSelected: {
    backgroundColor: COLORS.primary,
  },
  optMarkText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  optMarkTextSelected: {
    color: COLORS.white,
  },
  optContent: {
    flex: 1,
  },
  footerControls: {
    padding: SPACING[4],
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING[3],
  },
  btnSplit: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
  actionBtn: {
    flex: 1,
  },
  // Side Palette Drawer
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.85,
    backgroundColor: COLORS.card,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    padding: SPACING[4],
    zIndex: 1000,
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  drawerTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  closeDrawer: {
    padding: SPACING[1],
  },
  closeDrawerIcon: {
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.textSecondary,
  },
  gridMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: SPACING[6],
  },
  gridItem: {
    width: (width * 0.85 - SPACING[8] - 32) / 5,
    height: (width * 0.85 - SPACING[8] - 32) / 5,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  gridItemActive: {
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  gridItemText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  gridItemTextLight: {
    color: COLORS.white,
  },
  answeredBadgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.successLight,
  },
  legendArea: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING[3],
    gap: SPACING[2],
  },
  legendSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: RADIUS.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.textSecondary,
  },
});
