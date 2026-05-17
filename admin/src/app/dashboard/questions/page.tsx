import { QuestionList } from '@/components/QuestionList';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export default function QuestionsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and organize all your exam questions.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="gap-2">
            <Plus size={18} />
            Add Question
          </Button>
        </Link>
      </div>
      
      <div className="flex-1">
        <QuestionList />
      </div>
    </div>
  );
}
