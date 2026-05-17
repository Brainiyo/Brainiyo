'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import styles from './PerformanceAnalytics.module.css';

export function PerformanceAnalytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { streak } = useUser();

  useEffect(() => {
    async function fetchData() {
      try {
        const [perfRes, weakRes] = await Promise.all([
          api.getPerformance(),
          api.getWeakTopics()
        ]);
        setStats(perfRes.data);
        setWeakTopics(weakRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Analyzing your performance...</div>;

  const totalAttempts = stats.reduce((acc, s) => acc + (parseInt(s.total_attempts) || 0), 0);
  
  // Calculate average accuracy and average time only for subjects that have actual attempts
  const subjectsWithAttempts = stats.filter(s => (parseInt(s.total_attempts) || 0) > 0);
  
  const avgAccuracy = subjectsWithAttempts.length > 0 
    ? Math.round(subjectsWithAttempts.reduce((acc, s) => acc + (parseFloat(s.avg_accuracy) || 0), 0) / subjectsWithAttempts.length) 
    : 0;

  const avgTimeTaken = subjectsWithAttempts.length > 0
    ? Math.round(subjectsWithAttempts.reduce((acc, s) => acc + (parseFloat(s.avg_time_taken) || 0), 0) / subjectsWithAttempts.length)
    : 0;

  // Use average accuracy as mastery, defaulting to 24% if no data exists
  const mastery = avgAccuracy || 24;

  return (
    <div className={styles.dashboard}>
      <header>
        <h1 className={styles.title}>Performance Insights</h1>
        <p className={styles.subtitle}>Track your progress and target your weak spots.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalAttempts}</span>
          <span className={styles.statLabel}>Total Solved</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{avgAccuracy}%</span>
          <span className={styles.statLabel}>Avg. Accuracy</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{streak?.current_streak || 0}</span>
          <span className={styles.statLabel}>Day Streak 🔥</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{avgTimeTaken > 0 ? `${avgTimeTaken}s` : '45s'}</span>
          <span className={styles.statLabel}>Time / Question</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Subject Mastery</h2>
          <div className={styles.subjectBars}>
            {stats.map((s, i) => (
              <div key={s.subject_id} className={styles.subjectItem}>
                <div className={styles.subjectMeta}>
                  <span>{s.subject_name}</span>
                  <span>{Math.round(s.avg_accuracy)}%</span>
                </div>
                <div className={styles.barContainer}>
                  <motion.div 
                    className={styles.barFill} 
                    style={{ background: getSubjectColor(s.subject_name) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.avg_accuracy}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Syllabus Overview</h2>
          <div className={styles.masteryContainer}>
            <div className={styles.masteryCircle}>
              <svg className={styles.svgCircle} width="200" height="200">
                <circle className={styles.circleBg} cx="100" cy="100" r="80" />
                <motion.circle 
                  className={styles.circleFill} 
                  cx="100" cy="100" r="80" 
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ strokeDasharray: `${(mastery / 100) * 502} 502` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className={styles.circleText}>
                <span className={styles.masteryValue}>{mastery}%</span>
                <span className={styles.masteryLabel}>Mastered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🔥 Focus Area: Weak Topics</h2>
        <p className={styles.subtitle}>These topics need urgent attention. Practice them to boost your overall score.</p>
        <div className={styles.weakTopics}>
          {weakTopics.length > 0 ? weakTopics.map((topic) => (
            <div key={topic.id} className={styles.topicCard}>
              <div className={styles.topicName}>
                {topic.topic_name}
                <span className={styles.accuracyBadge}>{Math.round(topic.accuracy_percent)}% Accuracy</span>
              </div>
              <div className={styles.topicMeta}>
                {topic.subject_name} • {topic.chapter_name} • {topic.total_attempts} attempts
              </div>
            </div>
          )) : (
            <div className={styles.empty}>Keep practicing! We'll identify your weak spots once you solve more questions.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function getSubjectColor(name: string) {
  const n = name.toLowerCase();
  if (n.includes('physic')) return '#4f46e5';
  if (n.includes('chem')) return '#06b6d4';
  if (n.includes('math')) return '#f59e0b';
  if (n.includes('bio')) return '#10b981';
  return '#6366f1';
}
