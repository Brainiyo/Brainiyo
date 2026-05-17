'use client';
import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ExamInterface } from '@/components/ExamInterface';
import { ExamResult } from '@/components/ExamResult';

export default function ExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const testId = params.id as string;
  const testTitle = searchParams.get('title') || 'Mock Test';
  
  const [result, setResult] = useState<any>(null);

  if (result) {
    return (
      <ExamResult 
        result={result} 
        onBack={() => router.push('/dashboard/tests')} 
      />
    );
  }

  return (
    <ExamInterface 
      testId={testId} 
      testTitle={testTitle} 
      onFinish={setResult} 
    />
  );
}
