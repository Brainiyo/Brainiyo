'use client';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from './ImageUpload';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config';
import { QuestionPreview } from '../preview/QuestionPreview';
import { useEffect } from 'react';



const questionSchema = z.object({
  subject_id: z.string().min(1, "Subject is required"),
  chapter_id: z.string().min(1, "Chapter is required"),
  topic_id: z.string().min(1, "Topic is required"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  examType: z.enum(['JEE Main', 'JEE Advanced', 'NEET']),
  questionText: z.string().min(5, "Question text must be at least 5 characters"),
  questionImageUrl: z.string().optional(),
  q_type: z.enum(['MCQ', 'INTEGER']).default('MCQ'),
  options: z.object({
    A: z.string().optional(),
    B: z.string().optional(),
    C: z.string().optional(),
    D: z.string().optional(),
  }).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  explanation: z.string().min(1, "Explanation is required"),
  solutionImageUrl: z.string().optional(),
}).refine((data) => {
  if (data.q_type === 'MCQ') {
    return (
      !!data.options?.A &&
      !!data.options?.B &&
      !!data.options?.C &&
      !!data.options?.D &&
      ['A', 'B', 'C', 'D'].includes(data.correctAnswer)
    );
  }
  return true;
}, {
  message: "For MCQ, all options (A-D) are required and correct answer must be A, B, C, or D",
  path: ["correctAnswer"]
});

type QuestionFormValues = z.input<typeof questionSchema>;

interface QuestionFormProps {
  initialData?: any;
  onSuccess?: (data?: any) => void;
  isModal?: boolean;
  forcedType?: 'MCQ' | 'INTEGER';
}

export function QuestionForm({ initialData, onSuccess, isModal, forcedType }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const isEditing = !!initialData;

  const { register, handleSubmit, control, watch, reset, formState: { errors }, setValue } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData ? {
      subject_id: initialData.subject_id || '',
      chapter_id: initialData.chapter_id || '',
      topic_id: initialData.topic_id || '',
      difficulty: (initialData.difficulty?.charAt(0).toUpperCase() + initialData.difficulty?.slice(1)) as any || 'Medium',
      examType: initialData.exam_type || 'JEE Main',
      q_type: forcedType || initialData.q_type || 'MCQ',
      questionText: initialData.body || '',
      questionImageUrl: initialData.image_url || '',
      options: {
        A: initialData.option_a || '',
        B: initialData.option_b || '',
        C: initialData.option_c || '',
        D: initialData.option_d || '',
      },
      correctAnswer: initialData.correct_option || 'A',
      explanation: initialData.explanation_text || '',
      solutionImageUrl: initialData.solution_image_url || '',
    } : {
      subject_id: '',
      chapter_id: '',
      topic_id: '',
      difficulty: 'Medium',
      examType: 'JEE Main',
      q_type: forcedType || 'MCQ',
      correctAnswer: 'A',
      options: { A: '', B: '', C: '', D: '' }
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        subject_id: initialData.subject_id || '',
        chapter_id: initialData.chapter_id || '',
        topic_id: initialData.topic_id || '',
        difficulty: (initialData.difficulty?.charAt(0).toUpperCase() + initialData.difficulty?.slice(1)) as any || 'Medium',
        examType: initialData.exam_type || 'JEE Main',
        q_type: forcedType || initialData.q_type || 'MCQ',
        questionText: initialData.body || '',
        questionImageUrl: initialData.image_url || '',
        options: {
          A: initialData.option_a || '',
          B: initialData.option_b || '',
          C: initialData.option_c || '',
          D: initialData.option_d || '',
        },
        correctAnswer: initialData.correct_option || 'A',
        explanation: initialData.explanation_text || '',
        solutionImageUrl: initialData.solution_image_url || '',
      });
    }
  }, [initialData, reset, forcedType]);

  const selectedSubjectId = watch('subject_id');
  const selectedChapterId = watch('chapter_id');
  const currentQType = watch('q_type') || 'MCQ';

  useEffect(() => {
    fetch(`${API_BASE_URL}/curriculum/subjects`)
      .then(res => res.json())
      .then(data => setSubjects(data.data || []))
      .catch(err => console.error("Failed to fetch subjects", err));
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      return;
    }
    fetch(`${API_BASE_URL}/curriculum/chapters/${selectedSubjectId}`)
      .then(res => res.json())
      .then(data => setChapters(data.data || []))
      .catch(err => console.error("Failed to fetch chapters", err));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([]);
      return;
    }
    fetch(`${API_BASE_URL}/curriculum/topics/${selectedChapterId}`)
      .then(res => res.json())
      .then(data => setTopics(data.data || []))
      .catch(err => console.error("Failed to fetch topics", err));
  }, [selectedChapterId]);

  const formData = watch();

  const onSubmit = async (data: QuestionFormValues) => {
    setIsSubmitting(true);
    const savingToast = toast.loading(isEditing ? 'Updating question...' : 'Saving question to bank...');
    
    try {
      const token = localStorage.getItem('brainiyo_token');
      const url = isEditing ? `${API_BASE_URL}/questions/${initialData.id}` : `${API_BASE_URL}/questions`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic_id: data.topic_id,
          body: data.questionText,
          option_a: data.q_type === 'INTEGER' ? null : data.options?.A,
          option_b: data.q_type === 'INTEGER' ? null : data.options?.B,
          option_c: data.q_type === 'INTEGER' ? null : data.options?.C,
          option_d: data.q_type === 'INTEGER' ? null : data.options?.D,
          correct_option: data.correctAnswer,
          explanation_text: data.explanation,
          difficulty: data.difficulty.toLowerCase(),
          image_url: data.questionImageUrl,
          solution_image_url: data.solutionImageUrl,
          source: isEditing ? initialData.source : 'Admin Dashboard',
          q_type: data.q_type
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');

      toast.success(isEditing ? 'Question updated successfully!' : 'Question saved successfully!', { id: savingToast });
      if (!isEditing) reset();
      if (onSuccess) onSuccess(result.data);
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed: ${error.message || 'Unknown error'}`, { id: savingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 gap-8 h-full", !isModal && "lg:grid-cols-2")}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Question' : 'Upload Question'}</h2>
          <p className="text-sm text-slate-500">
            {isEditing ? 'Update the details for this question.' : 'Fill in the details below to add a new question to the bank.'}
          </p>
        </div>
        
        <form 
          onSubmit={handleSubmit(onSubmit, (err) => {
            console.error("Validation Errors:", err);
            const missingFields = Object.keys(err).map(key => {
              if (key === 'options') return 'Options (A, B, C, D)';
              return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
            });
            toast.error(`Missing or invalid fields: ${missingFields.join(', ')}`, {
              duration: 4000,
              icon: '⚠️'
            });
          })} 
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar flex-1 scroll-smooth">
            {/* META DATA */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">1</span>
                Classification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Subject</label>
                  <select 
                    {...register('subject_id')} 
                    className={cn(
                      "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
                      errors.subject_id ? "border-red-500 ring-red-500/10" : "border-slate-200 dark:border-slate-700"
                    )}
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.subject_id && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.subject_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Exam Type</label>
                  <select {...register('examType')} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                  </select>
                </div>
                {!forcedType && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Question Type</label>
                    <select {...register('q_type')} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="INTEGER">Integer / Numerical</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Chapter</label>
                  <select 
                    {...register('chapter_id')} 
                    className={cn(
                      "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                      errors.chapter_id ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                    disabled={!selectedSubjectId}
                  >
                    <option value="">Select Chapter...</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.chapter_id && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.chapter_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Topic</label>
                  <select 
                    {...register('topic_id')} 
                    className={cn(
                      "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                      errors.topic_id ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                    disabled={!selectedChapterId}
                  >
                    <option value="">Select Topic...</option>
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  {errors.topic_id && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.topic_id.message}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Difficulty</label>
                  <div className="flex gap-4">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" value={d} {...register('difficulty')} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* QUESTION CONTENT */}
            <section className="space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">2</span>
                Question Content
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Question Text</label>
                <textarea 
                  {...register('questionText')} 
                  rows={4} 
                  className={cn(
                    "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]",
                    errors.questionText ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                  )} 
                  placeholder="Type the question here..." 
                />
                {errors.questionText && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.questionText.message}</p>}
              </div>

              <Controller
                name="questionImageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload 
                    label="Question Diagram (Optional)" 
                    value={field.value || ''} 
                    onChange={field.onChange} 
                    path="questions"
                  />
                )}
              />

              {currentQType === 'MCQ' ? (
                <>
                  <div className="space-y-3 pt-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Options</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm border border-slate-200 dark:border-slate-700">{opt}</div>
                          <input 
                            {...register(`options.${opt as 'A'|'B'|'C'|'D'}`)} 
                            className={cn(
                              "flex-1 rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                              errors.options?.[opt as 'A'|'B'|'C'|'D'] ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                            )} 
                            placeholder={`Enter option ${opt}...`} 
                          />
                        </div>
                      ))}
                    </div>
                    {errors.options && <p className="text-red-500 text-[11px] mt-1 font-medium text-center">All options are required</p>}
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">Correct Answer</label>
                    <div className="flex gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <label key={opt} className="flex-1">
                          <input type="radio" value={opt} {...register('correctAnswer')} className="peer sr-only" />
                          <div className="text-center px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 dark:peer-checked:bg-indigo-900/20 peer-checked:text-indigo-700 dark:peer-checked:text-indigo-400 font-bold transition-all hover:border-slate-200 dark:hover:border-slate-700">
                            {opt}
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.correctAnswer && <p className="text-red-500 text-[11px] mt-1 font-medium text-center">{errors.correctAnswer.message}</p>}
                  </div>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Correct Answer (Numerical Value)</label>
                  <input
                    type="text"
                    {...register('correctAnswer')}
                    className={cn(
                      "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none",
                      errors.correctAnswer ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )}
                    placeholder="e.g. 12 or 5.5"
                  />
                  {errors.correctAnswer && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.correctAnswer.message}</p>}
                </div>
              )}
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* SOLUTION */}
            <section className="space-y-5 pb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">3</span>
                Solution & Explanation
              </h3>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">Explanation</label>
                <textarea 
                  {...register('explanation')} 
                  rows={4} 
                  className={cn(
                    "w-full rounded-lg border bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y min-h-[100px]",
                    errors.explanation ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                  )} 
                  placeholder="Provide a detailed step-by-step solution..." 
                />
                {errors.explanation && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.explanation.message}</p>}
              </div>

              <Controller
                name="solutionImageUrl"
                control={control}
                render={({ field }) => (
                  <ImageUpload 
                    label="Solution Diagram (Optional)" 
                    value={field.value || ''} 
                    onChange={field.onChange} 
                    path="solutions"
                  />
                )}
              />
            </section>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <Button type="submit" size="lg" className="w-full h-12 text-base font-bold shadow-indigo-500/20 shadow-lg" loading={isSubmitting}>
              Save Question to Bank
            </Button>
          </div>
        </form>
      </div>

      <div className="hidden lg:block h-full sticky top-0">
        <QuestionPreview data={formData} />
      </div>
    </div>
  );
}
