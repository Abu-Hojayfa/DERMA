import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCreateSpot, useScanSpot } from '@derma/api-client-react';

export default function ScanScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const createSpotMutation = useCreateSpot();
  const scanSpotMutation = useScanSpot();

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "DermaCheck needs camera access to take a photo of your skin concern.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "DermaCheck needs gallery access to select a photo of your skin concern.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsScanning(true);
    try {
      const spot = await createSpotMutation.mutateAsync({ data: { label: "New Scan", bodyRegion: "Unknown" } });
      await scanSpotMutation.mutateAsync({ id: spot.id, data: { base64Image: imageBase64 } });
      Alert.alert("Analysis Complete", "Check your history for the results!");
      setImageUri(null);
      setImageBase64(null);
    } catch (e) {
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }}>
        <View style={styles.content}>
          <ScreenHeader title="Skin screening" subtitle="A calm first step for your concern" />
          <Text style={styles.description}>Upload a clear photo of the skin concern you want to check.</Text>
          
          <View style={styles.uploadCard}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <Pressable onPress={handleAnalyze} disabled={isScanning} style={({ pressed }) => [styles.primaryButton, (pressed || isScanning) && styles.buttonPressed, { marginTop: 20 }]}>
                  <Feather name="check" size={17} color={colors.primaryForeground} />
                  <Text style={styles.primaryText}>{isScanning ? "Analyzing..." : "Analyze Image"}</Text>
                </Pressable>
                <Pressable onPress={() => { setImageUri(null); setImageBase64(null); }} disabled={isScanning} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed, { marginTop: 10 }]}>
                  <Feather name="x" size={17} color={colors.primary} />
                  <Text style={styles.secondaryText}>Clear Selection</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}><Feather name="image" size={30} color={colors.primary} /></View>
                <Text style={styles.uploadTitle}>Add a photo</Text>
                <Text style={styles.uploadText}>Choose a well-lit photo so you can keep the concern clearly in view.</Text>
                <Pressable onPress={takePhoto} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}><Feather name="camera" size={17} color={colors.primaryForeground} /><Text style={styles.primaryText}>Take photo</Text></Pressable>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}><Feather name="image" size={17} color={colors.primary} /><Text style={styles.secondaryText}>Choose from gallery</Text></Pressable>
              </>
            )}
          </View>

          <View style={styles.tip}><View style={styles.tipIcon}><Feather name="sun" size={16} color={colors.warning} /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>Tip for a clearer screening</Text><Text style={styles.tipText}>Use good lighting and keep the skin area clearly visible.</Text></View></View>
          <View style={styles.disclaimer}><Feather name="info" size={16} color={colors.primary} /><Text style={styles.disclaimerText}>DermaCheck is a screening assistant, not a replacement for professional medical advice.</Text></View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 22 },
  description: { marginTop: 30, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  uploadCard: { marginTop: 24, padding: 24, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  uploadIcon: { width: 74, height: 74, borderRadius: 26, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { marginTop: 17, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 },
  uploadText: { maxWidth: 250, marginTop: 7, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  primaryButton: { width: '100%', height: 50, marginTop: 24, borderRadius: 15, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 13 },
  secondaryButton: { width: '100%', height: 50, marginTop: 10, borderRadius: 15, backgroundColor: colors.tealWash, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  secondaryText: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 13 },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  tip: { marginTop: 14, padding: 15, borderRadius: 18, backgroundColor: colors.warningWash, flexDirection: 'row', gap: 10 },
  tipIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1 },
  tipTitle: { color: '#92400E', fontFamily: 'Inter_700Bold', fontSize: 12 },
  tipText: { marginTop: 4, color: '#A16207', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  disclaimer: { marginTop: 25, paddingHorizontal: 3, flexDirection: 'row', gap: 8 },
  disclaimerText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  previewImage: { width: 250, height: 250, borderRadius: 20 },
});