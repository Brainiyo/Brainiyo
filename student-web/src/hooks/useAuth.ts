'use client';
import { useUser } from '@/contexts/UserContext';

export function useAuth() {
  const { user, isAuthenticated, logout } = useUser();
  return { user, loading: isAuthenticated === null, isAuthenticated, logout };
}
