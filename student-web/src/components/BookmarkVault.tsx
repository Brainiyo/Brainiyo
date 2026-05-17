'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkMinus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from './Card';
import { Button } from './Button';

export const BookmarkVault = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await api.getBookmarks();
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setBookmarks(prev => prev.filter(b => b.id !== id));
      await api.toggleBookmark(id);
      if (activeQuestion?.id === id) setActiveQuestion(null);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      fetchBookmarks(); // Revert on fail
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Loading Vault...</div>;
  if (bookmarks.length === 0) return <div className="p-12 text-center text-slate-500 font-bold">Your vault is empty. Bookmark questions during practice to see them here.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade">
      {/* Left List */}
      <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        {bookmarks.map((q) => (
          <Card 
            key={q.id} 
            className={`cursor-pointer transition-all hover:border-indigo-300 ${activeQuestion?.id === q.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
            onClick={() => setActiveQuestion(q)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-indigo-600 mb-1">{q.subject_name} • {q.chapter_name}</div>
                <div className="text-sm font-semibold line-clamp-2" dangerouslySetInnerHTML={{ __html: q.body }} />
              </div>
              <button 
                className="text-slate-400 hover:text-red-500 p-1"
                onClick={(e) => removeBookmark(q.id, e)}
              >
                <BookmarkMinus size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-3 font-medium">
              Saved on {new Date(q.created_at).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>

      {/* Right Viewer */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {activeQuestion ? (
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-bold">{activeQuestion.subject_name}</span>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded font-bold">{activeQuestion.difficulty}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => removeBookmark(activeQuestion.id)}>Remove from Vault</Button>
                </div>
                
                <div className="text-lg font-medium mb-8" dangerouslySetInnerHTML={{ __html: activeQuestion.body }} />
                
                <div className="space-y-3 mb-8">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div 
                      key={opt}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        activeQuestion.correct_option === opt 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <span className="font-bold mr-3">{opt}</span>
                      <span dangerouslySetInnerHTML={{ __html: activeQuestion[`option_${opt.toLowerCase()}`] }} />
                      {activeQuestion.correct_option === opt && <span className="float-right text-green-600 font-bold">✓ Correct Answer</span>}
                    </div>
                  ))}
                </div>

                {activeQuestion.explanation_text && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Explanation</h4>
                    <div className="text-amber-900 dark:text-amber-200 text-sm" dangerouslySetInnerHTML={{ __html: activeQuestion.explanation_text }} />
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium">
              Select a question from your vault to review it.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
