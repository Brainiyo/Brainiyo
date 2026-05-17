'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PracticeRedirect() {
  const router = useRouter();
  useEffect(() => {
    // In a real app, we'd load the practice component here
    // For now, redirect to home with a state or just home
    router.push('/?tab=practice');
  }, [router]);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
    <div style={{ textAlign: 'center' }}>
      <h2>Entering Practice Arena...</h2>
      <div className="spinner"></div>
    </div>
  </div>;
}
