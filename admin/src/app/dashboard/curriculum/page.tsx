'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, ChevronRight, ChevronDown, Layers, Target, Trash2, Loader2, X, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

import { API_BASE_URL } from '@/lib/config';

// ─── Modal Component ─────────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);

  // Modal states
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState<string | null>(null); // subjectId
  const [showAddTopic, setShowAddTopic] = useState<string | null>(null);     // chapterId

  // Form states
  const [newSubject, setNewSubject] = useState({ name: '', exam_type: 'BOTH' });
  const [newChapter, setNewChapter] = useState({ name: '', class_level: 11, order_index: 0 });
  const [newTopic, setNewTopic] = useState({ name: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const getToken = () => localStorage.getItem('brainiyo_token');

  const fetchCurriculum = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/full-hierarchy`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to fetch');
      setCurriculum(result.data || []);
    } catch (error: any) {
      console.error("Failed to fetch curriculum", error);
      toast.error(error.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  // ─── Subject CRUD ─────────────────────────────────────────────
  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) { toast.error('Subject name is required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ name: newSubject.name.trim(), exam_type: newSubject.exam_type })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to add subject');
      toast.success(`Subject "${newSubject.name}" created!`);
      setNewSubject({ name: '', exam_type: 'BOTH' });
      setShowAddSubject(false);
      fetchCurriculum();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" and ALL its chapters, topics, and linked questions?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchCurriculum();
      toast.success('Subject deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  // ─── Chapter CRUD ─────────────────────────────────────────────
  const handleAddChapter = async () => {
    if (!newChapter.name.trim() || !showAddChapter) { toast.error('Chapter name is required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          subject_id: showAddChapter,
          name: newChapter.name.trim(),
          class_level: newChapter.class_level,
          order_index: newChapter.order_index
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to add chapter');
      toast.success(`Chapter "${newChapter.name}" created!`);
      setNewChapter({ name: '', class_level: 11, order_index: 0 });
      setShowAddChapter(null);
      fetchCurriculum();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add chapter');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!window.confirm('Delete this chapter and all its topics?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/chapters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed');
      fetchCurriculum();
      toast.success('Chapter deleted');
    } catch (err) { toast.error('Failed to delete chapter'); }
  };

  // ─── Topic CRUD ───────────────────────────────────────────────
  const handleAddTopic = async () => {
    if (!newTopic.name.trim() || !showAddTopic) { toast.error('Topic name is required'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ chapter_id: showAddTopic, name: newTopic.name.trim() })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to add topic');
      toast.success(`Topic "${newTopic.name}" added!`);
      setNewTopic({ name: '' });
      setShowAddTopic(null);
      fetchCurriculum();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/curriculum/topics/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('Failed');
      fetchCurriculum();
      toast.success('Topic deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('phys')) return '⚡';
    if (n.includes('chem')) return '🧪';
    if (n.includes('math')) return '📐';
    if (n.includes('bio')) return '🧬';
    return '📚';
  };

  const getExamBadge = (examType: string) => {
    const colors: Record<string, string> = {
      'NEET': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'JEE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'BOTH': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", colors[examType] || colors['BOTH'])}>
        {examType}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;

  return (
    <div className="pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Curriculum Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage subjects, chapters, and topics hierarchy.</p>
        </div>
        <button onClick={() => setShowAddSubject(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20">
          <Plus size={16} />
          Add Subject
        </button>
      </div>

      {curriculum.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
          <BookOpen size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-500">No Subjects Yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">Create your first subject to start building the curriculum tree.</p>
          <button onClick={() => setShowAddSubject(true)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Plus size={16} className="inline mr-2" />Create First Subject
          </button>
        </div>
      )}

      <div className="space-y-4">
        {curriculum.map((subject) => (
          <div key={subject.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
              onClick={() => toggleSubject(String(subject.id))}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl shadow-inner text-indigo-600">
                  {getSubjectIcon(subject.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{subject.name}</h3>
                    {subject.exam_type && getExamBadge(subject.exam_type)}
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{subject.chapters?.length || 0} Chapters</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteSubject(String(subject.id), subject.name); }}><Trash2 size={16} /></button>
                <div className="p-2 text-slate-400">
                  {expandedSubjects.includes(String(subject.id)) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </div>
            </div>

            {expandedSubjects.includes(String(subject.id)) && (
              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chapters in {subject.name}</h4>
                  <button onClick={() => { setShowAddChapter(String(subject.id)); setNewChapter({ name: '', class_level: 11, order_index: 0 }); }} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                    <Plus size={14} /> Add Chapter
                  </button>
                </div>

                {(!subject.chapters || subject.chapters.length === 0) ? (
                  <div className="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No chapters added yet.</div>
                ) : (
                  <div className="space-y-3">
                    {subject.chapters.map((chapter: any) => (
                      <div key={chapter.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          onClick={() => toggleChapter(String(chapter.id))}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                              <Layers size={16} />
                            </div>
                            <span className="text-sm font-bold">{chapter.name}</span>
                            {chapter.class_level && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 font-bold text-amber-700 dark:text-amber-400">
                                Class {chapter.class_level}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">{chapter.topics?.length || 0} Topics</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); handleDeleteChapter(String(chapter.id)); }}><Trash2 size={14} /></button>
                            <div className="text-slate-400">
                              {expandedChapters.includes(String(chapter.id)) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </div>
                        </div>

                        {expandedChapters.includes(String(chapter.id)) && (
                          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-3 bg-slate-50/30 dark:bg-slate-950/30">
                            <div className="flex items-center justify-between mt-3 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topics</span>
                              <button onClick={() => { setShowAddTopic(String(chapter.id)); setNewTopic({ name: '' }); }} className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                <Plus size={12} /> Add Topic
                              </button>
                            </div>
                            {(!chapter.topics || chapter.topics.length === 0) ? (
                              <div className="text-xs text-slate-400 text-center py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">No topics yet</div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {chapter.topics.map((topic: any) => (
                                  <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Target size={14} className="text-indigo-400 shrink-0" />
                                      <span className="text-xs font-medium truncate" title={topic.name}>{topic.name}</span>
                                    </div>
                                    <button onClick={() => handleDeleteTopic(String(topic.id))} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><Trash2 size={14} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Add Subject Modal ──────────────────────────────────── */}
      <Modal open={showAddSubject} onClose={() => setShowAddSubject(false)} title="Add New Subject">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1.5 block text-slate-700 dark:text-slate-300">Subject Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Physics, Chemistry, Biology, Mathematics"
              value={newSubject.name}
              onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-2 block text-slate-700 dark:text-slate-300">Exam Type</label>
            <div className="flex gap-2">
              {['NEET', 'JEE', 'BOTH'].map(type => (
                <button
                  key={type}
                  onClick={() => setNewSubject({ ...newSubject, exam_type: type })}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                    newSubject.exam_type === type
                      ? type === 'NEET' ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600"
                        : type === 'JEE' ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-600"
                        : "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-600"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">BOTH = visible to both NEET and JEE students</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddSubject(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddSubject} loading={submitting}>Create Subject</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Add Chapter Modal ─────────────────────────────────── */}
      <Modal open={!!showAddChapter} onClose={() => setShowAddChapter(null)} title="Add New Chapter">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1.5 block text-slate-700 dark:text-slate-300">Chapter Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Kinematics, Organic Chemistry"
              value={newChapter.name}
              onChange={e => setNewChapter({ ...newChapter, name: e.target.value })}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-bold mb-2 block text-slate-700 dark:text-slate-300">Class Level</label>
            <div className="flex gap-2">
              {[{ value: 11, label: 'Class 11' }, { value: 12, label: 'Class 12' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setNewChapter({ ...newChapter, class_level: opt.value })}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                    newChapter.class_level === opt.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold mb-1.5 block text-slate-700 dark:text-slate-300">Order Index</label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="0"
              value={newChapter.order_index}
              onChange={e => setNewChapter({ ...newChapter, order_index: parseInt(e.target.value) || 0 })}
            />
            <p className="text-[11px] text-slate-400 mt-1">Controls display order. Lower = shown first.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddChapter(null)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddChapter} loading={submitting}>Add Chapter</Button>
          </div>
        </div>
      </Modal>

      {/* ─── Add Topic Modal ───────────────────────────────────── */}
      <Modal open={!!showAddTopic} onClose={() => setShowAddTopic(null)} title="Add New Topic">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-1.5 block text-slate-700 dark:text-slate-300">Topic Name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              placeholder="e.g. Newton's Laws, Thermodynamics"
              value={newTopic.name}
              onChange={e => setNewTopic({ name: e.target.value })}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleAddTopic()}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddTopic(null)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAddTopic} loading={submitting}>Add Topic</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
