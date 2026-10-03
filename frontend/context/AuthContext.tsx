import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (name: string, email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const STORAGE_KEY = '@derma-check/user';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value) setUser(JSON.parse(value) as User);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async (email) => {
        const nextUser = { email, name: email.split('@')[0] || 'there' };
        setUser(nextUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      },
      signUp: async (name, email) => {
        const nextUser = { email, name };
        setUser(nextUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      },
      signOut: async () => {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}