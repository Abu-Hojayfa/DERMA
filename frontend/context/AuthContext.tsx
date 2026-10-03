import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { loginUser, registerUser, setAuthTokenGetter, setBaseUrl } from '@derma/api-client-react';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
setBaseUrl(API_BASE);

setAuthTokenGetter(async () => {
  return await AsyncStorage.getItem('@derma-check/token');
});

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (name: string, email: string, password?: string) => Promise<void>;
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
      signIn: async (email, password = 'password123') => {
        const response = await loginUser({ email, password });
        setUser(response.user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        await AsyncStorage.setItem('@derma-check/token', response.token);
      },
      signUp: async (name, email, password = 'password123') => {
        const response = await registerUser({ name, email, password });
        setUser(response.user);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        await AsyncStorage.setItem('@derma-check/token', response.token);
      },
      signOut: async () => {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem('@derma-check/token');
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