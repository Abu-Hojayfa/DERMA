/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#0F172A',
    tint: '#2563EB',
    background: '#F8FAFC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    cardForeground: '#0F172A',
    primary: '#2563EB',
    primaryForeground: '#FFFFFF',
    secondary: '#DBEAFE',
    secondaryForeground: '#1E40AF',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    accent: '#3B82F6',
    accentForeground: '#FFFFFF',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    border: '#E2E8F0',
    input: '#E2E8F0',
    tealWash: '#EFF6FF',
    tealBorder: '#BFDBFE',
    warningWash: '#FFFBEB',
    warning: '#F59E0B',
    successWash: '#F0FDFA',
  },
  dark: {
    text: '#F8FAFC',
    tint: '#60A5FA',
    background: '#0B1220',
    foreground: '#F8FAFC',
    card: '#111C2E',
    cardForeground: '#F8FAFC',
    primary: '#3B82F6',
    primaryForeground: '#FFFFFF',
    secondary: '#1E3A8A',
    secondaryForeground: '#DBEAFE',
    muted: '#182438',
    mutedForeground: '#94A3B8',
    accent: '#60A5FA',
    accentForeground: '#0B1220',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    border: '#26354B',
    input: '#334155',
    tealWash: '#10254A',
    tealBorder: '#315A9B',
    warningWash: '#332A14',
    warning: '#FBBF24',
    successWash: '#10254A',
  },
  radius: 18,
};

export default colors;
