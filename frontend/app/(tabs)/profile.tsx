import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/context/ThemeContext';

export default function ProfileScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { mode, toggleMode } = useTheme();
  const name = user?.name || 'Your profile';
  async function logout() {
    await signOut();
    router.replace('/');
  }
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 25, paddingBottom: insets.bottom + 100 }}>
        <ScreenHeader title="Profile" subtitle="Your account and privacy" onBack={() => router.back()} />
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 1).toUpperCase()}</Text></View>
          <View style={styles.profileCopy}><Text style={styles.name}>{name}</Text><Text style={styles.email}>{user?.email || 'Screening assistant member'}</Text></View>
          <Pressable style={({ pressed }) => [styles.editButton, pressed && styles.pressed]} onPress={() => Alert.alert('Profile editing', 'Profile details can be updated when account sync is connected.')}><Feather name="edit-2" size={15} color={colors.primary} /></Pressable>
        </View>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Pressable onPress={() => toggleMode()} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.rowIcon}><Feather name={mode === 'dark' ? 'moon' : 'sun'} size={17} color={colors.primary} /></View>
          <View style={styles.rowCopy}><Text style={styles.rowLabel}>Appearance</Text><Text style={styles.rowDetail}>{mode === 'dark' ? 'Dark mode' : 'Light mode'}</Text></View>
          <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
        </Pressable>
        <ProfileRow icon="bell" label="Notifications" detail="Stay up to date" />
        <ProfileRow icon="lock" label="Privacy & data" detail="On-device for now" />
        <ProfileRow icon="help-circle" label="Help center" detail="Learn about DermaCheck" />
        <Text style={styles.sectionTitle}>About DermaCheck</Text>
        <View style={styles.aboutCard}><View style={styles.aboutIcon}><Feather name="heart" size={17} color={colors.primary} /></View><View style={styles.aboutCopy}><Text style={styles.aboutTitle}>Screening with care</Text><Text style={styles.aboutText}>DermaCheck helps you understand what to consider next. It does not provide medical diagnoses.</Text></View></View>
        <Pressable onPress={logout} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}><Feather name="log-out" size={17} color={colors.destructive} /><Text style={styles.logoutText}>Log out</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function ProfileRow({ icon, label, detail }: { icon: keyof typeof Feather.glyphMap; label: string; detail: string }) {
  const colors = useColors();
  const styles = getStyles(colors);
  return <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={styles.rowIcon}><Feather name={icon} size={17} color={colors.primary} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowDetail}>{detail}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></Pressable>;
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { marginHorizontal: 22, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7 },
  subtitle: { marginHorizontal: 22, marginTop: 6, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 },
  profileCard: { margin: 24, marginBottom: 29, padding: 16, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 51, height: 51, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 19 },
  profileCopy: { flex: 1, marginLeft: 13 },
  name: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 },
  email: { marginTop: 4, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 },
  editButton: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.tealWash, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { marginHorizontal: 22, marginBottom: 12, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 },
  row: { minHeight: 68, marginHorizontal: 18, marginBottom: 9, paddingHorizontal: 14, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.tealWash, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowLabel: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  rowDetail: { marginTop: 3, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 },
  aboutCard: { marginHorizontal: 18, padding: 16, borderRadius: 18, backgroundColor: colors.tealWash, borderWidth: 1, borderColor: colors.tealBorder, flexDirection: 'row', gap: 11 },
  aboutIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  aboutCopy: { flex: 1 },
  aboutTitle: { color: colors.secondaryForeground, fontFamily: 'Inter_700Bold', fontSize: 12 },
  aboutText: { marginTop: 4, color: colors.secondaryForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  logout: { marginHorizontal: 22, marginTop: 29, height: 48, borderRadius: 15, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: colors.destructive, fontFamily: 'Inter_700Bold', fontSize: 13 },
  pressed: { opacity: 0.7 },
});