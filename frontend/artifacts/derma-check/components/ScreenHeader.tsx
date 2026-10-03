import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  const palette = useColors();
  const styles = createStyles(palette);
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={20} color={palette.foreground} />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useColors>) {
  return StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  copy: { flex: 1 },
  title: {
    color: palette.foreground,
    fontFamily: 'Inter_700Bold',
    fontSize: 27,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 4,
    color: palette.mutedForeground,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  });
}