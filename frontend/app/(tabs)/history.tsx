import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 26, paddingBottom: insets.bottom + 100 }}>
        <View style={styles.header}><ScreenHeader title="My history" subtitle="Your past screening activity" onBack={() => router.back()} /></View>
        <View style={styles.summary}><View style={styles.summaryIcon}><Feather name="activity" size={20} color={colors.primary} /></View><View><Text style={styles.summaryNumber}>2</Text><Text style={styles.summaryLabel}>screenings completed</Text></View></View>
        <Text style={styles.sectionTitle}>Recent screenings</Text>
        <HistoryRow title="Left arm spot" date="Screened 2 days ago" tone="mint" />
        <HistoryRow title="Small mole" date="Screened 1 week ago" tone="sand" />
        <View style={styles.note}><Feather name="lock" size={15} color={colors.primary} /><Text style={styles.noteText}>Your screening history stays private on this device for now.</Text></View>
      </ScrollView>
    </View>
  );
}

function HistoryRow({ title, date, tone }: { title: string; date: string; tone: 'mint' | 'sand' }) {
  const colors = useColors();
  const styles = getStyles(colors);
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, tone === 'sand' && styles.rowIconSand]}><Feather name={tone === 'sand' ? 'crosshair' : 'circle'} size={18} color={tone === 'sand' ? colors.warning : colors.primary} /></View>
      <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDate}>{date}</Text></View>
      <View style={styles.status}><Text style={styles.statusText}>Screened</Text><Feather name="chevron-right" size={15} color={colors.primary} /></View>
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 22, marginBottom: 25 },
  title: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7 },
  subtitle: { marginTop: 6, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 },
  summary: { marginHorizontal: 18, marginBottom: 29, padding: 18, borderRadius: 20, backgroundColor: colors.tealWash, borderWidth: 1, borderColor: colors.tealBorder, flexDirection: 'row', alignItems: 'center', gap: 13 },
  summaryIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  summaryNumber: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 },
  summaryLabel: { marginTop: 2, color: colors.secondaryForeground, fontFamily: 'Inter_400Regular', fontSize: 12 },
  sectionTitle: { marginHorizontal: 22, marginBottom: 12, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 },
  row: { minHeight: 77, marginHorizontal: 18, marginBottom: 9, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  rowIconSand: { backgroundColor: colors.warningWash },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  rowDate: { marginTop: 4, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  note: { margin: 23, padding: 15, borderRadius: 16, backgroundColor: colors.card, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  noteText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.7 },
});