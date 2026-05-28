'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from '../Dashboard.module.css';

const DAILY_GOAL = 20;

const SUBJECT_COLORS: Record<string, string> = {
  Physics:   'linear-gradient(90deg, #6366f1, #818cf8)',
  Chemistry: 'linear-gradient(90deg, #10b981, #34d399)',
  Biology:   'linear-gradient(90deg, #f59e0b, #fbbf24)',
  Mathematics: 'linear-gradient(90deg, #ec4899, #f472b6)',
};

function getSubjectColor(name: string) {
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return SUBJECT_COLORS[key];
  }
  return 'linear-gradient(90deg, #a855f7, #c084fc)';
}

function getMotivation(streak: number, todayDone: number, name: string) {
  const firstName = name?.split(' ')[0] || 'Scholar';
  if (todayDone === 0)  return { emoji: '⚡', text: `Ready to conquer today, ${firstName}? Your first question awaits!` };
  if (todayDone >= DAILY_GOAL) return { emoji: '🏆', text: `Daily goal crushed! You're on fire, ${firstName}!` };
  if (streak >= 7)  return { emoji: '🔥', text: `${streak}-day streak! Keep the momentum going, ${firstName}!` };
  if (streak >= 3)  return { emoji: '💪', text: `${streak} days strong! Don't break the chain, ${firstName}!` };
  return { emoji: '🚀', text: `Let's build that streak, ${firstName}. One question at a time!` };
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export default function DashboardOverview() {
  const { user, streak, dueRevision } = useUser();
  const router = useRouter();

  const [stats, setStats]               = useState<any>(null);
  const [leaderboard, setLeaderboard]   = useState<any[]>([]);
  const [myRank, setMyRank]             = useState<any>(null);
  const [availTests, setAvailTests]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, lbRes, testsRes] = await Promise.all([
          api.getDashboard(),
          api.getLeaderboard(),
          api.getAvailableMockTests(),
        ]);

        if (dashRes.success)   setStats(dashRes.data);
        if (lbRes.success) {
          setLeaderboard(lbRes.data.leaderboard?.slice(0, 5) || []);
          setMyRank(lbRes.data.current_user || null);
        }
        if (testsRes.success)  setAvailTests(testsRes.data?.slice(0, 3) || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayDone      = stats?.today_attempted ?? 0;
  const avgAccuracy    = stats?.total_attempted > 0 ? Math.round(stats.overall_accuracy) : 0;
  const totalSolved    = stats?.total_attempted ?? 0;
  const weakChapters   = stats?.weak_chapters ?? [];
  const subjectBreak   = stats?.subject_breakdown ?? [];
  const currentStreak  = streak?.current_streak ?? 0;
  const motiv          = getMotivation(currentStreak, todayDone, user?.name || '');
  const progressPct    = Math.min(100, Math.round((todayDone / DAILY_GOAL) * 100));

  const rankEmoji = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  const rankClass = (rank: number) =>
    rank === 1 ? styles.rankGold : rank === 2 ? styles.rankSilver : rank === 3 ? styles.rankBronze : styles.rankNormal;

  return (
    <div className={styles.page}>

      {/* ── 1. Motivational Banner ── */}
      <motion.div
        custom={0} variants={fadeUp} initial="hidden" animate="show"
        className={styles.banner}
      >
        <div className={styles.bannerGlow} />
        <div className={styles.bannerLeft}>
          <span className={styles.bannerGreeting}>{motiv.emoji} {motiv.text}</span>
          <span className={styles.bannerSub}>
            {user?.target_exam} Aspirant &nbsp;·&nbsp; {user?.class === 13 ? 'Dropper' : `Class ${user?.class}`}
          </span>
        </div>
        <div className={styles.bannerRight}>
          <div className={styles.bannerBadge}>
            <span className={styles.bannerBadgeVal}>🔥 {currentStreak}</span>
            <span className={styles.bannerBadgeLbl}>Day Streak</span>
          </div>
          <div className={styles.bannerBadge}>
            <span className={styles.bannerBadgeVal}>⭐ {user?.xp_points ?? 0}</span>
            <span className={styles.bannerBadgeLbl}>XP Points</span>
          </div>
          {myRank && (
            <div className={styles.bannerBadge}>
              <span className={styles.bannerBadgeVal}>{rankEmoji(myRank.rank)}</span>
              <span className={styles.bannerBadgeLbl}>Your Rank</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 2. Stats Row ── */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.blue}`}>🎯</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : `${avgAccuracy}%`}</span>
            <span className={styles.statLabel}>Avg Accuracy</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.amber}`}>⚡</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : totalSolved}</span>
            <span className={styles.statLabel}>Total Solved</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.green}`}>📅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : todayDone}</span>
            <span className={styles.statLabel}>Done Today</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIconWrap} ${styles.purple}`}>📚</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{loading ? '—' : dueRevision}</span>
            <span className={styles.statLabel}>Due for Revision</span>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Quick Actions ── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className={styles.quickActions}>
        <button className={styles.quickActionBtn} onClick={() => router.push('/dashboard/practice')}>
          <div className={styles.quickActionIcon} style={{ background: 'rgba(99,102,241,0.12)' }}>🧠</div>
          <div className={styles.quickActionText}>
            <span className={styles.quickActionTitle}>Practice Now</span>
            <span className={styles.quickActionSub}>Topic-wise questions</span>
          </div>
        </button>
        <button className={styles.quickActionBtn} onClick={() => router.push('/dashboard/tests')}>
          <div className={styles.quickActionIcon} style={{ background: 'rgba(16,185,129,0.12)' }}>📝</div>
          <div className={styles.quickActionText}>
            <span className={styles.quickActionTitle}>Mock Tests</span>
            <span className={styles.quickActionSub}>{availTests.length} tests available</span>
          </div>
        </button>
        <button className={styles.quickActionBtn} onClick={() => router.push('/dashboard/bookmarks')}>
          <div className={styles.quickActionIcon} style={{ background: 'rgba(245,158,11,0.12)' }}>🔖</div>
          <div className={styles.quickActionText}>
            <span className={styles.quickActionTitle}>Review Bookmarks</span>
            <span className={styles.quickActionSub}>{dueRevision > 0 ? `${dueRevision} due today` : 'All caught up!'}</span>
          </div>
        </button>
        <button className={styles.quickActionBtn} onClick={() => router.push('/dashboard/analytics')}>
          <div className={styles.quickActionIcon} style={{ background: 'rgba(236,72,153,0.12)' }}>📊</div>
          <div className={styles.quickActionText}>
            <span className={styles.quickActionTitle}>My Performance</span>
            <span className={styles.quickActionSub}>View full analytics</span>
          </div>
        </button>
      </motion.div>

      {/* ── 4 & 5. Today Progress + Revision Deck ── */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show" className={styles.mainGrid}>

        {/* Today's Progress */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}><span className={styles.sectionTitleIcon}>📅</span>Today&apos;s Progress</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Goal: {DAILY_GOAL} questions / day
            </span>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressTop}>
              <span className={styles.progressLabel}>Questions Solved</span>
              <span className={styles.progressCount}>{todayDone} / {DAILY_GOAL}</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
            </div>
            <span className={styles.progressGoal}>
              {progressPct >= 100
                ? '🎉 Daily goal achieved! Keep going!'
                : `${DAILY_GOAL - todayDone} more to hit your daily goal`}
            </span>
          </div>

          {/* Revision Deck */}
          <div className={styles.revisionBanner}>
            <div className={styles.revisionLeft}>
              <span className={styles.revisionTitle}>📖 Daily Revision Deck</span>
              <span className={styles.revisionSub}>
                {dueRevision > 0
                  ? `${dueRevision} flashcards due for review today`
                  : "All caught up! Great job 🎉"}
              </span>
            </div>
            <button
              className={`${styles.revisionBtn} ${dueRevision > 0 ? styles.revisionBtnActive : styles.revisionBtnDefault}`}
              onClick={() => router.push('/dashboard/bookmarks')}
            >
              {dueRevision > 0 ? 'Start Revision' : 'View Saved'}
            </button>
          </div>
        </div>

        {/* Subject Accuracy Bars */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}><span className={styles.sectionTitleIcon}>📊</span>Subject Accuracy</span>
            <button className={styles.sectionLink} onClick={() => router.push('/dashboard/analytics')}>
              Full Analytics →
            </button>
          </div>

          {loading ? (
            <div className={styles.subjectList}>
              {[1,2,3].map(i => (
                <div key={i} className={styles.subjectRow}>
                  <div className={`${styles.skeleton}`} style={{ height: 14, width: '60%' }} />
                  <div className={`${styles.skeleton}`} style={{ height: 8, width: '100%' }} />
                </div>
              ))}
            </div>
          ) : subjectBreak.length === 0 ? (
            <div className={styles.noWeakChapters}>
              <span className={styles.noWeakEmoji}>📈</span>
              Practice questions to see your subject-wise accuracy here.
            </div>
          ) : (
            <div className={styles.subjectList}>
              {subjectBreak.map((s: any) => (
                <div key={s.subject_id} className={styles.subjectRow}>
                  <div className={styles.subjectTop}>
                    <span className={styles.subjectName}>{s.subject}</span>
                    <span className={styles.subjectAccuracy}>{s.accuracy_percent ?? 0}%</span>
                  </div>
                  <div className={styles.subjectTrack}>
                    <div
                      className={styles.subjectFill}
                      style={{
                        width: `${s.accuracy_percent ?? 0}%`,
                        background: getSubjectColor(s.subject),
                      }}
                    />
                  </div>
                  <span className={styles.subjectAttempts}>{s.total_attempts} attempts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 6 & 7. Weak Chapters + Mock Tests ── */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className={styles.mainGrid}>

        {/* Weak Chapters */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}><span className={styles.sectionTitleIcon}>🎯</span>Focus Areas</span>
            <button className={styles.sectionLink} onClick={() => router.push('/dashboard/practice')}>
              Practice →
            </button>
          </div>

          {loading ? (
            <div className={styles.weakList}>
              {[1,2,3].map(i => (
                <div key={i} className={`${styles.skeleton}`} style={{ height: 56, borderRadius: 14 }} />
              ))}
            </div>
          ) : weakChapters.length === 0 ? (
            <div className={styles.noWeakChapters}>
              <span className={styles.noWeakEmoji}>✅</span>
              No weak chapters yet. Keep practicing to see your focus areas!
            </div>
          ) : (
            <div className={styles.weakList}>
              {weakChapters.map((ch: any, idx: number) => (
                <div
                  key={ch.chapter_id}
                  className={styles.weakChapter}
                  onClick={() => router.push('/dashboard/practice')}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.weakRank}>{idx + 1}</div>
                  <div className={styles.weakInfo}>
                    <div className={styles.weakName}>{ch.chapter_name}</div>
                    <div className={styles.weakSubject}>{ch.subject_name}</div>
                  </div>
                  <span className={styles.weakAccuracy}>{ch.accuracy_percent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Mock Tests */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}><span className={styles.sectionTitleIcon}>📝</span>Available Tests</span>
            <button className={styles.sectionLink} onClick={() => router.push('/dashboard/tests')}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className={styles.mockTestList}>
              {[1,2,3].map(i => (
                <div key={i} className={`${styles.skeleton}`} style={{ height: 68, borderRadius: 14 }} />
              ))}
            </div>
          ) : availTests.length === 0 ? (
            <div className={styles.noMockTests}>
              <span style={{ fontSize: 32 }}>📭</span>
              No tests available right now. Check back soon!
            </div>
          ) : (
            <div className={styles.mockTestList}>
              {availTests.map((test: any) => (
                <div key={test.id} className={styles.mockTestCard}>
                  <div className={styles.mockTestIcon}>📝</div>
                  <div className={styles.mockTestInfo}>
                    <div className={styles.mockTestName}>{test.title}</div>
                    <div className={styles.mockTestMeta}>
                      <span>{test.total_questions} Qs</span>
                      <span className={styles.mockTestDot} />
                      <span>{test.duration_minutes} min</span>
                      <span className={styles.mockTestDot} />
                      <span>{test.exam_type}</span>
                    </div>
                  </div>
                  <button
                    className={styles.mockStartBtn}
                    onClick={() => router.push('/dashboard/tests')}
                  >
                    Start →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 8. Leaderboard Peek ── */}
      <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}><span className={styles.sectionTitleIcon}>🏆</span>Leaderboard</span>
          <button className={styles.sectionLink} onClick={() => router.push('/dashboard/leaderboard')}>
            Full Board →
          </button>
        </div>

        {loading ? (
          <div className={styles.leaderboardList}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`${styles.skeleton}`} style={{ height: 52, borderRadius: 14 }} />
            ))}
          </div>
        ) : (
          <div className={styles.leaderboardList}>
            {leaderboard.map((entry: any) => (
              <div
                key={entry.id}
                className={`${styles.leaderboardRow} ${entry.is_current_user ? styles.currentUser : ''}`}
              >
                <span className={`${styles.leaderboardRank} ${rankClass(entry.rank)}`}>
                  {entry.rank <= 3 ? rankEmoji(entry.rank) : `#${entry.rank}`}
                </span>
                <div className={styles.leaderboardAvatar}>
                  {entry.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <span className={styles.leaderboardName}>
                  {entry.name}
                  {entry.is_current_user && <span className={styles.youBadge}>YOU</span>}
                </span>
                <span className={styles.leaderboardXp}>⭐ {entry.xp_points} XP</span>
              </div>
            ))}

            {/* Show user's rank separately if they're not in the top 5 */}
            {myRank && !leaderboard.find((e: any) => e.is_current_user) && (
              <div className={styles.leaderboardUserSelf}>
                <span className={`${rankClass(myRank.rank)}`} style={{ fontWeight: 800 }}>
                  {myRank.rank <= 3 ? rankEmoji(myRank.rank) : `#${myRank.rank}`}
                </span>
                <div className={styles.leaderboardAvatar} style={{ width: 28, height: 28, fontSize: 12 }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: 700 }}>
                  {user?.name} <span className={styles.youBadge}>YOU</span>
                </span>
                <span className={styles.leaderboardXp}>⭐ {myRank.xp_points} XP</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

    </div>
  );
}
