'use client';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import styles from './ExamResult.module.css';

export const ExamResult = ({ result, onBack }: { result: any, onBack: () => void }) => {
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
          <h3>Performance Summary</h3>
          <div className={styles.breakdownList}>
            <p className="text-slate-500">
              You answered {result.correct} questions correctly out of {result.correct + result.incorrect + result.unattempted}.
              {result.incorrect > 5 && " Target reducing negative marking in your next session."}
            </p>
          </div>
        </Card>
      </div>

      <div className={styles.footer}>
        <Button size="lg" onClick={onBack}>Return to Dashboard</Button>
      </div>
    </div>
  );
};
