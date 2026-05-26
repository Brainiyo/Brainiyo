'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import styles from './ExamResult.module.css';

export const ExamResult = ({ result, onBack }: { result: any, onBack: () => void }) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleExplanation = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getInsights = () => {
    const total = (result.correct || 0) + (result.incorrect || 0) + (result.unattempted || 0);
    const accuracy = total > 0 ? Math.round(((result.correct || 0) / total) * 100) : 0;
    const negativeMarks = result.incorrect || 0;
    
    const insights = [];
    
    if (accuracy >= 80) {
      insights.push({
        type: 'success',
        text: 'Outstanding accuracy! You have strong conceptual clarity. Keep challenging yourself with harder mock tests.'
      });
    } else if (accuracy >= 60) {
      insights.push({
        type: 'info',
        text: 'Good job! A solid performance. Focus on reviewing the specific topics where you made mistakes to reach 80%+ accuracy.'
      });
    } else if (total > 0) {
      insights.push({
        type: 'warning',
        text: 'Needs practice. We recommend going back to chapter-wise practice sets and reading study materials to clarify core concepts.'
      });
    }

    if (negativeMarks > 5) {
      insights.push({
        type: 'danger',
        text: `High negative marking alert! You lost ${negativeMarks} marks due to incorrect answers. Avoid guessing and only attempt questions when you are reasonably confident.`
      });
    }

    if ((result.unattempted || 0) > total * 0.3) {
      insights.push({
        type: 'info',
        text: 'High unattempted rate. Try to improve your speed/time management, or check if you need to revise these topics to attempt more questions confidently.'
      });
    }
    
    return insights;
  };

  const insights = getInsights();
  const questions = result.questions || [];

  const filteredQuestions = questions.filter((q: any) => {
    const isAnswered = q.user_answer !== null && q.user_answer !== undefined && String(q.user_answer).trim() !== '';
    if (filter === 'all') return true;
    if (filter === 'correct') return q.is_correct === true && isAnswered;
    if (filter === 'incorrect') return q.is_correct === false && isAnswered;
    if (filter === 'unattempted') return !isAnswered;
    return true;
  });

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1>Performance Analysis</h1>
        <p>Comprehensive breakdown of your assessment results.</p>
      </motion.div>

      <div className={styles.mainGrid}>
        <Card className={styles.scoreCard}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreVal}>{result.score}</span>
            <span className={styles.scoreMax}>Points</span>
          </div>
          <div className={styles.rankInfo}>
            <p>Test Assessment</p>
            <h3>{result.score > 100 ? 'Excellent' : result.score > 0 ? 'Good' : 'Needs Practice'}</h3>
          </div>
        </Card>

        <div className={styles.statsGrid}>
          <Card className={styles.statMini}>
            <span className={styles.statLabel}>Correct</span>
            <span className={`${styles.statVal} ${styles.green}`}>{result.correct}</span>
          </Card>
          <Card className={styles.statMini}>
            <span className={styles.statLabel}>Incorrect</span>
            <span className={`${styles.statVal} ${styles.red}`}>{result.incorrect}</span>
          </Card>
          <Card className={styles.statMini}>
            <span className={styles.statLabel}>Unattempted</span>
            <span className={styles.statVal}>{result.unattempted}</span>
          </Card>
        </div>

        <Card className={styles.breakdownCard}>
          <h3>Suggestions & Insights</h3>
          <div className={styles.breakdownList}>
            <p className="text-slate-500">
              You answered {result.correct} questions correctly out of {result.correct + result.incorrect + result.unattempted}.
            </p>
            {insights.length > 0 && (
              <div className={styles.insightsContainer}>
                {insights.map((ins, i) => (
                  <div key={i} className={`${styles.insightItem} ${styles[ins.type]}`}>
                    <div className={styles.insightIcon}>
                      {ins.type === 'success' && <CheckCircle2 size={18} />}
                      {ins.type === 'info' && <BookOpen size={18} />}
                      {ins.type === 'warning' && <AlertCircle size={18} />}
                      {ins.type === 'danger' && <XCircle size={18} />}
                    </div>
                    <div className={styles.insightText}>{ins.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Question Review Section */}
      {questions.length > 0 && (
        <div className={styles.reviewSection}>
          <h2 className={styles.reviewTitle}>Question Review</h2>
          
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <button 
              className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('all')}
            >
              All Questions ({questions.length})
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'correct' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('correct')}
            >
              Correct ({result.correct})
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'incorrect' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('incorrect')}
            >
              Incorrect ({result.incorrect})
            </button>
            <button 
              className={`${styles.filterBtn} ${filter === 'unattempted' ? styles.activeFilterBtn : ''}`}
              onClick={() => setFilter('unattempted')}
            >
              Unattempted ({result.unattempted})
            </button>
          </div>

          {/* Question List */}
          <div className={styles.questionList}>
            {filteredQuestions.length === 0 ? (
              <Card className="text-center py-12 text-slate-400 italic">
                No questions match the selected filter.
              </Card>
            ) : (
              filteredQuestions.map((q: any, idx: number) => {
                const isAnswered = q.user_answer !== null && q.user_answer !== undefined && String(q.user_answer).trim() !== '';
                const isCorrect = q.is_correct === true && isAnswered;
                const isIncorrect = q.is_correct === false && isAnswered;
                const isUnattempted = !isAnswered;
                
                return (
                  <div key={q.id} className={styles.questionCard}>
                    {/* Card Header */}
                    <div className={styles.qCardHeader}>
                      <span className={styles.qIndex}>
                        Question {idx + 1}
                        <span className={styles.qTypeBadge}>{q.q_type || 'MCQ'}</span>
                      </span>
                      
                      <div className="flex gap-2">
                        {isCorrect && (
                          <span className={`${styles.statusBadge} ${styles.badgeCorrect}`}>
                            <CheckCircle2 size={12} /> Correct (+4)
                          </span>
                        )}
                        {isIncorrect && (
                          <span className={`${styles.statusBadge} ${styles.badgeIncorrect}`}>
                            <XCircle size={12} /> Incorrect (-1)
                          </span>
                        )}
                        {isUnattempted && (
                          <span className={`${styles.statusBadge} ${styles.badgeUnattempted}`}>
                            Unattempted
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Body */}
                    <div 
                      className={styles.qCardBody} 
                      dangerouslySetInnerHTML={{ __html: q.body }}
                    />

                    {/* Question Answers */}
                    {q.q_type === 'INTEGER' ? (
                      <div className={styles.integerResult}>
                        <div className={styles.integerRow}>
                          <span className="text-slate-500">Your Answer:</span>
                          <span className={isCorrect ? styles.green : isIncorrect ? styles.red : 'text-slate-500'}>
                            {isAnswered ? q.user_answer : 'Not Attempted'}
                          </span>
                        </div>
                        <div className={styles.integerRow}>
                          <span className="text-slate-500">Correct Answer:</span>
                          <span className={styles.green}>{q.correct_option}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.optionsGrid}>
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const optionText = q[`option_${opt.toLowerCase()}`];
                          if (!optionText) return null;
                          
                          const isUserSelection = q.user_answer === opt;
                          const isCorrectOption = q.correct_option === opt;
                          
                          let optionClass = styles.optionItem;
                          if (isUserSelection && isCorrectOption) {
                            optionClass += ` ${styles.optSelectedCorrect}`;
                          } else if (isUserSelection && !isCorrectOption) {
                            optionClass += ` ${styles.optSelectedIncorrect}`;
                          } else if (isCorrectOption) {
                            optionClass += ` ${styles.optCorrectAnswer}`;
                          }
                          
                          return (
                            <div key={opt} className={optionClass}>
                              <span className={styles.optionLetter}>{opt}</span>
                              <span dangerouslySetInnerHTML={{ __html: optionText }} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Collapsible Solution Accordion */}
                    <div className="mt-4">
                      <button 
                        className={styles.explanationToggle}
                        onClick={() => toggleExplanation(q.id)}
                      >
                        <span className="flex items-center gap-2">
                          <Lightbulb size={16} />
                          {expandedQuestions[q.id] ? 'Hide Solution' : 'View Correct Approach & Solution'}
                        </span>
                        {expandedQuestions[q.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      
                      {expandedQuestions[q.id] && (
                        <div className={styles.explanationContent}>
                          {q.explanation_text ? (
                            <div 
                              className={styles.explanationText}
                              dangerouslySetInnerHTML={{ __html: q.explanation_text }}
                            />
                          ) : (
                            <p className="text-slate-400 italic">No detailed explanation provided for this question.</p>
                          )}
                          {q.image_url && (
                            <img 
                              src={q.image_url} 
                              alt="Solution Diagram" 
                              className={styles.explanationImage}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <Button size="lg" onClick={onBack}>Return to Dashboard</Button>
      </div>
    </div>
  );
};
