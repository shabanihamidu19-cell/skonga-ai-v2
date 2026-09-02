import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { DrawerNavigationProp } from "@react-navigation/drawer";
import { greeting } from "@skonga/shared";
import { useAppState } from "../context/AppState";
import { colors } from "../theme";
import type { DrawerParamList } from "../navigation/types";

export function ChatScreen() {
  const nav = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { active, settings, remaining, entitlement, online, send } = useAppState();
  const [draft, setDraft] = useState("");
  const welcome = `${greeting(settings.preferredName)} I'm SKONGA AI — how can I help you today?`;

  async function onSend() {
    const result = await send(draft);
    if (result === "limit") {
      nav.navigate("Pay");
      return;
    }
    if (result === "ok") setDraft("");
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {!online && (
        <View style={styles.offline}>
          <Text style={styles.offlineText}>Offline — saved chats only</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.messages}>
        {!active?.messages.length && <Text style={styles.bubble}>{welcome}</Text>}
        {active?.messages.map((m) => (
          <Text key={m.id} style={[styles.bubble, m.role === "user" && styles.user]}>
            {m.content}
          </Text>
        ))}
        {!entitlement.isPro && (
          <Text style={styles.muted}>
            Free messages left: {Number.isFinite(remaining) ? remaining : "unlimited"}
          </Text>
        )}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question..."
          placeholderTextColor={colors.muted}
          multiline
        />
        <TouchableOpacity style={styles.btn} onPress={onSend}>
          <Text style={styles.btnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  offline: { backgroundColor: "#3f2a14", padding: 8, alignItems: "center" },
  offlineText: { color: "#fbbf24", fontSize: 12 },
  messages: { padding: 16, paddingBottom: 24 },
  bubble: { color: colors.text, marginBottom: 14, lineHeight: 22, fontSize: 16 },
  user: { color: colors.accentSoft, textAlign: "right" },
  muted: { color: colors.muted, marginTop: 8 },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnText: { color: "white", fontWeight: "700" },
});
