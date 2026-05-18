'use client';
import { useUser } from '@/contexts/UserContext';
import { Sidebar } from '@/components/Sidebar';
import { Onboarding } from '@/components/Onboarding';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import styles from '../Home.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loginWithGoogle, logout, streak, updateUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  if (isAuthenticated === null) return <div className={styles.splash}>B</div>;

  if (!isAuthenticated) {
    return (
      <main className={styles.loginPage}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.loginCard}
        >
          <div className={styles.loginHeader}>
            <div className={styles.bigLogo}>B</div>
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
    return 'Dashboard';
  };

  const breadcrumb = 'Brainiyo Portal' + pathname.replace('/dashboard', '').replace('/', ' / ').replace(/-/g, ' ');

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={pathname} onTabChange={() => {}} onLogout={logout} user={user} />
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
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
              className="p-2 rounded-full mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 duration-200 flex items-center justify-center"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-amber-400" />}
            </button>

            {user?.xp_points !== undefined && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-sm mr-2 border border-indigo-100 dark:border-indigo-800/40">
                <span className="text-lg">⭐</span> {user.xp_points} XP
              </div>
            )}
            <div className={styles.streakBadge}>
              🔥 {streak?.current_streak || 0} Day Streak
            </div>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{user?.name?.charAt(0)}</div>
            </div>
          </div>
        </header>

        <section className={styles.content}>
          {children}
        </section>
      </main>
    </div>
  );
}
