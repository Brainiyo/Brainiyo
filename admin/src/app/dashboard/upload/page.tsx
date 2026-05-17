'use client';
import { useState } from 'react';
import { QuestionForm } from '@/components/forms/QuestionForm';
import { BulkUpload } from '@/components/forms/BulkUpload';
import { cn } from '@/lib/utils';
import { FileText, Files } from 'lucide-react';

export default function UploadPage() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Questions</h1>
          <p className="text-slate-500 dark:text-slate-400">Add questions individually or upload in bulk via CSV.</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mb-8 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setMode('single')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            mode === 'single' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <FileText size={18} />
          Single Upload
        </button>
        <button
          onClick={() => setMode('bulk')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
            mode === 'bulk' 
              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          <Files size={18} />
          Bulk CSV Upload
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {mode === 'single' ? <QuestionForm /> : <BulkUpload />}
      </div>
    </div>
  );
}
