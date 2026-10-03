import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const palette = useColors();
  const styles = createStyles(palette);
  return (
    <View style={[styles.mark, compact && styles.compact]}>
      <View style={[styles.inner, compact && styles.compactInner]}>
        <Feather name="check" size={compact ? 15 : 22} color={palette.primary} strokeWidth={3} />
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useColors>) {
  return StyleSheet.create({
  mark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compact: {
    width: 38,
    height: 38,
    borderRadius: 13,
  },
  compactInner: {
    width: 25,
    height: 25,
    borderRadius: 13,
  },
  });
}