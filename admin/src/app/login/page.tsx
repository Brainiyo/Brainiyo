'use client';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Brain, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Brainiyo Admin Panel</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Sign in to manage the question bank and curriculum.
        </p>
        <Button 
          onClick={signInWithGoogle} 
          className="w-full flex items-center justify-center gap-2"
          size="lg"
        >
          <LogIn size={20} />
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
