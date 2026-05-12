import React from 'react';
import { 
  Users, 
  UserCheck, 
  IndianRupee, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const kpis = [
  { label: 'Total Users', value: '45,231', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'DAU', value: '8,432', change: '+5.2%', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  { label: 'Revenue MTD', value: '₹12.4L', change: '+18%', icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Qs Attempted', value: '1.2M', change: '-2%', icon: CheckCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const dauData = [
  { name: '01 May', value: 4000 }, { name: '05 May', value: 3000 }, { name: '10 May', value: 5000 },
  { name: '15 May', value: 4500 }, { name: '20 May', value: 6000 }, { name: '25 May', value: 7500 },
  { name: '30 May', value: 8432 },
];

const subjectData = [
  { name: 'Physics', value: 450, color: '#4F46E5' },
  { name: 'Chemistry', value: 380, color: '#0D9488' },
  { name: 'Biology', value: 520, color: '#8B5CF6' },
  { name: 'Maths', value: 310, color: '#F59E0B' },
];

const recentSignups = [
  { name: 'Arjun Sharma', email: 'arjun@example.com', exam: 'NEET', date: '2 mins ago' },
  { name: 'Priya Patel', email: 'priya@example.com', exam: 'JEE', date: '15 mins ago' },
  { name: 'Rahul Verma', email: 'rahul@example.com', exam: 'NEET', date: '1 hour ago' },
  { name: 'Sneha Rao', email: 'sneha@example.com', exam: 'JEE', date: '3 hours ago' },
];

const DashboardOverview: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-6 flex items-start justify-between">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{kpi.label}</p>
              <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold mt-2",
                kpi.change.startsWith('+') ? "text-green-600" : "text-red-600"
              )}>
                {kpi.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
                <span className="text-slate-400 font-normal">vs last month</span>
              </div>
            </div>
            <div className={cn("p-3 rounded-xl", kpi.bg)}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DAU Chart */}
        <div className="card p-6">
          <h4 className="text-lg font-bold mb-6">Daily Active Users (Last 30 Days)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dauData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Chart */}
        <div className="card p-6">
          <h4 className="text-lg font-bold mb-6">Questions per Subject (Last 7 Days)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-lg font-bold">Recent Signups</h4>
          <button className="text-primary-600 text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Student</th>
                <th className="px-6 py-4 font-bold">Exam</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentSignups.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{user.exam}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Active</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal utility for tailwind classes (usually in separate file but kept here for completeness)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default DashboardOverview;
