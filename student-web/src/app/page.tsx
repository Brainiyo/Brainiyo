'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import styles from './Landing.module.css';

export default function LandingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    api.getPublicStats().then(res => {
      if (res.success) setStats(res.data);
    }).catch(() => {});
  }, []);
  
  const portalUrl = '/dashboard';

  return (
    <div className={styles.landing}>
      <nav className={styles.nav}>
        <div className={`${styles.container} ${styles.navContent}`}>
          <Link href="/" className={styles.logo}>
            <Image src="/logo-icon.png" alt="Brainiyo" width={42} height={42} />
            <span>Brainiyo</span>
          </Link>
          <div className={styles.navItems}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#comparison" className={styles.navLink}>Why Us</a>
            <a href="#how" className={styles.navLink}>How it Works</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <a href="#faqs" className={styles.navLink}>FAQs</a>
          </div>
          <div className={styles.navActions}>
            <Button variant="outline" size="sm" onClick={() => window.location.href = 'https://brainiyo-student.vercel.app/dashboard'} style={{ borderRadius: '100px', borderColor: '#4f46e5', color: '#4f46e5', fontWeight: 700, padding: '8px 20px' }}>
              Practice Portal
            </Button>
          </div>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <motion.div 
            className={styles.heroContent}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className={styles.sectionTag}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
              Target NEET & JEE 2025
            </div>
            <h1>Master every concept. <br /><span className={styles.gradientText}>Crack the exam.</span></h1>
            <p>Personalized active learning that adapts to your speed. Practice over 100k+ real exam questions, pinpoint deep conceptual gaps, and secure your target rank.</p>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button size="lg" onClick={() => window.location.href = portalUrl}>
                {isAuthenticated ? 'Resume My Prep' : 'Start Practicing Now'}
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView()}>
                  Explore Features
                </Button>
              )}
            </div>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <h4>{stats ? `${(stats.total_students / 1000).toFixed(1)}k+` : '20k+'}</h4>
                <p>Active Aspirants</p>
              </div>
              <div className={styles.statItem}>
                <h4>{stats ? stats.total_attempts.toLocaleString() : '150k+'}</h4>
                <p>Questions Solved</p>
              </div>
              <div className={styles.statItem}>
                <h4>{stats ? stats.total_questions.toLocaleString() : '100k+'}</h4>
                <p>Practice Bank</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={styles.mockupWrapper}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            {/* Floating Premium Topic Tags */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                position: 'absolute',
                left: '-40px',
                top: '25%',
                zIndex: 10,
                background: 'white',
                color: '#4f46e5',
                padding: '10px 18px',
                borderRadius: '100px',
                boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.2)',
                border: '1px solid rgba(79, 70, 229, 0.1)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: '#f59e0b' }}>⚡</span> Electrostatics
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                position: 'absolute',
                left: '-50px',
                bottom: '18%',
                zIndex: 10,
                background: 'white',
                color: '#e11d48',
                padding: '10px 18px',
                borderRadius: '100px',
                boxShadow: '0 20px 40px -15px rgba(225, 29, 72, 0.2)',
                border: '1px solid rgba(225, 29, 72, 0.1)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: '#10b981' }}>🧪</span> Organic Reactions
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              style={{
                position: 'absolute',
                right: '-30px',
                bottom: '10%',
                zIndex: 10,
                background: 'white',
                color: '#0d9488',
                padding: '10px 18px',
                borderRadius: '100px',
                boxShadow: '0 20px 40px -15px rgba(13, 148, 136, 0.2)',
                border: '1px solid rgba(13, 148, 136, 0.1)',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: '#ec4899' }}>🧬</span> Molecular Genetics
            </motion.div>

            {/* Visual Phone Mockup - Functional Version */}
            <div style={{ position: 'relative', width: '330px', margin: '0 auto', filter: 'drop-shadow(0 25px 50px rgba(15, 23, 42, 0.15))' }}>
              <div style={{ background: '#0f172a', borderRadius: '48px', border: '12px solid #1e293b', padding: '24px 20px', height: '600px', color: 'white', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '70px', height: '5px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto 24px' }}></div>
                
                <InteractivePhoneContent />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <section className={styles.comparison} id="comparison">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <div className={styles.sectionTag}>The Advantage</div>
            <h2 style={{ fontSize: '42px', marginBottom: '20px' }}>Why Brainiyo outsmarts generic coaching</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Passive video watching gives a false sense of confidence. Real exam success requires hyper-personalized active recall.</p>
          </div>

          <div className={styles.compGrid}>
            <div className={styles.compCard}>
              <h3>Generic Online Courses</h3>
              <ul className={styles.compList}>
                <li>Passive endless video lecture loops</li>
                <li>One-size-fits-all generic question sheets</li>
                <li>No targeted tracking of what you start forgetting</li>
                <li>Zero real-time pacing or speed analytics</li>
              </ul>
            </div>
            <div className={`${styles.compCard} ${styles.brainiyoCard}`}>
              <div className={styles.compBadge}>THE BRAINIYO APPROACH</div>
              <h3>Active Precision Engine</h3>
              <ul className={styles.compList}>
                <li>Practice-first methodology triggers recall</li>
                <li>Real-time adaptive difficulty scaling</li>
                <li>Automated Spaced Repetition (SRS)</li>
                <li>Deep sub-topic accuracy & time metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.how} id="how">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
            <div className={styles.sectionTag}>Methodology</div>
            <h2 style={{ fontSize: '42px', marginBottom: '20px' }}>Three steps to absolute mastery</h2>
          </div>
          <div className={styles.stepsGrid}>
            <StepCard num="01" title="Target a Module" desc="Select any precise chapter or conceptual topic from the standardized syllabus." />
            <StepCard num="02" title="Adaptive Execution" desc="Engage with questions calibrated dynamically to your exact capability." />
            <StepCard num="03" title="Spaced Optimization" desc="Algorithms feed you failure points exactly when your retention starts dropping." />
          </div>
        </div>
      </section>

      <section className={styles.features} id="features">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '42px', marginBottom: '60px' }}>Engineered for ultimate test outcomes</h2>
          </div>
          <div className={styles.featuresGrid}>
            <FeatureCard icon="⚡" title="ML Calibrator" desc="Difficulty nodes adjust based on speed and accuracy strings." />
            <FeatureCard icon="🧠" title="SRS Queue" desc="Flashcard style queues ensure your weakest links are reinforced." />
            <FeatureCard icon="📊" title="Granular Diagnostics" desc="Instantly spot weak conceptual branches before mock tests." />
            <FeatureCard icon="🎯" title="NTA Native Fidelity" desc="Simulate perfect exam parameters using our native interface." />
          </div>
        </div>
      </section>

      <section className={styles.pricing} id="pricing">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className={styles.sectionTag}>Pricing</div>
            <h2 style={{ fontSize: '42px', marginBottom: '20px' }}>Zero barriers to preparation</h2>
          </div>
          <div className={styles.priceGrid}>
            <div className={styles.priceCard}>
              <h3>Essential Tier</h3>
              <div className={styles.priceDisplay}>₹0 <span>/ forever</span></div>
              <ul className={styles.compList} style={{ margin: '20px 0' }}>
                <li>30 Adaptive Prompts / Day</li>
                <li>Standard Topic Navigation</li>
                <li>Core Dashboard Diagnostics</li>
              </ul>
              <Button variant="outline" fullWidth onClick={() => window.location.href = '/dashboard'}>Launch Free Base</Button>
            </div>
            <div className={`${styles.priceCard} ${styles.proCard}`}>
              <div className={styles.popular}>MOST SELECTED</div>
              <h3>Mastery Ultimate</h3>
              <div className={styles.priceDisplay}>₹299 <span>/ month</span></div>
              <ul className={styles.compList} style={{ margin: '20px 0' }}>
                <li>Infinite Adaptive Execution</li>
                <li>Full Spaced Repetition System</li>
                <li>Deep Heatmap Weakness Detection</li>
              </ul>
              <Button fullWidth onClick={() => window.location.href = '/dashboard'}>Unlock Full Power</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.logo}>
                <Image src="/logo-icon.png" alt="Brainiyo" width={42} height={42} />
                <span style={{ color: 'white' }}>Brainiyo</span>
              </div>
              <p style={{ color: '#94a3b8', marginTop: '20px', maxWidth: '300px' }}>The supreme engineering platform built for NEET & JEE aspirants.</p>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>
              &copy; 2026 Brainiyo EdTech Technologies.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InteractivePhoneContent() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const options = [
    { id: 'A', text: '8.00', correct: false },
    { id: 'B', text: '6.98', correct: true },
    { id: 'C', text: '7.00', correct: false },
  ];

  const handleSelect = (id: string) => {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
  };

  return (
    <>
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ fontSize: '11px', fontWeight: 800, color: '#818cf8', marginBottom: '16px', letterSpacing: '1px' }}
      >
        PRACTICE • CHEMISTRY
      </motion.div>
      <div style={{ background: 'white', color: '#0f172a', padding: '24px', borderRadius: '28px', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontWeight: 800, fontSize: '16px', lineHeight: 1.5, marginBottom: '24px', color: '#1e293b' }}>
          What is the pH of 10⁻⁸ M HCl aqueous solution at 298K?
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {options.map((opt, index) => {
            const isSelected = selected === opt.id;
            const isCorrect = revealed && opt.correct;
            const isWrong = revealed && isSelected && !opt.correct;

            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isWrong 
                    ? { x: [-5, 5, -5, 5, 0], opacity: 1, y: 0 } 
                    : isCorrect 
                    ? { scale: [1, 1.05, 1], opacity: 1, y: 0 } 
                    : { opacity: 1, y: 0 }
                }
                transition={{ 
                  delay: revealed ? 0 : index * 0.1, 
                  duration: 0.4 
                }}
                whileHover={!revealed ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } : {}}
                whileTap={!revealed ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(opt.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                  border: isCorrect 
                    ? '2px solid #22c55e' 
                    : isWrong 
                    ? '2px solid #ef4444' 
                    : isSelected 
                    ? '2px solid #6366f1'
                    : '2px solid #f1f5f9',
                  background: isCorrect 
                    ? '#dcfce7' 
                    : isWrong 
                    ? '#fee2e2' 
                    : isSelected 
                    ? '#e0e7ff' 
                    : '#f8fafc',
                  color: isCorrect 
                    ? '#166534' 
                    : isWrong 
                    ? '#991b1b' 
                    : '#334155',
                  cursor: revealed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  <span style={{ opacity: 0.7, marginRight: '8px' }}>{opt.id})</span> {opt.text}
                </span>
                {isCorrect && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={{ fontSize: '12px', background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}
                  >
                    Correct
                  </motion.span>
                )}
                {isWrong && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={{ fontSize: '12px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}
                  >
                    Incorrect
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {revealed && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: '13px', color: '#475569', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <strong style={{ color: '#0f172a' }}>Concept Note</strong>
                </div>
                At high dilution (10⁻⁸ M), the H⁺ from water (10⁻⁷ M) cannot be ignored. Total [H⁺] ≈ 1.05 × 10⁻⁷ M, giving pH ≈ 6.98.
                
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelected(null); setRevealed(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '16px', color: 'white', fontWeight: 700, background: '#4f46e5', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)' }}
                >
                  <span>↺</span> Try Again
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function StepCard({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepNum}>{num}</div>
      <h4 style={{ marginBottom: '12px', fontSize: '22px' }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{desc}</p>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className={styles.featCard}>
      <div className={styles.featIcon}>{icon}</div>
      <h4 style={{ marginBottom: '12px', fontSize: '20px' }}>{title}</h4>
      <p style={{ color: '#94a3b8', fontSize: '15px' }}>{desc}</p>
    </div>
  );
}

