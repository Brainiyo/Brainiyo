'use client';
import { IndianRupee, TrendingUp, CreditCard, ArrowUpRight, Download, Calendar, Filter, ArrowDownRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const revenueData = [
  { name: 'Mon', value: 45000 },
  { name: 'Tue', value: 52000 },
  { name: 'Wed', value: 48000 },
  { name: 'Thu', value: 61000 },
  { name: 'Fri', value: 55000 },
  { name: 'Sat', value: 67000 },
  { name: 'Sun', value: 72000 },
];

const transactions = [
  { id: 'TX1024', student: 'Arjun Sharma', plan: 'NEET Pro Yearly', amount: 4999, status: 'Success', date: '2 mins ago' },
  { id: 'TX1023', student: 'Priya Patel', plan: 'JEE Monthly', amount: 999, status: 'Success', date: '15 mins ago' },
  { id: 'TX1022', student: 'Rahul Verma', plan: 'NEET Pro Yearly', amount: 4999, status: 'Pending', date: '1 hour ago' },
  { id: 'TX1021', student: 'Sneha Rao', plan: 'IIT JEE Bundle', amount: 8999, status: 'Success', date: '3 hours ago' },
];

export default function RevenuePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Insights</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track payments, subscriptions, and financial growth.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-xs h-10">
            <Calendar size={14} /> Last 7 Days
          </Button>
          <Button className="gap-2 text-xs h-10">
            <Download size={14} /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue MTD', value: '₹12.45L', change: '+18.2%', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Avg Order Value', value: '₹3,420', change: '+5.4%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Active Subscriptions', value: '2,840', change: '-1.2%', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const isUp = kpi.change.startsWith('+');
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                <h3 className="text-3xl font-bold">{kpi.value}</h3>
                <div className={`flex items-center gap-1 text-xs font-bold mt-3 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.change}
                  <span className="text-slate-400 font-normal ml-1">vs prev. period</span>
                </div>
              </div>
              <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                <Icon className={kpi.color} size={28} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-lg font-bold">Revenue Growth (Daily)</h4>
          <div className="flex gap-4 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" /> This Week
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                formatter={(value: any) => [value ? `₹${value.toLocaleString()}` : '₹0', 'Revenue']}
              />
              <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <h4 className="text-lg font-bold">Recent Transactions</h4>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={14} /> Filter
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Transaction ID</th>
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-mono text-slate-500">{tx.id}</td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{tx.student}</div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{tx.plan}</td>
                  <td className="px-8 py-5 font-bold text-slate-900 dark:text-slate-50">₹{tx.amount.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      tx.status === 'Success' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-400 font-medium">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
