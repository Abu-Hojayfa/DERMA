import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function LoginScreen() {
  const colors = useColors();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const { user, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState('test@email.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace('/home');
  }, [isLoading, user]);

  const emailError = submitted && !email.trim() ? 'Email is required' : submitted && !validEmail(email) ? 'Enter a valid email address' : '';
  const passwordError = submitted && !password ? 'Password is required' : '';

  async function handleLogin() {
    setSubmitted(true);
    if (!validEmail(email) || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await signIn(email.trim().toLowerCase());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/home');
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
      bottomOffset={24}
      showsVerticalScrollIndicator={false}
    >
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />
      <View style={styles.brandBlock}>
        <BrandMark />
        <Text style={styles.brand}>DermaCheck</Text>
        <Text style={styles.tagline}>Understand your skin. Take the next step.</Text>
      </View>

      <View style={styles.formBlock}>
        <Text style={styles.eyebrow}>YOUR PRIVATE SKIN COMPANION</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.intro}>Sign in to continue your screening journey.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address</Text>
          <View style={[styles.inputShell, focusedField === 'email' && styles.inputFocused, emailError && styles.inputError]}>
            <Feather name="mail" size={18} color={focusedField === 'email' ? colors.primary : colors.mutedForeground} />
            <TextInput
              testID="login-email"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
            />
          </View>
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputShell, focusedField === 'password' && styles.inputFocused, passwordError && styles.inputError]}>
            <Feather name="lock" size={18} color={focusedField === 'password' ? colors.primary : colors.mutedForeground} />
            <TextInput
              testID="login-password"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((value) => !value)}
              hitSlop={10}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSubmitted(false)}
          style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <Pressable
          testID="login-submit"
          accessibilityRole="button"
          accessibilityLabel="Log in"
          onPress={handleLogin}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryText}>Log In</Text>
          <Feather name="arrow-right" size={19} color={colors.primaryForeground} />
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSubmitted(false)}
          style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
        >
          <View style={styles.googleIcon}><Text style={styles.googleG}>G</Text></View>
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <Pressable onPress={() => router.push('/signup')} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 26 },
  decorOne: { position: 'absolute', top: -60, right: -70, width: 220, height: 220, borderRadius: 110, backgroundColor: colors.tealWash },
  decorTwo: { position: 'absolute', top: 105, left: -95, width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: colors.tealBorder },
  brandBlock: { alignItems: 'center', marginBottom: 54, paddingTop: 8 },
  brand: { marginTop: 15, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7 },
  tagline: { marginTop: 6, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center' },
  formBlock: { flex: 1, paddingHorizontal: 2 },
  eyebrow: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.15 },
  heading: { marginTop: 12, color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -0.8 },
  intro: { marginTop: 7, marginBottom: 28, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 22 },
  fieldGroup: { marginBottom: 20 },
  label: { marginBottom: 8, color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  inputShell: { height: 58, borderRadius: 17, borderWidth: 1, borderColor: colors.input, backgroundColor: colors.card, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.tealWash, shadowColor: colors.primary, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  input: { flex: 1, height: '100%', paddingVertical: 0, color: colors.foreground, fontFamily: 'Inter_400Regular', fontSize: 15 },
  inputError: { borderColor: colors.destructive },
  error: { marginTop: 6, color: colors.destructive, fontFamily: 'Inter_400Regular', fontSize: 12 },
  forgot: { alignSelf: 'flex-end', marginTop: -3, marginBottom: 22 },
  forgotText: { color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  primaryButton: { height: 58, borderRadius: 18, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  primaryText: { color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 15 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  divider: { marginVertical: 24, flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 },
  googleButton: { height: 54, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted },
  googleG: { color: '#4285F4', fontFamily: 'Inter_700Bold', fontSize: 14 },
  googleText: { color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingTop: 34 },
  footerText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 },
  link: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 13 },
  pressed: { opacity: 0.65 },
});