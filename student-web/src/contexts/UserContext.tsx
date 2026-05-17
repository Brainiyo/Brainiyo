'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

interface UserContextType {
  user: any;
  isAuthenticated: boolean | null;
  streak: any;
  dueRevision: number;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [streak, setStreak] = useState<any>(null);
  const [dueRevision, setDueRevision] = useState<number>(0);

  const fetchUserData = async () => {
    try {
      const [streakRes, revRes] = await Promise.all([
        api.getStreak(),
        api.getRevisionDue()
      ]);
      setStreak(streakRes);
      setDueRevision(revRes.count);
    } catch (err) {
      console.error('Failed to fetch user supplementary data', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res?.data) {
          setUser(res.data);
          setIsAuthenticated(true);
          await fetchUserData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const data = await api.verifyFirebaseToken(idToken);
      if (data.token) {
        api.setToken(data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        await fetchUserData();
      }
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch(e) {}
    api.clearToken();
    setIsAuthenticated(false);
    setUser(null);
    setStreak(null);
    setDueRevision(0);
    window.location.href = '/';
  };

  const updateUser = (userData: any) => {
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, streak, dueRevision, loginWithGoogle, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
