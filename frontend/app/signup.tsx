import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  error?: string;
  colors: any;
  styles: any;
}

const FormField = React.forwardRef<TextInput, FormFieldProps>(
  ({ label, icon, error, colors, styles, ...props }, ref) => {
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
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

export default function SignupScreen() {
  const colors = useColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo2@email.com");
  const [password, setPassword] = useState("1234");
  const [confirm, setConfirm] = useState("1234");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const isValid =
    !!name.trim() &&
    emailValid &&
    password.length >= 4 &&
    confirm === password &&
    agreed;

  const errors = {
    name: submitted && !name.trim() ? "Your name is required" : "",
    email:
      submitted && !email.trim()
        ? "Email is required"
        : submitted && !emailValid
          ? "Enter a valid email address"
          : "",
    password:
      submitted && password.length < 4 ? "Use at least 4 characters" : "",
    confirm: submitted && confirm !== password ? "Passwords do not match" : "",
    agreed:
      submitted && !agreed ? "Please acknowledge this before continuing" : "",
  };

  async function handleSignup() {
    setSubmitted(true);
    setServerError(null);

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/home");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setServerError(e.message || "Email might already be in use.");
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 26 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets={true}
    >
      <ScreenHeader
        title="Create account"
        subtitle="Start your skin health journey"
        onBack={() => router.back()}
      />
      <View style={styles.form}>
        <FormField
          label="Full name"
          icon="user"
          value={name}
          onChangeText={setName}
          error={errors.name}
          colors={colors}
          styles={styles}
          placeholder="Alex Morgan"
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <FormField
          ref={emailRef}
          label="Email address"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          colors={colors}
          styles={styles}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <FormField
          ref={passwordRef}
          label="Password"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          colors={colors}
          styles={styles}
          secureTextEntry
          placeholder="At least 4 characters"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        <FormField
          ref={confirmRef}
          label="Confirm password"
          icon="shield"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          colors={colors}
          styles={styles}
          secureTextEntry
          placeholder="Repeat your password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleSignup}
        />

        <Pressable
          onPress={() => setAgreed((value) => !value)}
          style={({ pressed }) => [
            styles.disclaimer,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed ? (
              <Feather
                name="check"
                size={14}
                color={colors.primaryForeground}
              />
            ) : null}
          </View>
          <Text style={styles.disclaimerText}>
            I agree that DermaCheck is a screening assistant and does not
            provide medical diagnoses.
          </Text>
        </Pressable>
        {errors.agreed ? (
          <Text style={styles.error}>{errors.agreed}</Text>
        ) : null}

        {serverError ? (
          <View style={styles.serverErrorBox}>
            <Feather name="alert-circle" size={16} color={colors.destructive} />
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleSignup}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryText}>Create Account</Text>
          <Feather
            name="arrow-right"
            size={19}
            color={colors.primaryForeground}
          />
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => router.replace("/")}>
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, paddingHorizontal: 26 },
    form: { marginTop: 38, paddingHorizontal: 2 },
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
    disclaimer: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 11,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    disclaimerText: {
      flex: 1,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      lineHeight: 19,
    },
    primaryButton: {
      height: 58,
      marginTop: 30,
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
    pressed: { opacity: 0.7 },
    serverErrorBox: {
      marginTop: 15,
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
