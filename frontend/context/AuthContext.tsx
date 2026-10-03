import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { loginUser, registerUser, setAuthTokenGetter, setBaseUrl } from '@derma/api-client-react';

const API_BASE = 'http://192.168.68.52:3000'; // Updated to your PC's local IP
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
  const [user, setUser] = useState<User | null>({ id: '65d8f74a9b23c4a2a1b9e5c1', name: 'Test User', email: 'test@email.com' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // BYPASS AUTH FOR TESTING
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