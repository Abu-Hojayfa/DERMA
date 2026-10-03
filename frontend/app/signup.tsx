import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function SignupScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@email.com');
  const [password, setPassword] = useState('1234');
  const [confirm, setConfirm] = useState('1234');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const errors = {
    name: submitted && !name.trim() ? 'Your name is required' : '',
    email: submitted && !email.trim() ? 'Email is required' : submitted && !emailValid ? 'Enter a valid email address' : '',
    password: submitted && password.length < 4 ? 'Use at least 4 characters' : '',
    confirm: submitted && confirm !== password ? 'Passwords do not match' : '',
    agreed: submitted && !agreed ? 'Please acknowledge this before continuing' : '',
  };

  async function handleSignup() {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean) || !name.trim() || !emailValid || password.length < 4 || confirm !== password || !agreed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await signUp(name.trim(), email.trim().toLowerCase());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/home');
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 26 }]}
      bottomOffset={24}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader title="Create account" subtitle="Start your skin health journey" onBack={() => router.back()} />
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <View style={[styles.inputShell, focusedField === 'name' && styles.inputFocused, errors.name && styles.inputError]}>
            <Feather name="user" size={18} color={focusedField === 'name' ? colors.primary : colors.mutedForeground} />
            <TextInput value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} placeholder="Alex Morgan" placeholderTextColor={colors.mutedForeground} style={styles.input} />
          </View>
          {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address</Text>
          <View style={[styles.inputShell, focusedField === 'email' && styles.inputFocused, errors.email && styles.inputError]}>
            <Feather name="mail" size={18} color={focusedField === 'email' ? colors.primary : colors.mutedForeground} />
            <TextInput value={email} onChangeText={setEmail} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={styles.input} />
          </View>
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputShell, focusedField === 'password' && styles.inputFocused, errors.password && styles.inputError]}>
            <Feather name="lock" size={18} color={focusedField === 'password' ? colors.primary : colors.mutedForeground} />
            <TextInput value={password} onChangeText={setPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} secureTextEntry placeholder="At least 4 characters" placeholderTextColor={colors.mutedForeground} style={styles.input} />
          </View>
          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <View style={[styles.inputShell, focusedField === 'confirm' && styles.inputFocused, errors.confirm && styles.inputError]}>
            <Feather name="shield" size={18} color={focusedField === 'confirm' ? colors.primary : colors.mutedForeground} />
            <TextInput value={confirm} onChangeText={setConfirm} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} secureTextEntry placeholder="Repeat your password" placeholderTextColor={colors.mutedForeground} style={styles.input} />
          </View>
          {errors.confirm ? <Text style={styles.error}>{errors.confirm}</Text> : null}
        </View>

        <Pressable onPress={() => setAgreed((value) => !value)} style={({ pressed }) => [styles.disclaimer, pressed && styles.pressed]}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}
          </View>
          <Text style={styles.disclaimerText}>I agree that DermaCheck is a screening assistant and does not provide medical diagnoses.</Text>
        </Pressable>
        {errors.agreed ? <Text style={styles.error}>{errors.agreed}</Text> : null}

        <Pressable onPress={handleSignup} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
          <Text style={styles.primaryText}>Create Account</Text>
          <Feather name="arrow-right" size={19} color={colors.primaryForeground} />
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Log in</Text></Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 26 },
  form: { marginTop: 38, paddingHorizontal: 2 },
  fieldGroup: { marginBottom: 20 },
  label: { marginBottom: 8, color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  inputShell: { height: 58, borderRadius: 17, borderWidth: 1, borderColor: colors.input, backgroundColor: colors.card, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.tealWash, shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  input: { flex: 1, height: '100%', paddingVertical: 0, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
  inputError: { borderColor: colors.destructive },
  error: { marginTop: 6, color: colors.destructive, fontFamily: 'Inter_400Regular', fontSize: 12 },
  disclaimer: { marginTop: 6, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  disclaimerText: { flex: 1, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19 },
  primaryButton: { height: 58, marginTop: 30, borderRadius: 18, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  primaryText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 15 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingTop: 34 },
  footerText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 },
  link: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 13 },
  pressed: { opacity: 0.7 },
});