import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  CreditCard, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Question Bank', path: '/questions' },
  { icon: Users, label: 'Students', path: '/students' },
  { icon: ClipboardList, label: 'Mock Tests', path: '/mock-tests' },
  { icon: CreditCard, label: 'Revenue', path: '/revenue' },
];

export const Sidebar: React.FC<SidebarProps> = ({ darkMode, setDarkMode }) => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside 
      className={cn(
        "h-screen sticky top-0 bg-white dark:bg-card-dark border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-brand-teal bg-clip-text text-transparent">
            Brainiyo
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/25" 
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <item.icon size={20} className={cn("transition-transform", !collapsed && "group-hover:scale-110")} />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
          <LogOut size={20} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
