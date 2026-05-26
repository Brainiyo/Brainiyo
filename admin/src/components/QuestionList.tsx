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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Filters
  const [exam, setExam] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [subject, setSubject] = useState('');
  const [qType, setQType] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Debounce search term changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch questions when dependencies change
  useEffect(() => {
    fetchQuestions();
  }, [page, exam, difficulty, subject, qType, debouncedSearch]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('brainiyo_token');
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', '20');
      if (exam) queryParams.append('examType', exam);
      if (difficulty) queryParams.append('difficulty', difficulty);
      if (subject) queryParams.append('subjectName', subject);
      if (qType) queryParams.append('qType', qType);
      if (debouncedSearch) queryParams.append('search', debouncedSearch);

      const res = await fetch(`${API_BASE_URL}/questions?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setQuestions(result.data || []);
      if (result.pagination) {
        setTotalPages(Math.ceil(result.pagination.total / result.pagination.limit) || 1);
      }
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

  const clearFilters = () => {
    setSearchTerm('');
    setExam('');
    setDifficulty('');
    setSubject('');
    setQType('');
    setPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 bg-slate-50 dark:bg-slate-950/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by question text or details..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select 
            value={exam} 
            onChange={e => { setExam(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Exams</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
          </select>

          <select 
            value={subject} 
            onChange={e => { setSubject(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Maths">Maths</option>
          </select>

          <select 
            value={difficulty} 
            onChange={e => { setDifficulty(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select 
            value={qType} 
            onChange={e => { setQType(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="INTEGER">Integer</option>
          </select>

          {(exam || subject || difficulty || qType || searchTerm) && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 h-9"
            >
              <X size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Subject & Type</th>
                <th className="px-6 py-4">Exam</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No questions found.
                  </td>
                </tr>
              ) : (
                questions.map(q => (
                  <tr key={q.id} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <p className="truncate font-medium">{q.body}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">{q.chapter_name} • {q.topic_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md font-medium text-xs">
                          {q.subject_name}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-medium text-xs">
                          {q.q_type || 'MCQ'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 w-max bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md font-semibold text-xs">
                          {q.exam_type || 'BOTH'}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">{q.source}</span>
                      </div>
                    </td>
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
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 text-sm">
        <div className="text-slate-500">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
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
