import React from 'react';
import { 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  RefreshCcw,
  Download
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const revenueData = [
  { name: 'Mon', revenue: 12000 },
  { name: 'Tue', revenue: 19000 },
  { name: 'Wed', revenue: 15000 },
  { name: 'Thu', revenue: 22000 },
  { name: 'Fri', revenue: 30000 },
  { name: 'Sat', revenue: 25000 },
  { name: 'Sun', revenue: 18000 },
];

const RevenueManager: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Revenue & Subscriptions</h2>
        <button className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          Export Financial Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="text-slate-500 text-sm font-medium">Monthly Recurring Revenue</div>
          <div className="text-3xl font-bold mt-2 text-primary-600">₹12,42,000</div>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-600 font-bold">
            <ArrowUp size={14} /> 24% increase <span className="text-slate-400 font-normal">from last month</span>
          </div>
        </div>
        <div className="card p-6">
          <div className="text-slate-500 text-sm font-medium">Active Subscriptions</div>
          <div className="text-3xl font-bold mt-2">4,231</div>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-600 font-bold">
            <TrendingUp size={14} /> 85% conversion rate
          </div>
        </div>
        <div className="card p-6">
          <div className="text-slate-500 text-sm font-medium">Average Revenue Per User</div>
          <div className="text-3xl font-bold mt-2">₹293</div>
          <div className="mt-4 flex items-center gap-1 text-xs text-red-600 font-bold">
            <ArrowDown size={14} /> 2% decrease <span className="text-slate-400 font-normal">from last week</span>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-lg font-bold">Revenue Growth</h4>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
            {['Daily', 'Weekly', 'Monthly'].map(t => (
              <button key={t} className={cn(
                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                t === 'Daily' ? "bg-white dark:bg-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              )}>{t}</button>
            ))}
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="text-lg font-bold">Recent Subscriptions</h4>
          <button className="btn-secondary py-1 text-xs">View All Transactions</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[1, 2, 3, 4].map(i => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold">Student {i}</div>
                    <div className="text-xs text-slate-500">student{i}@example.com</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded text-xs uppercase font-bold">Yearly Pro</span>
                  </td>
                  <td className="px-6 py-4 font-bold">₹2,499</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">May 12, 2024</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      Paid
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default RevenueManager;
