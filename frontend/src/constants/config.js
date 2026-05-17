// ─── Brainiyo App Configuration ──────────────────────────────────────────────

// API base URL — update this if using a physical device with LAN IP
export const API_BASE_URL = 'http://10.0.2.2:5002/api';

export const API_TIMEOUT = 15000; // 15 seconds

// Daily question target for free plan users
export const FREE_DAILY_LIMIT = 30;

// Session settings
export const SESSION_DEFAULT_QUESTIONS = 20;

// Study tips (shown daily on home screen, cycling every 24h)
export const STUDY_TIPS = [
  'Practice Newton\'s laws questions every day for 1 week to master them.',
  'Use spaced repetition — don\'t study the same topic two days in a row.',
  'After getting a question wrong, always read the full explanation.',
  'Time yourself — NEET gives you just 48 seconds per question.',
  'Revise weak topics in the morning when memory consolidation is strongest.',
  'Focus on NCERT concepts before attempting PYQ questions.',
  'Organic chemistry reactions: write them out by hand to memorize better.',
  'Physics numericals: always write the formula first, then substitute values.',
  'Do at least one full mock test per week in the final 3 months.',
  'Biology diagrams: label every part — NEET often asks about specific labels.',
  'For equilibrium problems, always draw a free body diagram first.',
  'Electrochemistry: learn the standard electrode potentials by heart.',
  'Genetics problems: practice Punnett squares until they become automatic.',
  'Thermodynamics: understand the concepts, not just the formulas.',
  'Ray optics: master sign conventions before attempting numericals.',
  'Plant physiology: link each process to its organelle for easier recall.',
  'For calculus-based physics, practice integration techniques separately.',
  'Review your mistakes before sleeping — it reinforces corrections overnight.',
  'Keep a formula sheet for Physical Chemistry — update it weekly.',
  'Human physiology: draw flow diagrams to connect organ systems.',
  'Waves and oscillations: SHM is tested every year — master it.',
  'Coordination compounds: memorize IUPAC naming rules systematically.',
  'Practice minimum 15 organic chemistry questions daily in the last month.',
  'Solve previous 5 years\' NEET papers completely before the exam.',
  'Cell biology: understand the ultrastructure — TEM/SEM questions appear.',
  'Fluid mechanics: Bernoulli\'s equation applications are high-weightage.',
  'P-block elements: group trends are more important than individual facts.',
  'Ecology numericals: pyramid of numbers vs biomass — know the difference.',
  'Work, energy, power: conservative vs non-conservative forces distinction.',
  'Genetics — Mendel\'s laws and their exceptions are heavily tested in NEET.',
];

// Notification type constants
export const NOTIFICATION_TYPES = {
  STREAK_RISK: 'streak_risk',
  REVISION_DUE: 'revision_due',
  WEEKLY_REPORT: 'weekly_report',
  MOCK_REMINDER: 'mock_test_reminder',
  DAILY_REMINDER: 'daily_reminder',
  MOTIVATIONAL: 'motivational',
};

// Accuracy thresholds for color coding
export const ACCURACY_THRESHOLDS = {
  WEAK: 40,      // < 40%  → red
  MODERATE: 70,  // 40–70% → amber
                 // > 70%  → green
};

// Mastery labels
export const MASTERY_LABELS = {
  BEGINNER: 'Beginner',
  DEVELOPING: 'Developing',
  PROFICIENT: 'Proficient',
  MASTERED: 'Mastered',
};

// Subject config
export const SUBJECTS = {
  PHYSICS: { id: 'physics', label: 'Physics', emoji: '⚛️', color: '#3B82F6' },
  CHEMISTRY: { id: 'chemistry', label: 'Chemistry', emoji: '🧪', color: '#10B981' },
  BIOLOGY: { id: 'biology', label: 'Biology', emoji: '🌿', color: '#F59E0B' },
  MATHS: { id: 'maths', label: 'Mathematics', emoji: '📐', color: '#8B5CF6' },
};
