import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePracticeStore = create(
  persist(
    (set, get) => ({
      // Current active session
      currentQuestion: null,
      sessionMode: 'practice', // 'practice' | 'revision'
      sessionTopicId: null,

      // Live session stats (reset each session)
      sessionStats: {
        correct: 0,
        wrong: 0,
        totalTime: 0,      // seconds
        questions: [],     // { questionId, isCorrect, timeTaken, selectedOption }
      },

      // Last completed session (for continue-where-you-left-off)
      lastSession: null,

      // Bookmarks persisted to AsyncStorage
      bookmarks: [],       // array of question objects

      // ── Actions ──────────────────────────────────────────────────────────
      setCurrentQuestion: (question) => set({ currentQuestion: question }),

      startSession: (topicId, mode) => set({
        sessionTopicId: topicId,
        sessionMode: mode,
        sessionStats: { correct: 0, wrong: 0, totalTime: 0, questions: [] },
        currentQuestion: null,
      }),

      recordAnswer: ({ questionId, isCorrect, timeTaken, selectedOption }) =>
        set((state) => ({
          sessionStats: {
            ...state.sessionStats,
            correct: state.sessionStats.correct + (isCorrect ? 1 : 0),
            wrong: state.sessionStats.wrong + (isCorrect ? 0 : 1),
            totalTime: state.sessionStats.totalTime + timeTaken,
            questions: [
              ...state.sessionStats.questions,
              { questionId, isCorrect, timeTaken, selectedOption },
            ],
          },
        })),

      endSession: () =>
        set((state) => ({
          lastSession: {
            topicId: state.sessionTopicId,
            mode: state.sessionMode,
            stats: state.sessionStats,
            endedAt: new Date().toISOString(),
          },
          currentQuestion: null,
          sessionTopicId: null,
        })),

      // Bookmarks
      addBookmark: (question) =>
        set((state) => {
          const already = state.bookmarks.some((q) => q.id === question.id);
          if (already) return state;
          return { bookmarks: [...state.bookmarks, question] };
        }),

      removeBookmark: (questionId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((q) => q.id !== questionId),
        })),

      isBookmarked: (questionId) =>
        get().bookmarks.some((q) => q.id === questionId),
    }),
    {
      name: 'practice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist bookmarks and lastSession — session stats are ephemeral
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        lastSession: state.lastSession,
      }),
    }
  )
);
