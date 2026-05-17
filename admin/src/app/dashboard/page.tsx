'use client';
import { Users, UserCheck, IndianRupee, CheckCircle, ArrowUpRight, ArrowDownRight, BookOpen, ClipboardList } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '@/lib/config';

const kpis = [
  { label: 'Total Students', value: '45,231', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Daily Active Users', value: '8,432', change: '+5.2%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Revenue MTD', value: '₹12.4L', change: '+18%', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Qs Attempted', value: '1.2M', change: '-2%', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

// Static data removed, using API data instead

const recentSignups = [
  { name: 'Arjun Sharma', email: 'arjun@example.com', exam: 'NEET', date: '2 mins ago' },
  { name: 'Priya Patel', email: 'priya@example.com', exam: 'JEE', date: '15 mins ago' },
  { name: 'Rahul Verma', email: 'rahul@example.com', exam: 'NEET', date: '1 hour ago' },
  { name: 'Sneha Rao', email: 'sneha@example.com', exam: 'JEE', date: '3 hours ago' },
];

const quickLinks = [
  { label: 'Upload Question', href: '/dashboard/upload', icon: BookOpen, color: 'from-indigo-500 to-indigo-600' },
  { label: 'View Question Bank', href: '/dashboard/questions', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
  { label: 'Manage Mock Tests', href: '/dashboard/mock-tests', icon: ClipboardList, color: 'from-purple-500 to-purple-600' },
  { label: 'View Students', href: '/dashboard/students', icon: Users, color: 'from-orange-500 to-orange-600' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('brainiyo_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/analytics/admin/overview`, { headers }).then(res => res.json()),
      fetch(`${API_BASE_URL}/auth/admin/users`, { headers }).then(res => res.json())
    ]).then(([overviewRes, usersRes]) => {
      setStats(overviewRes.data);
      setRecentStudents(usersRes.data?.slice(0, 5) || []);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load dashboard data", err);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { label: 'Total Students', value: stats?.stats?.total_students || '0', change: '+0%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'New Students (24h)', value: stats?.stats?.new_signups_24h || '0', change: '+0%', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Total Questions', value: stats?.stats?.total_questions || '0', change: '+0%', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Qs Attempted', value: stats?.stats?.total_attempts || '0', change: '+0%', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  const signupData = stats?.signup_chart?.map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    value: parseInt(d.count)
  })) || [];

  const subjectColors: Record<string, string> = {
    'Physics': '#4F46E5',
    'Chemistry': '#0D9488',
    'Biology': '#8B5CF6',
    'Maths': '#F59E0B',
    'Botany': '#10B981',
    'Zoology': '#F43F5E'
  };

  const subjectData = stats?.subject_breakdown?.map((d: any) => ({
    name: d.name,
    value: parseInt(d.count),
    color: subjectColors[d.name] || '#6366F1'
  })) || [];

  if (loading) return <div className="flex items-center justify-center h-full">Loading Dashboard...</div>;
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back! Here's what's happening with Brainiyo.</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a key={link.href} href={link.href} className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg hover:scale-105 transition-transform`}>
              <Icon size={20} />
              <span className="text-sm font-bold">{link.label}</span>
            </a>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isUp = kpi.change.startsWith('+');
          return (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-start justify-between shadow-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
                <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.change}
                  <span className="text-slate-400 font-normal">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <Icon className={kpi.color} size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-bold mb-6">New Signups (Last 30 Days)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-lg font-bold mb-6">Questions per Subject (Last 7 Days)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {subjectData.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-lg font-bold">Recent Signups</h4>
          <a href="/dashboard/students" className="text-indigo-600 text-sm font-bold hover:underline">View All →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold">Exam</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentStudents.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-sm">{user.name[0]}</div>
                      <div>
                        <div className="font-bold text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email || user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${user.target_exam === 'NEET' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{user.target_exam}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Active</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
