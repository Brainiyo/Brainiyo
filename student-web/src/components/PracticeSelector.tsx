'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from './Button';
import styles from './PracticeSelector.module.css';

interface PracticeSelectorProps {
  onStart: (topicId: string, count: number) => void;
}

export function PracticeSelector({ onStart }: PracticeSelectorProps) {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(10);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 1) {
      setLoading(true);
      api.getSubjects().then(res => {
        setSubjects(res.data);
        setLoading(false);
      });
    }
  }, [step]);

  const handleSubjectSelect = async (subject: any) => {
    setSelectedSubject(subject);
    setLoading(true);
    const res = await api.getChapters(subject.id);
    setChapters(res.data);
    setLoading(false);
    setStep(2);
  };

  const handleChapterSelect = async (chapter: any) => {
    setSelectedChapter(chapter);
    setLoading(true);
    const res = await api.getTopics(chapter.id);
    setTopics(res.data);
    setLoading(false);
    setStep(3);
  };

  const handleTopicSelect = (topic: any) => {
    setSelectedTopic(topic);
    setStep(4);
  };

  const handleStart = () => {
    onStart(selectedTopic.id, questionCount);
  };

  return (
    <div className={styles.selector}>
      <div className={styles.stepIndicator}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepDotActive : ''}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h1 className={styles.title}>Choose a Subject</h1>
            <p className={styles.subtitle}>Select the domain you want to master today.</p>
            <div className={styles.grid}>
              {subjects.map(sub => (
                <div key={sub.id} className={styles.card} onClick={() => handleSubjectSelect(sub)}>
                  <div className={styles.cardIcon}>{getSubjectIcon(sub.name)}</div>
                  <div className={styles.cardTitle}>{sub.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className={styles.header}>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>← Back</Button>
              <h1 className={styles.title}>{selectedSubject.name} Chapters</h1>
            </div>
            <div className={styles.list}>
              {chapters.map(ch => (
                <div key={ch.id} className={styles.listItem} onClick={() => handleChapterSelect(ch)}>
                  <div className={styles.itemInfo}>
                    <h4>{ch.name}</h4>
                    <span className={styles.itemStats}>{ch.total_topics} Topics • Class {ch.class_level}</span>
                  </div>
                  {ch.accuracy_percent && (
                    <div className={styles.accuracy}>{ch.accuracy_percent}% accuracy</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className={styles.header}>
              <Button variant="outline" size="sm" onClick={() => setStep(2)}>← Back</Button>
              <h1 className={styles.title}>Pick a Topic</h1>
            </div>
            <div className={styles.list}>
              {topics.map(t => (
                <div key={t.id} className={styles.listItem} onClick={() => handleTopicSelect(t)}>
                  <div className={styles.itemInfo}>
                    <h4>{t.name}</h4>
                    {t.due_reviews > 0 && <span style={{ color: '#ef4444' }}>🔥 {t.due_reviews} reviews due</span>}
                  </div>
                  <Button size="sm" variant="outline">Select</Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className={styles.header}>
              <Button variant="outline" size="sm" onClick={() => setStep(3)}>← Back</Button>
              <h1 className={styles.title}>Ready for Action?</h1>
              <p className={styles.subtitle}>You've selected <strong>{selectedTopic.name}</strong>. Choose your session depth.</p>
            </div>
            
            <div className={styles.selectionGroup}>
              <span className={styles.selectionLabel}>Number of Questions</span>
              <div className={styles.countSelector}>
                {[5, 10, 20, 50].map(count => (
                  <button 
                    key={count} 
                    className={`${styles.countBtn} ${questionCount === count ? styles.countBtnActive : ''}`}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <Button fullWidth size="lg" onClick={handleStart}>Launch Practice Session</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading && <div className={styles.overlayLoading}>Loading Curriculum...</div>}
    </div>
  );
}

function getSubjectIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('physic')) return '⚡';
  if (n.includes('chem')) return '🧪';
  if (n.includes('math')) return '📐';
  if (n.includes('bio')) return '🧬';
  return '📚';
}
