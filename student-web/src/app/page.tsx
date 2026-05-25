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
            {/* <a href="#pricing" className={styles.navLink}>Pricing</a> */}
            <a href="#faqs" className={styles.navLink}>FAQs</a>
          </div>
          <div className={styles.navActions}>
            <Button variant="outline" size="sm" onClick={() => window.location.href = portalUrl} style={{ borderRadius: '100px', borderColor: '#4f46e5', color: '#4f46e5', fontWeight: 700, padding: '8px 20px' }}>
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
            
            <div className={styles.heroButtons}>
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
              whileHover={{ scale: 1.05, translateY: -4 }}
              className={`${styles.floatingTag} ${styles.floatingTag1}`}
            >
              <span style={{ fontSize: '15px' }}>⚡</span> Electrostatics
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05, translateY: -4 }}
              className={`${styles.floatingTag} ${styles.floatingTag2}`}
            >
              <span style={{ fontSize: '15px' }}>🧪</span> Organic Reactions
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              whileHover={{ scale: 1.05, translateY: -4 }}
              className={`${styles.floatingTag} ${styles.floatingTag3}`}
            >
              <span style={{ fontSize: '15px' }}>🧬</span> Molecular Genetics
            </motion.div>

            {/* Premium Neon Glow behind phone */}
            <div style={{
              position: 'absolute',
              top: '12%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '260px',
              height: '490px',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(236, 72, 153, 0.4) 100%)',
              borderRadius: '60px',
              filter: 'blur(55px)',
              opacity: 0.65,
              zIndex: 0,
              pointerEvents: 'none'
            }}></div>

            {/* Visual Phone Mockup - Bezel-less Ultra Premium Version */}
            <div 
              style={{ 
                position: 'relative', 
                width: '320px', 
                margin: '0 auto', 
                zIndex: 2,
                transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
                transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-8px)';
                e.currentTarget.style.filter = 'drop-shadow(0 30px 60px rgba(79, 70, 229, 0.25))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(4deg)';
                e.currentTarget.style.filter = 'none';
              }}
            >
              <div style={{ 
                background: 'linear-gradient(to bottom, #090d16, #111827)', 
                borderRadius: '48px', 
                border: '9px solid rgba(30, 41, 59, 0.95)', 
                outline: '1px solid rgba(255,255,255,0.08)',
                padding: '38px 16px 20px', 
                height: '610px', 
                color: 'white', 
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.05)'
              }}>
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
            <h2 className={styles.sectionHeading}>Why Brainiyo outsmarts generic coaching</h2>
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
            <h2 className={styles.sectionHeading}>Three steps to absolute mastery</h2>
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
            <h2 className={`${styles.sectionHeading} ${styles.mb60}`} style={{ color: 'white' }}>Engineered for ultimate test outcomes</h2>
          </div>
          <div className={styles.featuresGrid}>
            <FeatureCard icon="⚡" title="ML Calibrator" desc="Difficulty nodes adjust based on speed and accuracy strings." />
            <FeatureCard icon="🧠" title="SRS Queue" desc="Flashcard style queues ensure your weakest links are reinforced." />
            <FeatureCard icon="📊" title="Granular Diagnostics" desc="Instantly spot weak conceptual branches before mock tests." />
            <FeatureCard icon="🎯" title="NTA Native Fidelity" desc="Simulate perfect exam parameters using our native interface." />
          </div>
        </div>
      </section>
      {/* Hiding Pricing for now
      <section className={styles.pricing} id="pricing">
        <div className={styles.container}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className={styles.sectionTag}>Pricing</div>
            <h2 className={styles.sectionHeading}>Zero barriers to preparation</h2>
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
      */}


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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Dynamic Island */}
      <div style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '24px', background: '#000', borderRadius: '20px', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '8px', height: '8px', background: '#1e293b', borderRadius: '50%', marginRight: '6px' }}></div>
        <div style={{ width: '4px', height: '4px', background: '#1e293b', borderRadius: '50%' }}></div>
      </div>

      {/* Simulated Device Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px 16px', fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>
        <span>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Cell Signal */}
          <span style={{ display: 'inline-flex', gap: '1.5px', alignItems: 'flex-end', height: '9px' }}>
            <span style={{ width: '2px', height: '3px', background: '#94a3b8', borderRadius: '0.5px' }}></span>
            <span style={{ width: '2px', height: '5px', background: '#94a3b8', borderRadius: '0.5px' }}></span>
            <span style={{ width: '2px', height: '7px', background: '#cbd5e1', borderRadius: '0.5px' }}></span>
            <span style={{ width: '2px', height: '9px', background: '#cbd5e1', borderRadius: '0.5px' }}></span>
          </span>
          {/* Wi-Fi Icon */}
          <span style={{ fontSize: '10px' }}>📶</span>
          {/* Battery Icon */}
          <span style={{ display: 'inline-flex', width: '20px', height: '10px', border: '1px solid #94a3b8', borderRadius: '3px', padding: '1px', alignItems: 'center', position: 'relative' }}>
            <span style={{ display: 'block', height: '100%', width: '75%', background: '#10b981', borderRadius: '1.5px' }}></span>
            <span style={{ position: 'absolute', right: '-3px', width: '2px', height: '4px', background: '#94a3b8', borderTopRightRadius: '1px', borderBottomRightRadius: '1px' }}></span>
          </span>
        </div>
      </div>

      {/* Course & Chapter Progress */}
      <div style={{ padding: '0 8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', letterSpacing: '1px', textTransform: 'uppercase' }}>Practice • Chemistry</span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>Q. 4 of 15</span>
        </div>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: '30%', height: '100%', background: 'linear-gradient(to right, #4f46e5, #818cf8)', borderRadius: '2px' }}></div>
        </div>
      </div>

      {/* Screen App Container */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)', padding: '20px', borderRadius: '28px', flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontWeight: 700, fontSize: '15px', lineHeight: 1.5, marginBottom: '20px', color: '#f1f5f9' }}>
          What is the pH of 10⁻⁸ M HCl aqueous solution at 298K?
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((opt, index) => {
            const isSelected = selected === opt.id;
            const isCorrect = revealed && opt.correct;
            const isWrong = revealed && isSelected && !opt.correct;

            return (
              <motion.button
                key={opt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={
                  isWrong 
                    ? { x: [-5, 5, -5, 5, 0], opacity: 1, y: 0 } 
                    : isCorrect 
                    ? { scale: [1, 1.03, 1], opacity: 1, y: 0 } 
                    : { opacity: 1, y: 0 }
                }
                transition={{ 
                  delay: revealed ? 0 : index * 0.08, 
                  duration: 0.35 
                }}
                whileHover={!revealed ? { scale: 1.015, backgroundColor: 'rgba(255,255,255,0.06)' } : {}}
                whileTap={!revealed ? { scale: 0.985 } : {}}
                onClick={() => handleSelect(opt.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.25s ease',
                  border: isCorrect 
                    ? '1px solid #10b981' 
                    : isWrong 
                    ? '1px solid #f43f5e' 
                    : isSelected 
                    ? '1px solid #6366f1'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isCorrect 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : isWrong 
                    ? 'rgba(244, 63, 94, 0.15)' 
                    : isSelected 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'rgba(255,255,255,0.03)',
                  color: isCorrect 
                    ? '#34d399' 
                    : isWrong 
                    ? '#f87171' 
                    : isSelected 
                    ? '#a5b4fc' 
                    : '#cbd5e1',
                  cursor: revealed ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: isCorrect 
                      ? '#10b981' 
                      : isWrong 
                      ? '#f43f5e' 
                      : isSelected 
                      ? '#6366f1'
                      : 'rgba(255,255,255,0.05)',
                    color: isCorrect || isWrong || isSelected ? 'white' : '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </span>
                
                {isCorrect && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    Correct
                  </motion.span>
                )}
                {isWrong && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    style={{ fontSize: '10px', background: 'rgba(244, 63, 94, 0.2)', color: '#f87171', padding: '2px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid rgba(244, 63, 94, 0.3)' }}
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
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: '12px', color: '#cbd5e1', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px' }}>💡</span>
                  <strong style={{ color: '#f1f5f9' }}>Concept Note</strong>
                </div>
                At high dilution (10⁻⁸ M), the H⁺ from water (10⁻⁷ M) cannot be ignored. Total [H⁺] ≈ 1.05 × 10⁻⁷ M, giving pH ≈ 6.98.
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelected(null); setRevealed(false); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', marginTop: '12px', color: 'white', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '11px', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)' }}
                >
                  <span>↺</span> Try Another Question
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
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

