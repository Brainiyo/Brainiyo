'use client';
import { motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import styles from '../Home.module.css';

export default function DashboardOverview() {
  const { dueRevision } = useUser();
  const router = useRouter();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={styles.dashboardGrid}
    >
      <Card glass className={styles.heroCard}>
        <div className={styles.heroContent}>
          <h3>Daily Revision Deck</h3>
          <p>
            {dueRevision > 0 
              ? `You have ${dueRevision} questions due for review today. Boost your retention now!` 
              : "You're all caught up on your revisions! Great job."}
          </p>
          {dueRevision > 0 && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '100%', background: '#f59e0b' }}></div>
            </div>
          )}
        </div>
        <Button 
          variant={dueRevision > 0 ? "primary" : "secondary"} 
          onClick={() => router.push('/dashboard/bookmarks')}
        >
          {dueRevision > 0 ? 'Start Revision' : 'View Saved'}
        </Button>
      </Card>

      <div className={styles.statCards}>
        <Card className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <div className={styles.statData}>
            <span className={styles.statVal}>84%</span>
            <span className={styles.statLabel}>Avg Accuracy</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statIcon}>⚡</span>
          <div className={styles.statData}>
            <span className={styles.statVal}>120</span>
            <span className={styles.statLabel}>Total Solved</span>
          </div>
        </Card>
      </div>
      
      <Card className={styles.recentActivity}>
        <h3>Upcoming Mock Tests</h3>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.actIcon}>📝</div>
            <div className={styles.actInfo}>
              <p>NEET Full Syllabus Mock 14</p>
              <span>Scheduled for May 15, 2026</span>
            </div>
            <Button variant="outline" size="sm">Register</Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
