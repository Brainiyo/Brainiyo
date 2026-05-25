'use client';
import styles from './Sidebar.module.css';
import {
  LayoutDashboard,
  Brain,
  Timer,
  Target,
  Trophy,
  Bookmark,
  UserCircle,
  X
} from 'lucide-react';

import Link from 'next/link';
import Image from 'next/image';

const navItems = [
  { id: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: '/dashboard/practice', label: 'Practice Arena', icon: <Target size={20} /> },
  { id: '/dashboard/tests', label: 'Mock Tests', icon: <Timer size={20} /> },
  { id: '/dashboard/analytics', label: 'Performance', icon: <Brain size={20} /> },
  { id: '/dashboard/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  { id: '/dashboard/bookmarks', label: 'Bookmarks', icon: <Bookmark size={20} /> },
  { id: '/dashboard/profile', label: 'My Profile', icon: <UserCircle size={20} /> },
];

export const Sidebar = ({ 
  activeTab, 
  onLogout, 
  user,
  isOpen = false,
  onClose
}: { 
  activeTab: string, 
  onTabChange?: any, 
  onLogout?: () => void, 
  user?: any,
  isOpen?: boolean,
  onClose?: () => void
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <Image src="/logo-icon.png" alt="Brainiyo" width={40} height={40} style={{ objectFit: 'contain' }} />
          <span className={styles.logoText}>Brainiyo</span>
          
          {/* Close button on mobile */}
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        {user?.target_exam && (
          <div className={styles.targetBadge}>
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
              onClick={onClose}
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
    </>
  );
};

