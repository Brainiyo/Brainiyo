'use client';

export interface QuestionData {
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
  examType: string;
  questionText: string;
  questionImageUrl: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: string;
  explanation: string;
  solutionImageUrl: string;
}

interface QuestionPreviewProps {
  data: Partial<QuestionData>;
}

export function QuestionPreview({ data }: QuestionPreviewProps) {
  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded">
          {data.subject || 'Subject'}
        </span>
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded">
          {data.chapter || 'Chapter'}
        </span>
        <div className="flex-1" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {data.examType || 'Exam'} • {data.difficulty || 'Diff'}
        </span>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-6">
        {data.questionText ? (
          <p className="whitespace-pre-wrap font-medium">{data.questionText}</p>
        ) : (
          <p className="text-slate-400 italic">Question text will appear here...</p>
        )}
      </div>

      {data.questionImageUrl && (
        <div className="mb-8 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
          <img src={data.questionImageUrl} alt="Question Diagram" className="max-h-64 mx-auto object-contain" />
        </div>
      )}

      <div className="space-y-3 mb-8">
        {['A', 'B', 'C', 'D'].map((opt) => (
          <div 
            key={opt}
            className="flex items-start p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
          >
            <span className="font-bold text-slate-400 mr-4 mt-0.5">{opt}</span>
            <span className="flex-1">
              {data.options?.[opt as keyof typeof data.options] || <span className="text-slate-300 italic">Option {opt}</span>}
            </span>
          </div>
        ))}
      </div>

      {data.explanation && (
        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">Solution / Explanation</h4>
          <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400 mb-4">{data.explanation}</p>
          
          {data.solutionImageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
              <img src={data.solutionImageUrl} alt="Solution Diagram" className="max-h-64 object-contain" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
