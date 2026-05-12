import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const mockStudents = [
  { id: 'S1', name: 'Arjun Sharma', phone: '+91 9876543210', email: 'arjun@example.com', accuracy: 78, plan: 'Pro', status: 'Active' },
  { id: 'S2', name: 'Priya Patel', phone: '+91 8765432109', email: 'priya@example.com', accuracy: 45, plan: 'Free', status: 'Inactive' },
];

const StudentAnalytics: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Student List Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name or phone..." className="input pl-10" />
        </div>

        <div className="space-y-2">
          {mockStudents.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={cn(
                "w-full p-4 rounded-xl text-left transition-all border",
                selectedStudent.id === s.id 
                  ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-sm" 
                  : "bg-white dark:bg-card-dark border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Phone size={12} /> {s.phone}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                  s.plan === 'Pro' ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                )}>{s.plan}</span>
                <div className="text-xs font-bold text-primary-600">{s.accuracy}% accuracy</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Student Detail View */}
      <div className="lg:col-span-2 space-y-8">
        <div className="card p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-teal flex items-center justify-center text-white text-2xl font-bold">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                  <span className="flex items-center gap-1"><Mail size={14} /> {selectedStudent.email}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> Joined May 2024</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary">Manage Account</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Attempts</div>
              <div className="text-2xl font-bold">1,420</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-orange-500">12 Days 🔥</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900">
              <div className="text-slate-500 text-xs font-bold uppercase mb-1">Queue Status</div>
              <div className="text-2xl font-bold text-primary-600">42 Pending</div>
            </div>
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="card p-8">
          <h4 className="text-lg font-bold mb-6">Accuracy Heatmap</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-8 h-8 rounded",
                  i % 4 === 0 ? "bg-green-500" : 
                  i % 4 === 1 ? "bg-green-300" :
                  i % 4 === 2 ? "bg-yellow-400" :
                  "bg-slate-200 dark:bg-slate-800"
                )}
                title={`Topic ${i+1}: ${Math.floor(Math.random() * 100)}%`}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> Strong</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /> Developing</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800" /> Not Attempted</div>
          </div>
        </div>

        {/* Practice Activity */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold">Recent Practice Activity</h4>
            <button className="text-sm font-bold text-primary-600">Full History</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="font-bold">Kinematics: 1D Motion</div>
                    <div className="text-xs text-slate-500">15 questions • 85% accuracy</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-medium">2 hours ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default StudentAnalytics;
