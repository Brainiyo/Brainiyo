'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkMinus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from './Card';
import { Button } from './Button';
import styles from './BookmarkVault.module.css';

export const BookmarkVault = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.getBookmarks();
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      await api.toggleBookmark(id);
      if (activeQuestion?.id === id) setActiveQuestion(null);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      fetchBookmarks(); // Revert on fail
    }
  };

  if (loading) return <div className={styles.loadingBox}><Loader2 className="animate-spin" /> Loading Vault...</div>;
  if (bookmarks.length === 0) return <div className={styles.emptyState}>Your vault is empty. Bookmark questions during practice to see them here.</div>;

  return (
    <div className={styles.container}>
      {/* Left List */}
      <div className={styles.list}>
        {bookmarks.map((q) => (
          <Card 
            key={q.id} 
            className={`${styles.listCard} ${activeQuestion?.id === q.id ? styles.activeCard : ''}`}
            onClick={() => setActiveQuestion(q)}
          >
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardMeta}>{q.subject_name} • {q.chapter_name}</div>
                <div className={styles.cardBody} dangerouslySetInnerHTML={{ __html: q.body }} />
              </div>
              <button 
                className={styles.removeBtn}
                onClick={(e) => removeBookmark(q.id, e)}
                aria-label="Remove bookmark"
              >
                <BookmarkMinus size={16} />
              </button>
            </div>
            <div className={styles.cardDate}>
              Saved on {new Date(q.created_at).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Right Viewer */}
      <div className={styles.viewer}>
        <AnimatePresence mode="wait">
          {activeQuestion ? (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className={styles.viewerCard}>
                <div className={styles.viewerHeader}>
                  <div className={styles.viewerBadges}>
                    <span className={styles.badgeSubject}>{activeQuestion.subject_name}</span>
                    <span className={styles.badgeDifficulty}>{activeQuestion.difficulty}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeBookmark(activeQuestion.id)}>Remove from Vault</Button>
                </div>
                
                <div className={styles.viewerBody} dangerouslySetInnerHTML={{ __html: activeQuestion.body }} />
                
                {activeQuestion.q_type === 'INTEGER' ? (
                  <div className={styles.integerAnswerBox}>
                    <p className="text-sm font-semibold text-slate-500 mb-1">Correct Answer:</p>
                    <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeQuestion.correct_option}</p>
                  </div>
                ) : (
                  <div className={styles.optionsList}>
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div 
                        key={opt}
                        className={`${styles.optionItem} ${
                          activeQuestion.correct_option === opt 
                            ? styles.correctOption 
                            : styles.incorrectOption
                        }`}
                      >
                        <div>
                          <span className={styles.optionLabel}>{opt}</span>
                          <span className={styles.optionText} dangerouslySetInnerHTML={{ __html: activeQuestion[`option_${opt.toLowerCase()}`] }} />
                        </div>
                        {activeQuestion.correct_option === opt && <span className={styles.correctText}>✓ Correct Answer</span>}
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.explanation_text && (
                  <div className={styles.explanationBox}>
                    <h4 className={styles.explanationTitle}>Explanation</h4>
                    <div className={styles.explanationContent} dangerouslySetInnerHTML={{ __html: activeQuestion.explanation_text }} />
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className={styles.emptyState}>
              Select a question from your vault to review it.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
