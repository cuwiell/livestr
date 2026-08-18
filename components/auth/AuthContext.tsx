'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // If user is null but we are in dev mode without keys, force a mock user
        if (!user && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
          setUser({ uid: 'mock-user-123', email: 'dev@test.com', displayName: 'Mock User' } as User);
        } else {
          setUser(user);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Firebase auth error, falling back to mock user', error);
        setUser({ uid: 'mock-user-123', email: 'dev@test.com', displayName: 'Mock User' } as User);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.warn('Firebase not configured, using mock user', error);
      setUser({ uid: 'mock-user-123', email: 'dev@test.com', displayName: 'Mock User' } as User);
      setLoading(false);
    }
  }, []);

  // Check if firebase config exists (only available on client if NEXT_PUBLIC is set)
  const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
