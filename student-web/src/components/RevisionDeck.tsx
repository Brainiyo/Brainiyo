'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from './Button';
import { useUser } from '@/contexts/UserContext';
import styles from './RevisionDeck.module.css';

export const RevisionDeck = () => {
  const { refreshUser } = useUser();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function fetchDue() {
      try {
        const res = await api.getRevisionDue();
        setQuestions(res.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDue();
  }, []);

  const handleOptionSelect = (opt: string) => {
    if (showResult) return;
    setSelectedOption(opt);
  };

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const q = questions[currentIndex];
      const res = await api.submitAttempt({ 
        questionId: q.id, 
        selectedOption, 
        timeTakenSeconds: 30 
      });
      setResult(res.data);
      setShowResult(true);

      // Refresh user details to sync XP points on the header
      try {
        await refreshUser();
      } catch (err) {
        console.error('Failed to sync XP points:', err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setResult(null);
    } else {
      // Completed all due questions
      setQuestions([]);
    }
  };

  if (loading) return <div className={styles.loading}>Loading your revision deck...</div>;

  if (questions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎉</div>
        <h2 className={styles.title}>All Caught Up!</h2>
        <p className={styles.subtitle}>You've completed all your revisions for today. Great job maintaining your streak!</p>
        <Button className="mt-8" onClick={() => window.location.href = '/dashboard'}>Back to Dashboard</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className={styles.container}>
      <header className={styles.deckHeader}>
        <h1 className={styles.title}>Daily Revision</h1>
        <span className={styles.count}>{questions.length - currentIndex} questions left</span>
      </header>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={styles.card}
        >
          <div className={styles.questionMeta}>
            <span className={styles.badge}>{currentQuestion.subject_name}</span>
            <span className={styles.badge}>{currentQuestion.chapter_name}</span>
            <span className={styles.badge}>{currentQuestion.difficulty}</span>
          </div>

          <div className={styles.body}>
            {currentQuestion.body}
          </div>

          <div className={styles.options}>
            {['A', 'B', 'C', 'D'].map((opt) => {
              const content = currentQuestion[`option_${opt.toLowerCase()}`];
              const isSelected = selectedOption === opt;
              const isCorrect = showResult && opt === result?.correct_option;
              const isWrong = showResult && isSelected && !result?.is_correct;

              return (
                <button
                  key={opt}
                  className={`${styles.option} ${isSelected ? styles.selected : ''} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
                  onClick={() => handleOptionSelect(opt)}
                  disabled={showResult}
                >
                  <span className={styles.optionLetter}>{opt}</span>
                  <span className={styles.optionText}>{content}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.explanation}
            >
              <div className={styles.explanationTitle}>
                {result.is_correct ? '✅ Correct Answer!' : '❌ Incorrect'}
              </div>
              <p>{result.explanation}</p>
              <div className="mt-4 text-xs font-bold text-slate-400">
                Next review scheduled: {new Date(result.spaced_repetition.next_review_at).toLocaleDateString()}
              </div>
            </motion.div>
          )}

          <div className={styles.nextBtn}>
            {!showResult ? (
              <Button disabled={!selectedOption || isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? 'Checking...' : 'Check Answer'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex === questions.length - 1 ? 'Finish Revision' : 'Next Question'}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
