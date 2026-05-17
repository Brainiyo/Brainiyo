'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from './Card';
import { Button } from './Button';
import { api } from '@/lib/api';
import styles from './MockTestCenter.module.css';

export default function MockTestCenter() {
  const [activeTab, setActiveTab] = useState('full');
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await api.getAvailableMockTests();
        setTests(res.data);
      } catch (err) {
        console.error('Failed to fetch tests:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  // Full length = 60+ questions; Chapter-wise = fewer than 60
  const filteredTests = tests.filter(t => 
    activeTab === 'full' ? t.total_questions >= 60 : t.total_questions < 60
  );

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'full' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('full')}
        >
          Full Length Tests
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'chapter' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('chapter')}
        >
          Chapter-wise Tests
        </button>
      </div>

      <div className={styles.grid}>
        {loading ? <div className="p-8 text-center col-span-full">Loading available tests...</div> : filteredTests.map((test) => (
          <Card key={test.id} className={styles.testCard}>
            <div className={styles.cardHeader}>
              <div className={styles.badge}>{test.exam_type}</div>
              <div className={styles.timeBadge}>⏱ {test.duration_minutes}m</div>
            </div>
            <h3>{test.title}</h3>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span>Questions</span>
                <strong>{test.total_questions}</strong>
              </div>
              <div className={styles.stat}>
                <span>Max Marks</span>
                <strong>{test.max_marks}</strong>
              </div>
            </div>
            <Button fullWidth variant="primary" onClick={() => router.push(`/dashboard/tests/${test.id}?title=${encodeURIComponent(test.title)}`)}>
              Launch Exam
            </Button>
          </Card>
        ))}
        {!loading && filteredTests.length === 0 && (
          <div className="p-8 text-center col-span-full" style={{ opacity: 0.6 }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
            <p style={{ fontWeight: 700, marginBottom: '8px' }}>
              {activeTab === 'full' ? 'No full length tests available yet.' : 'No chapter-wise tests available yet.'}
            </p>
            <p style={{ fontSize: '13px' }}>Only published tests appear here. Ask your admin to publish tests from the Admin Panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
