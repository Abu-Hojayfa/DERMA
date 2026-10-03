import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  error?: string;
  colors: any;
  styles: any;
  rightElement?: React.ReactNode;
}

const FormField = React.memo(
  React.forwardRef<TextInput, FormFieldProps>(
    ({ label, icon, error, colors, styles, rightElement, ...props }, ref) => {
      const [isFocused, setIsFocused] = useState(false);
      return (
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{label}</Text>
          <View
            style={[
              styles.inputShell,
              isFocused && styles.inputFocused,
              error && styles.inputError,
            ]}
          >
            <Feather
              name={icon}
              size={18}
              color={isFocused ? colors.primary : colors.mutedForeground}
            />
            <TextInput
              ref={ref}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
              {...props}
            />
            {rightElement}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      );
    },
  ),
);

function validEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim());
}

export default function LoginScreen() {
  const colors = useColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { user, isLoading, signIn, bypassLogin } = useAuth();

  const [email, setEmail] = useState("demo2@email.com");
  const [password, setPassword] = useState("1234");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace("/home");
  }, [isLoading, user]);

  const emailError =
    submitted && !email.trim()
      ? "Email is required"
      : submitted && !validEmail(email)
        ? "Enter a valid email address"
        : "";
  const passwordError = submitted && !password ? "Password is required" : "";

  async function handleLogin() {
    setSubmitted(true);
    setServerError(null);
    if (!validEmail(email) || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      await signIn(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/home");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(e.message || "Invalid credentials.");
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
    >
      <View pointerEvents="none" style={styles.decorOne} />
      <View pointerEvents="none" style={styles.decorTwo} />
      <View style={styles.brandBlock}>
        <BrandMark />
        <Text style={styles.brand}>DermaCheck</Text>
        <Text style={styles.tagline}>
          Understand your skin. Take the next step.
        </Text>
      </View>

      <View style={styles.formBlock}>
        <Text style={styles.eyebrow}>YOUR PRIVATE SKIN COMPANION</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.intro}>
          Sign in to continue your screening journey.
        </Text>

        <FormField
          label="Email address"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          colors={colors}
          styles={styles}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        <FormField
          label="Password"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          colors={colors}
          styles={styles}
          secureTextEntry={!showPassword}
          placeholder="Enter your password"
          autoComplete="password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          rightElement={
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={19}
                color={colors.mutedForeground}
              />
            </Pressable>
          }
        />

        <Pressable
          onPress={() => setSubmitted(false)}
          style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        {serverError ? (
          <View style={styles.serverErrorBox}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <Pressable
          testID="login-submit"
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryText}>Log In</Text>
          <Feather
            name="arrow-right"
            size={19}
            color={colors.primaryForeground}
          />
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          onPress={() => setSubmitted(false)}
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.googleIcon}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        {__DEV__ && (
          <Pressable
            onPress={async () => {
              await bypassLogin();
              router.replace("/home");
            }}
            style={({ pressed }) => [
              styles.googleButton,
              { marginTop: 12, borderColor: colors.primary },
              pressed && styles.buttonPressed,
            ]}
          >
            <Feather name="zap" size={18} color={colors.primary} />
            <Text style={[styles.googleText, { color: colors.primary }]}>
              Bypass Login (Dev)
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <Pressable
          onPress={() => router.push("/signup")}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.link}>Sign up</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 26 },
    decorOne: {
      position: "absolute",
      top: -60,
      right: -70,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.tealWash,
    },
    decorTwo: {
      position: "absolute",
      top: 105,
      left: -95,
      width: 190,
      height: 190,
      borderRadius: 95,
      borderWidth: 1,
      borderColor: colors.tealBorder,
    },
    brandBlock: { alignItems: "center", marginBottom: 54, paddingTop: 8 },
    brand: {
      marginTop: 15,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      letterSpacing: -0.7,
    },
    tagline: {
      marginTop: 6,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      textAlign: "center",
    },
    formBlock: { flex: 1, paddingHorizontal: 2 },
    eyebrow: {
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      fontSize: 11,
      letterSpacing: 1.15,
    },
    heading: {
      marginTop: 12,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 31,
      letterSpacing: -0.8,
    },
    intro: {
      marginTop: 7,
      marginBottom: 28,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
      lineHeight: 22,
    },
    fieldGroup: { marginBottom: 20 },
    label: {
      marginBottom: 8,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    inputShell: {
      height: 58,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.input,
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },
    inputFocused: {
      borderColor: colors.primary,
      backgroundColor: colors.tealWash,
      shadowColor: colors.primary,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    input: {
      flex: 1,
      height: "100%",
      paddingVertical: 0,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 15,
    },
    inputError: { borderColor: colors.destructive },
    error: {
      marginTop: 6,
      color: colors.destructive,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    forgot: { alignSelf: "flex-end", marginTop: -3, marginBottom: 22 },
    forgotText: {
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
    primaryButton: {
      height: 58,
      borderRadius: 18,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    primaryText: {
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
      fontSize: 15,
    },
    buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
    divider: {
      marginVertical: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    or: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    googleButton: {
      height: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    googleIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted,
    },
    googleG: { color: "#4285F4", fontFamily: "Inter_700Bold", fontSize: 14 },
    googleText: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
      paddingTop: 34,
    },
    footerText: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 13,
    },
    link: { color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 13 },
    pressed: { opacity: 0.65 },
    serverErrorBox: {
      marginTop: 5,
      marginBottom: 15,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.destructive + "15",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    serverErrorText: {
      color: colors.destructive,
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
    },
  });
