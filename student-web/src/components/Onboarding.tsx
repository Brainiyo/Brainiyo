'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { api } from '@/lib/api';
import styles from './Onboarding.module.css';

interface OnboardingProps {
  onComplete: (user: any) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [exam, setExam] = useState<'NEET' | 'JEE'>('NEET');
  const [studentClass, setStudentClass] = useState<11 | 12 | 13>(11);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.updateMe({
        target_exam: exam,
        class: studentClass
      });
      if (res.success) {
        onComplete(res.data);
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.onboardingOverlay}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={styles.onboardingCard}
      >
        <h1>Personalize Your Journey</h1>
        <p>Tell us a bit about your goals so we can calibrate your practice engine.</p>

        <div className={styles.selectionGroup}>
          <span className={styles.selectionLabel}>Target Exam</span>
          <div className={styles.optionsGrid}>
            <button 
              className={`${styles.optionBtn} ${exam === 'NEET' ? styles.active : ''}`}
              onClick={() => setExam('NEET')}
            >
              <span className={styles.optionIcon}>🩺</span>
              NEET
            </button>
            <button 
              className={`${styles.optionBtn} ${exam === 'JEE' ? styles.active : ''}`}
              onClick={() => setExam('JEE')}
            >
              <span className={styles.optionIcon}>🚀</span>
              JEE
            </button>
          </div>
        </div>

        <div className={styles.selectionGroup}>
          <span className={styles.selectionLabel}>Current Class</span>
          <div className={styles.optionsGrid}>
            <button 
              className={`${styles.optionBtn} ${studentClass === 11 ? styles.active : ''}`}
              onClick={() => setStudentClass(11)}
            >
              <span className={styles.optionIcon}>📚</span>
              Class 11
            </button>
            <button 
              className={`${styles.optionBtn} ${studentClass === 12 ? styles.active : ''}`}
              onClick={() => setStudentClass(12)}
            >
              <span className={styles.optionIcon}>🎓</span>
              Class 12
            </button>
            <button 
              className={`${styles.optionBtn} ${studentClass === 13 ? styles.active : ''}`}
              onClick={() => setStudentClass(13)}
            >
              <span className={styles.optionIcon}>🔄</span>
              Dropper
            </button>
          </div>
        </div>

        <Button 
          fullWidth 
          size="lg" 
          onClick={handleSubmit} 
          loading={loading}
          className={styles.submitBtn}
        >
          Start My Prep
        </Button>
      </motion.div>
    </div>
  );
}
