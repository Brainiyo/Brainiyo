'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from '../Home.module.css';

export default function DashboardOverview() {
  const { dueRevision } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, upcomingRes] = await Promise.all([
          api.getDashboard(),
          api.getUpcomingMockTests()
        ]);
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (upcomingRes.success) {
          setUpcomingTests(upcomingRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
        setUpcomingLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const avgAccuracy = stats && stats.total_attempted > 0
    ? `${Math.round(stats.overall_accuracy)}%`
    : '0%';
  const totalSolved = stats ? stats.total_attempted : 0;

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
            <span className={styles.statVal}>{loading ? '...' : avgAccuracy}</span>
            <span className={styles.statLabel}>Avg Accuracy</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statIcon}>⚡</span>
          <div className={styles.statData}>
            <span className={styles.statVal}>{loading ? '...' : totalSolved}</span>
            <span className={styles.statLabel}>Total Solved</span>
          </div>
        </Card>
      </div>
      
      <Card className={styles.recentActivity}>
        <h3>Upcoming Mock Tests</h3>
        <div className={styles.activityList}>
          {upcomingLoading ? (
            <div className="py-4 text-center text-slate-500 text-sm">Loading upcoming tests...</div>
          ) : upcomingTests.length === 0 ? (
            <div className="py-4 text-center text-slate-400 text-sm italic">
              No upcoming mock tests scheduled.
            </div>
          ) : (
            upcomingTests.map((test) => (
              <div key={test.id} className={styles.activityItem}>
                <div className={styles.actIcon}>📝</div>
                <div className={styles.actInfo}>
                  <p>{test.title}</p>
                  <span>
                    Scheduled for {new Date(test.publish_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push('/dashboard/tests')}
                >
                  View Details
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
