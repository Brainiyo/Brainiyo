module.exports = {
  // SM-2 constants
  SM2: {
    DEFAULT_EASE_FACTOR: 2.50,
    MIN_EASE_FACTOR:     1.30,
  },

  // Adaptive difficulty thresholds
  ADAPTIVE: {
    HARD_THRESHOLD:   75,  // accuracy% → serve hard
    MEDIUM_THRESHOLD: 45,  // accuracy% → serve medium
    SEEN_CACHE_SIZE:  50,
    SEEN_CACHE_TTL:   3600,
  },

  // Plan limits
  PLANS: {
    free: {
      dailyQuestions: parseInt(process.env.FREE_DAILY_QUESTIONS, 10) || 20,
      mockTests: 2,
    },
    pro: {
      dailyQuestions: parseInt(process.env.PRO_DAILY_QUESTIONS, 10) || 500,
      mockTests: Infinity,
    },
  },

  // Mock test question distribution
  MOCK: {
    NEET: { total: 180, Physics: 45, Chemistry: 45, Biology: 90 },
    JEE:  { total: 90,  Physics: 30, Chemistry: 30, Mathematics: 30 },
  },

  // NTA scoring
  NTA: {
    CORRECT: 4,
    WRONG:   -1 / 3,  // −0.333...
    SKIP:    0,
  },

  // Redis TTLs (seconds)
  CACHE: {
    SUBJECTS:    3600,   // 1 hour
    CHAPTERS:    3600,
    TOPICS:      3600,
    DASHBOARD:   60,
    LEADERBOARD: 300,    // 5 minutes
  },
};
