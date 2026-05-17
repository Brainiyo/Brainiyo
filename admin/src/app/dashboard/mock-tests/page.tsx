'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, Users, BarChart2, Trash2, Settings, ChevronRight, FileText, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

import { API_BASE_URL } from '@/lib/config';

export default function MockTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [testType, setTestType] = useState<'full' | 'chapter'>('chapter');
  const [newTest, setNewTest] = useState({ title: '', exam_type: 'NEET', duration_minutes: 60, total_questions: 30, publish_at: '', unpublish_at: '' });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setTests(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch mock tests", error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTest.title.trim()) {
      toast.error('Please enter a test title');
      return;
    }
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTest.title,
          exam_type: newTest.exam_type,
          duration_minutes: newTest.duration_minutes,
          total_questions: newTest.total_questions,
          publish_at: newTest.publish_at || null,
          unpublish_at: newTest.unpublish_at || null
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create');
      }
      
      toast.success('Test template created successfully');
      setShowCreate(false);
      setNewTest({ title: '', exam_type: 'NEET', duration_minutes: 60, total_questions: 30, publish_at: '', unpublish_at: '' });
      fetchTests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Test deleted');
      fetchTests();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingTest, setSchedulingTest] = useState<any>(null);
  const [schedulePublishAt, setSchedulePublishAt] = useState('');
  const [scheduleUnpublishAt, setScheduleUnpublishAt] = useState('');

  const handlePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${id}/publish`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to publish');
      
      toast.success('Test published successfully');
      fetchTests();
    } catch (error) {
      toast.error('Failed to publish test');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${id}/unpublish`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to unpublish');
      
      toast.success('Test unlisted successfully');
      fetchTests();
    } catch (error) {
      toast.error('Failed to unlist test');
    }
  };

  const openScheduleModal = (test: any) => {
    setSchedulingTest(test);
    setSchedulePublishAt(test.publish_at ? new Date(test.publish_at).toISOString().slice(0, 16) : '');
    setScheduleUnpublishAt(test.unpublish_at ? new Date(test.unpublish_at).toISOString().slice(0, 16) : '');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async () => {
    if (!schedulingTest) return;
    try {
      const token = localStorage.getItem('brainiyo_token');
      const res = await fetch(`${API_BASE_URL}/mock-tests/admin/templates/${schedulingTest.id}/schedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publish_at: schedulePublishAt || null,
          unpublish_at: scheduleUnpublishAt || null
        })
      });
      if (!res.ok) throw new Error('Failed to update schedule');
      
      toast.success('Schedule updated successfully');
      setShowScheduleModal(false);
      setSchedulingTest(null);
      fetchTests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    }
  };

  const handlePublishAll = async () => {
    const drafts = tests.filter(t => !t.is_published);
    if (drafts.length === 0) { toast.success('All tests are already published!'); return; }
    try {
      const token = localStorage.getItem('brainiyo_token');
      await Promise.all(drafts.map(t =>
        fetch(`${API_BASE_URL}/mock-tests/admin/templates/${t.id}/publish`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      toast.success(`${drafts.length} test(s) published successfully!`);
      fetchTests();
    } catch (error) {
      toast.error('Failed to publish some tests');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Test Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design, publish, and analyze mock examinations.</p>
        </div>
        <div className="flex gap-2">
          {tests.some(t => !t.is_published) && (
            <Button variant="outline" onClick={handlePublishAll} className="gap-2">
              <CheckCircle2 size={18} />
              Publish All Drafts
            </Button>
          )}
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus size={18} />
            Create New Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {tests.map((test) => (
          <div key={test.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 relative">
              <div className="flex items-center justify-between mb-4">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  test.exam_type === 'NEET' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                )}>
                  {test.exam_type}
                </span>
                {!test.is_published && test.publish_at && new Date(test.publish_at) > new Date() ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                    <Clock size={10} /> Scheduled
                  </span>
                ) : !test.is_published ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Draft
                  </span>
                ) : test.unpublish_at && new Date(test.unpublish_at) < new Date() ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Expired
                  </span>
                ) : null}
              </div>
              
              <h3 className="text-lg font-bold line-clamp-1">{test.title}</h3>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} /> {test.duration_mins} mins
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText size={14} /> {test.config?.sections?.length || 0} Sections
                </div>
              </div>

              <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openScheduleModal(test)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Settings size={16} /></button>
                <button onClick={() => handleDelete(test.id)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-slate-300" />
                  <span className="text-sm font-bold">{new Date(test.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Max Marks</p>
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-slate-300" />
                  <span className="text-xl font-bold">{test.max_marks}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto flex flex-wrap gap-2">
              <Link href={`/dashboard/mock-tests/${test.id}`} className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Manage Questions
              </Link>
              {test.is_published ? (
                <>
                  <button onClick={() => handleUnpublish(test.id)} className="py-2 px-3 rounded-xl border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                    Unlist
                  </button>
                  <button className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                    Analyze <ChevronRight size={14} />
                  </button>
                </>
              ) : !test.is_published && test.publish_at && new Date(test.publish_at) > new Date() ? (
                <>
                  <button onClick={() => openScheduleModal(test)} className="py-2 px-3 rounded-xl border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all">
                    Reschedule
                  </button>
                  <button onClick={() => handlePublish(test.id)} className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20">
                    Publish Now
                  </button>
                </>
              ) : (
                <button onClick={() => handlePublish(test.id)} className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20">
                  <CheckCircle2 size={14} /> Publish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simplified Create Modal Placeholder */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-2">Create New Mock Test</h2>
            <p className="text-slate-500 text-sm mb-5">Set up your test parameters. Questions are auto-pulled from the bank.</p>

            {/* Test Type Selector */}
            <div className="mb-5">
              <label className="text-sm font-bold mb-2 block">Test Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTestType('chapter');
                    setNewTest(prev => ({ ...prev, duration_minutes: 60, total_questions: 30 }));
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    testType === 'chapter'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">📝 Chapter-wise</div>
                  <div className="text-xs text-slate-400 mt-0.5">20–59 questions · Focused topic test</div>
                </button>
                <button
                  onClick={() => {
                    setTestType('full');
                    const defaults = newTest.exam_type === 'NEET'
                      ? { duration_minutes: 200, total_questions: 180 }
                      : { duration_minutes: 180, total_questions: 90 };
                    setNewTest(prev => ({ ...prev, ...defaults }));
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    testType === 'full'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">🏆 Full Length</div>
                  <div className="text-xs text-slate-400 mt-0.5">60+ questions · Complete mock exam</div>
                </button>
              </div>
            </div>

            {/* Presets for Full Length */}
            {testType === 'full' && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">⚡ Quick Presets</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setNewTest(prev => ({ ...prev, exam_type: 'NEET', duration_minutes: 200, total_questions: 180, title: prev.title || 'NEET Full Syllabus Mock' }))} className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-700 font-bold hover:bg-red-200 transition-colors">NEET (180Q / 200min)</button>
                  <button onClick={() => setNewTest(prev => ({ ...prev, exam_type: 'JEE', duration_minutes: 180, total_questions: 90, title: prev.title || 'JEE Mains Full Mock' }))} className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition-colors">JEE Mains (90Q / 180min)</button>
                  <button onClick={() => setNewTest(prev => ({ ...prev, exam_type: 'JEE', duration_minutes: 180, total_questions: 75, title: prev.title || 'JEE Advanced Full Mock' }))} className="text-xs px-3 py-1 rounded-lg bg-purple-100 text-purple-700 font-bold hover:bg-purple-200 transition-colors">JEE Advanced (75Q / 180min)</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1.5 block">Test Title</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="e.g. NEET 2024 Practice #1"
                  value={newTest.title}
                  onChange={e => setNewTest({...newTest, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-1.5 block">Exam Type</label>
                  <select 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTest.exam_type}
                    onChange={e => setNewTest({...newTest, exam_type: e.target.value})}
                  >
                    <option value="NEET">NEET</option>
                    <option value="JEE">JEE Main</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold mb-1.5 block">Duration (Mins)</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={newTest.duration_minutes}
                    onChange={e => setNewTest({...newTest, duration_minutes: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold mb-1.5 block">Total Questions</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="30"
                  value={newTest.total_questions}
                  onChange={e => setNewTest({...newTest, total_questions: parseInt(e.target.value) || 0})}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Questions auto-pulled from the bank. Max marks = questions × 4.{' '}
                  <span className={newTest.total_questions >= 60 ? 'text-indigo-500 font-bold' : 'text-amber-500 font-bold'}>
                    {newTest.total_questions >= 60 
                      ? '✓ Will appear under "Full Length Tests"' 
                      : `⚠ Add ${60 - newTest.total_questions} more to appear under "Full Length Tests"`}
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <div className="col-span-2">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Availability Schedule (Optional)</h3>
                  <p className="text-xs text-slate-500 mb-3">If set, test will automatically publish/unpublish at these times.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Publish At</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={newTest.publish_at}
                    onChange={e => setNewTest({...newTest, publish_at: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Unpublish At</label>
                  <input 
                    type="datetime-local" 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={newTest.unpublish_at}
                    onChange={e => setNewTest({...newTest, unpublish_at: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate}>Create Test</Button>
            </div>
          </div>
        </div>
      )}
      {/* Schedule Edit Modal */}
      {showScheduleModal && schedulingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Schedule Availability</h2>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{schedulingTest.title}</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm mt-4 mb-6">
              Set automated times to control when this mock test becomes visible and when it expires for students.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Publish At</label>
                <input 
                  type="datetime-local" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  value={schedulePublishAt}
                  onChange={e => setSchedulePublishAt(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave empty to keep it as a manual Draft until published.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Unpublish At</label>
                <input 
                  type="datetime-local" 
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                  value={scheduleUnpublishAt}
                  onChange={e => setScheduleUnpublishAt(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">Leave empty for indefinite visibility.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => { setShowScheduleModal(false); setSchedulingTest(null); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveSchedule}>Save Schedule</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
