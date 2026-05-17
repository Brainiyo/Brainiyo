'use client';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  Brain,
  Timer,
  Target,
  Trophy,
  Bookmark
} from 'lucide-react';

import Link from 'next/link';

const navItems = [
  { id: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: '/dashboard/practice', label: 'Practice Arena', icon: <Target size={20} /> },
  { id: '/dashboard/tests', label: 'Mock Tests', icon: <Timer size={20} /> },
  { id: '/dashboard/analytics', label: 'Performance', icon: <Brain size={20} /> },
  { id: '/dashboard/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  { id: '/dashboard/bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} /> },
];

export const Sidebar = ({ activeTab, onLogout, user }: { activeTab: string, onTabChange?: any, onLogout?: () => void, user?: any }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>B</div>
        <span className={styles.logoText}>Brainiyo</span>
      </div>

      {user?.target_exam && (
        <div style={{ margin: '0 20px 20px', padding: '10px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{user.target_exam === 'NEET' ? '🩺' : '🚀'}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>{user.target_exam} Target</div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{user.class === 13 ? 'Dropper' : `Class ${user.class}`}</div>
          </div>
        </div>
      )}


      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.id}
            className={`${styles.navItem} ${activeTab === item.id || (item.id !== '/dashboard' && activeTab.startsWith(item.id)) ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

