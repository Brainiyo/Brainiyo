'use client';
import { useState, useEffect } from 'react';
import { Search, Phone, Mail, Calendar, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { API_BASE_URL } from '@/lib/config';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('brainiyo_token');
    fetch(`${API_BASE_URL}/auth/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStudents(data.data || []);
        if (data.data?.length > 0) setSelectedStudent(data.data[0]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch students", err);
        setLoading(false);
      });
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage student accounts and performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Student List */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {filtered.length > 0 ? (
              filtered.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={cn(
                    "w-full p-4 rounded-xl text-left transition-all border",
                    selectedStudent?.id === s.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">{s.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} /> {s.phone}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">FREE</span>
                    <div className="text-xs font-bold text-indigo-600">Active Account</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">No students found.</div>
            )}
          </div>
        </div>

        {/* Student Detail */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
            {selectedStudent ? (
              <>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {selectedStudent.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                      <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                        <span className="flex items-center gap-1"><Mail size={14} /> {selectedStudent.email || 'No email'}</span>
                        <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Active</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", selectedStudent.target_exam === 'NEET' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>{selectedStudent.target_exam}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Class', value: `Class ${selectedStudent.class}`, color: '' },
                    { label: 'Onboarded', value: selectedStudent.is_onboarded ? 'Yes' : 'No', color: selectedStudent.is_onboarded ? 'text-emerald-600' : 'text-amber-500' },
                    { label: 'Last Login', value: selectedStudent.last_login ? new Date(selectedStudent.last_login).toLocaleDateString() : 'N/A', color: 'text-indigo-600' },
                  ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-1">{stat.label}</div>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">Select a student to view details</div>
            )}
          </div>

          {/* Heatmap */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold mb-4">Accuracy Heatmap (Subjects)</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={cn("w-8 h-8 rounded", i % 4 === 0 ? "bg-emerald-500" : i % 4 === 1 ? "bg-emerald-300" : i % 4 === 2 ? "bg-yellow-400" : "bg-slate-200 dark:bg-slate-800")}
                  title={`Topic ${i + 1}: ${(i * 13) % 100}%`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500" /> Strong</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" /> Developing</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800" /> Not Attempted</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold mb-4">Recent Practice Activity</h4>
            <div className="space-y-3">
              {['Kinematics: 1D Motion', 'Electrochemistry: Redox', 'Integration: Definite'].map((topic, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{topic}</div>
                      <div className="text-xs text-slate-500">15 questions • 85% accuracy</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{i + 2} hours ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
