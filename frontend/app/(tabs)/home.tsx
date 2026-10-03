import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const activity = [
  { title: 'Left arm spot', detail: 'Screened 2 days ago', icon: 'circle' as const, tone: 'mint' },
  { title: 'Small mole', detail: 'Screened 1 week ago', icon: 'crosshair' as const, tone: 'sand' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'there';

  function openScan() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/scan');
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 98 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {firstName}</Text>
            <Text style={styles.subtitle}>How can we help you today?</Text>
          </View>
          <Pressable onPress={() => router.push('/profile')} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <View style={styles.pill}><View style={styles.pillDot} /><Text style={styles.pillText}>Skin screening</Text></View>
            <Text style={styles.heroTitle}>Check a skin concern</Text>
            <Text style={styles.heroDescription}>Take or upload a photo to get helpful screening information about what to consider next.</Text>
            <Pressable onPress={openScan} style={({ pressed }) => [styles.heroButton, pressed && styles.buttonPressed]}>
              <Text style={styles.heroButtonText}>Start screening</Text>
              <Feather name="arrow-up-right" size={17} color={colors.light.primary} />
            </Pressable>
          </View>
          <View style={styles.heroArt}>
            <View style={styles.artRing}><View style={styles.artDot}><Feather name="check" size={28} color={colors.light.primaryForeground} strokeWidth={3} /></View></View>
            <View style={styles.artSparkOne} />
            <View style={styles.artSparkTwo} />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}><Feather name="shield" size={17} color={colors.light.primary} /></View>
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>A helpful next step, not a diagnosis</Text>
            <Text style={styles.infoText}>DermaCheck provides screening information, not a medical diagnosis. If you are concerned about a skin change, consult a qualified dermatologist.</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable onPress={() => router.push('/history')}><Text style={styles.viewAll}>View all history <Text style={styles.arrow}>→</Text></Text></Pressable>
        </View>
        <View style={styles.activityList}>
          {activity.map((item) => (
            <Pressable key={item.title} onPress={() => router.push('/history')} style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}>
              <View style={[styles.activityIcon, item.tone === 'sand' && styles.activityIconSand]}><Feather name={item.icon} size={17} color={item.tone === 'sand' ? colors.light.warning : colors.light.primary} /></View>
              <View style={styles.activityCopy}><Text style={styles.activityTitle}>{item.title}</Text><Text style={styles.activityDetail}>{item.detail}</Text></View>
              <Feather name="chevron-right" size={18} color={colors.light.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.quickTitle]}>Quick actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction icon="camera" label="New screening" tone="primary" onPress={openScan} />
          <QuickAction icon="clock" label="My history" onPress={() => router.push('/history')} />
          <QuickAction icon="message-circle" label="Ask assistant" onPress={() => router.push('/assistant')} />
          <QuickAction icon="user" label="Profile" onPress={() => router.push('/profile')} />
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({ icon, label, tone, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; tone?: 'primary'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}>
      <View style={[styles.quickIcon, tone === 'primary' && styles.quickIconPrimary]}><Feather name={icon} size={18} color={tone === 'primary' ? colors.light.primaryForeground : colors.light.primary} /></View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Feather name="arrow-up-right" size={15} color={colors.light.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  header: { paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  greeting: { color: colors.light.foreground, fontFamily: 'Inter_700Bold', fontSize: 22, letterSpacing: -0.5 },
  subtitle: { marginTop: 5, color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 },
  avatar: { width: 43, height: 43, borderRadius: 16, backgroundColor: colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.light.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 16 },
  heroCard: { minHeight: 260, marginHorizontal: 18, padding: 24, borderRadius: 28, backgroundColor: colors.light.primary, overflow: 'hidden', flexDirection: 'row', shadowColor: colors.light.primary, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  heroCopy: { flex: 1, zIndex: 1 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.16)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.light.tealBorder },
  pillText: { color: colors.light.secondary, fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  heroTitle: { maxWidth: 195, marginTop: 17, color: colors.light.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.7 },
  heroDescription: { maxWidth: 205, marginTop: 9, color: colors.light.secondary, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18 },
  heroButton: { alignSelf: 'flex-start', marginTop: 20, paddingHorizontal: 14, height: 39, borderRadius: 12, backgroundColor: colors.light.primaryForeground, flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroButtonText: { color: colors.light.primary, fontFamily: 'Inter_700Bold', fontSize: 12 },
  heroArt: { position: 'absolute', right: -17, top: 40, width: 152, height: 152, alignItems: 'center', justifyContent: 'center' },
  artRing: { width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: 'rgba(204,251,241,0.35)', alignItems: 'center', justifyContent: 'center' },
  artDot: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.light.accent, alignItems: 'center', justifyContent: 'center' },
  artSparkOne: { position: 'absolute', top: 6, right: 34, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.light.tealBorder },
  artSparkTwo: { position: 'absolute', bottom: 20, left: 3, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.light.accent },
  infoCard: { marginHorizontal: 18, marginTop: 16, padding: 17, borderRadius: 20, backgroundColor: colors.light.tealWash, borderWidth: 1, borderColor: colors.light.tealBorder, flexDirection: 'row', gap: 11 },
  infoIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.light.secondary, alignItems: 'center', justifyContent: 'center' },
  infoCopy: { flex: 1 },
  infoTitle: { color: colors.light.secondaryForeground, fontFamily: 'Inter_700Bold', fontSize: 12 },
  infoText: { marginTop: 4, color: colors.light.secondaryForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  sectionHeader: { marginHorizontal: 22, marginTop: 28, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.light.foreground, fontFamily: 'Inter_700Bold', fontSize: 17, letterSpacing: -0.3 },
  viewAll: { color: colors.light.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  arrow: { fontSize: 16 },
  activityList: { marginHorizontal: 18, borderRadius: 20, paddingHorizontal: 15, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  activityRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.light.border, gap: 12 },
  activityIcon: { width: 35, height: 35, borderRadius: 12, backgroundColor: colors.light.secondary, alignItems: 'center', justifyContent: 'center' },
  activityIconSand: { backgroundColor: colors.light.warningWash },
  activityCopy: { flex: 1 },
  activityTitle: { color: colors.light.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  activityDetail: { marginTop: 3, color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 },
  quickTitle: { marginHorizontal: 22, marginTop: 27, marginBottom: 12 },
  quickGrid: { marginHorizontal: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '48%', minHeight: 96, padding: 14, borderRadius: 20, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  quickIcon: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.light.tealWash, alignItems: 'center', justifyContent: 'center' },
  quickIconPrimary: { backgroundColor: colors.light.primary },
  quickLabel: { marginTop: 12, color: colors.light.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pressed: { opacity: 0.7 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});