import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from "expo-image-picker";
import { greeting } from "@skonga/shared";
import { useAppState } from "../context/AppState";
import { useTheme } from "../context/ThemeContext";
import type { DrawerParamList } from "../navigation/types";

export function ChatScreen() {
  const nav = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { active, settings, remaining, entitlement, online, sending, send } = useAppState();
  const { colors } = useTheme();
  const [draft, setDraft] = useState("");
  const welcome = `${greeting(settings.preferredName)} I'm SKONGA AI — how can I help you today?`;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg },
        offline: { backgroundColor: colors.offlineBg, padding: 8, alignItems: "center" },
        offlineText: { color: colors.offlineText, fontSize: 12 },
        messages: { padding: 16, paddingBottom: 24 },
        bubble: { color: colors.text, marginBottom: 14, lineHeight: 22, fontSize: 16 },
        user: { color: colors.accentSoft, textAlign: "right" },
        muted: { color: colors.muted, marginTop: 8 },
        typing: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
        tools: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 4 },
        tool: {
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        toolText: { color: colors.accentSoft, fontWeight: "600", fontSize: 13 },
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
          minWidth: 72,
          alignItems: "center",
        },
        btnDisabled: { opacity: 0.6 },
        btnText: { color: "#fff", fontWeight: "700" },
      }),
    [colors]
  );

  async function onSend() {
    const result = await send(draft);
    if (result === "limit") {
      nav.navigate("Pay");
      return;
    }
    if (result === "ok") setDraft("");
  }

  async function pickImage(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow camera or photos to scan a question.");
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, base64: false });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    const label = fromCamera ? "Camera scan" : "Gallery image";
    setDraft((prev) =>
      prev.trim()
        ? `${prev.trim()}\n\n[${label} attached: ${uri}]`
        : `[${label} attached: ${uri}]\nPlease solve this question.`
    );
    Alert.alert(
      "Image ready",
      "Image path was added to the message. When the vision API is live, this will be uploaded with POST /v1/chat."
    );
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
        {sending && (
          <View style={styles.typing}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.muted}> SKONGA is thinking...</Text>
          </View>
        )}
        {!entitlement.isPro && (
          <Text style={styles.muted}>
            Free messages left: {Number.isFinite(remaining) ? remaining : "unlimited"}
          </Text>
        )}
      </ScrollView>
      <View style={styles.tools}>
        <TouchableOpacity style={styles.tool} onPress={() => pickImage(true)}>
          <Text style={styles.toolText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool} onPress={() => pickImage(false)}>
          <Text style={styles.toolText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tool} onPress={() => nav.navigate("Notes")}>
          <Text style={styles.toolText}>Notes</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question..."
          placeholderTextColor={colors.muted}
          multiline
          editable={!sending}
        />
        <TouchableOpacity style={[styles.btn, sending && styles.btnDisabled]} onPress={onSend} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
