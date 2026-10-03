import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

export type ThemeMode = 'light' | 'dark';
type ThemeContextValue = {
  mode: ThemeMode;
  palette: typeof colors.light;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
};

const STORAGE_KEY = '@derma-check/theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemMode = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(systemMode === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setModeState(saved);
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette: colors[mode],
      setMode: async (nextMode) => {
        setModeState(nextMode);
        await AsyncStorage.setItem(STORAGE_KEY, nextMode);
      },
      toggleMode: async () => {
        const nextMode = mode === 'light' ? 'dark' : 'light';
        setModeState(nextMode);
        await AsyncStorage.setItem(STORAGE_KEY, nextMode);
      },
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}