'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from './Card';
import { Button } from './Button';
import { useUser } from '@/contexts/UserContext';
import styles from './PracticeArena.module.css'; // Reusing styles

interface QuizEngineProps {
  topicId: string;
  count: number;
  onComplete: () => void;
}

export function QuizEngine({ topicId, count, onComplete }: QuizEngineProps) {
  const { refreshUser } = useUser();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchNextQuestion = useCallback(async () => {
    setLoading(true);
    setRevealed(false);
    setSelectedOption(null);
    setFeedback(null);
    setIsBookmarked(false);
    try {
      const res = await api.getNextQuestion(topicId);
      setQuestions(prev => [...prev, res.question]);
      setTimeout(() => {
        if (window.MathJax?.typeset) window.MathJax.typeset();
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const handleSubmit = async () => {
    if (!selectedOption || revealed || submitting) return;
    setSubmitting(true);
    try {
      const question = questions[currentIndex];
      const res = await api.submitAttempt({
        questionId: question.id,
        selectedOption,
        timeTakenSeconds: 30, 
      });
      setFeedback(res.data);
      setRevealed(true);
      setAnswers(prev => [...prev, { ...res.data, questionId: question.id }]);
      
      // Refresh user details to sync XP points on the header
      try {
        await refreshUser();
      } catch (err) {
        console.error('Failed to sync XP points:', err);
      }
      
      setTimeout(() => {
        if (window.MathJax?.typeset) window.MathJax.typeset();
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < count) {
      setCurrentIndex(prev => prev + 1);
      fetchNextQuestion();
    } else {
      onComplete();
    }
  };

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked); // optimistic UI
      const res = await api.toggleBookmark(questions[currentIndex].id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      setIsBookmarked(!isBookmarked); // revert on failure
      console.error('Failed to toggle bookmark:', err);
    }
  };

  if (loading && questions.length <= currentIndex) {
    return <div className={styles.loading}>Generating your next challenge...</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className={styles.arena}>
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((currentIndex + 1) / count) * 100}%` }} 
          />
        </div>
        <span className={styles.progressText}>Question {currentIndex + 1} of {count}</span>
      </div>

      <Card className={styles.questionCard}>
        <div className="flex justify-between items-start mb-4">
          <div className={styles.meta}>
            <span className={styles.subject}>{currentQuestion.subject || 'Practice'}</span>
            <span className={`${styles.difficulty} ${styles[currentQuestion.difficulty || 'medium']}`}>
              {currentQuestion.difficulty || 'Medium'}
            </span>
          </div>
          <button 
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>

        <div className={styles.body} dangerouslySetInnerHTML={{ __html: currentQuestion.body }} />

        <div className={styles.options}>
          {['A', 'B', 'C', 'D'].map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = revealed && feedback?.correct_option === opt;
            const isWrong = revealed && isSelected && !isCorrect;

            return (
              <button
                key={opt}
                className={`${styles.option} ${isSelected ? styles.selected : ''} ${isCorrect ? styles.correct : ''} ${isWrong ? styles.wrong : ''}`}
                onClick={() => !revealed && setSelectedOption(opt)}
                disabled={revealed}
              >
                <span className={styles.optLabel}>{opt}</span>
                <span className={styles.optText} dangerouslySetInnerHTML={{ __html: currentQuestion[`option_${opt.toLowerCase()}`] }} />
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <Button 
            fullWidth 
            size="lg" 
            disabled={!selectedOption || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Checking...' : 'Check Answer'}
          </Button>
        ) : (
          <div className={styles.feedback}>
            <div className={`${styles.status} ${feedback?.is_correct ? styles.statusSuccess : styles.statusError}`}>
              {feedback?.is_correct ? '✨ Well Done!' : '💡 Let\'s learn from this'}
            </div>
            <div className={styles.explanation}>
              <h4>Explanation</h4>
              <div dangerouslySetInnerHTML={{ __html: feedback?.explanation }} />
            </div>
            <Button fullWidth size="lg" onClick={handleNext}>
              {currentIndex + 1 < count ? 'Next Question →' : 'Finish Session'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
