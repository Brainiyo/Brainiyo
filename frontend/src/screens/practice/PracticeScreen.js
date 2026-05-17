import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  AppState,
  Platform 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor, 
  FadeIn 
} from 'react-native-reanimated';
import MathJax from 'react-native-mathjax';
import { ApiService } from '../../api/client';
import { usePracticeStore } from '../../store/usePracticeStore';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import { SESSION_DEFAULT_QUESTIONS } from '../../constants/config';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function PracticeScreen({ route, navigation }) {
  const { topicId, mode = 'practice' } = route.params;

  // Global persistence hooks
  const startSession = usePracticeStore((state) => state.startSession);
  const recordAnswer = usePracticeStore((state) => state.recordAnswer);
  const endSession = usePracticeStore((state) => state.endSession);
  const sessionStats = usePracticeStore((state) => state.sessionStats);
  const isBookmarked = usePracticeStore((state) => state.isBookmarked);
  const addBookmark = usePracticeStore((state) => state.addBookmark);
  const removeBookmark = usePracticeStore((state) => state.removeBookmark);

  const incrementTodayAttempt = useAnalyticsStore((state) => state.incrementTodayAttempt);

  // Active indices
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Selection workflow states requested in SP-5
  const [selectedOption, setSelectedOption] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  // Background pause listener setup
  const timerInterval = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Animated drawer hook driving BottomSheet explanations
  const sheetY = useSharedValue(500);

  // Initialize practice session baseline tracking loop
  useEffect(() => {
    startSession(topicId, mode);
  }, [topicId, mode]);

  // Load single iterative task item
  const fetchNextItem = useCallback(async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsRevealed(false);
    setTimeTaken(0);
    sheetY.value = withTiming(500, { duration: 300 });

    try {
      // Dynamic engine queue resolution mapping server algorithms
      const res = await ApiService.getNextQuestion(topicId, mode);
      if (res?.question) {
        setQuestion(res.question);
      } else {
        throw new Error('Fallback inline payload triggers.');
      }
    } catch (err) {
      console.log('Core adaptive engine bypass simulated smoothly.');
      // Localized mock baseline supporting full LaTeX MathJax formatting
      setQuestion({
        id: `q-${Date.now()}`,
        source: 'PYQ 2023',
        difficulty: 'medium',
        body: 'A block of mass $m = 2 \\text{ kg}$ is resting on a rough inclined plane of inclination $30^\\circ$. If the coefficient of static friction $\\mu_s = 0.7$, the minimal force required to initiate sliding upwards is precisely:',
        option_a: '$12.4 \\text{ N}$',
        option_b: '$19.2 \\text{ N}$',
        option_c: '$21.9 \\text{ N}$',
        option_d: '$9.8 \\text{ N}$',
        correct_option: 'C',
        explanation_text: 'Force required upwards $F = mg(\\sin\\theta + \\mu_s\\cos\\theta)$. Substituting $m=2$, $g=9.8$, $\\theta=30^\\circ$, and $\\mu_s=0.7$, we compute $F = 2(9.8)(0.5 + 0.7 \\times 0.866) = 19.6(0.5 + 0.606) = 19.6(1.106) \\approx 21.68 \\text{ N}$. Closest matching exact numerical key option maps to C ($21.9 \\text{ N}$).',
      });
    } finally {
      setLoading(false);
      startClock();
    }
  }, [topicId, mode]);

  useEffect(() => {
    fetchNextItem();
    return () => stopClock();
  }, [fetchNextItem]);

  // App state listener stopping runtime clock increments when backgrounded
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        if (!isRevealed && !loading) startClock();
      } else if (nextState.match(/inactive|background/)) {
        stopClock();
      }
      appStateRef.current = nextState;
    });
    return () => {
      sub.remove();
      stopClock();
    };
  }, [isRevealed, loading]);

  const startClock = () => {
    stopClock();
    timerInterval.current = setInterval(() => {
      setTimeTaken((t) => t + 1);
    }, 1000);
  };

  const stopClock = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  // Helper converting runtime seconds to UI strings with specific tier thresholds
  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTimerColor = () => {
    if (timeTaken > 180) return COLORS.danger;   // >3min → red
    if (timeTaken > 90) return COLORS.warning;   // >90s  → amber
    return COLORS.textSecondary;
  };

  const handleSelect = (opt) => {
    if (isRevealed || loading) return;
    setSelectedOption(opt);
  };

  const handleConfirmAnswer = async () => {
    if (!selectedOption || isRevealed || loading) return;
    stopClock();
    setLoading(true);

    try {
      // Secure iterative submission mapping SM-2 engine parameters
      const res = await ApiService.submitAttempt({
        questionId: question.id,
        selectedOption,
        timeTakenSeconds: timeTaken,
      });

      if (res?.success) {
        const { is_correct, correct_option, explanation } = res.data;
        
        // Merge secure feedback into active question object
        setQuestion(prev => ({
          ...prev,
          correct_option,
          explanation_text: explanation,
        }));

        setIsRevealed(true);

        // Trigger local state tracking for session summary
        recordAnswer({
          questionId: question.id,
          isCorrect: is_correct,
          timeTaken,
          selectedOption,
        });
        incrementTodayAttempt(is_correct);

        // Slide up bottom sheet drawer seamlessly
        sheetY.value = withSpring(0, { damping: 20, stiffness: 90 });
      }
    } catch (err) {
      console.error('Answer submission failed:', err);
      // Fallback for offline/dev mode if needed
      setIsRevealed(true);
      sheetY.value = withSpring(0, { damping: 20, stiffness: 90 });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (questionIndex + 1 >= SESSION_DEFAULT_QUESTIONS) {
      // End session loop routing automatically to structured summary state view
      endSession();
      navigation.replace('SessionResult');
    } else {
      setQuestionIndex((prev) => prev + 1);
      fetchNextItem();
    }
  };

  const toggleBookmark = () => {
    if (!question) return;
    if (isBookmarked(question.id)) {
      removeBookmark(question.id);
    } else {
      addBookmark(question);
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
    TeX: {
      extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js'],
    },
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  const renderSkeleton = () => (
    <View style={styles.skelCol}>
      <Skeleton height={140} style={styles.skelBox} />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height={64} style={styles.skelOpt} />
      ))}
    </View>
  );

  const renderOptions = () => {
    const keys = ['A', 'B', 'C', 'D'];
    return (
      <View style={styles.optionsCol}>
        {keys.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrectAnswer = question?.correct_option === opt;

          // Determine styles map loops matching 3-state sequences
          let bg = COLORS.card;
          let border = COLORS.border;
          let labelBg = COLORS.neutral100;
          let labelColor = COLORS.textSecondary;

          if (!isRevealed) {
            if (isSelected) {
              bg = COLORS.primaryLight;
              border = COLORS.primary;
              labelBg = COLORS.primary;
              labelColor = COLORS.white;
            }
          } else {
            // Post-confirmation reveals
            if (isCorrectAnswer) {
              bg = COLORS.successLight;
              border = COLORS.success;
              labelBg = COLORS.success;
              labelColor = COLORS.white;
            } else if (isSelected && !isCorrectAnswer) {
              bg = COLORS.dangerLight;
              border = COLORS.danger;
              labelBg = COLORS.danger;
              labelColor = COLORS.white;
            }
          }

          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionBtn,
                { backgroundColor: bg, borderColor: border },
              ]}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.8}
            >
              <View style={[styles.optionLabelBox, { backgroundColor: labelBg }]}>
                <Text style={[styles.optionLabel, { color: labelColor }]}>{opt}</Text>
              </View>
              <View style={styles.optionContent}>
                <MathJax
                  mathJaxOptions={mathOptions}
                  html={`<div style="font-size: 15px; color: ${COLORS.text}; font-family: sans-serif;">${question[`option_${opt.toLowerCase()}`]}</div>`}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const curBookmarked = question ? isBookmarked(question.id) : false;

  return (
    <View style={styles.container}>
      {/* Custom dynamic screen top status tracker row */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        {/* Live dynamic progress line map */}
        <View style={styles.centerMeta}>
          <Text style={styles.counterText}>
            {questionIndex + 1} / {SESSION_DEFAULT_QUESTIONS}
          </Text>
          <View style={styles.thinTrack}>
            <View 
              style={[
                styles.thinFill, 
                { width: `${((questionIndex + 1) / SESSION_DEFAULT_QUESTIONS) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Clock threshold colorized feedback string */}
        <View style={styles.rightMeta}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            ⏱ {formatTimer(timeTaken)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
        {loading || !question ? (
          renderSkeleton()
        ) : (
          <Animated.View entering={FadeIn}>
            {/* Source + Difficulty chips mapping target models */}
            <View style={styles.chipsRow}>
              <View style={styles.chipsLeft}>
                {question.source ? <Badge label={question.source} variant="info" /> : null}
                {question.difficulty ? (
                  <Badge 
                    label={question.difficulty} 
                    variant={question.difficulty === 'hard' ? 'danger' : 'warning'} 
                  />
                ) : null}
              </View>

              <TouchableOpacity 
                style={styles.bookmarkBtn}
                onPress={toggleBookmark}
                activeOpacity={0.7}
              >
                <Text style={styles.bookmarkIcon}>
                  {curBookmarked ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Core Question Body MathJax embedding */}
            <View style={styles.questionCard}>
              <MathJax
                mathJaxOptions={mathOptions}
                html={`<div style="font-size: 16px; color: ${COLORS.text}; font-family: sans-serif; line-height: 1.5;">${question.body}</div>`}
              />
            </View>

            {/* Options Matrix mapping selection splits */}
            {renderOptions()}

            {/* Confirmation stage trigger lock requested in SP-5 */}
            {!isRevealed && selectedOption ? (
              <Animated.View entering={FadeIn} style={styles.confirmCol}>
                <Button
                  label="Confirm Answer"
                  variant="primary"
                  size="lg"
                  onPress={handleConfirmAnswer}
                />
              </Animated.View>
            ) : null}
          </Animated.View>
        )}
      </ScrollView>

      {/* Explanatory detail sliding overlay framework */}
      <Animated.View style={[styles.bottomSheet, sheetStyle, SHADOWS.lg]}>
        <View style={styles.sheetHandle} />
        
        <View style={styles.sheetTop}>
          <Text style={styles.sheetResult}>
            {selectedOption === question?.correct_option ? '🎉 Brilliant Response!' : '💡 Targeted Revision Point'}
          </Text>
          <Text style={styles.sheetCorrectHint}>
            Correct Option: <Text style={styles.boldOpt}>{question?.correct_option}</Text>
          </Text>
        </View>

        <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.explTitle}>Step-by-Step Resolution</Text>
          {question?.explanation_text ? (
            <MathJax
              mathJaxOptions={mathOptions}
              html={`<div style="font-size: 14px; color: ${COLORS.textSecondary}; font-family: sans-serif; line-height: 1.5;">${question.explanation_text}</div>`}
            />
          ) : null}
        </ScrollView>

        <View style={styles.sheetFooter}>
          <Button
            label={questionIndex + 1 >= SESSION_DEFAULT_QUESTIONS ? 'Finish Session' : 'Next Question'}
            variant="primary"
            size="lg"
            onPress={handleNext}
          />
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
  closeBtn: {
    padding: SPACING[1],
  },
  closeIcon: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
  },
  centerMeta: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  counterText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  thinTrack: {
    width: 100,
    height: 3,
    backgroundColor: COLORS.neutral200,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  thinFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  rightMeta: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  mainScroll: {
    padding: SPACING[4],
    paddingBottom: SPACING[12],
  },
  skelCol: {
    gap: SPACING[4],
  },
  skelBox: {
    borderRadius: RADIUS.md,
  },
  skelOpt: {
    borderRadius: RADIUS.md,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  chipsLeft: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  bookmarkBtn: {
    padding: SPACING[1],
  },
  bookmarkIcon: {
    fontSize: 26,
    color: COLORS.warning,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    marginBottom: SPACING[5],
    minHeight: 100,
  },
  optionsCol: {
    gap: SPACING[3],
    marginBottom: SPACING[5],
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2.5],
    minHeight: 60,
  },
  optionLabelBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  optionLabel: {
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
  optionContent: {
    flex: 1,
  },
  confirmCol: {
    marginTop: SPACING[2],
  },
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[6],
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.neutral300,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING[4],
  },
  sheetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  sheetResult: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  sheetCorrectHint: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.successDark,
  },
  boldOpt: {
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
  sheetBody: {
    flex: 1,
    marginBottom: SPACING[4],
  },
  explTitle: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    marginBottom: SPACING[2],
  },
  sheetFooter: {
    marginTop: 'auto',
  },
});
