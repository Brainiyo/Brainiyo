'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MockTestRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push('/?tab=tests');
  }, [router]);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
    <div style={{ textAlign: 'center' }}>
      <h2>Loading Mock Test Center...</h2>
      <div className="spinner"></div>
    </div>
  </div>;
}
