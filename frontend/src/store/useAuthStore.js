import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,

      // Onboarding selections (before account creation)
      onboarding: {
        targetExam: null,  // 'NEET' | 'JEE'
        class: null,       // '11' | '12' | 'Dropper'
        name: '',
        phone: '',
      },

      setAuth: (user, token) => set({
        user,
        token,
        isAuthenticated: !!token,
      }),

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),

      updateProfile: (fields) => set((state) => ({
        user: { ...state.user, ...fields },
      })),

      setOnboarding: (fields) => set((state) => ({
        onboarding: { ...state.onboarding, ...fields },
      })),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),

      syncProfile: async (fields) => {
        // Optimistic update
        set((state) => ({
          user: { ...state.user, ...fields },
        }));

        try {
          const res = await ApiService.updateMe(fields);
          if (res?.data) {
            set({ user: res.data });
          }
        } catch (err) {
          console.error('Profile synchronization failed:', err);
          // Rollback could be implemented here if needed
        }
      },

      setHydrated: (val) => set({ isHydrated: val }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
    }
  )
);
