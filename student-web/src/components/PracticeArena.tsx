'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card } from './Card';
import { Button } from './Button';
import styles from './PracticeArena.module.css';

declare global {
  interface Window {
    MathJax: any;
  }
}

import { PracticeSelector } from './PracticeSelector';
import { QuizEngine } from './QuizEngine';

export const PracticeArena = () => {
  const [mode, setMode] = useState<'selection' | 'quiz' | 'result'>('selection');
  const [sessionParams, setSessionParams] = useState<{ topicId: string, count: number } | null>(null);

  const handleStart = (topicId: string, count: number) => {
    setSessionParams({ topicId, count });
    setMode('quiz');
  };

  const handleComplete = () => {
    setMode('result');
  };

  return (
    <div className={styles.container}>
      {mode === 'selection' && (
        <PracticeSelector onStart={handleStart} />
      )}

      {mode === 'quiz' && sessionParams && (
        <QuizEngine 
          topicId={sessionParams.topicId} 
          count={sessionParams.count} 
          onComplete={handleComplete} 
        />
      )}

      {mode === 'result' && (
        <div className={styles.resultSplash}>
          <div className={styles.celebrationIcon}>🏆</div>
          <h2>Session Accomplished!</h2>
          <p>You've completed your target for this session. Your accuracy and recall metrics have been updated.</p>
          <Button size="lg" onClick={() => setMode('selection')}>Start New Session</Button>
        </div>
      )}
    </div>
  );
};
