'use client';
import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/Button';
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

import { API_BASE_URL } from '@/lib/config';

export function BulkUpload({ forcedType = 'MCQ' }: { forcedType?: 'MCQ' | 'INTEGER' }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    let headers, sample;
    if (forcedType === 'INTEGER') {
      headers = ['subject', 'chapter', 'topic', 'difficulty', 'examType', 'questionText', 'correctAnswer', 'explanation'];
      sample = ['Physics', 'Kinematics', 'Projectile Motion', 'Medium', 'JEE Main', 'Find the sum of 5 and 7.', '12', 'The sum is 5 + 7 = 12.'];
    } else {
      headers = ['subject', 'chapter', 'topic', 'difficulty', 'examType', 'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer', 'explanation'];
      sample = ['Physics', 'Kinematics', 'Projectile Motion', 'Medium', 'JEE Main', 'Sample MCQ Question?', 'Opt A', 'Opt B', 'Opt C', 'Opt D', 'A', 'Sample Solution'];
    }
    
    const csv = Papa.unparse([headers, sample]);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = forcedType === 'INTEGER' ? 'brainiyo_bulk_integer_template.csv' : 'brainiyo_bulk_mcq_template.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data } = results;
        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        try {
          const token = localStorage.getItem('brainiyo_token');
          const formattedQuestions = (data as any[]).map(row => ({
            subject: row.subject,
            chapter: row.chapter || 'Unknown',
            topic: row.topic || 'Unknown',
            difficulty: row.difficulty || 'medium',
            examType: row.examType || 'JEE Main',
            body: row.questionText,
            option_a: forcedType === 'INTEGER' ? null : row.optionA,
            option_b: forcedType === 'INTEGER' ? null : row.optionB,
            option_c: forcedType === 'INTEGER' ? null : row.optionC,
            option_d: forcedType === 'INTEGER' ? null : row.optionD,
            correct_option: row.correctAnswer,
            explanation_text: row.explanation || '',
            q_type: forcedType,
          }));

          const res = await fetch(`${API_BASE_URL}/questions/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ questions: formattedQuestions })
          });

          const result = await res.json();
          if (!res.ok) throw new Error(result.message || 'Bulk upload failed');

          setResults({ success: result.count, failed: 0, errors: [] });
          toast.success(`Successfully uploaded ${result.count} questions!`);
        } catch (err: any) {
          console.error(err);
          toast.error(`Bulk upload failed: ${err.message}`);
          setResults({ success: 0, failed: data.length, errors: [err.message] });
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error(error);
        toast.error("Error parsing CSV file.");
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold mb-2">{forcedType === 'INTEGER' ? 'Bulk Integer Upload' : 'CSV Bulk Upload'}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {forcedType === 'INTEGER' 
                ? 'Upload hundreds of numerical answer questions at once using a standardized CSV format.'
                : 'Upload hundreds of MCQ questions at once using a standardized CSV format.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <FileDown size={16} />
            Download Template
          </Button>
        </div>

        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
            isProcessing 
              ? "opacity-50 pointer-events-none bg-slate-50 dark:bg-slate-950" 
              : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
          )}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="font-bold text-indigo-600">Processing and Uploading...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-lg font-bold mb-1">Click to upload CSV</p>
              <p className="text-sm text-slate-400">or drag and drop your file here</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
        </div>

        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            <p className="font-bold mb-1">Important Instructions:</p>
            <ul className="list-disc list-inside space-y-1 opacity-90">
              <li>Use the provided template for correct column mapping.</li>
              <li>Images cannot be uploaded via CSV. You can add them later via the Edit option.</li>
              <li>{forcedType === 'INTEGER' ? 'Correct Answer must be a numerical value (e.g. 12 or 5.5).' : 'Correct Answer must be exactly A, B, C, or D.'}</li>
              <li>Subject must be one of: Physics, Chemistry, Mathematics, Biology.</li>
            </ul>
          </div>
        </div>
      </div>

      {results && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            Upload Summary
            <span className="text-xs font-normal text-slate-400">(Latest Batch)</span>
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Success
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{results.success}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} /> Failed
              </p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{results.failed}</p>
            </div>
          </div>
          
          {results.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Error Details</p>
              <div className="max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-950 rounded-lg p-3 text-xs font-mono text-red-500 space-y-1">
                {results.errors.map((err, i) => <p key={i}>{err}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
