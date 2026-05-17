'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Trash2, Edit2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { QuestionForm } from './forms/QuestionForm';
import { cn } from '@/lib/utils';

import { API_BASE_URL } from '@/lib/config';

export function QuestionList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setQuestions(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch questions", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.chapter_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by question, subject, or chapter..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4">Question</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Exam</th>
              <th className="px-6 py-4">Difficulty</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No questions found.
                </td>
              </tr>
            ) : (
              filteredQuestions.map(q => (
                <tr key={q.id} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="truncate font-medium">{q.body}</p>
                    <p className="text-xs text-slate-400 truncate mt-1">{q.chapter_name} • {q.topic_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md font-medium text-xs">
                      {q.subject_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{q.source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md font-bold text-xs uppercase ${
                      q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700' :
                      q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingQuestion(q)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal Overlay */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold">Edit Question</h2>
              <button 
                onClick={() => setEditingQuestion(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <QuestionForm 
                initialData={editingQuestion} 
                isModal={true}
                onSuccess={() => {
                  setEditingQuestion(null);
                  fetchQuestions();
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
