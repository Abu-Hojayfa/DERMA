import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const placeholder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Preview mode', 'Photo capture is not enabled in this preview yet.');
  };
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}>
        <View style={styles.content}>
          <ScreenHeader title="Skin screening" subtitle="A calm first step for your concern" />
          <Text style={styles.description}>Upload a clear photo of the skin concern you want to check.</Text>
          <View style={styles.uploadCard}>
            <View style={styles.uploadIcon}><Feather name="image" size={30} color={colors.light.primary} /></View>
            <Text style={styles.uploadTitle}>Add a photo</Text>
            <Text style={styles.uploadText}>Choose a well-lit photo so you can keep the concern clearly in view.</Text>
            <Pressable onPress={placeholder} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}><Feather name="camera" size={17} color={colors.light.primaryForeground} /><Text style={styles.primaryText}>Take photo</Text></Pressable>
            <Pressable onPress={placeholder} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}><Feather name="image" size={17} color={colors.light.primary} /><Text style={styles.secondaryText}>Choose from gallery</Text></Pressable>
          </View>
          <View style={styles.tip}><View style={styles.tipIcon}><Feather name="sun" size={16} color={colors.light.warning} /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>Tip for a clearer screening</Text><Text style={styles.tipText}>Use good lighting and keep the skin area clearly visible.</Text></View></View>
          <View style={styles.disclaimer}><Feather name="info" size={16} color={colors.light.primary} /><Text style={styles.disclaimerText}>DermaCheck is a screening assistant, not a replacement for professional medical advice.</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingHorizontal: 22 },
  description: { marginTop: 30, color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  uploadCard: { marginTop: 24, padding: 24, borderRadius: 24, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, alignItems: 'center' },
  uploadIcon: { width: 74, height: 74, borderRadius: 26, backgroundColor: colors.light.secondary, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { marginTop: 17, color: colors.light.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 },
  uploadText: { maxWidth: 250, marginTop: 7, color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  primaryButton: { width: '100%', height: 50, marginTop: 24, borderRadius: 15, backgroundColor: colors.light.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { color: colors.light.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 13 },
  secondaryButton: { width: '100%', height: 50, marginTop: 10, borderRadius: 15, backgroundColor: colors.light.tealWash, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  secondaryText: { color: colors.light.primary, fontFamily: 'Inter_700Bold', fontSize: 13 },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  tip: { marginTop: 14, padding: 15, borderRadius: 18, backgroundColor: colors.light.warningWash, flexDirection: 'row', gap: 10 },
  tipIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { color: '#92400E', fontFamily: 'Inter_700Bold', fontSize: 12 },
  tipText: { marginTop: 4, color: '#A16207', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  disclaimer: { marginTop: 25, paddingHorizontal: 3, flexDirection: 'row', gap: 8 },
  disclaimerText: { flex: 1, color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
});