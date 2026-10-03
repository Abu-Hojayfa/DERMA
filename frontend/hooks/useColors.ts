import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 * When a sibling web artifact's dark tokens are synced into a `dark`
 * key, this hook will automatically switch palettes based on the
 * device's appearance setting.
 *
 * The returned object is memoized so its reference only changes when
 * the palette actually changes — preventing unnecessary re-renders of
 * children that receive colors as a prop.
 */
export function useColors() {
  const { palette } = useTheme();
  // Memoize so the object reference is stable across renders.
  // Without this, every keystroke causes a new object → FormField re-renders.
  return useMemo(() => ({ ...palette, radius: 18 }), [palette]);
}
