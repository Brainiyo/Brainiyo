'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import styles from './ExamInterface.module.css';

interface ExamInterfaceProps {
  testId: string;
  testTitle: string;
  onFinish?: (result: any) => void;
}

export const ExamInterface = ({ testId, testTitle, onFinish }: ExamInterfaceProps) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await api.startMockTest(testId);
        setQuestions(res.data.questions);
        setAttemptId(res.data.attemptId);
        setTimeLeft(res.data.template.duration_minutes * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [testId]);

  useEffect(() => {
    if (loading || !attemptId) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleFinish(); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attemptId]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleFinish = async () => {
    if (submitting || !attemptId) return;
    if (!window.confirm('Are you sure you want to submit the exam?')) return;
    setSubmitting(true);
    try {
      const answersArray = questions.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id] || null,
      }));
      const res = await api.submitMockTestAnswers(attemptId, answersArray);
      onFinish?.(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to submit exam. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];

  if (loading) return <div className={styles.loading}>Initializing Secure Exam Environment...</div>;

  return (
    <div className={styles.examContainer}>
      <header className={styles.examHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>B</div>
          <div className={styles.examName}>{testTitle}</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.timer}>
            <span>Time Remaining:</span>
            <strong className={timeLeft < 300 ? styles.timerWarning : ''}>
              {formatTime(timeLeft)}
            </strong>
          </div>
          <Button variant="danger" size="sm" onClick={handleFinish}>Submit Exam</Button>
        </div>
      </header>

      <main className={styles.examMain}>
        <div className={styles.contentArea}>
          <div className={styles.qHeader}>
            <span className={styles.qNum}>Question {currentIdx + 1}</span>
            <span className={styles.qSubject}>{currentQ?.subject}</span>
          </div>

          <div className={styles.qBody} dangerouslySetInnerHTML={{ __html: currentQ?.body }} />

          <div className={styles.options}>
            {['A', 'B', 'C', 'D'].map((opt) => (
              <label key={opt} className={`${styles.option} ${answers[currentQ.id] === opt ? styles.selectedOpt : ''}`}>
                <input 
                  type="radio" 
                  name={`q-${currentQ.id}`} 
                  checked={answers[currentQ.id] === opt}
                  onChange={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt }))}
                />
                <span className={styles.radioCustom}></span>
                <span className={styles.optText} dangerouslySetInnerHTML={{ __html: currentQ[`option_${opt.toLowerCase()}`] }} />
              </label>
            ))}
          </div>

          <div className={styles.actions}>
            <div className={styles.leftActions}>
              <Button 
                variant="outline" 
                onClick={() => setMarkedForReview(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
              >
                {markedForReview[currentIdx] ? 'Unmark Review' : 'Mark for Review'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setAnswers(prev => {
                  const newAnswers = { ...prev };
                  delete newAnswers[currentQ.id];
                  return newAnswers;
                })}
              >
                Clear Response
              </Button>
            </div>
            <div className={styles.rightActions}>
              <Button 
                variant="outline" 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
                }}
              >
                Save & Next
              </Button>
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.candidateInfo}>
            <div className={styles.avatar}>D</div>
            <div>
              <p className={styles.name}>Demo Scholar</p>
              <p className={styles.exam}>NEET 2026</p>
            </div>
          </div>

          <div className={styles.paletteContainer}>
            <h4>Question Palette</h4>
            <div className={styles.palette}>
              {questions.map((_, idx) => {
                const qId = questions[idx].id;
                const isAnswered = answers[qId] !== undefined;
                const isMarked = markedForReview[idx];
                const isCurrent = currentIdx === idx;

                let stateClass = styles.notVisited;
                if (isAnswered) stateClass = styles.answered;
                if (isMarked) stateClass = styles.marked;
                if (isAnswered && isMarked) stateClass = styles.answeredMarked;
                if (isCurrent) stateClass += ` ${styles.activePalette}`;

                return (
                  <button 
                    key={idx} 
                    className={`${styles.pCell} ${stateClass}`}
                    onClick={() => setCurrentIdx(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}><span className={styles.answered}></span> Answered</div>
            <div className={styles.legendItem}><span className={styles.notVisited}></span> Not Answered</div>
            <div className={styles.legendItem}><span className={styles.marked}></span> Marked for Review</div>
          </div>
        </aside>
      </main>
    </div>
  );
};
