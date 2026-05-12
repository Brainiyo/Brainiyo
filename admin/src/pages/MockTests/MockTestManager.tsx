import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  FileText, 
  Users, 
  BarChart2, 
  Trash2,
  Settings,
  ChevronRight
} from 'lucide-react';

const mockTests = [
  { id: 'MT1', name: 'NEET Full Syllabus #4', type: 'NEET', date: '2024-05-15', attempts: 1240, avgScore: 540 },
  { id: 'MT2', name: 'JEE Main Phase 1 Mock', type: 'JEE', date: '2024-05-20', attempts: 850, avgScore: 185 },
];

const MockTestManager: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mock Test Manager</h2>
        <button 
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Test
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTests.map(test => (
          <div key={test.id} className="card group">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                  test.type === 'NEET' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                )}>{test.type}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-primary-600"><Settings size={16} /></button>
                  <button className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <h4 className="text-lg font-bold mt-2">{test.name}</h4>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Calendar size={14} /> Schedule: {test.date}
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Attempts</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <Users size={18} className="text-slate-400" />
                  {test.attempts}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Avg Score</div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <BarChart2 size={18} className="text-slate-400" />
                  {test.avgScore}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button className="w-full py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-all">
                View Detailed Analysis
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card w-full max-w-lg p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold mb-6">Create Mock Test</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Test Name</label>
                <input type="text" className="input" placeholder="e.g., NEET Practice Test #1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1 block">Exam Type</label>
                  <select className="input">
                    <option>NEET</option>
                    <option>JEE Main</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Date</label>
                  <input type="date" className="input" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Question Selection</label>
                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <p className="text-sm text-slate-500">Auto-generate from question bank</p>
                  <button className="text-xs font-bold text-primary-600 mt-2">Configure Rules</button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button className="btn-primary">Generate Test</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default MockTestManager;
