import { create } from 'zustand';

export const useAnalyticsStore = create((set) => ({
  // Dashboard data
  streak: { current: 0, longest: 0, lastActiveDate: null },
  todayStats: { attempted: 0, correct: 0, accuracy: 0 },
  weeklyActivity: [],      // [{ date, count }] last 7 days
  subjectStats: [],        // [{ subjectId, accuracy, chaptersTotal, chaptersDone }]
  weakTopics: [],          // top 3–5 weak topics
  revisionDueCount: 0,

  // Settings-level: dark mode
  darkMode: false,

  // ── Actions ──────────────────────────────────────────────────────────────
  setStreak: (streak) => set({ streak }),
  setTodayStats: (todayStats) => set({ todayStats }),
  setWeeklyActivity: (weeklyActivity) => set({ weeklyActivity }),
  setSubjectStats: (subjectStats) => set({ subjectStats }),
  setWeakTopics: (weakTopics) => set({ weakTopics }),
  setRevisionDueCount: (count) => set({ revisionDueCount: count }),

  setDashboard: ({ streak, todayStats, weeklyActivity, subjectStats, weakTopics, revisionDueCount }) =>
    set({ streak, todayStats, weeklyActivity, subjectStats, weakTopics, revisionDueCount }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (val) => set({ darkMode: val }),

  // Optimistic increment after answering a question
  incrementTodayAttempt: (isCorrect) =>
    set((state) => {
      const attempted = state.todayStats.attempted + 1;
      const correct = state.todayStats.correct + (isCorrect ? 1 : 0);
      return {
        todayStats: {
          attempted,
          correct,
          accuracy: Math.round((correct / attempted) * 100),
        },
      };
    }),
}));
