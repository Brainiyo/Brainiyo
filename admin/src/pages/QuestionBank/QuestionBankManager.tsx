import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Upload, 
  Check, 
  X,
  FileDown
} from 'lucide-react';
import { LaTeXPreview } from '../../components/LaTeXPreview';

interface Question {
  id: string;
  body: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  source: 'NCERT' | 'PYQ' | 'NEW';
  attempts: number;
  accuracy: number;
  created: string;
}

const mockQuestions: Question[] = [
  { 
    id: 'Q1024', 
    body: 'A particle moves along a straight line such that $s = t^3 - 6t^2 + 3t + 4$. Find $v$ when $a=0$.', 
    subject: 'Physics', 
    chapter: 'Kinematics', 
    topic: 'Motion in 1D', 
    difficulty: 'Medium', 
    source: 'PYQ', 
    attempts: 420, 
    accuracy: 65, 
    created: '2024-05-10' 
  },
  { 
    id: 'Q1025', 
    body: 'Calculate the pH of $10^{-8}$ M HCl solution.', 
    subject: 'Chemistry', 
    chapter: 'Equilibrium', 
    topic: 'Ionic Equilibrium', 
    difficulty: 'Hard', 
    source: 'NCERT', 
    attempts: 850, 
    accuracy: 42, 
    created: '2024-05-11' 
  },
];

const QuestionBankManager: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Question Bank</h2>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Upload size={18} />
            Bulk Import
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Question
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by question text or ID..." 
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="input w-40">
            <option>All Subjects</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Biology</option>
          </select>
          <select className="input w-40">
            <option>Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
          <button className="btn-secondary px-3">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedQuestions(mockQuestions.map(q => q.id));
                      else setSelectedQuestions([]);
                    }}
                  />
                </th>
                <th className="px-6 py-4 font-bold">Question Detail</th>
                <th className="px-6 py-4 font-bold">Metadata</th>
                <th className="px-6 py-4 font-bold">Stats</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {mockQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                      checked={selectedQuestions.includes(q.id)}
                      onChange={() => toggleSelect(q.id)}
                    />
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <div className="text-xs text-primary-600 font-bold mb-1">{q.id}</div>
                    <div className="line-clamp-2 text-sm">
                      <LaTeXPreview text={q.body} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{q.subject}</div>
                    <div className="text-xs text-slate-500">{q.chapter} • {q.topic}</div>
                    <div className="mt-2 flex gap-1">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        q.difficulty === 'Easy' ? "bg-green-100 text-green-700" :
                        q.difficulty === 'Medium' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>{q.difficulty}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-blue-100 text-blue-700">{q.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{q.attempts} attempts</div>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full", q.accuracy > 60 ? "bg-green-500" : "bg-yellow-500")} 
                        style={{ width: `${q.accuracy}%` }} 
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">{q.accuracy}% accuracy</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedQuestions.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-8">
          <div className="text-sm font-bold">
            {selectedQuestions.length} questions selected
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div className="flex gap-4">
            <button className="text-sm font-bold hover:text-red-400 flex items-center gap-2">
              <Trash2 size={16} />
              Delete Bulk
            </button>
            <button className="text-sm font-bold hover:text-primary-400 flex items-center gap-2">
              <Edit size={16} />
              Change Difficulty
            </button>
            <button className="text-sm font-bold hover:text-green-400 flex items-center gap-2">
              <FileDown size={16} />
              Export
            </button>
          </div>
          <button 
            onClick={() => setSelectedQuestions([])}
            className="p-1 hover:bg-slate-800 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add Question Modal (Simplified version for space) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Add New Question</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-1 block">Subject</label>
                  <select className="input">
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Biology</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Chapter</label>
                  <input type="text" className="input" placeholder="e.g., Kinematics" />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button key={d} type="button" className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20">
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold mb-1 block">Question Body (LaTeX enabled)</label>
                  <textarea 
                    className="input h-32 font-mono text-sm" 
                    placeholder="Type question here... Use $...$ for math."
                  />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Live Preview</span>
                  <LaTeXPreview text="Question preview will appear here..." />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label className="text-sm font-bold mb-1 block">Option {opt}</label>
                    <input type="text" className="input" placeholder={`Enter option ${opt}...`} />
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default QuestionBankManager;
