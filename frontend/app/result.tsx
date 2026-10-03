import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useColors } from '@/hooks/useColors';
import { ScreenHeader } from '@/components/ScreenHeader';

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = 'mild' | 'moderate' | 'severe';
type Urgency = 'low' | 'medium' | 'high';
type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };

interface ScanResult {
  photoEntry: { concernType: string; severity: Severity; confidence: number; imageUrl?: string };
  careCard: { generatedText: string; routineSteps: string[]; ingredients: string[]; urgencyLevel: Urgency };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_KEY ?? '';

const SEVERITY_COLOR: Record<Severity, string> = {
  mild: '#22c55e',
  moderate: '#f59e0b',
  severe: '#ef4444',
};
const URGENCY_LABEL: Record<Urgency, string> = {
  low: 'Routine care',
  medium: 'Monitor closely',
  high: 'See a professional',
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: Severity }) {
  const color = SEVERITY_COLOR[severity] ?? '#94a3b8';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color, fontFamily: 'Inter_600SemiBold', fontSize: 12, textTransform: 'capitalize' }}>
        {severity}
      </Text>
    </View>
  );
}

function Chip({ text, icon }: { text: string; icon?: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: colors.tealWash, borderWidth: 1, borderColor: colors.tealBorder }}>
      {icon ? <Feather name={icon} size={12} color={colors.primary} /> : null}
      <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>{text}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResultScreen() {
  const colors = useColors();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ imageUri: string; result: string }>();
  const flatListRef = useRef<FlatList>(null);

  const scanResult: ScanResult | null = useMemo(() => {
    try { return params.result ? JSON.parse(params.result) : null; } catch { return null; }
  }, [params.result]);

  // ── Chat state ──────────────────────────────────────────────────────────────
  const systemPrompt = useMemo(() => scanResult ? [
    'You are DermaCheck, a friendly cosmetic skin-care assistant (NOT a medical device).',
    `The user just had their skin screened. Results: concern type = "${scanResult.photoEntry.concernType}", severity = "${scanResult.photoEntry.severity}".`,
    `Care card: ${scanResult.careCard.generatedText}`,
    'Answer follow-up questions warmly and conversationally. Always add a short disclaimer that this is cosmetic guidance only.',
  ].join(' ') : 'You are a friendly skin-care assistant.', [scanResult]);

  const welcomeMessage: ChatMessage = useMemo(() => ({
    id: 'welcome',
    role: 'assistant',
    text: scanResult
      ? `Your skin was screened 🌿\n\n**${scanResult.photoEntry.concernType}** — ${scanResult.photoEntry.severity} severity.\n\n${scanResult.careCard.generatedText}\n\nFeel free to ask me anything about this result!`
      : "Your scan results are ready. Ask me anything!",
  }), [scanResult]);

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? draft).trim();
    if (!msg) return;
    const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    setIsTyping(true);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const body = {
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: msg },
        ],
      };
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify(body),
      });
      const data = await res.json() as any;
      const reply = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't get a response. Please try again.";
      const aiMsg: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', text: reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const aiMsg: ChatMessage = { id: `${Date.now()}-a`, role: 'assistant', text: "I'm having trouble connecting. Please check your internet and try again." };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [draft, messages, systemPrompt]);

  if (!scanResult) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>No result data found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const { photoEntry, careCard } = scanResult;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={0}>
        {/* Header */}
        <View style={[styles.headerWrap, { paddingTop: insets.top + 14 }]}>
          <ScreenHeader
            title="Your result"
            subtitle="Powered by Gemini AI"
            onBack={() => router.replace('/(tabs)/scan')}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Image preview */}
              {params.imageUri ? (
                <Image source={{ uri: params.imageUri }} style={styles.previewImage} resizeMode="cover" />
              ) : null}

              {/* Result card */}
              <View style={styles.resultCard}>
                <View style={styles.resultCardHeader}>
                  <View style={styles.resultIconWrap}>
                    <Feather name="activity" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.concernType}>{photoEntry.concernType}</Text>
                    <SeverityBadge severity={photoEntry.severity} />
                  </View>
                  <View style={styles.urgencyBadge}>
                    <Feather
                      name={careCard.urgencyLevel === 'high' ? 'alert-triangle' : careCard.urgencyLevel === 'medium' ? 'eye' : 'check-circle'}
                      size={13}
                      color={careCard.urgencyLevel === 'high' ? '#ef4444' : careCard.urgencyLevel === 'medium' ? '#f59e0b' : '#22c55e'}
                    />
                    <Text style={[styles.urgencyText, { color: careCard.urgencyLevel === 'high' ? '#ef4444' : careCard.urgencyLevel === 'medium' ? '#f59e0b' : '#22c55e' }]}>
                      {URGENCY_LABEL[careCard.urgencyLevel]}
                    </Text>
                  </View>
                </View>

                {/* Routine steps */}
                {careCard.routineSteps.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suggested routine</Text>
                    {careCard.routineSteps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Ingredients */}
                {careCard.ingredients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Helpful ingredients</Text>
                    <View style={styles.chips}>
                      {careCard.ingredients.map((ing, i) => (
                        <Chip key={i} text={ing} icon="droplet" />
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.disclaimer}>
                  <Feather name="info" size={13} color={colors.mutedForeground} />
                  <Text style={styles.disclaimerText}>This is cosmetic guidance only — not a medical diagnosis. Consult a dermatologist for personal advice.</Text>
                </View>
              </View>

              {/* Chat section header */}
              <View style={styles.chatHeader}>
                <Feather name="message-circle" size={16} color={colors.primary} />
                <Text style={styles.chatHeaderText}>Ask your AI assistant</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.role === 'user' && styles.userRow]}>
              {item.role === 'assistant' && (
                <View style={styles.avatar}><Feather name="message-circle" size={14} color={colors.primary} /></View>
              )}
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText]}>{item.text}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.messageRow}>
                <View style={styles.avatar}><Feather name="message-circle" size={14} color={colors.primary} /></View>
                <View style={[styles.bubble, styles.aiBubble]}>
                  <Text style={styles.bubbleText}>Thinking…</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Composer */}
        <View style={[styles.composerWrap, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              placeholder="Ask about your result…"
              placeholderTextColor={colors.mutedForeground}
              style={styles.composerInput}
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={!draft.trim() || isTyping}
              style={({ pressed }) => [styles.sendBtn, (!draft.trim() || isTyping) && styles.sendDisabled, pressed && { opacity: 0.75 }]}
            >
              <Feather name="arrow-up" size={18} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (c: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  headerWrap: { paddingHorizontal: 22, paddingBottom: 12 },
  listContent: { paddingHorizontal: 18, paddingBottom: 16 },
  previewImage: { width: '100%', height: 220, borderRadius: 20, marginBottom: 16 },
  resultCard: { backgroundColor: c.card, borderRadius: 22, borderWidth: 1, borderColor: c.border, padding: 18, marginBottom: 20 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  resultIconWrap: { width: 44, height: 44, borderRadius: 16, backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center' },
  concernType: { color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 17, marginBottom: 5 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: c.muted },
  urgencyText: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  section: { marginTop: 16 },
  sectionTitle: { color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 13, marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNum: { width: 22, height: 22, borderRadius: 8, backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: c.primary, fontFamily: 'Inter_700Bold', fontSize: 11 },
  stepText: { flex: 1, color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  disclaimer: { marginTop: 16, flexDirection: 'row', gap: 7, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, color: c.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  chatHeaderText: { color: c.foreground, fontFamily: 'Inter_700Bold', fontSize: 15 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  userRow: { justifyContent: 'flex-end' },
  avatar: { width: 28, height: 28, borderRadius: 10, backgroundColor: c.secondary, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
  aiBubble: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: c.primary, borderBottomRightRadius: 4 },
  bubbleText: { color: c.foreground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  userBubbleText: { color: c.primaryForeground },
  composerWrap: { paddingHorizontal: 18, paddingTop: 10, backgroundColor: c.background, borderTopWidth: 1, borderTopColor: c.border },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, borderRadius: 17, borderWidth: 1, borderColor: c.input, backgroundColor: c.card, paddingLeft: 14, paddingRight: 6 },
  composerInput: { flex: 1, minHeight: 44, color: c.foreground, fontFamily: 'Inter_400Regular', fontSize: 13 },
  sendBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.38 },
});
