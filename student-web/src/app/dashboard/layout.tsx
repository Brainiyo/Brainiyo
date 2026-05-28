'use client';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Sidebar } from '@/components/Sidebar';
import { Onboarding } from '@/components/Onboarding';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Menu } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../Home.module.css';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loginWithGoogle, logout, streak, updateUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthenticated === null) {
    return (
      <div className={styles.splash}>
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
        >
          <Image
            src="/logo-icon.png"
            alt="Brainiyo Logo"
            width={100}
            height={100}
            style={{ objectFit: 'contain' }}
            priority
          />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '3px', fontFamily: 'var(--font-outfit), sans-serif' }}>
            BRAINIYO
          </h2>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.loginPage}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.loginCard}
        >
          <div className={styles.loginHeader}>
            <div className={styles.bigLogo}>
              <Image
                src="/logo-icon.png"
                alt="Brainiyo Logo"
                width={80}
                height={80}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <h1>Master Your Future</h1>
            <p>Step into the Brainiyo Arena and conquer your JEE/NEET goals.</p>
          </div>
          
          <Button fullWidth size="lg" onClick={loginWithGoogle} className={styles.googleBtn}>
            <span className={styles.googleIcon}>G</span> Continue with Google
          </Button>
          
          <p className={styles.loginFooter}>
            By continuing, you agree to our <span>Terms of Service</span>
          </p>
        </motion.div>
      </main>
    );
  }

  if (!user?.is_onboarded) {
    return <Onboarding onComplete={updateUser} />;
  }

  const getPageTitle = () => {
    if (pathname === '/dashboard') return `Welcome back, ${user?.name?.split(' ')[0]}!`;
    if (pathname.includes('/practice')) return 'Practice Arena';
    if (pathname.includes('/tests')) return 'Mock Test Center';
    if (pathname.includes('/analytics')) return 'Performance Insights';
    if (pathname.includes('/leaderboard')) return 'Leaderboard';
    if (pathname.includes('/bookmarks')) return 'Bookmark Vault';
    if (pathname.includes('/profile')) return 'My Profile';
    return 'Dashboard';
  };


  const breadcrumb = 'Brainiyo Portal' + pathname.replace('/dashboard', '').replace('/', ' / ').replace(/-/g, ' ');

  return (
    <div className={styles.layout}>
      <Sidebar 
        activeTab={pathname} 
        onLogout={logout} 
        user={user} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuToggle} 
              onClick={() => setSidebarOpen(true)}
              title="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="animate-fade">
              {getPageTitle()}
            </h2>
            <p className={styles.breadcrumb} style={{ textTransform: 'capitalize' }}>
              {breadcrumb === 'Brainiyo Portal' ? 'Brainiyo Portal / Overview' : breadcrumb}
            </p>
          </div>

          <div className={styles.headerRight}>
            <button 
              onClick={toggleTheme}
              className={styles.themeToggle}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon size={20} style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <Sun size={20} style={{ color: '#f59e0b' }} />
              )}
            </button>

            {user?.xp_points !== undefined && (
              <div className={styles.xpBadge}>
                <span>⭐</span> <span>{user.xp_points} <span className={styles.badgeLabel}>XP</span></span>
              </div>
            )}
            <div className={styles.streakBadge}>
              🔥 {streak?.current_streak || 0} <span className={styles.badgeLabel}>Day Streak</span>
            </div>
            <Link href="/dashboard/profile" className={styles.userProfile} title="My Profile">
              <div className={styles.avatar}>{user?.name?.charAt(0)}</div>
            </Link>
          </div>
        </header>

        <section className={styles.content}>
          {children}
        </section>
      </main>
    </div>
  );
}
