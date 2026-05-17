'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import styles from './Leaderboard.module.css';

export const Leaderboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getLeaderboard();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading rankings...</div>;
  if (!data || !data.leaderboard.length) return <div className={styles.loading}>No rankings available yet. Start practicing!</div>;

  const topThree = data.leaderboard.slice(0, 3);
  const restList = data.leaderboard.slice(3);

  // Reorder top 3 for podium display: Rank 2, Rank 1, Rank 3
  const podiumOrder = [
    topThree[1],
    topThree[0],
    topThree[2]
  ].filter(Boolean);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Global Leaderboard</h1>
          <p className={styles.subtitle}>Compete with peers and track your All-India Standing</p>
        </div>
      </header>

      {/* Podium */}
      <div className={styles.topThree}>
        {podiumOrder.map((user: any) => {
          const rankNum = user.rank;
          const barClass = rankNum === 1 ? styles.bar1 : rankNum === 2 ? styles.bar2 : styles.bar3;
          const rankClass = rankNum === 1 ? styles.rank1 : rankNum === 2 ? styles.rank2 : styles.rank3;

          return (
            <motion.div 
              key={user.id} 
              className={styles.podium}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rankNum * 0.1 }}
            >
              <div className={`${styles.podiumRank} ${rankClass}`}>{rankNum}</div>
              <div className={styles.podiumAvatar} style={{ color: rankNum === 1 ? '#f59e0b' : '#64748b' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className={`${styles.podiumBar} ${barClass}`}>
                <div className={styles.podiumName}>{user.name}</div>
                <div className={styles.podiumXp}>{user.xp_points} XP</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* List */}
      <div className={styles.listContainer}>
        {restList.map((user: any, index: number) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (index * 0.05) }}
            className={`${styles.listItem} ${user.is_current_user ? styles.isCurrentUser : ''}`}
          >
            <div className={styles.itemRank}>#{user.rank}</div>
            <div className={styles.itemInfo}>
              <div className={styles.itemAvatar}>{user.name.charAt(0).toUpperCase()}</div>
              <div className={styles.itemName}>
                {user.name}
                {user.is_current_user && <span className={styles.itemMe}>You</span>}
              </div>
            </div>
            <div className={styles.itemXp}>{user.xp_points} XP</div>
          </motion.div>
        ))}

        {/* Append current user at the bottom if they aren't in the Top 50 */}
        {data.current_user && !data.leaderboard.find((u: any) => u.id === data.current_user.id) && (
          <div className={`${styles.listItem} ${styles.isCurrentUser}`} style={{ borderTop: '2px solid #e2e8f0' }}>
            <div className={styles.itemRank}>#{data.current_user.rank}</div>
            <div className={styles.itemInfo}>
              <div className={styles.itemAvatar}>{data.current_user.name.charAt(0).toUpperCase()}</div>
              <div className={styles.itemName}>
                {data.current_user.name}
                <span className={styles.itemMe}>You</span>
              </div>
            </div>
            <div className={styles.itemXp}>{data.current_user.xp_points} XP</div>
          </div>
        )}
      </div>
    </div>
  );
};
