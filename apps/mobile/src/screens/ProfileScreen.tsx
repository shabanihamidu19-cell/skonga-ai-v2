import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { isApiConfigured, login } from "../api/client";
import { useTheme } from "../context/ThemeContext";

export function ProfileScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg, padding: 16 },
        h: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 8 },
        muted: { color: colors.muted, marginBottom: 16 },
        input: {
          borderWidth: 1,
          borderColor: colors.line,
          borderRadius: 12,
          color: colors.text,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 10,
          backgroundColor: colors.panel,
        },
        btn: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
        btnText: { color: "white", fontWeight: "700" },
      }),
    [colors]
  );

  async function onLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Enter email and password.");
      return;
    }
    if (!isApiConfigured()) {
      Alert.alert("Auth not live", "Set EXPO_PUBLIC_API_URL and implement POST /v1/auth/login.");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      Alert.alert("Signed in", "Session token received.");
    } catch (e) {
      Alert.alert("Login failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <Text style={styles.h}>Account</Text>
      <Text style={styles.muted}>Email login talks to the backend when EXPO_PUBLIC_API_URL is set.</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor={colors.muted}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={colors.muted}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.btn} onPress={onLogin} disabled={busy}>
        <Text style={styles.btnText}>{busy ? "Please wait..." : "Log in"}</Text>
      </TouchableOpacity>
    </View>
  );
}
