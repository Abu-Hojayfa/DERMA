import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/hooks/useColors';

type Message = { id: string; role: 'assistant' | 'user'; text: string };

const starterMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi, I’m here to help you understand common skin-care questions. What would you like to know?',
};

function getLocalReply(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes('dry') || lower.includes('itch')) {
    return 'For dry or itchy skin, try a fragrance-free moisturizer, keep showers lukewarm, and avoid harsh scrubs. If it is persistent, painful, or spreading, consider speaking with a dermatologist.';
  }
  if (lower.includes('sun') || lower.includes('sunscreen')) {
    return 'A broad-spectrum SPF 30 or higher is a good everyday habit. Reapply when spending extended time outdoors, and add shade or protective clothing when possible.';
  }
  if (lower.includes('mole') || lower.includes('spot') || lower.includes('change')) {
    return 'Take note of changes in size, shape, color, bleeding, or persistent irritation. A qualified dermatologist can assess anything that looks new or different.';
  }
  if (lower.includes('acne') || lower.includes('breakout')) {
    return 'A gentle cleanser and non-comedogenic moisturizer can be a simple starting point. Avoid picking at spots, and consider professional advice if breakouts are painful or persistent.';
  }
  return 'I can share general skin-care information and help you think about next steps. I can’t diagnose conditions, so please consult a qualified dermatologist for a personal assessment.';
}

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const palette = useColors();
  const styles = createStyles(palette);
  const [messages, setMessages] = useState<Message[]>([starterMessage]);
  const [draft, setDraft] = useState('');

  const suggestions = useMemo(() => ['My skin feels dry', 'How can I protect my skin from sun?', 'I noticed a new spot'], []);

  function sendMessage(value = draft) {
    const text = value.trim();
    if (!text) return;
    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    const assistantMessage: Message = { id: `${Date.now()}-assistant`, role: 'assistant', text: getLocalReply(text) };
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboard} behavior="padding" keyboardVerticalOffset={0}>
        <View style={[styles.headerWrap, { paddingTop: insets.top + 18 }]}>
          <ScreenHeader title="Skin assistant" subtitle="General guidance for your next step" onBack={() => router.back()} />
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.role === 'user' && styles.userRow]}>
              {item.role === 'assistant' ? <View style={styles.assistantAvatar}><Feather name="message-circle" size={16} color={palette.primary} /></View> : null}
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.text}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.suggestionArea}>
              <Text style={styles.suggestionLabel}>Try asking</Text>
              <View style={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <Pressable key={suggestion} onPress={() => sendMessage(suggestion)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
        />
        <View style={[styles.composerArea, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              placeholder="Ask a skin-care question..."
              placeholderTextColor={palette.mutedForeground}
              style={styles.composerInput}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={() => sendMessage()} disabled={!draft.trim()} style={({ pressed }) => [styles.sendButton, !draft.trim() && styles.sendDisabled, pressed && styles.pressed]}>
              <Feather name="arrow-up" size={18} color={palette.primaryForeground} />
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>For general information only. This assistant does not diagnose or replace medical advice.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },
    keyboard: { flex: 1 },
    headerWrap: { paddingHorizontal: 22, paddingBottom: 14 },
    list: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 18 },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
    userRow: { justifyContent: 'flex-end' },
    assistantAvatar: { width: 29, height: 29, borderRadius: 11, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
    bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 17 },
    assistantBubble: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderBottomLeftRadius: 5 },
    userBubble: { backgroundColor: palette.primary, borderBottomRightRadius: 5 },
    messageText: { color: palette.foreground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
    userMessageText: { color: palette.primaryForeground },
    suggestionArea: { marginTop: 9 },
    suggestionLabel: { marginBottom: 9, color: palette.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
    suggestions: { gap: 8 },
    suggestion: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 13, backgroundColor: palette.tealWash, borderWidth: 1, borderColor: palette.tealBorder },
    suggestionText: { color: palette.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
    composerArea: { paddingHorizontal: 18, paddingTop: 10, backgroundColor: palette.background },
    composer: { minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: palette.input, backgroundColor: palette.card, paddingLeft: 16, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
    composerInput: { flex: 1, minHeight: 46, color: palette.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 },
    sendButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
    sendDisabled: { opacity: 0.38 },
    disclaimer: { marginTop: 7, color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'center' },
    pressed: { opacity: 0.7 },
  });
}