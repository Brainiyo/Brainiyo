'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const allowedEmails = ['brainiyoofficial@gmail.com', 'shreyanshg2005@gmail.com'];
        if (!currentUser.email || !allowedEmails.includes(currentUser.email.toLowerCase())) {
          alert('Access denied: You do not have administrator permissions.');
          await firebaseSignOut(auth);
          setUser(null);
          localStorage.removeItem('brainiyo_token');
          setLoading(false);
          router.push('/login');
          return;
        }

        const idToken = await currentUser.getIdToken();
        try {
          const res = await fetch(`${API_BASE_URL}/auth/verify-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          const data = await res.json();
          if (data.token) {
            localStorage.setItem('brainiyo_token', data.token);
          }
        } catch (err) {
          console.error("Backend auth failed", err);
        }
      } else {
        localStorage.removeItem('brainiyo_token');
      }

      setUser(currentUser);
      setLoading(false);
      
      // Basic redirect logic
      if (!currentUser && pathname !== '/login') {
        router.push('/login');
      } else if (currentUser && pathname === '/login') {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const allowedEmails = ['brainiyoofficial@gmail.com', 'shreyanshg2005@gmail.com'];
      if (!email || !allowedEmails.includes(email.toLowerCase())) {
        alert('Access denied: You do not have administrator permissions.');
        await firebaseSignOut(auth);
        throw new Error('Access denied: Unauthorized email');
      }
      const idToken = await result.user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('brainiyo_token', data.token);
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
