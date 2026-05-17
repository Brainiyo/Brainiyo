'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, Trash2, Search, ArrowLeft, LayoutGrid, Clock, Target, FileText, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/config';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuestionForm } from '@/components/forms/QuestionForm';
import { Edit2 } from 'lucide-react';

export default function MockTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  // Picker state
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [selectedInPicker, setSelectedInPicker] = useState<string[]>([]);

  useEffect(() => {
    fetchDetails();
  }, [testId]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${testId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setTest(result.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch test details');
      router.push('/dashboard/mock-tests');
    }
  };

  const fetchPickerQuestions = async () => {
    setPickerLoading(true);
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/questions?search=${pickerSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setAllQuestions(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    if (showPicker) fetchPickerQuestions();
  }, [showPicker, pickerSearch]);

  const handleRemove = async (questionId: string) => {
    if (!confirm('Remove this question from the test?')) return;
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${testId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove');
      toast.success('Question removed');
      fetchDetails();
    } catch (error) {
      toast.error('Failed to remove question');
    }
  };

  const handleAddSelected = async () => {
    if (selectedInPicker.length === 0) return;
    const savingToast = toast.loading('Adding questions...');
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${testId}/questions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ questionIds: selectedInPicker })
      });
      if (!res.ok) throw new Error('Failed to add questions');
      toast.success(`${selectedInPicker.length} questions added`, { id: savingToast });
      setShowPicker(false);
      setSelectedInPicker([]);
      fetchDetails();
    } catch (error) {
      toast.error('Failed to add questions', { id: savingToast });
    }
  };

  const toggleSelectInPicker = (id: string) => {
    setSelectedInPicker(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="flex justify-center p-24"><Loader2 className="animate-spin text-indigo-500 w-10 h-10" /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/mock-tests">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                {test.exam_type}
              </span>
              {!test.is_published && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Draft</span>
              )}
            </div>
            <h1 className="text-3xl font-bold">{test.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowPicker(true)} variant="outline" className="gap-2">
            <LayoutGrid size={18} /> Add from Bank
          </Button>
          <Button onClick={() => setShowNewQuestion(true)} className="gap-2">
            <Plus size={18} /> Add New Question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</p>
            <p className="text-xl font-bold">{test.duration_minutes} Minutes</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</p>
            <p className="text-xl font-bold">{test.questions?.length || 0} / {test.total_questions}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Marks</p>
            <p className="text-xl font-bold">{test.max_marks}</p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold">Current Questions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Question Body</th>
                <th className="px-6 py-4">Subject / Chapter</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {test.questions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No questions added yet. Use the buttons above to add.</td>
                </tr>
              ) : (
                test.questions.map((q: any, idx: number) => (
                  <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="truncate font-medium">{q.body}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{q.subject_name}</p>
                      <p className="text-xs text-slate-400">{q.chapter_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                        q.difficulty === 'easy' ? "bg-emerald-50 text-emerald-700" :
                        q.difficulty === 'medium' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      )}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => setEditingQuestion(q)} variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 size={16} />
                        </Button>
                        <Button onClick={() => handleRemove(q.id)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <h2 className="text-2xl font-bold">Add from Bank</h2>
                <p className="text-sm text-slate-500">Search and select questions to add to this test.</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by topic, question body, or difficulty..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-3">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
                  <p className="text-slate-400 font-medium">Loading bank questions...</p>
                </div>
              ) : allQuestions.length === 0 ? (
                <div className="text-center py-20 text-slate-400">No questions found matching your search.</div>
              ) : (
                allQuestions.map(q => (
                  <div 
                    key={q.id} 
                    onClick={() => toggleSelectInPicker(q.id)}
                    className={cn(
                      "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                      selectedInPicker.includes(q.id) 
                        ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate mb-1">{q.body}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="text-indigo-500">{q.subject_name}</span>
                        <span>•</span>
                        <span>{q.chapter_name}</span>
                        <span>•</span>
                        <span className={cn(
                          q.difficulty === 'easy' ? "text-emerald-500" : 
                          q.difficulty === 'medium' ? "text-amber-500" : "text-red-500"
                        )}>{q.difficulty}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedInPicker.includes(q.id) ? "bg-indigo-500 border-indigo-500 text-white" : "border-slate-200 dark:border-slate-700"
                    )}>
                      {selectedInPicker.includes(q.id) && <Plus size={14} strokeWidth={4} />}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <p className="text-sm font-bold text-slate-500">
                {selectedInPicker.length} Questions Selected
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowPicker(false)}>Cancel</Button>
                <Button onClick={handleAddSelected} disabled={selectedInPicker.length === 0}>Add Selected to Test</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add New Question Modal */}
      {showNewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add New Question to Test</h2>
              <button onClick={() => setShowNewQuestion(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <QuestionForm 
                isModal={true}
                onSuccess={async (newQuestion?: any) => {
                  if (newQuestion?.id) {
                    try {
                      const token = localStorage.getItem('brainiyo_token');
                      await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${testId}/questions`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify({ questionIds: [newQuestion.id] })
                      });
                    } catch (error) {
                      console.error("Auto-link failed", error);
                    }
                  }
                  setShowNewQuestion(false);
                  fetchDetails();
                }}
              />
            </div>
          </div>
        </div>
      )}
      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Question</h2>
              <button onClick={() => setEditingQuestion(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <QuestionForm 
                initialData={editingQuestion}
                isModal={true}
                onSuccess={() => {
                  setEditingQuestion(null);
                  fetchDetails();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
