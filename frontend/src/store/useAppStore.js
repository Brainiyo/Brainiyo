import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAppStore = create(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      examType: null, // 'NEET' or 'JEE'
      studentClass: null, // 11, 12, 'Dropper'
      
      completeOnboarding: (examType, studentClass) => set({ 
        hasCompletedOnboarding: true,
        examType,
        studentClass
      }),
      
      setExamType: (examType) => set({ examType }),
      setStudentClass: (studentClass) => set({ studentClass }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
